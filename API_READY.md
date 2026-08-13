# SENTI — API Readiness Guide

## Current State

All data in SENTI flows through a mock service layer. No real API calls are made. The architecture is designed so that switching to a real backend requires changes to **service files only** — no UI or component changes needed.

## Architecture

```
UI Component → Context/Hook → Service → Mock Data
                                    ↓ (when backend ready)
                                  API Client → Backend
```

## Migration Steps

### 1. Configure Environment

```bash
# .env
NEXT_PUBLIC_API_URL=https://api.senti.com/v1
```

### 2. Update Service Files

Each service in `services/*.service.ts` currently returns mock data. Replace mock calls with `api` client calls:

**Before (mock):**
```typescript
async getBalances(): Promise<WalletBalance[]> {
  return delay([...mockWalletBalances]);
}
```

**After (real API):**
```typescript
import { api } from '@/api';
import { API_ROUTES } from '@/api/routes';

async getBalances(): Promise<WalletBalance[]> {
  return api.get<WalletBalance[]>(API_ROUTES.wallet.balances);
}
```

### 3. Service → Route Mapping

| Service | API Route | Method |
|---------|-----------|--------|
| `walletService.getBalances()` | `/wallet/balances` | GET |
| `walletService.deposit()` | `/wallet/deposit` | POST |
| `walletService.withdraw()` | `/wallet/withdraw` | POST |
| `walletService.transfer()` | `/wallet/transfer` | POST |
| `walletService.exchange()` | `/wallet/exchange` | POST |
| `paymentService.sendPayment()` | `/payments` | POST |
| `paymentService.getPaymentLinks()` | `/payments/links` | GET |
| `merchantService.getProfile()` | `/merchant/profile` | GET |
| `escrowService.getAll()` | `/escrow` | GET |
| `escrowService.releaseMilestone()` | `/escrow/{id}/release` | POST |
| `cardsService.getAll()` | `/cards` | GET |
| `cardsService.freeze()` | `/cards/{id}/freeze` | POST |
| `transactionsService.getAll()` | `/transactions` | GET |
| `analyticsService.getRevenueData()` | `/analytics/revenue` | GET |
| `authService.login()` | `/auth/login` | POST |
| `authService.signup()` | `/auth/signup` | POST |
| `authService.refreshTokens()` | `/auth/refresh` | POST |

### 4. Auth Token Management

The `api/interceptors.ts` file handles:
- Injecting `Authorization: Bearer <token>` on every request
- Storing/restoring tokens from localStorage
- Token expiry checking

When the backend is live, the auth context (`features/identity/auth-context.tsx`) already calls `setAuthTokens()` on login — no changes needed.

### 5. Error Handling

The `api/error.ts` file defines structured error codes:
- `NETWORK_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`
- `VALIDATION_ERROR`, `RATE_LIMIT`, `SERVER_ERROR`, `TIMEOUT`, `OFFLINE`

Services should catch `ApiError` and surface user-friendly messages.

### 6. Remove Mock Data

Once all services are migrated:
1. Delete `services/mock-data.ts`
2. Remove the `delay()` helper from each service
3. Remove mock data imports

## API Route Registry

All routes are defined in `api/routes.ts` as a centralized registry. This ensures:
- No hardcoded URLs in service files
- Easy route updates in one place
- Type-safe route parameters

## Testing the Migration

1. Set `NEXT_PUBLIC_API_URL` to a staging environment
2. Run the app — services will automatically use the API client
3. Mock services can be kept for unit testing by conditionally returning mock data when `NEXT_PUBLIC_API_URL` is empty

## Rate Limiting & Retries

The API client supports:
- 30-second request timeout
- AbortController for cancellation
- Error interceptor chain for centralized error handling

To add retries, extend `api/client.ts` with a retry wrapper.
