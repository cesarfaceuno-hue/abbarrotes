import { Router } from 'express';
import { workflowEngine } from '../engine/WorkflowEngine.js';

export const workflowsRouter = Router();

// GET all workflows
workflowsRouter.get('/', (req, res) => {
  try {
    const workflows = workflowEngine.getWorkflows();
    res.json({ success: true, workflows });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET workflow by ID
workflowsRouter.get('/:id', (req, res) => {
  try {
    const workflow = workflowEngine.getWorkflowById(req.params.id);
    if (!workflow) {
      return res.status(404).json({ success: false, error: 'Workflow no encontrado' });
    }
    res.json({ success: true, workflow });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET recent workflow execution runs
workflowsRouter.get('/runs/history', (req, res) => {
  try {
    const runs = workflowEngine.getRuns(30);
    res.json({ success: true, runs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET execution run by ID
workflowsRouter.get('/runs/:runId', (req, res) => {
  try {
    const run = workflowEngine.getRunById(req.params.runId);
    if (!run) {
      return res.status(404).json({ success: false, error: 'Ejecución no encontrada' });
    }
    res.json({ success: true, run });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST execute specific workflow
workflowsRouter.post('/:id/execute', async (req, res) => {
  const { id } = req.params;
  const { triggeredBy } = req.body;

  try {
    const runRecord = await workflowEngine.executeWorkflow(
      id, 
      triggeredBy || 'Don Pedro (God Mode / CTO)'
    );
    res.json({
      success: true,
      message: `Workflow "${runRecord.workflowName}" ejecutado con éxito.`,
      run: runRecord
    });
  } catch (err: any) {
    console.error(`Error ejecutando workflow ${id}:`, err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create custom workflow
workflowsRouter.post('/create', (req, res) => {
  try {
    const { code, name, category, description, triggerType, cronSchedule, estimatedDuration, estimatedSavingsPotential, targetTenants, stages, requiredPermissions, autoApprovalThreshold } = req.body;
    
    if (!name || !stages || !Array.isArray(stages)) {
      return res.status(400).json({ success: false, error: 'Campos requeridos: name y stages (array).' });
    }

    const created = workflowEngine.createWorkflow({
      code: code || `WF-${Date.now().toString().slice(-3)}`,
      name,
      category: category || 'OPERATIONS',
      description: description || 'Flujo de trabajo personalizado.',
      triggerType: triggerType || 'MANUAL',
      cronSchedule: cronSchedule || 'Bajo Demanda',
      estimatedDuration: estimatedDuration || '30s',
      estimatedSavingsPotential: estimatedSavingsPotential || 'Variable',
      targetTenants: targetTenants || 'Tienda Actual',
      stages,
      requiredPermissions: requiredPermissions || ['INVENTORY_READ'],
      autoApprovalThreshold: autoApprovalThreshold || 5000
    });

    res.json({ success: true, workflow: created });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT update custom workflow
workflowsRouter.put('/:id', (req, res) => {
  try {
    const updated = workflowEngine.updateWorkflow(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Workflow no encontrado' });
    }
    res.json({ success: true, workflow: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE workflow
workflowsRouter.delete('/:id', (req, res) => {
  try {
    const deleted = workflowEngine.deleteWorkflow(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Workflow no encontrado o no se pudo eliminar' });
    }
    res.json({ success: true, message: 'Workflow eliminado correctamente' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

