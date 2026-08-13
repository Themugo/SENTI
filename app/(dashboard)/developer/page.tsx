'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Copy, Key, Webhook, Code2, Terminal, Check,
  Eye, EyeOff, Trash2, Activity, BookOpen,
} from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/status-badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockApiKeys, mockWebhooks } from '@/services/mock-data';
import { formatDate, truncateMiddle } from '@/lib/utils';
import { toast } from 'sonner';

const codeExamples = {
  curl: `curl -X POST https://api.senti.com/v1/payments \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 2500,
    "currency": "USD",
    "description": "Premium consultation"
  }'`,
  javascript: `import { Senti } from '@senti/sdk';

const senti = new Senti('sk_live_...');

const payment = await senti.payments.create({
  amount: 2500,
  currency: 'USD',
  description: 'Premium consultation',
});

console.log(payment.id);`,
  python: `import senti

senti.api_key = 'sk_live_...'

payment = senti.Payment.create(
  amount=2500,
  currency='USD',
  description='Premium consultation',
)

print(payment.id)`,
};

export default function DeveloperPage() {
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [activeExample, setActiveExample] = useState('curl');

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Developer API" description="Build on SENTI with our RESTful API, SDKs, and webhooks.">
        <Button asChild variant="outline" size="sm" className="gap-1.5">
          <Link href="/docs">
            <BookOpen className="h-4 w-4" />
            Docs
          </Link>
        </Button>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Create Key
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="API Requests (30d)" value="1.2M" change={24.5} icon={<Activity className="h-5 w-5" />} />
        <StatCard title="Webhook Deliveries" value="48.2K" change={18.2} icon={<Webhook className="h-5 w-5" />} delay={0.05} />
        <StatCard title="Avg Response Time" value="142ms" change={-8.3} delay={0.1} />
      </div>

      <Tabs defaultValue="keys">
        <TabsList>
          <TabsTrigger value="keys" className="gap-1.5"><Key className="h-4 w-4" /> API Keys</TabsTrigger>
          <TabsTrigger value="webhooks" className="gap-1.5"><Webhook className="h-4 w-4" /> Webhooks</TabsTrigger>
          <TabsTrigger value="logs" className="gap-1.5"><Terminal className="h-4 w-4" /> Logs</TabsTrigger>
          <TabsTrigger value="sandbox" className="gap-1.5"><Code2 className="h-4 w-4" /> Sandbox</TabsTrigger>
        </TabsList>

        {/* API Keys */}
        <TabsContent value="keys" className="mt-4 space-y-4">
          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Name</th>
                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Key</th>
                    <th className="hidden px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground sm:table-cell">Environment</th>
                    <th className="hidden px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground md:table-cell">Last Used</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {mockApiKeys.map((key, i) => (
                    <motion.tr
                      key={key.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      className="border-b border-border transition-colors hover:bg-muted/40"
                    >
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium">{key.name}</p>
                        <p className="text-xs text-muted-foreground">Created {formatDate(key.createdAt)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <code className="rounded bg-muted px-2 py-1 font-mono text-xs">
                            {showKey[key.id] ? key.key : truncateMiddle(key.key)}
                          </code>
                          <button onClick={() => setShowKey((p) => ({ ...p, [key.id]: !p[key.id] }))} className="text-muted-foreground hover:text-foreground">
                            {showKey[key.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                          <button onClick={() => copyCode(key.key)} className="text-muted-foreground hover:text-foreground">
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell">
                        <Badge variant={key.environment === 'live' ? 'success' : 'outline'}>
                          {key.environment}
                        </Badge>
                      </td>
                      <td className="hidden px-4 py-3 md:table-cell">
                        <span className="text-sm text-muted-foreground">{key.lastUsed ? formatDate(key.lastUsed) : '—'}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Webhooks */}
        <TabsContent value="webhooks" className="mt-4 space-y-4">
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold font-display">Webhook Endpoints</h3>
              <Button size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" />
                Add Endpoint
              </Button>
            </div>
            <div className="space-y-3">
              {mockWebhooks.map((wh, i) => (
                <motion.div
                  key={wh.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="rounded-xl border border-border p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <code className="truncate text-sm font-mono">{wh.url}</code>
                        <Badge variant={wh.status === 'active' ? 'success' : 'outline'}>{wh.status}</Badge>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {wh.events.map((ev) => (
                          <span key={ev} className="rounded-md bg-muted px-2 py-0.5 text-xs font-mono text-muted-foreground">
                            {ev}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{wh.successRate}%</p>
                      <p className="text-xs text-muted-foreground">success rate</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Logs */}
        <TabsContent value="logs" className="mt-4">
          <Card className="overflow-hidden p-0">
            <div className="border-b border-border p-4">
              <h3 className="text-sm font-semibold">Recent API Requests</h3>
            </div>
            <div className="divide-y divide-border">
              {[
                { method: 'POST', path: '/v1/payments', status: 200, time: '142ms', ts: '2 min ago' },
                { method: 'GET', path: '/v1/balances', status: 200, time: '28ms', ts: '5 min ago' },
                { method: 'POST', path: '/v1/transfers', status: 201, time: '156ms', ts: '12 min ago' },
                { method: 'GET', path: '/v1/transactions', status: 200, time: '45ms', ts: '18 min ago' },
                { method: 'POST', path: '/v1/refunds', status: 400, time: '89ms', ts: '25 min ago' },
                { method: 'GET', path: '/v1/webhooks', status: 200, time: '32ms', ts: '1 hour ago' },
              ].map((log, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3 text-sm">
                  <Badge variant={log.status === 200 || log.status === 201 ? 'success' : 'error'}>
                    {log.status}
                  </Badge>
                  <span className="font-mono text-xs font-medium">{log.method}</span>
                  <code className="flex-1 font-mono text-xs text-muted-foreground">{log.path}</code>
                  <span className="text-xs text-muted-foreground">{log.time}</span>
                  <span className="hidden text-xs text-muted-foreground sm:block">{log.ts}</span>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Sandbox / Code examples */}
        <TabsContent value="sandbox" className="mt-4 space-y-4">
          <Card className="overflow-hidden p-0">
            <div className="border-b border-border p-4">
              <h3 className="text-sm font-semibold">Quick Start</h3>
              <p className="text-xs text-muted-foreground">Make your first API request</p>
            </div>
            <div className="flex gap-1 border-b border-border px-4 pt-3">
              {Object.keys(codeExamples).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveExample(lang)}
                  className={`rounded-t-lg px-3 py-2 text-xs font-medium transition-colors ${
                    activeExample === lang
                      ? 'border-b-2 border-primary text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {lang === 'curl' ? 'cURL' : lang === 'javascript' ? 'JavaScript' : 'Python'}
                </button>
              ))}
              <button
                onClick={() => copyCode(codeExamples[activeExample as keyof typeof codeExamples])}
                className="ml-auto flex items-center gap-1 px-3 py-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <Copy className="h-3.5 w-3.5" />
                Copy
              </button>
            </div>
            <pre className="overflow-x-auto p-5 text-sm leading-relaxed">
              <code className="font-mono">{codeExamples[activeExample as keyof typeof codeExamples]}</code>
            </pre>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold">SDKs</h3>
            <p className="text-xs text-muted-foreground">Official SDKs for every major language</p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {['JavaScript', 'Python', 'Go', 'Ruby', 'PHP', 'Java', 'Rust', 'Swift'].map((sdk) => (
                <div key={sdk} className="flex items-center gap-2 rounded-lg border border-border p-3 text-sm">
                  <Code2 className="h-4 w-4 text-primary" />
                  <span className="font-medium">{sdk}</span>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
