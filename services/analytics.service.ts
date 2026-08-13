/**
 * Analytics Service — Mock implementation
 */

import {
  mockRevenueData,
  mockVolumeData,
  mockCurrencyBreakdown,
  mockAdminStats,
  mockAdminRevenueData,
  mockAdminGeoData,
} from '@/services/mock-data';
import type { ChartPoint } from '@/types';

function delay<T>(data: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

export const analyticsService = {
  async getRevenueData(): Promise<ChartPoint[]> {
    return delay([...mockRevenueData]);
  },

  async getVolumeData(): Promise<ChartPoint[]> {
    return delay([...mockVolumeData]);
  },

  async getCurrencyBreakdown(): Promise<{ name: string; value: number; color: string }[]> {
    return delay([...mockCurrencyBreakdown]);
  },

  async getOverview(): Promise<{
    totalRevenue: number;
    netProfit: number;
    transactionCount: number;
    avgTransaction: number;
  }> {
    return delay({
      totalRevenue: 426_000,
      netProfit: 312_400,
      transactionCount: 1_284,
      avgTransaction: 332,
    });
  },

  async getAdminStats() {
    return delay({ ...mockAdminStats });
  },

  async getAdminRevenueData(): Promise<ChartPoint[]> {
    return delay([...mockAdminRevenueData]);
  },

  async getAdminGeoData() {
    return delay([...mockAdminGeoData]);
  },
};
