import {
  PlanTier,
  PlanDefinition,
  SubscriptionStatus,
  Organization,
  Tenant,
  Store,
  Membership,
  Subscription,
  UsageRecord,
  BillingEvent,
  UserRole
} from '../types/saas.js';
import crypto from 'crypto';

export const PLAN_CATALOG: Record<PlanTier, PlanDefinition> = {
  STARTER: {
    tier: 'STARTER',
    name: 'Abarrotes Starter (1 Tienda)',
    priceMXN: 499,
    billingInterval: 'MONTHLY',
    maxStores: 1,
    maxUsers: 2,
    maxProducts: 500,
    maxTransactionsPerMonth: 3000,
    maxAIExecutionsPerMonth: 50,
    entitlements: {
      pos: true,
      inventory: true,
      kardex: true,
      storeBrain: true,
      priceIntelligence: false,
      aiAgents: false,
      multiStore: false,
      apiAccess: false
    }
  },
  PRO: {
    tier: 'PRO',
    name: 'Abarrotes Pro (Control & Precios)',
    priceMXN: 1299,
    billingInterval: 'MONTHLY',
    maxStores: 3,
    maxUsers: 5,
    maxProducts: 2500,
    maxTransactionsPerMonth: 15000,
    maxAIExecutionsPerMonth: 500,
    entitlements: {
      pos: true,
      inventory: true,
      kardex: true,
      storeBrain: true,
      priceIntelligence: true,
      aiAgents: true,
      multiStore: true,
      apiAccess: false
    }
  },
  BUSINESS: {
    tier: 'BUSINESS',
    name: 'Abarrotes Business (Multi-Sucursal & IA)',
    priceMXN: 2999,
    billingInterval: 'MONTHLY',
    maxStores: 10,
    maxUsers: 20,
    maxProducts: 10000,
    maxTransactionsPerMonth: 60000,
    maxAIExecutionsPerMonth: 3000,
    entitlements: {
      pos: true,
      inventory: true,
      kardex: true,
      storeBrain: true,
      priceIntelligence: true,
      aiAgents: true,
      multiStore: true,
      apiAccess: true
    }
  },
  ENTERPRISE: {
    tier: 'ENTERPRISE',
    name: 'Abarrotes Enterprise (Ilimitado)',
    priceMXN: 6999,
    billingInterval: 'MONTHLY',
    maxStores: 999,
    maxUsers: 999,
    maxProducts: 99999,
    maxTransactionsPerMonth: 999999,
    maxAIExecutionsPerMonth: 99999,
    entitlements: {
      pos: true,
      inventory: true,
      kardex: true,
      storeBrain: true,
      priceIntelligence: true,
      aiAgents: true,
      multiStore: true,
      apiAccess: true
    }
  }
};

export class SaaSEngine {
  private organizations: Map<string, Organization> = new Map();
  private tenants: Map<string, Tenant> = new Map();
  private stores: Map<string, Store> = new Map();
  private memberships: Map<string, Membership> = new Map();
  private subscriptions: Map<string, Subscription> = new Map();
  private usageRecords: Map<string, UsageRecord> = new Map();
  private billingEvents: Set<string> = new Set(); // For webhook idempotency

  constructor() {
    // Seed default demo organization & tenant
    this.seedDefaultTenant();
  }

