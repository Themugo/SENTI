# SENTI — Components Reference

## Shared UI Components (`components/ui/`)

Built on shadcn/ui (Radix UI primitives + TailwindCSS).

| Component | File | Purpose |
|-----------|------|---------|
| Button | `button.tsx` | Primary, secondary, outline, ghost variants |
| Input | `input.tsx` | Text input with icon support |
| Card | `card.tsx` | Container with header, content, footer |
| Dialog | `dialog.tsx` | Modal dialog |
| Sheet | `sheet.tsx` | Slide-out drawer |
| Tabs | `tabs.tsx` | Tabbed navigation |
| Table | `table.tsx` | Data table primitives |
| Badge | `badge.tsx` | Status indicator |
| Avatar | `avatar.tsx` | User avatar with fallback |
| Tooltip | `tooltip.tsx` | Hover info tooltip |
| DropdownMenu | `dropdown-menu.tsx` | Contextual menu |
| Select | `select.tsx` | Dropdown select |
| Switch | `switch.tsx` | Toggle switch |
| Checkbox | `checkbox.tsx` | Checkbox input |
| Label | `label.tsx` | Form label |
| Sonner | `sonner.tsx` | Toast notifications |
| Skeleton | `skeleton.tsx` | Loading placeholder |
| ScrollArea | `scroll-area.tsx` | Custom scrollbar |
| Separator | `separator.tsx` | Visual divider |
| Progress | `progress.tsx` | Progress bar |
| LoadingScreen | `loading-screen.tsx` | Full-screen loading with SENTI branding |

## Custom Components (`components/`)

| Component | File | Purpose |
|-----------|------|---------|
| Sidebar | `sidebar.tsx` | Dashboard navigation with active state animation |
| Topbar | `topbar.tsx` | Dashboard top bar with search, notifications, user menu |
| MarketingNav | `marketing-nav.tsx` | Public site navigation + footer |
| PageHeader | `page-header.tsx` | Dashboard page title + description + actions |
| StatCard | `stat-card.tsx` | Metric card with change indicator |
| AnimatedCounter | `animated-counter.tsx` | Number counter with spring animation |
| Charts | `charts.tsx` | Recharts wrappers (area, bar, line, pie) |
| TransactionRow | `transaction-row.tsx` | Transaction list row + table |
| StatusBadge | `status-badge.tsx` | Transaction status + type badges |
| EmptyState | `empty-state.tsx` | Empty state placeholder |
| LoadingSkeleton | `loading-skeleton.tsx` | Table/card skeletons |

## Providers (`components/providers/`)

| Provider | File | Purpose |
|----------|------|---------|
| AppProviders | `app-providers.tsx` | Combines all providers in correct order |
| ThemeProvider | `theme-provider.tsx` | Dark/light mode via next-themes |
| QueryProvider | `query-provider.tsx` | TanStack Query client |

## Feature Components (`features/`)

| Component | File | Purpose |
|-----------|------|---------|
| AuthGuard | `features/identity/route-guards.tsx` | Protects routes requiring auth |
| RoleGuard | `features/identity/route-guards.tsx` | Role-based access control |
| AdminGuard | `features/identity/route-guards.tsx` | Admin-only access |
| MerchantGuard | `features/identity/route-guards.tsx` | Merchant/admin access |

## Usage Patterns

```tsx
// Page with header and stats
<PageHeader title="Dashboard" description="Overview">
  <Button>Action</Button>
</PageHeader>
<StatCard title="Revenue" value="$89,200" change={18.2} icon={<TrendingUp />} />

// Protected content
<AuthGuard>
  <DashboardContent />
</AuthGuard>

// Charts
<RevenueAreaChart data={data} height={280} />
<VolumeBarChart data={data} height={200} />
```
