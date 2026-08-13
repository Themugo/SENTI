import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CURRENCIES, EXCHANGE_RATES } from '@/constants';
import { currencyService } from '@/services/currency.service';
import type { CurrencyCode } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency: CurrencyCode = 'USD',
  options?: Intl.NumberFormatOptions,
): string {
  const meta = CURRENCIES[currency];
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: meta.decimals,
    maximumFractionDigits: meta.decimals,
    ...options,
  }).format(amount);
}

export function formatCurrencyWithSymbol(
  amount: number,
  currency: CurrencyCode = 'USD',
): string {
  return currencyService.format(amount, currency);
}

export function convertCurrency(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
): number {
  return currencyService.convert(amount, from, to);
}

export function formatCompact(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount);
}

export function formatDate(date: string | Date, opts?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...opts,
  }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value > 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

export function maskCardNumber(last4: string): string {
  return `•••• •••• •••• ${last4}`;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function truncateMiddle(str: string, start = 6, end = 4): string {
  if (str.length <= start + end) return str;
  return `${str.slice(0, start)}…${str.slice(-end)}`;
}

// Legacy alias
export type Currency = CurrencyCode;
