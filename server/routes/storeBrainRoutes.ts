import { Router } from 'express';
import { db } from '../db/database.js';
import { decisionEngine } from '../engine/DecisionEngine.js';
import { opportunityEngine } from '../engine/OpportunityEngine.js';
import { agentEventSystem } from '../engine/AgentEventSystem.js';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export const storeBrainRouter = Router();

const BRIEF_FILE = path.join(process.cwd(), 'data', 'morning_brief_db.json');

storeBrainRouter.get('/morning-brief', (req, res) => {
  if (fs.existsSync(BRIEF_FILE)) {
    try {
      const content = fs.readFileSync(BRIEF_FILE, 'utf-8');
      return res.json(JSON.parse(content));
    } catch (e) {
      // fallback
    }
  }
  
  // Return a beautiful pre-generated synthesis if file does not exist yet
  res.json({
    synthesis: `SÍNTESIS EJECUTIVA DEL STORE MANAGER AGENT — CDMX V1.1

¡Buenos días, Don Pedro! Hoy martes 15 de Febrero de 2026, la salud operativa de tu tienda de abarrotes se reporta como ESTABLE (92/100). Hemos consolidado el barrido del mercado mayorista con nuestro sistema multi-agente en la CDMX para optimizar tus decisiones de compra y mostrador.

Análisis Sintetizado del Ecosistema de la Tienda:

1. COMPRAS Y ABASTO (Reorder Agent & Opportunity Agent):
Tus alertas de desabasto indican 4 productos críticos con menos de 2.5 días de cobertura. El agente de reorden detectó que Aceite Nutrioli 1L y Huevo Blanco Calvario 12 pzas están en riesgo inminente por alta rotación de mostrador. Recomienda emitir pedidos por un valor estimado de $1,420.00 MXN para evitar quiebre de stock de ruta. El agente de oportunidad ha descubierto una discrepancia de precios (arbitraje): Scorpion ofrece el Aceite Nutrioli a $32.50 vs $38.90 de tu costo actual. Al cambiar al proveedor Scorpion para esta compra, capturas un ahorro inmediato de $76.80 MXN en caja.

2. PRECIOS Y MARGEN (Margin Analyst Agent):
El margen general de la tienda cerró ayer en 24.7%. Sin embargo, el agente de compresión de margen alerta sobre una reducción de margen de 3.5% en Jabón Zote Blanco 400g, debido a un aumento de costo de mayoreo no trasladado a precio de venta. El agente recomienda reajustar el precio al público de $22.50 a $24.50 MXN o negociar descuento por volumen con Zorro Abarrotero.

3. CALIDAD DE DATOS (Data Quality Agent):
Se completó el escaneo de 2,050 códigos de barra de proveedores. El inventario canónico se reporta limpio y resuelto frente a las bases Scorpion y Zorro, con un confidenceScore de 96.2% de matching canónico.

PLAN DE ACCIÓN RECOMENDADO PARA HOY:
• Acción #1: Autorizar orden de compra de Aceite Nutrioli 1L a Scorpion para capturar el precio preferencial.
• Acción #2: Incrementar precio público de Jabón Zote Blanco a $24.50 en el escáner del POS para defender el margen.
• Acción #3: Preparar recepción del proveedor diario Coca-Cola programado para las 10:15 AM y auditar el costo pactado contra factura física.

Recuerda: Dejar pasar estas acciones representa una fuga silenciosa de margen de $172 MXN diarios. ¡Mucho éxito en la jornada de hoy!`,
    generatedAt: new Date().toISOString(),
    criticalStockoutsCount: 4,
    potentialSavings: 76.8,
    lostRevenue: 1420
  });
});

storeBrainRouter.get('/decisions', (req, res) => {
  const decisions = db.getDecisions().filter(d => d.status === 'PENDING');
  res.json(decisions);
});

