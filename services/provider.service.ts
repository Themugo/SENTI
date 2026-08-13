/**
 * Provider Manager Service
 * Manages provider registration, health monitoring, and configuration.
 * The Core never touches providers directly — always through this manager.
 */

import type { Provider, ProviderId, ProviderHealth } from '@/types';
import { ALL_PROVIDERS, PROVIDER_MAP, PROVIDER_CONFIGS } from './providers/mock-providers';
import type { IPaymentProvider } from './providers/provider.interface';

export const providerService = {
  /** Get all registered providers. */
  getAll(): Provider[] {
    return ALL_PROVIDERS.filter((p) => p.getProvider().enabled).map((p) => p.getProvider());
  },

  /** Get all providers including disabled. */
  getAllIncludingDisabled(): Provider[] {
    return ALL_PROVIDERS.map((p) => p.getProvider());
  },

  /** Get a specific provider by ID. */
  getById(id: ProviderId): IPaymentProvider | undefined {
    return PROVIDER_MAP[id];
  },

  /** Get provider adapter (same as getById but returns the interface). */
  getAdapter(id: ProviderId): IPaymentProvider | undefined {
    return PROVIDER_MAP[id];
  },

  /** Get providers by category. */
  getByCategory(category: Provider['category']): Provider[] {
    return this.getAll().filter((p) => p.category === category);
  },

  /** Get providers that support a currency. */
  getByCurrency(currency: string): Provider[] {
    return this.getAll().filter((p) => p.supportedCurrencies.includes(currency as never));
  },

  /** Get providers that support a country. */
  getByCountry(country: string): Provider[] {
    return this.getAll().filter((p) => p.supportedCountries.includes(country));
  },

  /** Check provider health. */
  async checkHealth(id: ProviderId): Promise<ProviderHealth> {
    const adapter = this.getById(id);
    if (!adapter) throw new Error(`Provider ${id} not found`);
    return adapter.healthCheck();
  },

  /** Check health of all providers. */
  async checkAllHealth(): Promise<ProviderHealth[]> {
    return Promise.all(ALL_PROVIDERS.map((p) => p.healthCheck()));
  },

  /** Get provider status summary. */
  getStatusSummary(): { operational: number; degraded: number; down: number; maintenance: number; total: number } {
    const all = this.getAllIncludingDisabled();
    return {
      operational: all.filter((p) => p.status === 'operational').length,
      degraded: all.filter((p) => p.status === 'degraded').length,
      down: all.filter((p) => p.status === 'down').length,
      maintenance: all.filter((p) => p.status === 'maintenance').length,
      total: all.length,
    };
  },

  /** Get provider config. */
  getConfig(id: ProviderId): Provider {
    return { id, ...PROVIDER_CONFIGS[id] };
  },

  /** Get count. */
  count(): number {
    return this.getAll().length;
  },
};
