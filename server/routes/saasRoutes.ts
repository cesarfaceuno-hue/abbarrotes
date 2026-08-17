import { Router } from 'express';
import { saasEngine, PLAN_CATALOG } from '../engine/SaaSEngine.js';

export const saasRouter = Router();

// GET Plan Catalog
saasRouter.get('/plans', (req, res) => {
  res.json({
    success: true,
    plans: PLAN_CATALOG
  });
});

// GET Tenant Subscription & Entitlements
saasRouter.get('/subscription/:tenantId', (req, res) => {
  try {
    const { tenantId } = req.params;
    const subscription = saasEngine.getTenantSubscription(tenantId);
    if (!subscription) {
      return res.status(404).json({ success: false, error: 'Subscription not found for tenant' });
    }
    const plan = saasEngine.getPlan(subscription.planTier);
    const usage = saasEngine.getUsage(tenantId);

    res.json({
      success: true,
      subscription,
      plan,
      usage
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST Check Feature Access (Entitlements)
saasRouter.post('/entitlements/check', (req, res) => {
  try {
    const { tenantId, featureKey } = req.body;
    if (!tenantId || !featureKey) {
      return res.status(400).json({ success: false, error: 'tenantId and featureKey are required' });
    }
    const allowed = saasEngine.canAccess(tenantId, featureKey);
    res.json({
      success: true,
      tenantId,
      featureKey,
      allowed
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST Provision New Tenant / Organization
saasRouter.post('/provision', (req, res) => {
  try {
    const { orgName, ownerEmail, planTier } = req.body;
    if (!orgName || !ownerEmail) {
      return res.status(400).json({ success: false, error: 'orgName and ownerEmail are required' });
    }
    const result = saasEngine.provisionTenant(orgName, ownerEmail, planTier || 'PRO');
    res.json({
      success: true,
      message: 'Tenant and organization successfully provisioned with 14-day trial.',
      ...result
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST Secure Billing Webhook (Stripe/Payment Provider simulation)
saasRouter.post('/webhook', (req, res) => {
  try {
    const signature = req.headers['x-provider-signature'] as string || 'test-sig';
    const { eventId, eventType, tenantId, payload } = req.body;

    if (!eventId || !eventType || !tenantId) {
      return res.status(400).json({ success: false, error: 'Missing required webhook parameters' });
    }

    const result = saasEngine.processWebhookEvent(eventId, signature, eventType, tenantId, payload);
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
