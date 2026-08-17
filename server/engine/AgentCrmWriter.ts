import { db } from '../db/database.js';
import { CrmEntityResolver } from './CrmEntityResolver.js';

export interface AgentCrmAction {
  action:
    | 'create_customer'
    | 'update_customer'
    | 'create_opportunity'
    | 'update_opportunity'
    | 'create_activity'
    | 'create_task'
    | 'update_task'
    | 'create_insight'
    | 'create_supplier';
  customer_id?: string;
  tenant_id?: string;
  external_id?: string;
  idempotency_key?: string;
  data: Record<string, any>;
}

export interface CrmWriteBackMetrics {
  actions_detected: number;
  actions_executed: number;
  created: number;
  updated: number;
  deduplicated: number;
  failed: number;
  errors: string[];
}

export class AgentCrmWriter {
  public static processActions(
    agentId: string,
    agentName: string,
    actions: AgentCrmAction[]
  ): CrmWriteBackMetrics {
    const metrics: CrmWriteBackMetrics = {
      actions_detected: actions.length,
      actions_executed: 0,
      created: 0,
      updated: 0,
      deduplicated: 0,
      failed: 0,
      errors: []
    };

    if (!Array.isArray(actions) || actions.length === 0) {
      return metrics;
    }

    for (const act of actions) {
      try {
        // Entity resolution if customer_id not explicitly given but identifiers are in data/query
        if (!act.customer_id && (act.tenant_id || act.external_id || act.data.name || act.data.phone)) {
          const resolved = CrmEntityResolver.resolveCustomer({
            tenantId: act.tenant_id,
            externalId: act.external_id,
            phone: act.data.phone,
            email: act.data.email,
            rfc: act.data.rfc,
            name: act.data.name,
            businessName: act.data.businessName
          });
          if (resolved.customer) {
            act.customer_id = resolved.customer.id;
            if (!act.tenant_id) act.tenant_id = resolved.customer.tenantId;
          }
        }

        switch (act.action) {
          case 'create_customer': {
            const resolved = CrmEntityResolver.resolveCustomer({
              tenantId: act.data.tenantId,
              externalId: act.external_id,
              phone: act.data.phone,
              email: act.data.email,
              rfc: act.data.rfc,
              name: act.data.name
            });

            if (resolved.customer && resolved.confidence >= 0.8) {
              db.updateCustomer(resolved.customer.id, act.data);
              metrics.updated++;
              metrics.deduplicated++;
            } else {
              const cust = db.createCustomer({
                ...act.data,
                externalId: act.external_id
              } as any);
              metrics.created++;
              db.addAuditLog({
                id: `audit-agent-cust-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
                tenantId: cust.tenantId,
                action: 'AGENT_CRM_CUSTOMER_CREATED',
                actor: agentName,
                timestamp: new Date().toISOString(),
                before: null,
                after: cust,
                reason: `Creado por ${agentName} (${agentId})`,
                sourceEvidence: `Agent Execution ${agentId}`
              });
            }
            metrics.actions_executed++;
            break;
          }

          case 'update_customer': {
            const targetId = act.customer_id || act.tenant_id;
            if (!targetId) {
              throw new Error('Missing customer_id or tenant_id for update_customer');
            }
            const customer = db.getCustomer(targetId) || db.listCustomers({}).find((c) => c.tenantId === targetId);
            if (customer) {
              const before = { ...customer };
              const updated = db.updateCustomer(customer.id, act.data);
              metrics.updated++;
              metrics.actions_executed++;
              db.addAuditLog({
                id: `audit-agent-cust-upd-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
                tenantId: customer.tenantId,
                action: 'AGENT_CRM_CUSTOMER_UPDATED',
                actor: agentName,
                timestamp: new Date().toISOString(),
                before,
                after: updated,
                reason: `Actualizado por ${agentName} (${agentId})`,
                sourceEvidence: `Agent Execution ${agentId}`
              });
            } else {
              throw new Error(`Customer target ${targetId} not found for update`);
            }
            break;
          }

          case 'create_opportunity': {
            const existingOpps = db.listDealOpportunities({});
            const found = act.external_id
              ? existingOpps.find((o: any) => o.externalId === act.external_id)
              : null;

            if (found) {
              db.updateDealOpportunity(found.id, act.data);
              metrics.updated++;
              metrics.deduplicated++;
            } else {
              const opp = db.createDealOpportunity({
                ...act.data,
                customerId: act.customer_id || act.data.customerId || 'cust-cdmx-1',
                tenantId: act.tenant_id || act.data.tenantId || 'tenant-cdmx-01',
                externalId: act.external_id,
                source: 'AI_INVENTORY_AGENT'
              } as any);
              metrics.created++;
              db.addAuditLog({
                id: `audit-agent-opp-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
                tenantId: opp.tenantId,
                action: 'AGENT_CRM_OPPORTUNITY_CREATED',
                actor: agentName,
                timestamp: new Date().toISOString(),
                before: null,
                after: opp,
                reason: `Oportunidad comercial generada por ${agentName}`,
                sourceEvidence: `Agent Execution ${agentId}`
              });
            }
            metrics.actions_executed++;
            break;
          }

          case 'update_opportunity': {
            if (!act.customer_id) throw new Error('Missing customer_id for update_opportunity');
            const opps = db.listDealOpportunities({ customerId: act.customer_id });
            if (opps.length > 0) {
              db.updateDealOpportunity(opps[0].id, act.data);
              metrics.updated++;
              metrics.actions_executed++;
            }
            break;
          }

          case 'create_activity': {
            const customerId = act.customer_id || 'cust-cdmx-1';
            const tenantId = act.tenant_id || 'tenant-cdmx-01';
            const idempotencyKey = act.idempotency_key || `act-${agentId}-${customerId}-${act.data.title || Date.now()}`;
            const existingActs = db.listActivities({ customerId });
            const duplicate = existingActs.find((a: any) => a.idempotencyKey === idempotencyKey);

            if (duplicate) {
              metrics.deduplicated++;
            } else {
              db.createActivity({
                ...act.data,
                customerId,
                tenantId,
                idempotencyKey,
                source: 'AI_AGENT'
              } as any);
              metrics.created++;
              metrics.actions_executed++;
            }
            break;
          }

          case 'create_task': {
            const customerId = act.customer_id || 'cust-cdmx-1';
            const tenantId = act.tenant_id || 'tenant-cdmx-01';
            const idempotencyKey = act.idempotency_key || `task-${agentId}-${customerId}-${act.data.title}`;
            const existingTasks = db.listTasks({ customerId });
            const duplicate = existingTasks.find((t: any) => t.idempotencyKey === idempotencyKey || t.title === act.data.title);

            if (duplicate) {
              metrics.deduplicated++;
            } else {
              db.createTask({
                ...act.data,
                customerId,
                tenantId,
                idempotencyKey,
                source: 'AI_AUTONOMOUS'
              } as any);
              metrics.created++;
              metrics.actions_executed++;
            }
            break;
          }

          case 'create_insight': {
            const customerId = act.customer_id || 'cust-cdmx-1';
            const tenantId = act.tenant_id || 'tenant-cdmx-01';
            const idempotencyKey = act.idempotency_key || `insight-${agentId}-${customerId}-${act.data.title}`;
            const existingInsights = db.listAiInsights(customerId);
            const duplicate = existingInsights.find((i: any) => i.idempotencyKey === idempotencyKey || i.title === act.data.title);

            if (duplicate) {
              metrics.deduplicated++;
            } else {
              db.createAiInsight({
                ...act.data,
                customerId,
                tenantId,
                idempotencyKey
              } as any);
              metrics.created++;
              metrics.actions_executed++;
            }
            break;
          }

          case 'create_supplier': {
            db.createSupplierPartner(act.data);
            metrics.created++;
            metrics.actions_executed++;
            break;
          }

          default:
            break;
        }
      } catch (err: any) {
        metrics.failed++;
        metrics.errors.push(`Action ${act.action} failed: ${err.message}`);
      }
    }

    return metrics;
  }
}
