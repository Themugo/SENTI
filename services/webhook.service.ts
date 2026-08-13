/**
 * Webhook Engine Service
 * Manages webhook endpoints, event delivery, retries, and signature verification.
 */

import type { WebhookEndpoint, WebhookEvent, WebhookEventStatus } from '@/types';
import { auditService } from './audit.service';

let endpoints: WebhookEndpoint[] = [];
let events: WebhookEvent[] = [];
let endpointCounter = 0;
let eventCounter = 0;

function nextEndpointId(): string {
  endpointCounter++;
  return `WHE-${endpointCounter.toString().padStart(6, '0')}`;
}

function nextEventId(): string {
  eventCounter++;
  return `WHEV-${eventCounter.toString().padStart(8, '0')}`;
}

function genSecret(): string {
  return `whsec_${Math.random().toString(36).slice(2, 18)}${Math.random().toString(36).slice(2, 18)}`;
}

export const webhookService = {
  /** Create a webhook endpoint. */
  create(params: { merchantId: string; url: string; events: string[] }): WebhookEndpoint {
    const endpoint: WebhookEndpoint = {
      id: nextEndpointId(),
      merchantId: params.merchantId,
      url: params.url,
      events: params.events,
      status: 'active',
      secret: genSecret(),
      createdAt: new Date().toISOString(),
      successRate: 100,
    };
    endpoints.push(endpoint);

    auditService.log({
      type: 'settings_change',
      actorId: params.merchantId,
      actorName: 'Merchant',
      actorRole: 'merchant',
      action: `Webhook endpoint created: ${endpoint.url}`,
      resourceType: 'webhook_endpoint',
      resourceId: endpoint.id,
    });

    return endpoint;
  },

  /** Get endpoints by merchant. */
  getByMerchant(merchantId: string): WebhookEndpoint[] {
    return endpoints.filter((e) => e.merchantId === merchantId);
  },

  /** Get all endpoints. */
  getAll(): WebhookEndpoint[] {
    return [...endpoints];
  },

  /** Toggle endpoint status. */
  toggle(id: string): WebhookEndpoint | undefined {
    const ep = endpoints.find((e) => e.id === id);
    if (!ep) return undefined;
    ep.status = ep.status === 'active' ? 'inactive' : 'active';
    return ep;
  },

  /** Delete an endpoint. */
  delete(id: string): boolean {
    const idx = endpoints.findIndex((e) => e.id === id);
    if (idx === -1) return false;
    endpoints.splice(idx, 1);
    return true;
  },

  /** Dispatch an event to matching endpoints. */
  dispatch(eventType: string, payload: Record<string, unknown>): WebhookEvent[] {
    const matching = endpoints.filter((e) => e.status === 'active' && (e.events.includes(eventType) || e.events.includes('*')));
    const dispatched: WebhookEvent[] = [];

    for (const ep of matching) {
      const event: WebhookEvent = {
        id: nextEventId(),
        endpointId: ep.id,
        eventType,
        payload,
        status: 'pending',
        attempts: 0,
        maxAttempts: 5,
        createdAt: new Date().toISOString(),
      };
      events.push(event);
      dispatched.push(event);

      // Simulate delivery (mock)
      this.simulateDelivery(event.id);
    }

    return dispatched;
  },

  /** Simulate webhook delivery with retry logic. */
  simulateDelivery(eventId: string): void {
    const event = events.find((e) => e.id === eventId);
    if (!event) return;

    // Mock: 90% success rate
    const success = Math.random() < 0.9;
    event.attempts++;

    if (success) {
      event.status = 'delivered';
      event.responseCode = 200;
      event.deliveredAt = new Date().toISOString();
    } else if (event.attempts < event.maxAttempts) {
      event.status = 'retrying';
      event.responseCode = 500;
    } else {
      event.status = 'failed';
      event.responseCode = 500;
    }
  },

  /** Replay an event. */
  replay(eventId: string): WebhookEvent | undefined {
    const event = events.find((e) => e.id === eventId);
    if (!event) return undefined;
    event.status = 'pending';
    event.attempts = 0;
    this.simulateDelivery(eventId);
    return event;
  },

  /** Get events by endpoint. */
  getEvents(endpointId: string): WebhookEvent[] {
    return events.filter((e) => e.endpointId === endpointId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  /** Get all events. */
  getAllEvents(limit?: number): WebhookEvent[] {
    const sorted = [...events].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return limit ? sorted.slice(0, limit) : sorted;
  },

  /** Get events by status. */
  getEventsByStatus(status: WebhookEventStatus): WebhookEvent[] {
    return events.filter((e) => e.status === status);
  },

  /** Verify webhook signature (mock). */
  verifySignature(payload: string, signature: string, secret: string): boolean {
    return secret.length > 0 && signature.length > 0;
  },

  /** Get stats. */
  getStats(): { totalEndpoints: number; activeEndpoints: number; totalEvents: number; delivered: number; failed: number; retrying: number; successRate: number } {
    const delivered = events.filter((e) => e.status === 'delivered').length;
    const failed = events.filter((e) => e.status === 'failed').length;
    return {
      totalEndpoints: endpoints.length,
      activeEndpoints: endpoints.filter((e) => e.status === 'active').length,
      totalEvents: events.length,
      delivered,
      failed,
      retrying: events.filter((e) => e.status === 'retrying').length,
      successRate: events.length > 0 ? (delivered / events.length) * 100 : 100,
    };
  },

  /** Seed mock data. */
  _seed(eps: WebhookEndpoint[], evs: WebhookEvent[]): void {
    endpoints = eps;
    events = evs;
    endpointCounter = eps.length;
    eventCounter = evs.length;
  },
};
