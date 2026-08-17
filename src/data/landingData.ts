import { ProductComparisonDemo, FaqItem } from '../types';

export const MOCK_HERO_PRODUCT: ProductComparisonDemo = {
  id: 'coca-600',
  name: 'Coca-Cola Original',
  presentation: '600 ml — Caja c/24 pzas',
  category: 'Bebidas',
  regularPrice: 17.0,
  bestPrice: 15.2,
  potentialSavingsPerUnit: 1.8,
  rotation: 'Alta',
  currentStock: 24,
  dailySales: 12,
  recommendation: 'Comprar',
  whyReason: 'La última vez pagaste $17.00. Hoy encontramos $15.20. Vendes ~12 unidades al día y tienes inventario para 2 días.',
  actionSummary: 'Recomendamos comprar 50 unidades (2 cajas) para cubrir la semana sin congelar caja. Ahorro potencial: $90.00 MXN.',
  recoveryDaysEstimate: 2.5,
  estimatedMargin: 25.0,
  options: [
    { supplier: 'Preventa habitual de ruta', pricePerUnit: 17.0, condition: 'Precio de lista de la última compra' },
    { supplier: 'Mayorista de la zona', pricePerUnit: 15.2, isBest: true, condition: 'Caja con 24 piezas' },
    { supplier: 'Depósito cercano', pricePerUnit: 15.8, condition: 'Mínimo 2 cajas' },
    { supplier: 'Promoción especial en combo', pricePerUnit: 16.0, condition: 'Requiere comprar 5 cajas mixtas' },
  ],
};

export const MOCK_COMPARISON_PRODUCTS: ProductComparisonDemo[] = [
  {
    id: 'coca-600',
    name: 'Coca-Cola Original',
    presentation: '600 ml',
    category: 'Bebidas',
    regularPrice: 17.0,
    bestPrice: 15.2,
    potentialSavingsPerUnit: 1.8,
    rotation: 'Alta',
    currentStock: 24,
    dailySales: 12,
    recommendation: 'Comprar',
    whyReason: 'La última vez pagaste $17.00. Hoy encontramos $15.20. Vendes ~12 u/día y tienes inventario para 2 días. Recomendamos comprar 50 unidades (2 cajas).',
    actionSummary: 'Comprar 2 cajas hoy. Recuperas el capital en 4 días garantizados.',
    recoveryDaysEstimate: 4,
    estimatedMargin: 25.5,
    options: [
      { supplier: 'Proveedor A (Preventa habitual)', pricePerUnit: 17.0, notes: 'Precio de lista de tu última compra' },
      { supplier: 'Proveedor B (Mayorista local)', pricePerUnit: 15.2, isBest: true, condition: 'Caja con 24 pzas', notes: 'Mejor opción para TU tienda hoy' },
      { supplier: 'Proveedor C (Depósito regional)', pricePerUnit: 15.8, notes: 'Mínimo 2 cajas' },
      { supplier: 'Promoción combo 4+1', pricePerUnit: 16.0, notes: 'Costo unitario aparente $16.00' },
    ],
  },
  {
    id: 'leche-entera',
    name: 'Leche Entera',
    presentation: '1 Litro',
    category: 'Lácteos',
    regularPrice: 26.5,
    bestPrice: 24.3,
    potentialSavingsPerUnit: 2.2,
    rotation: 'Media',
    currentStock: 12,
    dailySales: 6,
    recommendation: 'Comprar',
    whyReason: 'Demanda diaria estable de 6 litros. Tu inventario rinde solo 2 días; surtir 2 cajas hoy asegura margen y previene que los clientes busquen en otra tienda.',
    actionSummary: 'Surtir 2 cajas para el fin de semana.',
    recoveryDaysEstimate: 4,
    estimatedMargin: 18.0,
    options: [
      { supplier: 'Proveedor de ruta habitual', pricePerUnit: 26.5, notes: 'Reparto semanal' },
      { supplier: 'Mayorista de Abarrotes', pricePerUnit: 24.3, isBest: true, condition: 'Caja con 12 pzas', notes: 'Ahorro de $26.40 por caja' },
      { supplier: 'Club de compras', pricePerUnit: 25.1, notes: 'Condición de volumen alto' },
    ],
  },
  {
    id: 'jabon-polvo',
    name: 'Jabón en Polvo',
    presentation: 'Bolsa 1 kg',
    category: 'Limpieza',
    regularPrice: 38.0,
    bestPrice: 33.5,
    potentialSavingsPerUnit: 4.5,
    rotation: 'Baja',
    currentStock: 18,
    dailySales: 0.5,
    recommendation: 'Esperar',
    whyReason: 'El proveedor ofrece un descuento de 12% ($33.50), pero tienes 18 bolsas en tienda que tardarán ~36 días en venderse. Comprar más congelaría $600 pesos de tu caja chica.',
    actionSummary: 'No congelar dinero diario en mercancía de baja rotación.',
    recoveryDaysEstimate: 36,
    estimatedMargin: 15.0,
    options: [
      { supplier: 'Distribuidor de Químicos', pricePerUnit: 38.0, notes: 'Precio de lista' },
      { supplier: 'Oferta Preventa por bulto', pricePerUnit: 33.5, isBest: true, notes: 'Descuento atractivo pero rotación lenta' },
    ],
  },
];