  private seedDefaultTenant() {
    const orgId = 'org-cdmx-01';
    const tenantId = 'tenant-cdmx-01';
    const storeId = 'store-cdmx-centro';

    this.organizations.set(orgId, {
      id: orgId,
      name: 'Abarrotes Don Pepe (CDMX)',
      rfc: 'XAXX010101000',
      ownerUserId: 'user-owner-01',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    this.tenants.set(tenantId, {
      id: tenantId,
      organizationId: orgId,
      name: 'Don Pepe Centro',
      defaultStoreId: storeId,
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    });

    this.stores.set(storeId, {
      id: storeId,
      tenantId: tenantId,
      organizationId: orgId,
      name: 'Sucursal Centro CDMX',
      address: 'Av. Insurgentes Sur 420',
      city: 'Ciudad de México',
      state: 'CDMX',
      postalCode: '06700',
      createdAt: new Date().toISOString()
    });

    this.memberships.set('mem-01', {
      id: 'mem-01',
      userId: 'user-owner-01',
      organizationId: orgId,
      tenantId: tenantId,
      storeIds: [storeId],
      role: 'OWNER',
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    });

    const now = new Date();
    const periodEnd = new Date();
    periodEnd.setDate(now.getDate() + 30);

    this.subscriptions.set(tenantId, {
      id: 'sub-01',
      tenantId: tenantId,
      organizationId: orgId,
      planTier: 'BUSINESS',
      status: 'ACTIVE',
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: periodEnd.toISOString(),
      cancelAtPeriodEnd: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    });
  }

  public getPlan(tier: PlanTier): PlanDefinition {
    return PLAN_CATALOG[tier] || PLAN_CATALOG.STARTER;
  }

  public getTenantSubscription(tenantId: string): Subscription | undefined {
    return this.subscriptions.get(tenantId);
  }

  public canAccess(tenantId: string, featureKey: keyof PlanDefinition['entitlements']): boolean {
    const sub = this.subscriptions.get(tenantId);
    if (!sub || (sub.status !== 'ACTIVE' && sub.status !== 'TRIALING')) {
      return false;
    }
    const plan = PLAN_CATALOG[sub.planTier];
    if (!plan) return false;
    return !!plan.entitlements[featureKey];
  }

  public recordUsage(tenantId: string, metric: 'transaction' | 'aiExecution'): void {
    const month = new Date().toISOString().slice(0, 7);
    const key = `${tenantId}:${month}`;
    let record = this.usageRecords.get(key);
    if (!record) {
      record = {
        tenantId,
        month,
        transactionsCount: 0,
        aiExecutionsCount: 0,
        productsCount: 150,
        storesCount: 1,
        usersCount: 2,
        updatedAt: new Date().toISOString()
      };
    }
    if (metric === 'transaction') record.transactionsCount++;
    if (metric === 'aiExecution') record.aiExecutionsCount++;
    record.updatedAt = new Date().toISOString();
    this.usageRecords.set(key, record);
  }

  public getUsage(tenantId: string): UsageRecord {
    const month = new Date().toISOString().slice(0, 7);
    const key = `${tenantId}:${month}`;
    return this.usageRecords.get(key) || {
      tenantId,
      month,
      transactionsCount: 1240,
      aiExecutionsCount: 88,
      productsCount: 150,
      storesCount: 1,
      usersCount: 2,
      updatedAt: new Date().toISOString()
    };
  }

  public processWebhookEvent(eventId: string, signature: string, eventType: string, tenantId: string, payload: any): { success: boolean; message: string } {
    // Webhook security & idempotency check
    if (this.billingEvents.has(eventId)) {
      return { success: true, message: 'Duplicate webhook event ignored (Idempotency verified)' };
    }

    if (!signature || signature.length < 10) {
      return { success: false, message: 'Invalid webhook signature' };
    }

    this.billingEvents.add(eventId);

    const sub = this.subscriptions.get(tenantId);
    if (sub) {
      if (eventType === 'invoice.payment_succeeded') {
        sub.status = 'ACTIVE';
        sub.updatedAt = new Date().toISOString();
      } else if (eventType === 'invoice.payment_failed') {
        sub.status = 'PAST_DUE';
        sub.updatedAt = new Date().toISOString();
      } else if (eventType === 'customer.subscription.deleted') {
        sub.status = 'CANCELED';
        sub.cancelAtPeriodEnd = false;
        sub.updatedAt = new Date().toISOString();
      }
      this.subscriptions.set(tenantId, sub);
    }

    return { success: true, message: `Successfully processed event ${eventType}` };
  }

  public provisionTenant(orgName: string, ownerEmail: string, planTier: PlanTier): { tenantId: string; organizationId: string; storeId: string } {
    const orgId = `org-${crypto.randomBytes(4).toString('hex')}`;
    const tenantId = `tenant-${crypto.randomBytes(4).toString('hex')}`;
    const storeId = `store-${crypto.randomBytes(4).toString('hex')}`;

    this.organizations.set(orgId, {
      id: orgId,
      name: orgName,
      ownerUserId: ownerEmail,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    this.tenants.set(tenantId, {
      id: tenantId,
      organizationId: orgId,
      name: orgName,
      defaultStoreId: storeId,
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    });

    this.stores.set(storeId, {
      id: storeId,
      tenantId: tenantId,
      organizationId: orgId,
      name: `${orgName} Sucursal Principal`,
      address: 'Centro CDMX',
      city: 'Ciudad de México',
      state: 'CDMX',
      postalCode: '06000',
      createdAt: new Date().toISOString()
    });

    const now = new Date();
    const trialEnd = new Date();
    trialEnd.setDate(now.getDate() + 14);

    this.subscriptions.set(tenantId, {
      id: `sub-${crypto.randomBytes(4).toString('hex')}`,
      tenantId: tenantId,
      organizationId: orgId,
      planTier: planTier,
      status: 'TRIALING',
      trialStartedAt: now.toISOString(),
      trialEndsAt: trialEnd.toISOString(),
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: trialEnd.toISOString(),
      cancelAtPeriodEnd: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    });

    return { tenantId, organizationId: orgId, storeId };
  }
}

export const saasEngine = new SaaSEngine();
