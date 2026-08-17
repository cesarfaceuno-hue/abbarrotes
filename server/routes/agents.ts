import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { agentOrchestrator } from '../engine/AgentOrchestrator.js';
import { googleSheetsIntelligenceAgent } from '../engine/GoogleSheetsIntelligenceAgent.js';

export const agentsRouter = Router();

// GET Agent Pipeline Observability Status
agentsRouter.get('/status', (req, res) => {
  try {
    const status = agentOrchestrator.getPipelineStatus();
    res.json({ success: true, observability: status });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET all registered agents & contracts
agentsRouter.get('/', (req, res) => {
  try {
    const agents = agentOrchestrator.getAgents();
    res.json({ success: true, agents });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET recent agent execution runs
agentsRouter.get('/runs', (req, res) => {
  try {
    const runs = agentOrchestrator.getRuns(50);
    res.json({ success: true, runs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET agent failures
agentsRouter.get('/failures', (req, res) => {
  try {
    const failures = agentOrchestrator.getFailures();
    res.json({ success: true, failures });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET Mini Cloud Database CSV Status
agentsRouter.get('/mini-cloud-status', (req, res) => {
  try {
    const fileInfo = googleSheetsIntelligenceAgent.exportMiniCloudDatabaseFile();
    res.json({ success: true, fileInfo });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET Download Mini Cloud Database CSV
agentsRouter.get('/download-mini-cloud', (req, res) => {
  try {
    const fileInfo = googleSheetsIntelligenceAgent.exportMiniCloudDatabaseFile();
    const filePath = path.join(process.cwd(), 'data', 'exports', 'abarrotes1_mini_cloud_database.csv');
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'Archivo de mininube aún no generado.' });
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="abarrotes1_mini_cloud_database.csv"');
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST Execute ALL 11 AI Agents and generate Mini Cloud Google Sheets CSV
agentsRouter.post('/run-all', async (req, res) => {
  try {
    const agentResults = await agentOrchestrator.executeFullPipeline();
    const miniCloudFile = googleSheetsIntelligenceAgent.exportMiniCloudDatabaseFile();

    res.json({
      success: true,
      message: 'Todos los agentes ejecutados e iniciados correctamente. Base de datos interna de mini nube generada.',
      agentsExecutedCount: agentResults.length,
      agentResults,
      miniCloudFile
    });
  } catch (err: any) {
    console.error('Error executing all agents:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST execute specific agent
agentsRouter.post('/:id/execute', async (req, res) => {
  const { id } = req.params;
  const { triggerType } = req.body;

  try {
    const result = await agentOrchestrator.executeAgent(id, triggerType || 'MANUAL');
    res.json({ success: true, result });
  } catch (err: any) {
    console.error(`Error executing agent ${id}:`, err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST execute full orchestrated pipeline (Discovery -> Matching -> ... -> Opportunity)
agentsRouter.post('/pipeline/execute', async (req, res) => {
  try {
    const results = await agentOrchestrator.executeFullPipeline();
    const miniCloudFile = googleSheetsIntelligenceAgent.exportMiniCloudDatabaseFile();
    res.json({ success: true, results, count: results.length, miniCloudFile });
  } catch (err: any) {
    console.error('Error executing agent pipeline:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

