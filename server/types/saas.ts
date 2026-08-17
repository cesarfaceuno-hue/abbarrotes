export type SubscriptionStatus = 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'GRACE_PERIOD' | 'SUSPENDED' | 'CANCELED' | 'EXPIRED';

export type PlanTier = 'STARTER' | 'PRO' | 'BUSINESS' | 'ENTERPRISE';

export type UserRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'CASHIER' | 'INVENTORY_MANAGER' | 'ANALYST';

export interface PlanDefinition {
  tier: PlanTier;
  name: string;
  priceMXN: number;
  billingInterval: 'MONTHLY' | 'YEARLY';
  maxStores: number;
  maxUsers: number;
  maxProducts: number;
  maxTransactionsPerMonth: number;
  maxAIExecutionsPerMonth: number;
  entitlements: {
    pos: boolean;
    inventory: boolean;
    kardex: boolean;
    storeBrain: boolean;
    priceIntelligence: boolean;
    aiAgents: boolean;
    multiStore: boolean;
    apiAccess: boolean;
  };
}

export interface Organization {
  id: string;
  name: string;
  rfc?: string;
  ownerUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tenant {
  id: string;
  organizationId: string;
  name: string;
  defaultStoreId: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'CANCELED';
  createdAt: string;
}

export interface Store {
  id: string;
  tenantId: string;
  organizationId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  createdAt: string;
}

export interface Membership {
  id: string;
  userId: string;
  organizationId: string;
  tenantId: string;
  storeIds: string[];
  role: UserRole;
  status: 'ACTIVE' | 'INVITED' | 'DISABLED';
  createdAt: string;
}

export interface Subscription {
  id: string;
  tenantId: string;
  organizationId: string;
  planTier: PlanTier;
  status: SubscriptionStatus;
  trialStartedAt?: string;
  trialEndsAt?: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  paymentProviderCustomerId?: string;
  paymentProviderSubscriptionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UsageRecord {
  tenantId: string;
  month: string; // YYYY-MM
  transactionsCount: number;
  aiExecutionsCount: number;
  productsCount: number;
  storesCount: number;
  usersCount: number;
  updatedAt: string;
}

export interface BillingEvent {
  eventId: string;
  tenantId: string;
  eventType: string;
  provider: string;
  payloadHash: string;
  timestamp: string;
  status: 'PROCESSED' | 'FAILED' | 'DUPLICATE';
}