export const MOCK_ROTATION_EXAMPLES = [
  {
    product: 'Coca-Cola 600 ml',
    salesStat: 'Pedro vende aproximadamente 100 Coca-Colas cada 8 días.',
    stockAlert: 'Su inventario actual podría durar aproximadamente 2 días.',
    dailyRate: '12.5 piezas / día',
    rotationLevel: 'Alta rotación' as const,
    badgeColor: 'bg-[#E8F5E9] text-[#0D6832] border-[#C8E6C9]',
    status: 'Encontramos una oportunidad de compra. Dinero en movimiento continuo.',
    recommendationAction: 'Comprar ahora',
  },
  {
    product: 'Leche Entera 1 Litro',
    salesStat: 'Pedro vende aproximadamente 42 litros cada 7 días.',
    stockAlert: 'Su inventario actual rinde ~2 días de venta.',
    dailyRate: '6.0 litros / día',
    rotationLevel: 'Rotación media' as const,
    badgeColor: 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]',
    status: 'Demanda estable semanal. Mantener stock justo sin excedentes.',
    recommendationAction: 'Comprar 2 cajas',
  },
  {
    product: 'Jabón en Polvo 1 kg',
    salesStat: 'Pedro vende aproximadamente 4 bolsas al mes.',
    stockAlert: 'Tiene 18 unidades en anaquel (suficiente para más de 4 meses).',
    dailyRate: '0.13 piezas / día',
    rotationLevel: 'Baja rotación' as const,
    badgeColor: 'bg-[#FEE2E2] text-[#C92A2A] border-[#FECACA]',
    status: 'Riesgo de capital inmovilizado. No comprar más aunque esté en oferta.',
    recommendationAction: 'Esperar',
  },
];

export const MOCK_DAILY_OPPORTUNITIES = [
  {
    id: 1,
    product: 'Coca-Cola 600 ml',
    badge: 'Oportunidad de margen',
    badgeType: 'urgent',
    rotation: 'Alta rotación',
    stockAlert: 'Inventario para 2 días (24 piezas)',
    lastPrice: '$17.00 MXN',
    todayPrice: '$15.20 MXN',
    salesVelocity: '~12 unidades / día',
    stockCoverage: '2 días restantes',
    suggestedPurchase: '50 unidades (2 cajas)',
    what: 'La última vez pagaste $17.00. Hoy encontramos $15.20 en mayorista local.',
    whyBreakdown: {
      found: 'La última vez pagaste $17.00 por unidad en preventa. Hoy detectamos disponibilidad a $15.20 en mayorista de la zona.',
      context: 'Vendes un promedio constante de 12 botellas al día y actualmente te quedan 24 piezas en anaquel (cobertura para 2 días).',
      recommendation: 'Recomendamos comprar 50 unidades (2 cajas). Recuperas tu inversión en 4 días y ahorras $90.00 MXN netos en esta sola compra.',
    },
    recommendation: 'Comprar 50 unidades (2 cajas).',
    status: 'Comprar',
  },
  {
    id: 2,
    product: 'Leche Entera 1 Litro',
    badge: 'Inventario bajo',
    badgeType: 'positive',
    rotation: 'Rotación media',
    stockAlert: 'Quedan 12 litros',
    lastPrice: '$26.50 MXN',
    todayPrice: '$24.30 MXN',
    salesVelocity: '~6 litros / día',
    stockCoverage: '2 días restantes',
    suggestedPurchase: '24 litros (2 cajas)',
    what: 'Caja con 12 piezas a $24.30 c/u en abarrotera de la zona (vs $26.50 habitual).',
    whyBreakdown: {
      found: 'Encontramos caja con 12 litros a $24.30 c/u, reduciendo $2.20 por pieza respecto al reparto regular.',
      context: 'Mantienes una venta constante de 6 litros diarios sin riesgo de merma ni caducidad.',
      recommendation: 'Comprar 2 cajas para el fin de semana. Ahorro de $52.80 MXN garantizando abasto a tus clientes.',
    },
    recommendation: 'Comprar 2 cajas.',
    status: 'Comprar',
  },
  {
    id: 3,
    product: 'Jabón en Polvo 1 kg',
    badge: 'Oferta aparente — Esperar',
    badgeType: 'warning',
    rotation: 'Baja rotación',
    stockAlert: '18 unidades en anaquel',
    lastPrice: '$38.00 MXN',
    todayPrice: '$33.50 MXN (oferta)',
    salesVelocity: '~0.5 bolsas / día',
    stockCoverage: '36 días de stock',
    suggestedPurchase: '0 unidades (no comprar)',
    what: 'El proveedor ofrece bulto a $33.50 (12% de descuento aparente).',
    whyBreakdown: {
      found: 'El proveedor ofrece bulto cerrado con un costo unitario atractivo de $33.50 frente a tus $38.00 normales.',
      context: 'Tienes 18 unidades en anaquel y tu historial demuestra que tardas más de un mes en vender 15 piezas.',
      recommendation: 'Esperar. No inmovilices $600 pesos de tu caja chica en mercancía que estará arrumbada semanas.',
    },
    recommendation: 'Esperar. No comprar.',
    status: 'Esperar',
  },
];

