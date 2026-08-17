import OpenAI from 'openai';

let openaiClient: OpenAI | null = null;

export function getOpenAIClient(): OpenAI | null {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return null;
  }
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: key,
    });
  }
  return openaiClient;
}

/**
 * Direct client helper instantiated with process.env.OPENAI_API_KEY
 */
export const createOpenAI = () => {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
};

export function isOpenAIConfigured(): boolean {
  const key = process.env.OPENAI_API_KEY;
  return !!key && key.startsWith('sk-') && key.length > 20;
}

/**
 * Diagnostic status for OpenAI configuration without exposing secrets
 */
export function getOpenAIStatus() {
  const key = process.env.OPENAI_API_KEY;

  return {
    configured: Boolean(key),
    validFormat: Boolean(key?.startsWith('sk-')),
    keyLength: key?.length ?? 0,
    model: 'gpt-4o-mini',
  };
}

export interface StoreAdvisorContext {
  storeName?: string;
  totalProducts?: number;
  criticalStockouts?: number;
  potentialSavings?: number;
  recentAlerts?: string[];
}

/**
 * Generates an executive daily morning brief or synthesis using OpenAI.
 */
export async function generateStoreSynthesisOpenAI(params: {
  criticalStockoutsCount: number;
  criticalProductNames: string[];
  potentialSavings: number;
  marginSqueezeCount: number;
  totalProductsScanned: number;
}): Promise<string> {
  const client = getOpenAIClient();
  if (!client) {
    throw new Error('OPENAI_API_KEY is not configured in the environment.');
  }

  const prompt = `
Actúa como el Store Manager AI & Asesor Estratégico de "Abarrotes IA" para una tienda de abarrotes en México (Don Pedro).
Datos operativos actuales:
- Desabastos críticos detectados: ${params.criticalStockoutsCount} productos (${params.criticalProductNames.join(', ') || 'Ninguno'}).
- Ahorro potencial detectado en mercado mayorista (Scorpion, Zorro, Central de Abastos): $${params.potentialSavings.toFixed(2)} MXN.
- Alertas de compresión de margen: ${params.marginSqueezeCount}.
- Productos escaneados y monitoreados: ${params.totalProductsScanned}.

Genera una síntesis ejecutiva clara, profesional y motivadora (máximo 3 párrafos y 3 acciones directas en viñetas).
Enfócate en maximizar la ganancia en mostrador, defender el margen y aprovechar las mejores compras de mayoreo. Formato Markdown.
`;

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'Eres el cerebro y asesor financiero inteligente de Abarrotes IA para tenderos y comerciantes en México.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 800,
  });

  return response.choices[0]?.message?.content || '';
}

/**
 * Answers questions from the store owner using OpenAI with full store & market context.
 */
export async function chatStoreAdvisorOpenAI(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  context?: StoreAdvisorContext
): Promise<string> {
  const client = getOpenAIClient();
  if (!client) {
    throw new Error('OPENAI_API_KEY is not configured in the environment.');
  }

  const systemContext = `
Eres el Asesor Inteligente de Abarrotes IA integrado en la tienda.
Tu objetivo es ayudar al dueño de la tienda ("Don Pedro" o comerciante) a:
1. Tomar decisiones de compra inteligentes comparando precios de mayoreo (Scorpion, Zorro Abarrotero, Central de Abastos, Puma).
2. Calcular márgenes brutos y precios de venta ideales en mostrador (ej. 20% a 35% de margen).
3. Evitar mermas y desabastos de productos de alta rotación (Coca-Cola, Aceite Nutrioli, Sabritas, Huevo, Jabón Zote, Azúcar, Frijol, etc.).
4. Explicar oportunidades de ahorro y estrategias de flujo de caja.

Habla en un tono amigable, claro, respetuoso, con terminología de comercio mexicano (piezas, cajas, margen, mayoreo, mostrador, ticket promedio), sin tecnicismos innecesarios de informática.

${context ? `Contexto actual de la tienda:
- Productos en catálogo: ${context.totalProducts || 24}
- Desabastos críticos: ${context.criticalStockouts || 0}
- Ahorros identificados: $${(context.potentialSavings || 0).toFixed(2)} MXN
${context.recentAlerts?.length ? `- Alertas recientes: ${context.recentAlerts.join('; ')}` : ''}` : ''}
`;

  const formattedMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemContext },
    ...messages,
  ];

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: formattedMessages,
    temperature: 0.7,
    max_tokens: 1000,
  });

  return response.choices[0]?.message?.content || 'No se pudo generar respuesta del asesor.';
}
