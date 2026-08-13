# SENTI — Folder Structure

```
senti/
├── api/                          # API layer (ready for backend integration)
│   ├── client.ts                 # Fetch-based HTTP client
│   ├── routes.ts                 # Route registry
│   ├── interceptors.ts           # Auth token injection, error normalization
│   ├── error.ts                  # ApiError class with error codes
│   ├── types.ts                  # API request/response types
│   └── index.ts                  # Barrel export
│
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout (fonts, providers)
│   ├── page.tsx                  # Landing page
│   ├── globals.css              # Global styles + CSS variables
│   ├── not-found.tsx            # Custom 404
│   ├── global-error.tsx         # Global error boundary
│   │
│   ├── (auth)/                  # Auth route group
│   │   ├── layout.tsx           # Split-screen auth layout
│   │   ├── login/
│   │   ├── signup/
│   │   ├── forgot-password/
│   │   ├── verify-otp/
│   │   └── two-factor/
│   │
│   ├── (dashboard)/             # Dashboard route group (auth-protected)
│   │   ├── layout.tsx           # Sidebar + Topbar + AuthGuard
│   │   ├── loading.tsx          # Loading state
│   │   ├── error.tsx            # Error boundary
│   │   ├── dashboard/
│   │   ├── wallet/
│   │   ├── transactions/
│   │   ├── send-money/
│   │   ├── receive-money/
│   │   ├── payment-links/
│   │   ├── invoices/
│   │   ├── subscriptions/
│   │   ├── merchant/
│   │   ├── checkout/
│   │   ├── escrow/
│   │   ├── cards/
│   │   ├── exchange/
│   │   ├── analytics/
│   │   ├── developer/
│   │   ├── docs/
│   │   ├── settings/
│   │   ├── notifications/
│   │   └── admin/
│   │
│   └── (marketing)/             # Public marketing pages
│       ├── pricing/
│       └── help/
│
├── components/                   # Shared UI components
│   ├── providers/
│   │   └── app-providers.tsx     # Combined providers
│   ├── ui/                       # shadcn/ui primitives (38 components)
│   ├── sidebar.tsx
│   ├── topbar.tsx
│   ├── marketing-nav.tsx
│   ├── page-header.tsx
│   ├── stat-card.tsx
│   ├── animated-counter.tsx
│   ├── charts.tsx
│   ├── transaction-row.tsx
│   ├── status-badge.tsx
│   ├── empty-state.tsx
│   ├── loading-skeleton.tsx
│   ├── theme-provider.tsx
│   └── query-provider.tsx
│
├── features/                     # Feature-based modules
│   ├── identity/
│   │   ├── auth-context.tsx      # Auth state, login/signup/logout
│   │   └── route-guards.tsx      # AuthGuard, RoleGuard, AdminGuard
│   ├── wallet/
│   │   └── wallet-context.tsx    # Wallet state, balances
│   └── notifications/
│       └── notifications-context.tsx
│
├── services/                     # Mock service layer
│   ├── mock-data.ts              # Centralized mock data
│   ├── wallet.service.ts
│   ├── payment.service.ts
│   ├── merchant.service.ts
│   ├── auth.service.ts
│   ├── escrow.service.ts
│   ├── cards.service.ts
│   ├── transactions.service.ts
│   ├── analytics.service.ts
│   ├── notifications.service.ts
│   └── developer.service.ts
│
├── styles/                       # Design system
│   └── design-tokens.ts          # Typography, spacing, shadows, animation tokens
│
├── lib/                          # Shared utilities
│   └── utils.ts                  # cn(), formatters, converters
│
├── hooks/                        # Shared hooks
│   └── use-toast.ts              # (Legacy — replaced by sonner)
│
├── types/                        # Shared TypeScript types
│   └── index.ts
│
├── constants/                    # App constants
│   └── index.ts                  # Currencies, nav items, pricing plans
│
├── tests/                        # Test infrastructure
│   ├── unit/
│   │   └── utils.test.ts
│   └── e2e/
│       └── smoke.spec.ts
│
├── .env.example                  # Environment variable template
├── .env                          # Actual env vars (gitignored)
├── vitest.config.ts              # Unit test config
├── playwright.config.ts          # E2E test config
├── vitest.setup.ts               # Test setup
│
├── ARCHITECTURE.md
├── COMPONENTS.md
├── DESIGN_SYSTEM.md
├── FOLDER_STRUCTURE.md
├── API_READY.md
│
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── components.json
└── netlify.toml
```

## Key Principles

1. **Feature-first**: Each domain owns its context, hooks, and components
2. **Service layer**: All data access goes through services, not direct mock-data imports
3. **API-ready**: The `api/` layer is structured for backend integration without UI changes
4. **Shared UI**: All reusable components live in `components/ui/`
5. **Route groups**: `(auth)`, `(dashboard)`, `(marketing)` organize routes without URL impact
