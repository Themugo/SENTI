import './globals.css';
import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import { AppProviders } from '@/components/providers/app-providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://senti.com'),
  title: 'SENTI — Money Without Borders',
  description:
    'Next-generation financial infrastructure for businesses and individuals. Global payments, digital wallets, virtual cards, escrow, and more.',
  openGraph: {
    title: 'SENTI — Money Without Borders',
    description:
      'Next-generation financial infrastructure for businesses and individuals.',
    type: 'website',
    url: 'https://senti.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SENTI — Money Without Borders',
    description:
      'Next-generation financial infrastructure for businesses and individuals.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jakarta.variable} ${mono.variable} font-sans antialiased`}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