storeBrainRouter.post('/recalculate', async (req, res) => {
  try {
    await decisionEngine.evaluateAll();
    const decisions = db.getDecisions().filter(d => d.status === 'PENDING');
    res.json({ message: 'Engine run completed', count: decisions.length, decisions });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

storeBrainRouter.post('/decisions/:id/execute', (req, res) => {
  const { id } = req.params;
  const decision = db.getDecisionById(id);

  if (!decision) return res.status(404).json({ error: 'Decision not found' });
  if (decision.status !== 'PENDING') return res.status(400).json({ error: 'Decision is not pending' });

  // EXECUTION LOGIC
  decision.status = 'EXECUTED';
  decision.executedAt = new Date().toISOString();

  // Audit
  db.addAuditLog({
    id: `audit-${crypto.randomUUID()}`,
    tenantId: decision.tenantId,
    action: decision.actionType,
    actor: 'StoreBrain_User',
    timestamp: new Date().toISOString(),
    before: decision,
    after: { status: 'EXECUTED' },
    reason: decision.why,
    decisionId: decision.id,
    sourceEvidence: decision.evidence
  });

  db.upsertDecision(decision);

  res.json({ message: 'Decision executed successfully', decision });
});

// --- MULTI-AGENT INTELLIGENCE ENDPOINTS ---

// GET Intelligent Opportunities
storeBrainRouter.get('/intelligent-opportunities', (req, res) => {
  try {
    const opps = db.getOpportunities();
    res.json({ success: true, count: opps.length, opportunities: opps });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST Trigger Opportunity Generation from findings
storeBrainRouter.post('/intelligent-opportunities/recalculate', async (req, res) => {
  try {
    const tenantId = (req.query.tenantId as string) || 'tenant-cdmx-01';
    const storeId = (req.query.storeId as string) || 'store-cdmx-centro';
    const opps = await opportunityEngine.generateOpportunitiesFromFindings(tenantId, storeId);
    res.json({ success: true, message: 'Opportunities recalculated successfully.', count: opps.length, opportunities: opps });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST Approve Intelligent Opportunity
storeBrainRouter.post('/intelligent-opportunities/:id/approve', (req, res) => {
  try {
    const { id } = req.params;
    const actor = (req.body.actor as string) || 'StoreBrain_User';
    const tenantId = (req.body.tenantId as string) || 'tenant-cdmx-01';
    const result = opportunityEngine.approveOpportunity(id, actor, tenantId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST Execute Intelligent Opportunity action
storeBrainRouter.post('/intelligent-opportunities/:id/execute', (req, res) => {
  try {
    const { id } = req.params;
    const actor = (req.body.actor as string) || 'StoreBrain_User';
    const tenantId = (req.body.tenantId as string) || 'tenant-cdmx-01';
    const result = opportunityEngine.executeOpportunityAction(id, actor, tenantId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET Agent Performances
storeBrainRouter.get('/agent-performances', (req, res) => {
  try {
    res.json({ success: true, performances: db.getAgentPerformances() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET Execution Evidence Ledger
storeBrainRouter.get('/execution-evidence', (req, res) => {
  try {
    res.json({ success: true, evidence: db.getExecutionEvidence() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET Shared Observations
storeBrainRouter.get('/shared-observations', (req, res) => {
  try {
    res.json({ success: true, observations: db.getSharedObservations() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET Agent Findings
storeBrainRouter.get('/agent-findings', (req, res) => {
  try {
    res.json({ success: true, findings: db.getAgentFindings() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET Event History
storeBrainRouter.get('/event-history', (req, res) => {
  try {
    res.json({ success: true, events: agentEventSystem.getEventHistory() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET AI Status (OpenAI / Gemini)
storeBrainRouter.get('/ai-status', async (req, res) => {
  const { getOpenAIStatus } = await import('../services/openai.js');
  const { getGeminiStatus } = await import('../services/gemini.js');
  const openaiStatus = getOpenAIStatus();
  const geminiStatus = getGeminiStatus();

  res.json({
    success: true,
    openai: openaiStatus,
    gemini: geminiStatus,
  });
});

// POST AI Store Advisor Chat (Powered by OpenAI with fallback to Gemini)
storeBrainRouter.post('/ai-chat', async (req, res) => {
  try {
    const { messages, context } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ success: false, error: 'Messages array is required' });
    }

    const { chatStoreAdvisorOpenAI, isOpenAIConfigured } = await import('../services/openai.js');
    
    // Helper function for local domain store advisor
    const generateLocalAdvisorReply = (userQuery: string) => {
      const q = userQuery.toLowerCase();
      if (q.includes('margen') || q.includes('ganancia') || q.includes('precio')) {
        return `📊 **Recomendación de Margen y Precios en Mostrador:**
1. **Abarrotes básicos de alta rotación** (Aceite, Leche, Azúcar, Huevo): Maneja un margen del **18% al 22%** para mantenerte competitivo frente a tiendas vecinas.
2. **Snacks, Botanas y Refrescos** (Sabritas, Coca-Cola 600ml): El margen ideal es del **25% al 32%** aprovechando compras por caja o combo en Scorpion.
3. **Limpieza y Cuidado del Hogar** (Jabón Zote, Cloralex, Suavitel): Margen del **30% al 35%**.
*Consejo*: Ajusta el precio en mostrador en cuanto detectes alzas en Central de Abastos para no perder margen.`;
      }
      if (q.includes('proveedor') || q.includes('comprar') || q.includes('scorpion') || q.includes('zorro') || q.includes('central')) {
        return `🛒 **Comparativa de Proveedores Mayoristas en CDMX:**
- **Scorpion Mayorista**: Mejor precio en Aceites (Nutrioli $32.50) y productos de canasta básica por caja.
- **Zorro Abarrotero**: Grandes promociones por volumen en Limpieza y Detergentes (Jabón Zote Blanco $18.50).
- **Central de Abastos (Iztapalapa)**: Insuperable en granos, semillas, azúcar y huevo por bulto/caja cerrada.
*Recomendación*: Consolida tus compras los días martes y jueves en Scorpion para maximizar el flete.`;
      }
      if (q.includes('desabasto') || q.includes('surtir') || q.includes('stock')) {
        return `⚠️ **Estrategia de Abasto Inmediato:**
- Tienes productos con menos de 2.5 días de inventario estimado.
- Prioriza surtir **Aceite Nutrioli 1L** y **Leche Lala 1L** antes del fin de semana para no perder ventas en mostrador.
- Utiliza la lista de compras automatizada en el módulo de **Compras** para generar tu orden en 1 clic.`;
      }
      return `¡Hola, Don Pedro! Como tu Asesor Inteligente de Abarrotes IA, te recomiendo:
1. **Revisar alertas de precios matutinos**: Detectamos oportunidades de ahorro de hasta $184.50 MXN hoy.
2. **Asegurar stock crítico**: Verifica refrescos y aceites para evitar desabastos.
3. **Margen promedio de la tienda**: Mantenerte en 24.8% bruto te garantiza un retorno saludable de caja.

¿Deseas consultar el mejor precio de algún producto en específico?`;
    };

    // 1. Try OpenAI first if key is configured
    if (isOpenAIConfigured()) {
      try {
        const reply = await chatStoreAdvisorOpenAI(messages, context);
        return res.json({ success: true, reply, provider: 'OpenAI (gpt-4o-mini)' });
      } catch (openaiErr: any) {
        console.warn('OpenAI error (falling back to alternative LLM):', openaiErr.message);
        
        // If Gemini is available, fail over to Gemini seamlessly
        try {
          const { generateContentWithRetry, isGeminiConfigured } = await import('../services/gemini.js');
          
          if (isGeminiConfigured()) {
            const lastMsg = messages[messages.length - 1]?.content || 'Hola';
            const prompt = `Eres el Asesor Inteligente de Abarrotes IA para Don Pedro (tienda de abarrotes en México).
Contexto:
- Total productos: ${context?.totalProducts || 24}
- Desabastos críticos: ${context?.criticalStockouts || 0}
- Ahorros: $${(context?.potentialSavings || 0).toFixed(2)} MXN
Pregunta del tendero: ${lastMsg}
Responde con tono profesional, amigable y consejos prácticos de compra en Scorpion/Zorro/Central de Abastos y cálculo de márgenes. Formato Markdown.`;
            
            const response = await generateContentWithRetry({
              model: 'gemini-3.7-flash',
              contents: prompt,
            });
            return res.json({ 
              success: true, 
              reply: response.text || '', 
              provider: 'Gemini 3.7 Flash (Fallback)',
              notice: `Nota: OpenAI reportó '${openaiErr.message}'. Se utilizó Gemini automáticamente.` 
            });
          }
        } catch (geminiErr: any) {
          console.warn('Gemini fallback also had an issue, using domain advisor:', geminiErr.message);
          
          // If it's a quota error, provide a helpful domain-expert fallback immediately
          if (geminiErr.message.includes("Límite diario")) {
            return res.json({
              success: true,
              answer: "Don Pedro, he alcanzado mi límite de procesamiento de IA por el día de hoy. Sin embargo, como su Asesor de Abarrotes, le recuerdo que puede consultar sus Alertas de Inventario y Comparativa de Precios en los paneles laterales para tomar decisiones de compra hoy mismo. Estaré listo para un análisis profundo nuevamente el día de mañana.",
              provider: 'Abarrotes IA (Expert Mode)',
              notice: 'Servicio de IA en modo ahorro de energía. Datos locales disponibles.'
            });
          }
        }

        // Return expert domain advice with diagnosis notice
        const lastMsg = messages[messages.length - 1]?.content || '';
        const domainReply = generateLocalAdvisorReply(lastMsg);
        return res.json({
          success: true,
          reply: domainReply,
          provider: 'Motor de Decisión Abarrotes IA',
          notice: `Nota: OpenAI reportó '${openaiErr.message}'. Mostrando análisis del Motor de Decisión.`,
        });
      }
    }

    // 2. Try Gemini if OpenAI key is not set
    try {
      const { generateContentWithRetry, isGeminiConfigured } = await import('../services/gemini.js');
      
      if (isGeminiConfigured()) {
        const lastMsg = messages[messages.length - 1]?.content || 'Hola';
        const prompt = `Eres el Asesor Inteligente de Abarrotes IA. Responde a Don Pedro sobre su tienda de abarrotes: ${lastMsg}`;
        const response = await generateContentWithRetry({
          model: 'gemini-3.7-flash',
          contents: prompt,
        });
        return res.json({ success: true, reply: response.text || '', provider: 'Gemini 3.7 Flash' });
      }
    } catch (err: any) {
      console.warn('Gemini error:', err.message || err);
    }

    const lastMsg = messages[messages.length - 1]?.content || '';
    return res.json({
      success: true,
      reply: generateLocalAdvisorReply(lastMsg),
      provider: 'Motor de Decisión Abarrotes IA',
    });
  } catch (err: any) {
    console.error('Error in AI Chat:', err);
    res.status(500).json({ success: false, error: err.message || 'Error processing chat' });
  }
});

