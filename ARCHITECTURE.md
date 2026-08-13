# SENTI — Architecture Documentation

## Overview

SENTI is a next-generation financial infrastructure platform built with Next.js 13 (App Router), TypeScript, and TailwindCSS. The frontend is designed to be production-ready and backend-agnostic — all data flows through a service layer that currently returns mock data but is structured for seamless backend integration.

## Architecture Pattern

### Feature-Based Architecture

The project uses a feature-based architecture where each business domain is self-contained:

```
features/
  identity/       — Auth, session, route guards
  wallet/          — Wallet context and wallet-specific logic
  notifications/   — Notification context
```

Each feature folder contains:
- `components/` — Feature-specific UI components
- `hooks/` — Feature-specific hooks
- `services/` — Feature-specific service calls
- `types/` — Feature-specific types
- `utils/` — Feature-specific utilities
- `constants/` — Feature-specific constants

### Layered Architecture

```
┌─────────────────────────────────────┐
│           UI Layer (app/)            │
│   Pages, Layouts, Route Groups       │
├─────────────────────────────────────┤
│      Feature Layer (features/)       │
│   Contexts, Guards, Feature Hooks     │
├─────────────────────────────────────┤
│      Service Layer (services/)        │
│   wallet.service, auth.service, etc.  │
├─────────────────────────────────────┤
│        API Layer (api/)               │
│   client, routes, interceptors        │
├─────────────────────────────────────┤
│      Shared Layer (components/)       │
│   UI components, providers, utils     │
└─────────────────────────────────────┘
```

## State Management

The app uses React Context for global state, organized by domain:

| Context | File | Scope |
|---------|------|-------|
| AuthContext | `features/identity/auth-context.tsx` | User session, tokens, role checks |
| WalletContext | `features/wallet/wallet-context.tsx` | Balances, deposit, withdraw |
| NotificationsContext | `features/notifications/notifications-context.tsx` | Notifications, unread count |

TanStack Query is available for server-state caching and is wrapped at the root level via `QueryProvider`.

## Data Flow

```
Component → Hook (useAuth/useWallet) → Context → Service → Mock Data
                                                    ↓ (when backend ready)
                                                  API Client → Backend
```

## Route Protection

- `AuthGuard` — Wraps all dashboard routes; redirects to `/login` if unauthenticated
- `RoleGuard` — Checks user role; redirects if unauthorized
- `AdminGuard` — Restricts access to admin role
- `MerchantGuard` — Restricts access to merchant/admin roles

## Error Handling

- `app/global-error.tsx` — Catches unhandled runtime errors
- `app/(dashboard)/error.tsx` — Dashboard-specific error boundary with retry
- `app/not-found.tsx` — Custom 404 page
- `app/(dashboard)/loading.tsx` — Dashboard loading state
- `ApiError` class — Structured API error handling with error codes

## Performance Strategy

- `experimental.optimizePackageImports` for tree-shaking lucide-react, framer-motion, recharts
- Route-level code splitting via Next.js App Router
- `LoadingScreen` component for Suspense fallbacks
- Mock services use simulated delays to test loading states

## When Backend Is Ready

1. Set `NEXT_PUBLIC_API_URL` in `.env`
2. Replace mock service implementations with `api.get/post/put/delete` calls
3. Remove `services/mock-data.ts` (or keep for testing)
4. Add server-side middleware for auth verification
5. Enable Next.js image optimization (`images.unoptimized: false`)
