import { db } from '../db/database.js';
import { agentOrchestrator } from './AgentOrchestrator.js';

export type AgentEventType =
  | 'SALE_COMPLETED'
  | 'INVENTORY_CHANGED'
  | 'PRICE_CHANGED'
  | 'PRODUCT_DISCOVERED'
  | 'SUPPLIER_UPDATED'
  | 'MARGIN_CHANGED'
  | 'STOCKOUT_RISK'
  | 'OPPORTUNITY_CREATED'
  | 'DECISION_APPROVED'
  | 'ACTION_EXECUTED'
  | 'ACTION_COMPLETED'
  | 'ACTION_REJECTED';

export interface AgentEvent {
  eventId: string;
  eventType: AgentEventType;
  tenantId: string;
  storeId: string;
  payload: Record<string, any>;
  timestamp: string;
}

export class AgentEventSystem {
  private static instance: AgentEventSystem;
  private listeners: Map<AgentEventType, Array<(event: AgentEvent) => Promise<void>>> = new Map();
  private eventHistory: AgentEvent[] = [];
  private activeEventTriggers: Set<string> = new Set();

  private constructor() {
    this.registerDefaultEventHandlers();
  }

  public static getInstance(): AgentEventSystem {
    if (!AgentEventSystem.instance) {
      AgentEventSystem.instance = new AgentEventSystem();
    }
    return AgentEventSystem.instance;
  }

  public subscribe(eventType: AgentEventType, callback: (event: AgentEvent) => Promise<void>) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(callback);
  }

  public async emit(eventType: AgentEventType, payload: Record<string, any>, tenantId = 'tenant-cdmx-01', storeId = 'store-cdmx-main') {
    // Re-entrancy guard to prevent recursive cascade loops
    const triggerKey = `${eventType}-${tenantId}`;
    if (this.activeEventTriggers.has(triggerKey)) {
      return;
    }

    const event: AgentEvent = {
      eventId: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      eventType,
      tenantId,
      storeId,
      payload,
      timestamp: new Date().toISOString()
    };

    this.eventHistory.push(event);

    // Save to audit logs
    try {
      db.addAuditLog({
        id: `audit-event-${event.eventId}`,
        tenantId,
        action: `EVENT_${eventType}`,
        actor: 'AgentEventSystem',
        timestamp: event.timestamp,
        before: {},
        after: { eventId: event.eventId, payloadSummary: Object.keys(payload) },
        reason: `Event system broadcast of ${eventType}`
      });
    } catch (err) {
      // Non-blocking
    }

    const handlers = this.listeners.get(eventType) || [];
    if (handlers.length > 0) {
      this.activeEventTriggers.add(triggerKey);
      try {
        for (const handler of handlers) {
          try {
            await handler(event);
          } catch (err) {
            console.error(`[EventSystem Error] Handler failed for event ${eventType}:`, err);
          }
        }
      } finally {
        setTimeout(() => {
          this.activeEventTriggers.delete(triggerKey);
        }, 1000);
      }
    }
  }

  private registerDefaultEventHandlers() {
    // 1. SALE_COMPLETED / INVENTORY_CHANGED -> Trigger Inventory Analyst
    this.subscribe('SALE_COMPLETED', async (evt) => {
      console.log(`[EventSystem] Triggering inventory analyst due to SALE_COMPLETED`);
      await agentOrchestrator.executeAgent('inventory-analyst-agent', 'EVENT_DRIVEN');
    });

    this.subscribe('INVENTORY_CHANGED', async (evt) => {
      console.log(`[EventSystem] Triggering inventory analyst due to INVENTORY_CHANGED`);
      await agentOrchestrator.executeAgent('inventory-analyst-agent', 'EVENT_DRIVEN');
    });

    // 2. PRICE_CHANGED -> Trigger Price Monitor & Margin Analyst
    this.subscribe('PRICE_CHANGED', async (evt) => {
      console.log(`[EventSystem] Triggering price monitor & margin analyst due to PRICE_CHANGED`);
      await agentOrchestrator.executeAgent('price-monitor-agent', 'EVENT_DRIVEN');
      await agentOrchestrator.executeAgent('margin-analyst-agent', 'EVENT_DRIVEN');
    });

    // 3. STOCKOUT_RISK -> Trigger Reorder Agent
    this.subscribe('STOCKOUT_RISK', async (evt) => {
      console.log(`[EventSystem] Triggering reorder agent due to STOCKOUT_RISK`);
      await agentOrchestrator.executeAgent('reorder-agent', 'EVENT_DRIVEN');
    });

    // 4. OPPORTUNITY_CREATED -> Trigger Store Manager Agent
    this.subscribe('OPPORTUNITY_CREATED', async (evt) => {
      console.log(`[EventSystem] Triggering store manager due to OPPORTUNITY_CREATED`);
      await agentOrchestrator.executeAgent('store-manager-agent', 'EVENT_DRIVEN');
    });
  }

  public getEventHistory(): AgentEvent[] {
    return this.eventHistory;
  }
}

export const agentEventSystem = AgentEventSystem.getInstance();
