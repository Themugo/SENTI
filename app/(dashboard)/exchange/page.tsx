'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, RefreshCw, TrendingUp, TrendingDown, Info, Check } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { CURRENCY_LIST } from '@/constants';
import { currencyService } from '@/services/currency.service';
import { feesService } from '@/services/fees.service';
import { limitsService } from '@/services/limits.service';
import { transactionService } from '@/services/transaction.service';
import { initFromSupabase } from '@/services/data-access';
import { financialEngine } from '@/services/financial-engine';
import { ledgerService } from '@/services/ledger.service';
import { formatCurrencyWithSymbol } from '@/lib/utils';
import { toast } from 'sonner';
import type { CurrencyCode, WalletBalance } from '@/types';

const rateHistory = [
  { label: '1D', change: 0.12 },
  { label: '1W', change: -0.34 },
  { label: '1M', change: 1.2 },
  { label: '3M', change: 2.8 },
  { label: '6M', change: 4.1 },
  { label: '1Y', change: 6.5 },
];

export default function ExchangePage() {
  const [from, setFrom] = useState<CurrencyCode>('USD');
  const [to, setTo] = useState<CurrencyCode>('KES');
  const [amount, setAmount] = useState(1000);
  const [ready, setReady] = useState(false);
  const [balances, setBalances] = useState<WalletBalance[]>([]);
  const [exchanged, setExchanged] = useState(false);

  useEffect(() => {
    (async () => {
      await initFromSupabase();
      const wallets = financialEngine.getCurrentUserWallets();
      const userBalances = wallets.map((w) => ledgerService.calculateBalance(w.id));
      setBalances(userBalances);
      setReady(true);
    })();
  }, []);

  const converted = currencyService.convert(amount, from, to);
  const rate = currencyService.getRate(from, to);
  const fee = feesService.calculate(amount, from, 'currency_exchange', true);
  const finalAmount = converted - currencyService.convert(fee.fxFee, from, to);

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  const handleExchange = () => {
    const wallets = financialEngine.getCurrentUserWallets();
    const primaryWallet = wallets.find((w) => w.type === 'primary');
    if (!primaryWallet) {
      toast.error('No primary wallet found');
      return;
    }

    const limitCheck = limitsService.checkLimit(primaryWallet.id, amount, from);
    if (!limitCheck.allowed) {
      toast.error(limitCheck.reason ?? 'Transaction limit exceeded');
      return;
    }

    const destWallet = wallets.find((w) => w.currency === to && w.type === 'primary') ?? primaryWallet;

    const tx = transactionService.create({
      type: 'currency_exchange',
      amount,
      currency: from,
      description: `Currency exchange: ${from} to ${to}`,
      counterparty: { name: 'SENTI Exchange', walletId: destWallet.id },
      sourceWalletId: primaryWallet.id,
      destinationWalletId: destWallet.id,
      paymentMethod: 'wallet',
      destinationCurrency: to,
    });

    transactionService.updateStatus(tx.id, 'completed', 'Exchange completed');

    setExchanged(true);
    toast.success(`Exchanged ${formatCurrencyWithSymbol(amount, from)} to ${formatCurrencyWithSymbol(finalAmount, to)}`);
    setTimeout(() => setExchanged(false), 3000);
  };

  if (!ready) {
    return (
      <div className="space-y-6">
        <PageHeader title="Currency Exchange" description="Exchange between 13 currencies at mid-market rates with low fees." />
        <div className="mx-auto max-w-2xl">
          <div className="h-96 animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Currency Exchange" description="Exchange between 13 currencies at mid-market rates with low fees." />

      <div className="mx-auto max-w-2xl space-y-6">
        <Card className="p-6">
          <div className="space-y-4">
            {/* From */}
            <div className="rounded-xl border border-border p-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">You Send</Label>
                <span className="text-xs text-muted-foreground">
                  Balance: {formatCurrencyWithSymbol(
                    balances.find((b) => b.currency === from)?.available ?? 0,
                    from,
                  )}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="border-0 bg-transparent p-0 text-2xl font-bold font-display focus-visible:ring-0"
                />
                <Select value={from} onValueChange={(v) => setFrom(v as CurrencyCode)}>
                  <SelectTrigger className="w-36 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCY_LIST.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.flag} {c.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Swap button */}
            <div className="flex justify-center">
              <button
                onClick={handleSwap}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-primary transition-all hover:rotate-180 hover:border-primary hover:bg-primary/5"
                aria-label="Swap currencies"
              >
                <ArrowRight className="h-4 w-4 rotate-90" />
              </button>
            </div>

            {/* To */}
            <div className="rounded-xl border border-border p-4">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">You Receive</Label>
              <div className="mt-2 flex items-center gap-3">
                <div className="flex-1 text-2xl font-bold font-display text-primary">
                  {formatCurrencyWithSymbol(finalAmount, to)}
                </div>
                <Select value={to} onValueChange={(v) => setTo(v as CurrencyCode)}>
                  <SelectTrigger className="w-36 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCY_LIST.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.flag} {c.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Exchange rate info */}
          <div className="mt-4 rounded-lg bg-muted/50 p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Exchange Rate</span>
              <span className="font-medium">
                1 {from} = {rate.toFixed(4)} {to}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">FX Fee (0.5%)</span>
              <span className="font-medium">{formatCurrencyWithSymbol(fee.fxFee, from)}</span>
            </div>
            <div className="flex items-center justify-between text-sm border-t border-border pt-2">
              <span className="font-semibold">You'll receive</span>
              <span className="font-bold text-lg font-display text-primary">
                {formatCurrencyWithSymbol(finalAmount, to)}
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <p>Mid-market rate. No hidden fees. Funds settle instantly in your wallet. 13 currencies supported.</p>
          </div>

          <Button
            className="mt-4 w-full gap-2"
            size="lg"
            onClick={handleExchange}
            disabled={exchanged}
          >
            {exchanged ? (
              <>
                <Check className="h-4 w-4" />
                Exchange Completed
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Exchange {formatCurrencyWithSymbol(amount, from)}
              </>
            )}
          </Button>
        </Card>

        {/* Rate history */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-muted-foreground">{from}/{to} Rate History</h3>
          <div className="mt-4 grid grid-cols-6 gap-2">
            {rateHistory.map((r, i) => (
              <motion.div
                key={r.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="rounded-lg border border-border p-2 text-center"
              >
                <p className="text-xs text-muted-foreground">{r.label}</p>
                <p className={`mt-1 text-xs font-semibold flex items-center justify-center gap-0.5 ${r.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {r.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {Math.abs(r.change)}%
                </p>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
