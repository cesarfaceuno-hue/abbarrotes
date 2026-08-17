import { Router } from 'express';
import { productionCertificationEngine } from '../engine/ProductionCertificationEngine.js';
import { productionOperations } from '../engine/ProductionOperations.js';

export const productionRouter = Router();

// GET /api/production/health
productionRouter.get('/health', (req, res) => {
  try {
    const opsHealth = productionOperations.getHealthStatus();
    res.json({
      success: true,
      health: opsHealth
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/production/certification
productionRouter.get('/certification', (req, res) => {
  try {
    const runs = productionCertificationEngine.getRuns();
    res.json({
      success: true,
      runs
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/production/certification/:runId
productionRouter.get('/certification/:runId', (req, res) => {
  try {
    const { runId } = req.params;
    const run = productionCertificationEngine.getRunById(runId);
    if (!run) {
      return res.status(404).json({ success: false, error: 'Certification run not found' });
    }
    res.json({
      success: true,
      run
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/production/evidence
productionRouter.get('/evidence', (req, res) => {
  try {
    const evidence = productionCertificationEngine.getEvidence();
    res.json({
      success: true,
      evidence
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/production/evidence/:evidenceId
productionRouter.get('/evidence/:evidenceId', (req, res) => {
  try {
    const { evidenceId } = req.params;
    const ev = productionCertificationEngine.getEvidenceById(evidenceId);
    if (!ev) {
      return res.status(404).json({ success: false, error: 'Evidence record not found' });
    }
    res.json({
      success: true,
      evidence: ev
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/production/incidents
productionRouter.get('/incidents', (req, res) => {
  try {
    const incidents = productionCertificationEngine.getIncidents();
    res.json({
      success: true,
      incidents
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/production/incidents/:incidentId
productionRouter.get('/incidents/:incidentId', (req, res) => {
  try {
    const { incidentId } = req.params;
    const inc = productionCertificationEngine.getIncidentById(incidentId);
    if (!inc) {
      return res.status(404).json({ success: false, error: 'Incident not found' });
    }
    res.json({
      success: true,
      incident: inc
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/production/certification/run
productionRouter.post('/certification/run', async (req, res) => {
  try {
    const actor = req.body.actor || 'automated_agent';
    const run = await productionCertificationEngine.executeCertificationRun(actor);
    res.json({
      success: true,
      message: 'Certification suite executed successfully and persistent evidence generated.',
      run
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/production/incidents/:incidentId/acknowledge
productionRouter.post('/incidents/:incidentId/acknowledge', (req, res) => {
  try {
    const { incidentId } = req.params;
    const result = productionCertificationEngine.acknowledgeIncident(incidentId);
    if (!result.success) {
      return res.status(404).json({ success: false, error: 'Incident not found' });
    }
    res.json({
      success: true,
      message: 'Incident acknowledged.',
      incident: result.incident
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/production/incidents/:incidentId/resolve
productionRouter.post('/incidents/:incidentId/resolve', (req, res) => {
  try {
    const { incidentId } = req.params;
    const { rootCause, remediation } = req.body;
    if (!rootCause || !remediation) {
      return res.status(400).json({ success: false, error: 'rootCause and remediation are required' });
    }
    const result = productionCertificationEngine.resolveIncident(incidentId, rootCause, remediation);
    if (!result.success) {
      return res.status(404).json({ success: false, error: 'Incident not found' });
    }
    res.json({
      success: true,
      message: 'Incident resolved.',
      incident: result.incident
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
