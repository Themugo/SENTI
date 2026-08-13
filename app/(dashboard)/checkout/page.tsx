'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard, Smartphone, Landmark, Apple, Wallet, Shield,
  Lock, Check, ArrowRight, ShoppingBag,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CURRENCIES } from '@/constants';
import { initFromSupabase } from '@/services/data-access';
import { financialEngine } from '@/services/financial-engine';
import { transactionService } from '@/services/transaction.service';
import { feesService } from '@/services/fees.service';
import type { Currency, TransactionType, PaymentMethod } from '@/types';

const paymentMethods = [
  { id: 'visa', label: 'Visa', icon: CreditCard, desc: 'Credit or debit card' },
  { id: 'mastercard', label: 'Mastercard', icon: CreditCard, desc: 'Credit or debit card' },
  { id: 'mpesa', label: 'M-Pesa', icon: Smartphone, desc: 'Mobile money — Kenya' },
  { id: 'airtel', label: 'Airtel Money', icon: Smartphone, desc: 'Mobile money' },
  { id: 'bank', label: 'Bank Transfer', icon: Landmark, desc: 'Direct bank transfer' },
  { id: 'applepay', label: 'Apple Pay', icon: Apple, desc: 'Pay with Apple Pay' },
  { id: 'googlepay', label: 'Google Pay', icon: Smartphone, desc: 'Pay with Google Pay' },
  { id: 'paypal', label: 'PayPal', icon: Wallet, desc: 'Pay with PayPal' },
];

export default function CheckoutPage() {
  const [selectedMethod, setSelectedMethod] = useState('visa');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      await initFromSupabase();
      setReady(true);
    })();
  }, []);

  const amount = 250;
  const currency: Currency = 'USD';
  const fee = feesService.calculate(amount, currency, 'card_payment');

  const handlePay = () => {
    setProcessing(true);

    const wallets = financialEngine.getCurrentUserWallets();
    const primaryWallet = wallets.find((w) => w.type === 'primary');
    const merchantWallet = wallets.find((w) => w.type === 'merchant');

    if (!primaryWallet || !merchantWallet) {
      setProcessing(false);
      toast.error('Wallet not found');
      return;
    }

    const methodMap: Record<string, { type: TransactionType; pm: PaymentMethod }> = {
      visa: { type: 'card_payment', pm: 'card' },
      mastercard: { type: 'card_payment', pm: 'card' },
      mpesa: { type: 'mpesa', pm: 'mpesa' },
      airtel: { type: 'airtel_money', pm: 'airtel' },
      bank: { type: 'bank_transfer', pm: 'bank' },
      applepay: { type: 'card_payment', pm: 'apple_pay' },
      googlepay: { type: 'card_payment', pm: 'google_pay' },
      paypal: { type: 'card_payment', pm: 'paypal' },
    };

    const mapping = methodMap[selectedMethod] ?? methodMap.visa;

    const tx = transactionService.create({
      type: mapping.type,
      amount,
      currency,
      description: 'Premium Consultation — 1-hour session',
      counterparty: { name: 'SENTI Merchant', walletId: merchantWallet.id },
      sourceWalletId: primaryWallet.id,
      destinationWalletId: merchantWallet.id,
      paymentMethod: mapping.pm,
    });

    setTimeout(() => {
      transactionService.updateStatus(tx.id, 'completed', 'Checkout payment completed');
      setProcessing(false);
      setSuccess(true);
      toast.success('Payment completed successfully');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Checkout" description="A premium checkout experience for your customers." />

      <div className="mx-auto max-w-4xl">
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Payment methods */}
          <div className="lg:col-span-3">
            <Card className="p-6">
              <h3 className="text-lg font-semibold font-display">Payment Method</h3>
              <p className="text-sm text-muted-foreground">Choose how you'd like to pay</p>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                      selectedMethod === method.id
                        ? 'border-primary bg-primary/5 shadow-premium'
                        : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <method.icon className={`h-6 w-6 ${selectedMethod === method.id ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="text-xs font-medium">{method.label}</span>
                  </button>
                ))}
              </div>

              {/* Card form */}
              <AnimatePresence mode="wait">
                {(selectedMethod === 'visa' || selectedMethod === 'mastercard') && (
                  <motion.div
                    key="card"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="card-number">Card Number</Label>
                      <Input id="card-number" placeholder="4242 4242 4242 4242" className="font-mono" />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2 space-y-2">
                        <Label htmlFor="card-name">Name on Card</Label>
                        <Input id="card-name" placeholder="John Doe" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="card-expiry">Expiry</Label>
                        <Input id="card-expiry" placeholder="MM/YY" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="card-cvc">CVC</Label>
                        <Input id="card-cvc" placeholder="123" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {selectedMethod === 'mpesa' && (
                  <motion.div
                    key="mpesa"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="phone">M-Pesa Phone Number</Label>
                      <Input id="phone" placeholder="+254 712 345 678" />
                    </div>
                    <p className="text-xs text-muted-foreground">You'll receive a prompt on your phone to confirm the payment.</p>
                  </motion.div>
                )}

                {selectedMethod === 'bank' && (
                  <motion.div
                    key="bank"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 space-y-4"
                  >
                    <div className="rounded-lg bg-muted/50 p-4 text-sm">
                      <p className="font-medium">Bank Transfer Details</p>
                      <p className="mt-2 text-muted-foreground">Account: SENTI-8F2A-4B9C</p>
                      <p className="text-muted-foreground">Reference: PAY-2026-0841</p>
                    </div>
                  </motion.div>
                )}

                {(selectedMethod === 'applepay' || selectedMethod === 'googlepay' || selectedMethod === 'paypal' || selectedMethod === 'airtel') && (
                  <motion.div
                    key="wallet"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 space-y-4"
                  >
                    <p className="text-sm text-muted-foreground">
                      You'll be redirected to {paymentMethods.find((m) => m.id === selectedMethod)?.label} to complete your payment securely.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
                <Lock className="h-3.5 w-3.5" />
                Payments are encrypted and secure. SENTI never stores your card details.
              </div>
            </Card>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-2">
            <Card className="sticky top-20 p-6">
              <h3 className="text-lg font-semibold font-display">Order Summary</h3>

              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Premium Consultation</p>
                    <p className="text-xs text-muted-foreground">1-hour session</p>
                  </div>
                  <p className="text-sm font-semibold">{CURRENCIES[currency].symbol}{amount}</p>
                </div>
              </div>

              <div className="mt-5 space-y-2 border-t border-border pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{CURRENCIES[currency].symbol}{amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Processing fee</span>
                  <span>{CURRENCIES[currency].symbol}{fee.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-3">
                  <span className="font-semibold">Total</span>
                  <span className="text-lg font-bold font-display">{CURRENCIES[currency].symbol}{(amount + fee.total).toFixed(2)}</span>
                </div>
              </div>

              <Button
                className="mt-6 w-full gap-2"
                size="lg"
                onClick={handlePay}
                disabled={processing || success}
              >
                {processing ? (
                  'Processing...'
                ) : success ? (
                  <>
                    <Check className="h-4 w-4" />
                    Payment Complete
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Pay {CURRENCIES[currency].symbol}{(amount + fee.total).toFixed(2)}
                  </>
                )}
              </Button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-3.5 w-3.5" />
                Protected by SENTI Buyer Protection
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
