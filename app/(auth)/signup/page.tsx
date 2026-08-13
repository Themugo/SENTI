'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Lock, User, Eye, EyeOff, ArrowRight, ArrowLeft, Check,
  Globe, CreditCard, ShieldCheck, Sparkles, Phone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '@/features/identity/auth-context';
import { identityService } from '@/services/identity.service';
import { kycService } from '@/services/kyc.service';
import { CURRENCIES, COUNTRIES } from '@/constants';
import type { AccountType, CurrencyCode } from '@/types';

const steps = [
  { number: 1, label: 'Account', icon: Mail },
  { number: 2, label: 'Personal', icon: User },
  { number: 3, label: 'Preferences', icon: Globe },
  { number: 4, label: 'Verify', icon: ShieldCheck },
  { number: 5, label: 'Welcome', icon: Sparkles },
];

const accountTypes: { value: AccountType; label: string; desc: string }[] = [
  { value: 'personal', label: 'Personal', desc: 'Individual account for personal use' },
  { value: 'business', label: 'Business', desc: 'For registered businesses and startups' },
  { value: 'non_profit', label: 'Non-Profit / NGO', desc: 'For charities and non-profit organizations' },
  { value: 'government', label: 'Government', desc: 'For government organizations and agencies' },
  { value: 'developer', label: 'Developer', desc: 'For building with SENTI API' },
  { value: 'marketplace', label: 'Marketplace', desc: 'For multi-sided marketplaces' },
];

export default function SignupWizardPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    email: '',
    phone: '',
    password: '',
    terms: false,
    firstName: '',
    lastName: '',
    accountType: 'personal' as AccountType,
    country: 'Kenya',
    language: 'en',
    currency: 'USD' as CurrencyCode,
  });

  const update = (key: string, value: string | boolean) => setForm((p) => ({ ...p, [key]: value }));

  const canProceed = () => {
    switch (step) {
      case 1: return form.email && form.phone && form.password.length >= 8 && form.terms;
      case 2: return form.firstName && form.lastName && form.accountType;
      case 3: return form.country && form.language && form.currency;
      case 4: return true;
      default: return true;
    }
  };

  const handleNext = () => {
    if (!canProceed()) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (step < 5) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      await signup(form.firstName || 'New User', form.email, form.password);
      identityService.create({
        userId: `usr_${Date.now()}`,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        accountType: form.accountType,
        country: form.country,
        language: form.language,
        preferredCurrency: form.currency,
      });
      toast.success('Welcome to SENTI!');
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch {
      toast.error('Failed to create account');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="flex items-center justify-between">
        {steps.map((s, i) => (
          <div key={s.number} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                  step >= s.number
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-muted text-muted-foreground'
                }`}
              >
                {step > s.number ? <Check className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
              </div>
              <span className={`text-xs font-medium ${step >= s.number ? 'text-foreground' : 'text-muted-foreground'}`}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`mx-2 h-0.5 w-8 sm:w-16 ${step > s.number ? 'bg-primary' : 'bg-border'}`} />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Account */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-bold font-display">Create your account</h2>
              <p className="text-sm text-muted-foreground">Start with your email and password</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@example.com" className="pl-10" value={form.email} onChange={(e) => update('email', e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="phone" placeholder="+254 712 345 678" className="pl-10" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Create a strong password" className="pl-10 pr-10" value={form.password} onChange={(e) => update('password', e.target.value)} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.password && (
                <div className="space-y-1 pt-1">
                  {[
                    { label: '8+ characters', met: form.password.length >= 8 },
                    { label: 'Uppercase letter', met: /[A-Z]/.test(form.password) },
                    { label: 'Number', met: /[0-9]/.test(form.password) },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center gap-1.5 text-xs">
                      <Check className={`h-3 w-3 ${s.met ? 'text-success' : 'text-muted-foreground'}`} />
                      <span className={s.met ? 'text-success' : 'text-muted-foreground'}>{s.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-start gap-2">
              <Checkbox id="terms" checked={form.terms} onCheckedChange={(v) => update('terms', v === true)} />
              <Label htmlFor="terms" className="text-sm font-normal text-muted-foreground leading-relaxed">
                I agree to the Terms of Service and Privacy Policy
              </Label>
            </div>
          </motion.div>
        )}

        {/* Step 2: Personal Details */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-bold font-display">Tell us about yourself</h2>
              <p className="text-sm text-muted-foreground">Your personal details and account type</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="John" value={form.firstName} onChange={(e) => update('firstName', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Doe" value={form.lastName} onChange={(e) => update('lastName', e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Account Type</Label>
              <div className="grid grid-cols-2 gap-2">
                {accountTypes.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => update('accountType', t.value)}
                    className={`rounded-xl border p-3 text-left transition-all ${
                      form.accountType === t.value ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <p className="text-sm font-semibold">{t.label}</p>
                    <p className="text-xs text-muted-foreground">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Preferences */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-bold font-display">Set your preferences</h2>
              <p className="text-sm text-muted-foreground">Country, language, and currency</p>
            </div>

            <div className="space-y-2">
              <Label>Country</Label>
              <Select value={form.country} onValueChange={(v) => update('country', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c.code} value={c.name}>{c.flag} {c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Language</Label>
              <Select value={form.language} onValueChange={(v) => update('language', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="sw">Swahili</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="ar">Arabic</SelectItem>
                  <SelectItem value="pt">Portuguese</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Preferred Currency</Label>
              <Select value={form.currency} onValueChange={(v) => update('currency', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(CURRENCIES).map(([code, meta]) => (
                    <SelectItem key={code} value={code}>{meta.flag} {code} — {meta.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        )}

        {/* Step 4: Verification */}
        {step === 4 && (
          <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-bold font-display">Verify your identity</h2>
              <p className="text-sm text-muted-foreground">Complete KYC to unlock all features</p>
            </div>

            <div className="rounded-xl border border-border p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">Identity Verification (KYC)</p>
                  <p className="text-xs text-muted-foreground">Required to send and receive money</p>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Government ID or Passport', desc: 'Upload a clear photo' },
                  { label: 'Selfie Verification', desc: 'Take a live selfie' },
                  { label: 'Proof of Address', desc: 'Utility bill or bank statement' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => toast.info('KYC upload will be available after signup')}>
                      Upload
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">You can skip this step and complete verification later from your dashboard.</p>
          </motion.div>
        )}

        {/* Step 5: Welcome */}
        {step === 5 && (
          <motion.div key="step5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-6 text-center py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success/10 text-success"
            >
              <Check className="h-10 w-10" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold font-display">Welcome to SENTI!</h2>
              <p className="mt-2 text-sm text-muted-foreground">Your account is ready. Let's get you to your dashboard.</p>
            </div>
            <div className="rounded-xl border border-border p-4 space-y-2 text-left">
              {[
                { label: 'Account Type', value: accountTypes.find((t) => t.value === form.accountType)?.label ?? 'Personal' },
                { label: 'Email', value: form.email },
                { label: 'Country', value: form.country },
                { label: 'Currency', value: form.currency },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation buttons */}
      {step < 5 && (
        <div className="flex gap-3">
          {step > 1 && (
            <Button variant="outline" onClick={handleBack} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          )}
          <Button onClick={handleNext} className="flex-1 gap-1.5" disabled={!canProceed()}>
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {step === 5 && (
        <Button onClick={handleFinish} className="w-full gap-2" size="lg" disabled={loading}>
          {loading ? 'Setting up your account...' : 'Go to Dashboard'}
          {!loading && <ArrowRight className="h-4 w-4" />}
        </Button>
      )}
    </div>
  );
}
