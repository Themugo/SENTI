'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from 'sonner';
import { authService } from '@/services/auth.service';

export default function OtpPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (code.length < 6) {
      toast.error('Enter the 6-digit code');
      return;
    }
    setLoading(true);
    try {
      await authService.verifyOtp(code);
      toast.success('Verification successful');
      router.push('/dashboard');
    } catch {
      toast.error('Invalid or expired code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary"
        >
          <ShieldCheck className="h-8 w-8" />
        </motion.div>
        <h1 className="text-2xl font-bold tracking-tight font-display">Verify your email</h1>
        <p className="text-sm text-muted-foreground">
          Enter the 6-digit code sent to your email address.
        </p>
      </div>

      <div className="flex flex-col items-center gap-6">
        <InputOTP
          maxLength={6}
          value={code}
          onChange={(v) => setCode(v)}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>

        <Button onClick={handleVerify} className="w-full gap-2" disabled={loading}>
          {loading ? 'Verifying...' : 'Verify code'}
        </Button>

        <p className="text-sm text-muted-foreground">
          Didn&apos;t receive a code?{' '}
          <button className="font-medium text-primary hover:underline" onClick={() => toast.info('Code resent')}>
            Resend
          </button>
        </p>
      </div>

      <Link
        href="/login"
        className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to login
      </Link>
    </div>
  );
}
