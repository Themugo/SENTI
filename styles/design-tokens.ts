/**
 * SENTI Design System Tokens
 * Single source of truth for all design decisions.
 * Consumed by tailwind.config.ts, globals.css, and components.
 */

export const colorTokens = {
  primary: {
    DEFAULT: 'hsl(var(--primary))',
    foreground: 'hsl(var(--primary-foreground))',
    50: 'hsl(160 84% 95%)',
    100: 'hsl(160 84% 88%)',
    200: 'hsl(160 84% 78%)',
    300: 'hsl(160 84% 65%)',
    400: 'hsl(160 84% 50%)',
    500: 'hsl(160 84% 40%)',
    600: 'hsl(160 84% 35%)',
    700: 'hsl(160 84% 27%)',
    800: 'hsl(160 84% 20%)',
    900: 'hsl(160 84% 15%)',
  },
  accent: {
    DEFAULT: 'hsl(var(--accent))',
    foreground: 'hsl(var(--accent-foreground))',
    50: 'hsl(186 90% 95%)',
    100: 'hsl(186 90% 88%)',
    200: 'hsl(186 90% 78%)',
    300: 'hsl(186 90% 65%)',
    400: 'hsl(186 90% 55%)',
    500: 'hsl(186 90% 45%)',
    600: 'hsl(186 90% 38%)',
    700: 'hsl(186 90% 30%)',
    800: 'hsl(186 90% 22%)',
    900: 'hsl(186 90% 15%)',
  },
  success: {
    DEFAULT: 'hsl(var(--success))',
    foreground: 'hsl(var(--success-foreground))',
  },
  warning: {
    DEFAULT: 'hsl(var(--warning))',
    foreground: 'hsl(var(--warning-foreground))',
  },
  destructive: {
    DEFAULT: 'hsl(var(--destructive))',
    foreground: 'hsl(var(--destructive-foreground))',
  },
  neutral: {
    background: 'hsl(var(--background))',
    foreground: 'hsl(var(--foreground))',
    card: 'hsl(var(--card))',
    muted: 'hsl(var(--muted))',
    border: 'hsl(var(--border))',
  },
} as const;

export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
} as const;

export const radius = {
  sm: 'calc(var(--radius) - 4px)',
  md: 'calc(var(--radius) - 2px)',
  lg: 'var(--radius)',
  xl: 'calc(var(--radius) + 4px)',
  '2xl': 'calc(var(--radius) + 8px)',
  full: '9999px',
} as const;

export const shadows = {
  sm: '0 1px 2px hsl(var(--foreground) / 0.04), 0 0 0 1px hsl(var(--border) / 0.5)',
  DEFAULT: '0 1px 2px hsl(var(--foreground) / 0.04), 0 4px 12px hsl(var(--foreground) / 0.06), 0 0 0 1px hsl(var(--border) / 0.5)',
  lg: '0 2px 4px hsl(var(--foreground) / 0.04), 0 8px 24px hsl(var(--foreground) / 0.08), 0 0 0 1px hsl(var(--border) / 0.5)',
  glow: '0 0 0 1px hsl(var(--primary) / 0.2), 0 8px 32px hsl(var(--primary) / 0.15)',
} as const;

export const typography = {
  fontFamily: {
    sans: 'var(--font-inter), system-ui, sans-serif',
    display: 'var(--font-display), var(--font-inter), sans-serif',
    mono: 'var(--font-mono), ui-monospace, monospace',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
    '7xl': '4.5rem',
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: '1.2',
    normal: '1.5',
    relaxed: '1.75',
  },
  letterSpacing: {
    tight: '-0.02em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
  },
} as const;

export const animationTokens = {
  duration: {
    fast: '0.15s',
    normal: '0.3s',
    slow: '0.5s',
    slower: '0.7s',
  },
  easing: {
    ease: [0.22, 1, 0.36, 1] as const,
    spring: { stiffness: 350, damping: 30 } as const,
    bounce: { stiffness: 200, damping: 15 } as const,
  },
  keyframes: {
    'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
    'fade-up': { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
    'scale-in': { from: { opacity: '0', transform: 'scale(0.96)' }, to: { opacity: '1', transform: 'scale(1)' } },
    shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
  },
} as const;

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export const zIndices = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  sidebar: 40,
  topbar: 30,
  overlay: 50,
  modal: 50,
  toast: 100,
} as const;
