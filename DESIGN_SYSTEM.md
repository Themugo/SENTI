# SENTI — Design System

## Brand

- **Product**: SENTI
- **Parent**: Frameworks Technologies
- **Tagline**: Money Without Borders.

## Color System

All colors are defined as CSS custom properties in `app/globals.css` and consumed via TailwindCSS classes.

### Primary — Deep Emerald
| Token | Light | Dark |
|-------|-------|------|
| `--primary` | `160 84% 27%` | `160 70% 45%` |
| `--primary-foreground` | `150 30% 98%` | `165 40% 6%` |

### Accent — Electric Cyan
| Token | Light | Dark |
|-------|-------|------|
| `--accent` | `186 90% 45%` | `186 85% 50%` |
| `--accent-foreground` | `186 80% 8%` | `186 80% 6%` |

### Semantic Colors
| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--success` | `142 71% 40%` | `142 65% 50%` | Positive actions, completed |
| `--warning` | `38 92% 50%` | `38 90% 55%` | Pending, caution |
| `--destructive` | `0 72% 51%` | `0 70% 55%` | Errors, destructive |

### Neutral — Slate
| Token | Light | Dark |
|-------|-------|------|
| `--background` | `150 20% 99%` | `165 40% 4%` |
| `--foreground` | `160 30% 10%` | `150 20% 96%` |
| `--card` | `0 0% 100%` | `165 35% 6%` |
| `--muted` | `150 16% 95%` | `165 25% 12%` |
| `--border` | `160 16% 90%` | `165 25% 15%` |

### Chart Colors
| Token | Value |
|-------|-------|
| `--chart-1` | Emerald |
| `--chart-2` | Cyan |
| `--chart-3` | Green |
| `--chart-4` | Amber |
| `--chart-5` | Red |

## Typography

| Role | Font | Weights |
|------|------|---------|
| Body | Inter (`--font-inter`) | 400, 500, 600 |
| Display/Headings | Plus Jakarta Sans (`--font-display`) | 600, 700 |
| Code/Data | JetBrains Mono (`--font-mono`) | 400 |

### Type Scale
| Size | Value | Usage |
|------|-------|-------|
| xs | 0.75rem | Labels, captions |
| sm | 0.875rem | Secondary text |
| base | 1rem | Body text |
| lg | 1.125rem | Emphasized text |
| xl | 1.25rem | Section headers |
| 2xl | 1.5rem | Card titles |
| 3xl | 1.875rem | Page sections |
| 4xl-7xl | 2.25rem-4.5rem | Hero, marketing |

### Line Height
- Body: 1.5 (150%)
- Headings: 1.2 (120%)

## Spacing

8px base unit:
`0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96`

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| sm | `calc(var(--radius) - 4px)` | Small elements |
| md | `calc(var(--radius) - 2px)` | Medium elements |
| lg | `0.75rem` (default) | Cards, inputs |
| xl | `calc(var(--radius) + 4px)` | Large containers |
| 2xl | `calc(var(--radius) + 8px)` | Feature cards |
| full | `9999px` | Pills, avatars |

## Shadows

| Token | Usage |
|-------|-------|
| shadow-sm | Subtle elevation |
| shadow-premium | Default card shadow |
| shadow-premium-lg | Hover/featured card shadow |
| shadow-glow-emerald | Primary CTA glow |

## Animation Tokens

Defined in `styles/design-tokens.ts`:
- Duration: fast (0.15s), normal (0.3s), slow (0.5s), slower (0.7s)
- Easing: `[0.22, 1, 0.36, 1]` (ease-out-quart)
- Spring: stiffness 350, damping 30

### Keyframes
- `fade-in`, `fade-up`, `scale-in`, `shimmer`, `pulse-glow`, `float`, `gradient-shift`

## Responsive Breakpoints

| Name | Width |
|------|-------|
| sm | 640px |
| md | 768px |
| lg | 1024px |
| xl | 1280px |
| 2xl | 1536px |

## Z-Index Scale

| Layer | Value |
|-------|-------|
| Base | 0 |
| Dropdown | 10 |
| Sticky | 20 |
| Topbar | 30 |
| Sidebar | 40 |
| Overlay/Modal | 50 |
| Toast | 100 |

## Icon Rules

- Use `lucide-react` exclusively
- Default size: `h-4 w-4` (16px) for inline, `h-5 w-5` (20px) for cards
- Decorative icons must have `aria-hidden="true"` or be wrapped in `aria-label`
- Interactive icons must have accessible labels

## Glass Effects

- `.glass` — Light mode glassmorphism (blur + saturate + border)
- `.glass-dark` — Dark mode glassmorphism
- Use sparingly — only for premium surfaces (hero overlays, floating bars)
