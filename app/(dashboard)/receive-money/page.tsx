'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, QrCode, Share2, Download, Link2, Mail } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { CURRENCIES } from '@/constants';
import type { Currency } from '@/types';

export default function ReceiveMoneyPage() {
  const [copied, setCopied] = useState(false);
  const [currency, setCurrency] = useState<Currency>('USD');
  const accountEmail = 'user@senti.com';
  const accountName = 'SENTI User';
  const accountNumber = 'SN-8F2A-4B9C-1029';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Receive Money" description="Share your details or generate a payment request." />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Account details */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold font-display">Your Account Details</h3>
          <p className="text-sm text-muted-foreground">Share these details to receive payments</p>

          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label>Account Name</Label>
              <div className="flex items-center gap-2">
                <Input value={accountName} readOnly className="bg-muted/50" />
                <Button variant="outline" size="icon" onClick={() => copyToClipboard(accountName)} aria-label="Copy">
                  {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Account Email</Label>
              <div className="flex items-center gap-2">
                <Input value={accountEmail} readOnly className="bg-muted/50" />
                <Button variant="outline" size="icon" onClick={() => copyToClipboard(accountEmail)} aria-label="Copy">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>SENTI Account Number</Label>
              <div className="flex items-center gap-2">
                <Input value={accountNumber} readOnly className="bg-muted/50 font-mono" />
                <Button variant="outline" size="icon" onClick={() => copyToClipboard(accountNumber)} aria-label="Copy">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Preferred Currency</Label>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(CURRENCIES).slice(0, 4).map(([code, meta]) => (
                  <button
                    key={code}
                    onClick={() => setCurrency(code as Currency)}
                    className={`rounded-lg border p-2 text-sm transition-colors ${
                      currency === code
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:bg-muted'
                    }`}
                  >
                    {meta.flag} {code}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* QR Code & Payment Request */}
        <Card className="p-6">
          <Tabs defaultValue="qr">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="qr" className="gap-1.5">
                <QrCode className="h-4 w-4" />
                QR Code
              </TabsTrigger>
              <TabsTrigger value="link" className="gap-1.5">
                <Link2 className="h-4 w-4" />
                Payment Link
              </TabsTrigger>
            </TabsList>

            <TabsContent value="qr" className="mt-6">
              <div className="flex flex-col items-center gap-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl border-2 border-border bg-white p-6"
                >
                  {/* QR placeholder */}
                  <div className="grid h-48 w-48 grid-cols-8 gap-0.5">
                    {Array.from({ length: 64 }).map((_, i) => (
                      <div
                        key={i}
                        className={`rounded-sm ${Math.random() > 0.5 ? 'bg-black' : 'bg-white'}`}
                      />
                    ))}
                  </div>
                </motion.div>
                <p className="text-sm text-muted-foreground">Scan to send money to {accountName}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="link" className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label>Amount (optional)</Label>
                <Input type="number" placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label>Note</Label>
                <Input placeholder="What's this for?" />
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Your payment link</p>
                <p className="mt-1 break-all font-mono text-sm">senti.pay/r/{accountNumber.toLowerCase().replace(/-/g, '')}</p>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 gap-1.5">
                  <Link2 className="h-4 w-4" />
                  Create Link
                </Button>
                <Button variant="outline" className="gap-1.5">
                  <Mail className="h-4 w-4" />
                  Email
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
