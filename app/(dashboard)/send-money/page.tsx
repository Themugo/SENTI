'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Check, ArrowRight, User, Mail } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { CURRENCIES } from '@/constants';
import { initFromSupabase } from '@/services/data-access';
import { financialEngine } from '@/services/financial-engine';
import { transactionService } from '@/services/transaction.service';
import { feesService } from '@/services/fees.service';
import { limitsService } from '@/services/limits.service';
import { ledgerService } from '@/services/ledger.service';
import { formatCurrencyWithSymbol } from '@/lib/utils';
import type { Currency, WalletBalance } from '@/types';

const schema = z.object({
  recipient: z.string().min(2, 'Enter recipient name'),
  email: z.string().email('Enter a valid email'),
  amount: z.number().min(1, 'Amount must be at least 1'),
  currency: z.string(),
  note: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function SendMoneyPage() {
  const router = useRouter();
  const [step, setStep] = useState<'form' | 'review' | 'success'>('form');
  const [formData, setFormData] = useState<FormData | null>(null);
  const [balances, setBalances] = useState<WalletBalance[]>([]);
  const [ready, setReady] = useState(false);
  const [txReference, setTxReference] = useState<string>('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { recipient: '', email: '', amount: 0, currency: 'USD', note: '' },
  });

  useEffect(() => {
    (async () => {
      await initFromSupabase();
      const wallets = financialEngine.getCurrentUserWallets();
      const userBalances = wallets.map((w) => ledgerService.calculateBalance(w.id));
      setBalances(userBalances);
      setReady(true);
    })();
  }, []);

  const amount = watch('amount');
  const currency = watch('currency') as Currency;
  const fee = feesService.calculate(amount || 0, currency, 'internal_transfer');

  const onSubmit = (data: FormData) => {
    setFormData(data);
    setStep('review');
  };

  const confirmSend = () => {
    if (!formData) return;

    const wallets = financialEngine.getCurrentUserWallets();
    const primaryWallet = wallets.find((w) => w.type === 'primary');
    if (!primaryWallet) {
      toast.error('No primary wallet found');
      return;
    }

    const limitCheck = limitsService.checkLimit(primaryWallet.id, formData.amount, formData.currency as Currency);
    if (!limitCheck.allowed) {
      toast.error(limitCheck.reason ?? 'Transaction limit exceeded');
      return;
    }

    const tx = transactionService.create({
      type: 'internal_transfer',
      amount: formData.amount,
      currency: formData.currency as Currency,
      description: formData.note || `Payment to ${formData.recipient}`,
      counterparty: {
        name: formData.recipient,
        email: formData.email,
      },
      sourceWalletId: primaryWallet.id,
      destinationWalletId: 'PW-PLATFORM-0001',
      paymentMethod: 'wallet',
    });

    transactionService.updateStatus(tx.id, 'completed', 'Payment sent');

    setTxReference(tx.reference);
    setStep('success');
    setTimeout(() => {
      toast.success('Payment sent successfully');
      router.push('/transactions');
    }, 2000);
  };

  if (!ready) {
    return (
      <div className="space-y-6">
        <PageHeader title="Send Money" description="Transfer funds to anyone, anywhere in the world." />
        <div className="mx-auto max-w-2xl">
          <div className="h-96 animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Send Money" description="Transfer funds to anyone, anywhere in the world." />

      <div className="mx-auto max-w-2xl">
        <AnimatePresence mode="wait">
          {step === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="recipient">Recipient Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input id="recipient" placeholder="John Doe" className="pl-10" {...register('recipient')} />
                    </div>
                    {errors.recipient && <p className="text-xs text-destructive">{errors.recipient.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Recipient Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input id="email" type="email" placeholder="john@example.com" className="pl-10" {...register('email')} />
                    </div>
                    {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...register('amount', { valueAsNumber: true })}
                      />
                      {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Currency</Label>
                      <Select defaultValue="USD" onValueChange={(v) => setValue('currency', v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(CURRENCIES).map(([code, meta]) => (
                            <SelectItem key={code} value={code}>
                              {meta.flag} {code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="note">Note (optional)</Label>
                    <Input id="note" placeholder="What's this for?" {...register('note')} />
                  </div>

                  <div className="rounded-lg bg-muted/50 p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Transaction fee</span>
                      <span className="font-medium">{formatCurrencyWithSymbol(fee.total, currency)}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="font-medium">Total you'll pay</span>
                      <span className="font-bold text-lg font-display">
                        {formatCurrencyWithSymbol((amount || 0) + fee.total, currency)}
                      </span>
                    </div>
                  </div>

                  <Button type="submit" className="w-full gap-2" size="lg">
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>
              </Card>
            </motion.div>
          )}

          {step === 'review' && formData && (
            <motion.div
              key="review"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="p-6">
                <div className="mb-6 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Send className="h-8 w-8" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold font-display">Review your payment</h3>
                  <p className="text-sm text-muted-foreground">Please confirm the details below</p>
                </div>

                <div className="space-y-3">
                  {[
                    { label: 'Recipient', value: formData.recipient },
                    { label: 'Email', value: formData.email },
                    { label: 'Amount', value: formatCurrencyWithSymbol(formData.amount, formData.currency as Currency) },
                    { label: 'Fee', value: formatCurrencyWithSymbol(fee.total, formData.currency as Currency) },
                    { label: 'Note', value: formData.note || '—' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between border-b border-border py-2.5">
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                      <span className="text-sm font-medium">{item.value}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm font-semibold">Total</span>
                    <span className="text-lg font-bold font-display">
                      {formatCurrencyWithSymbol(formData.amount + fee.total, formData.currency as Currency)}
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setStep('form')}>
                    Back
                  </Button>
                  <Button className="flex-1 gap-2" onClick={confirmSend}>
                    <Send className="h-4 w-4" />
                    Send {formatCurrencyWithSymbol(formData.amount, formData.currency as Currency)}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {step === 'success' && formData && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                  className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success/10 text-success"
                >
                  <Check className="h-10 w-10" />
                </motion.div>
                <h3 className="mt-6 text-xl font-bold font-display">Payment Sent!</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  You sent {formatCurrencyWithSymbol(formData.amount, formData.currency as Currency)} to {formData.recipient}
                </p>
                <p className="mt-1 text-xs text-muted-foreground font-mono">Ref: {txReference}</p>
                <p className="mt-1 text-xs text-muted-foreground">Redirecting to transactions...</p>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Available balances — from ledger */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-muted-foreground">Available Balances</h3>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {balances.map((b) => {
            const meta = CURRENCIES[b.currency];
            return (
              <div key={b.walletId} className="rounded-lg border border-border p-3 text-center">
                <p className="text-xs text-muted-foreground">{meta.flag} {b.currency}</p>
                <p className="mt-1 text-sm font-semibold">{formatCurrencyWithSymbol(b.available, b.currency)}</p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
