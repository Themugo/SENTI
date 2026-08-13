'use client';

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { ChartPoint } from '@/types';

const tooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '0.5rem',
  fontSize: '12px',
  color: 'hsl(var(--foreground))',
};

interface AreaChartProps {
  data: ChartPoint[];
  height?: number;
  showGrid?: boolean;
  color?: string;
  secondaryColor?: string;
}

export function RevenueAreaChart({
  data,
  height = 280,
  showGrid = true,
  color = 'hsl(160 84% 35%)',
  secondaryColor = 'hsl(186 90% 45%)',
}: AreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorSecondary" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={secondaryColor} stopOpacity={0.2} />
            <stop offset="95%" stopColor={secondaryColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />}
        <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
        <Tooltip contentStyle={tooltipStyle} />
        <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill="url(#colorPrimary)" name="This year" />
        {data[0]?.secondary !== undefined && (
          <Area type="monotone" dataKey="secondary" stroke={secondaryColor} strokeWidth={2} fill="url(#colorSecondary)" name="Last year" />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function VolumeBarChart({ data, height = 200, color = 'hsl(160 84% 35%)' }: { data: ChartPoint[]; height?: number; color?: string }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={1} />
            <stop offset="100%" stopColor={color} stopOpacity={0.4} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'hsl(var(--muted))' }} />
        <Bar dataKey="value" fill="url(#barGradient)" radius={[6, 6, 0, 0]} name="Volume" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SimpleLineChart({ data, height = 200, color = 'hsl(186 90% 45%)' }: { data: ChartPoint[]; height?: number; color?: string }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} name="Value" />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function CurrencyPieChart({ data, height = 240 }: { data: { name: string; value: number; color: string }[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
      </PieChart>
    </ResponsiveContainer>
  );
}