export const FAQ_LIST: FaqItem[] = [
  {
    id: 'faq-1',
    question: '¿Tengo que cambiar mi POS?',
    answer:
      'No. Abarrotes IA no es una empresa de POS que tiene IA; somos una plataforma de inteligencia para pequeños comercios que puede utilizar tu POS como fuente de información. Cuando exista una integración técnicamente viable, Abarrotes IA trabaja junto a tu sistema actual. También es compatible con hojas de cálculo, escaneo manual de notas o nuestro módulo ligero incluido.',
  },
  {
    id: 'faq-2',
    question: '¿Necesito saber de tecnología?',
    answer:
      'No. La filosofía del sistema es «La IA hace el trabajo difícil. Tú tomas la decisión». No necesitas saber de computación ni fórmulas: el sistema te muestra en español claro y con números grandes qué comprar, cuánto comprar y dónde ahorrar.',
  },
  {
    id: 'faq-3',
    question: '¿Cómo encuentra los precios?',
    answer:
      'Compara listas comerciales, promociones complejas (2x1, 3x2, descuentos por volumen, bonificaciones) y proveedores de tu zona para calcular el costo neto real por unidad y el costo efectivo según la cantidad que realmente necesita tu tienda.',
  },
  {
    id: 'faq-4',
    question: '¿De dónde obtiene la información?',
    answer:
      'De fuentes comerciales públicas, mayoristas participantes, distribuidores locales e inteligencia agregada del mercado para encontrar la mejor opción disponible para tu negocio considerando precio, distancia, disponibilidad, volumen y velocidad de venta.',
  },
  {
    id: 'faq-5',
    question: '¿Cada cuánto se actualiza?',
    answer:
      'La información se actualiza de manera continua. Cada mañana a primera hora tienes listo tu reporte de oportunidades para planear tus compras del día antes de que lleguen los camiones repartidores.',
  },
  {
    id: 'faq-6',
    question: '¿La plataforma garantiza ahorro?',
    answer:
      'No prometemos cifras mágicas ni resultados garantizados. Todas las sugerencias y comparativas son cálculos basados en tus datos y en las opciones comerciales disponibles para darte claridad y evitar que compres a ciegas.',
  },
  {
    id: 'faq-7',
    question: '¿Qué pasa si mi POS no puede integrarse?',
    answer:
      'Puedes capturar tus compras y productos clave de manera sencilla mediante escaneo de código de barras con tu lector o celular, o utilizar las herramientas operativas base de Abarrotes IA.',
  },
  {
    id: 'faq-8',
    question: '¿Puedo probarlo antes de pagar?',
    answer:
      'Sí. Tienes 30 días de prueba gratuita completa con tu propia tienda para conocer el sistema, analizar tus productos y medir el valor antes de decidir si continúas.',
  },
  {
    id: 'faq-9',
    question: '¿Qué información necesita?',
    answer:
      'Tus productos principales, las notas o entradas de compra de tus proveedores y tus salidas o ventas habituales para calcular la velocidad de rotación y los días de inventario.',
  },
  {
    id: 'faq-10',
    question: '¿Puedo cancelar?',
    answer:
      'Sí, en cualquier momento. No hay contratos forzosos ni plazos de permanencia. Puedes cancelar el servicio con un solo clic.',
  },
];
