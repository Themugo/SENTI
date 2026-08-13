'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { initFromSupabase } from '@/services/data-access';
import { financialEngine } from '@/services/financial-engine';
import { ledgerService } from '@/services/ledger.service';
import type { WalletBalance, Wallet } from '@/types';

interface WalletContextValue {
  balances: WalletBalance[];
  wallets: Wallet[];
  isLoading: boolean;
  error: string | null;
  totalUsd: number;
  refresh: () => void;
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [balances, setBalances] = useState<WalletBalance[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error] = useState<string | null>(null);
  const [totalUsd, setTotalUsd] = useState(0);

  const refresh = useCallback(() => {
    (async () => {
      await initFromSupabase();
      const userWallets = financialEngine.getCurrentUserWallets();
      setWallets(userWallets);
      const userBalances = userWallets.map((w) => ledgerService.calculateBalance(w.id));
      setBalances(userBalances);
      const total = userWallets.reduce((sum, w) => sum + ledgerService.calculateBalanceUSD(w.id), 0);
      setTotalUsd(total);
      setIsLoading(false);
    })();
  }, []);

  useState(() => {
    refresh();
  });

  return (
    <WalletContext.Provider value={{ balances, wallets, isLoading, error, totalUsd, refresh }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
