import { MasterProduct, MatchStatus, QualityStatus } from '../types.js';

export interface ParsedProduct {
  rawName: string;
  rawBrand?: string;
  rawSku?: string;
  rawBarcode?: string;
  rawPrice: number;
  rawUnit?: string;
  rawCategory?: string;
  rawAvailability?: string;
  sourceUrl: string;
  rawPayload: Record<string, any>;
}

export interface NormalizedProduct extends ParsedProduct {
  normalizedName: string;
  normalizedBrand: string;
  normalizedCategory: string;
  presentation: string;
  unit: string;
  packSize: number;
  unitPrice: number;
  currency: 'MXN';
}

export interface MatchResult {
  masterProduct?: MasterProduct;
  confidence: number;
  matchStatus: MatchStatus;
  matchReason: string;
}

export interface ValidationResult {
  isValid: boolean;
  qualityStatus: QualityStatus;
  flags: string[];
}

export class ProductMatchingEngine {
  private static BRAND_MAPPINGS: Record<string, string> = {
    'coca cola': 'Coca-Cola',
    'cocacola': 'Coca-Cola',
    'femsa': 'Coca-Cola',
    'alpura': 'Alpura',
    'lala': 'Lala',
    'santa clara': 'Santa Clara',
    'nutri': 'Nutri',
    'nutrileche': 'Nutri',
    'san juan': 'San Juan',
    'huevo san juan': 'San Juan',
    'la corona': 'La Corona',
    'roma': 'La Corona',
    'foca': 'La Corona',
    'zote': 'La Corona',
    '1-2-3': '1-2-3',
    'uno dos tres': '1-2-3',
    'maruchan': 'Maruchan',
    'bimbo': 'Bimbo',
    'tia rosa': 'Tía Rosa',
    'marinela': 'Marinela',
    'sabritas': 'Sabritas',
    'barcel': 'Barcel',
    'gamesa': 'Gamesa',
    'la moderna': 'La Moderna',
    'herdez': 'Herdez',
    'del fuerte': 'Del Fuerte',
    'costeña': 'La Costeña',
    'la costeña': 'La Costeña',
    'zulka': 'Zulka',
    'dolores': 'Dolores',
    'tunyt': 'Tuny',
    'tuny': 'Tuny',
    'trigon': 'Trigon',
    'iberia': 'Iberia',
    'kimberly clark': 'Kimberly-Clark',
    'sanitas': 'Sanitas',
  };

  public static normalizeBrand(rawBrand?: string, rawTitle = ''): string {
    const brandTarget = (rawBrand || '').trim().toLowerCase();
    const titleTarget = rawTitle.toLowerCase();

    // Check direct brand mapping
    for (const [key, val] of Object.entries(this.BRAND_MAPPINGS)) {
      if (brandTarget === key || brandTarget.includes(key)) {
        return val;
      }
    }

    // Check title mentions
    for (const [key, val] of Object.entries(this.BRAND_MAPPINGS)) {
      if (titleTarget.includes(key)) {
        return val;
      }
    }

    if (rawBrand && rawBrand.length > 1) {
      return rawBrand.charAt(0).toUpperCase() + rawBrand.slice(1);
    }

    return 'Genérico / Sin Marca';
  }

  public static normalizeUnitAndPresentation(rawText: string, rawPrice: number): { presentation: string; unit: string; packSize: number; unitPrice: number } {
    const text = rawText.toLowerCase();

    // Detect Pack Size (e.g., "12 pzas", "caja c/24", "10 bolsas", "12p/1l", "100h/20p")
    let packSize = 1;
    const packMatch = text.match(/(?:caja|paquete|tira|pack)?\s*(?:c\/|con\s+)?(\d+)\s*(?:pzas?|piezas?|bolsas?|piezas|pzs?|p\/|botellas?)/i);
    if (packMatch && packMatch[1]) {
      packSize = Math.max(1, parseInt(packMatch[1], 10));
    }

    // Detect Weight / Volume
    let presentation = '1 Pieza';
    let unit = 'pieza';

    if (text.includes('1l') || text.includes('1 litro') || text.includes('1 lt') || text.includes('1000ml')) {
      presentation = packSize > 1 ? `Caja con ${packSize}x 1 Litro` : '1 Litro Tetrapak/Botella';
      unit = packSize > 1 ? `caja c/${packSize}` : 'litro';
    } else if (text.includes('600 ml') || text.includes('600ml')) {
      presentation = packSize > 1 ? `Caja con ${packSize}x 600 ml` : '600 ml Pet';
      unit = packSize > 1 ? `caja c/${packSize}` : 'pieza';
    } else if (text.includes('1 kg') || text.includes('1kg') || text.includes('1 k') || text.includes('1 kilo')) {
      presentation = packSize > 1 ? `Caja con ${packSize}x 1 kg` : '1 kg Bolsa';
      unit = packSize > 1 ? `caja c/${packSize}` : 'kilo';
    } else if (text.includes('64g') || text.includes('64 g') || text.includes('64gr')) {
      presentation = packSize > 1 ? `Caja con ${packSize}x 64g` : 'Vaso 64g';
      unit = packSize > 1 ? `caja c/${packSize}` : 'pieza';
    } else if (text.includes('90g') || text.includes('90 gr')) {
      presentation = 'Barra 90g';
      unit = 'pieza';
    } else if (text.includes('426 ml') || text.includes('426ml')) {
      presentation = 'Bote 426 ml';
      unit = 'pieza';
    } else if (text.includes('200 ml') || text.includes('200ml')) {
      presentation = 'Mini Tetra 200 ml';
      unit = 'pieza';
    } else if (text.includes('kg') || text.includes('kilo')) {
      presentation = '1 kg A granel';
      unit = 'kilo';
    }

    // Unit price calculation if sold in bulk/case
    const unitPrice = packSize > 1 ? Number((rawPrice / packSize).toFixed(2)) : rawPrice;

    return {
      presentation,
      unit,
      packSize,
      unitPrice,
    };
  }

  public static normalizeProduct(parsed: ParsedProduct): NormalizedProduct {
    const normalizedBrand = this.normalizeBrand(parsed.rawBrand, parsed.rawName);
    const { presentation, unit, packSize, unitPrice } = this.normalizeUnitAndPresentation(parsed.rawName, parsed.rawPrice);

    let normalizedCategory = parsed.rawCategory || 'Abarrotes';
    const lowerName = parsed.rawName.toLowerCase();
    if (lowerName.includes('leche') || lowerName.includes('huevo') || lowerName.includes('queso') || lowerName.includes('crema')) {
      normalizedCategory = 'Lácteos y Huevo';
    } else if (lowerName.includes('coca') || lowerName.includes('refresco') || lowerName.includes('jugo') || lowerName.includes('agua')) {
      normalizedCategory = 'Bebidas';
    } else if (lowerName.includes('detergente') || lowerName.includes('jabon') || lowerName.includes('roma') || lowerName.includes('cloro') || lowerName.includes('limpieza') || lowerName.includes('toalla')) {
      normalizedCategory = 'Limpieza del Hogar';
    }

    return {
      ...parsed,
      normalizedName: parsed.rawName.replace(/\s+/g, ' ').trim(),
      normalizedBrand,
      normalizedCategory,
      presentation,
      unit,
      packSize,
      unitPrice,
      currency: 'MXN',
    };
  }

  public static matchProduct(normalized: NormalizedProduct, masterCatalog: MasterProduct[]): MatchResult {
    // 1. EXACT BARCODE MATCH (Confidence: 1.00)
    if (normalized.rawBarcode) {
      const cleanBarcode = normalized.rawBarcode.replace(/\D/g, '');
      const match = masterCatalog.find((m) => m.barcode && m.barcode.replace(/\D/g, '') === cleanBarcode);
      if (match) {
        return {
          masterProduct: match,
          confidence: 1.0,
          matchStatus: 'AUTO_MATCH',
          matchReason: `Coincidencia exacta por Código de Barras / EAN (${match.barcode})`,
        };
      }
    }

    // 2. EXACT SKU MATCH (Confidence: 0.98)
    if (normalized.rawSku) {
      const cleanSku = normalized.rawSku.trim().toUpperCase();
      const match = masterCatalog.find((m) => m.sku && m.sku.trim().toUpperCase() === cleanSku);
      if (match) {
        return {
          masterProduct: match,
          confidence: 0.98,
          matchStatus: 'AUTO_MATCH',
          matchReason: `Coincidencia exacta por SKU maestro (${match.sku})`,
        };
      }
    }

    // 3. BRAND + CANONICAL KEYWORD MATCH (Confidence: 0.90 - 0.96)
    const normBrandLower = normalized.normalizedBrand.toLowerCase();
    const normTitleLower = normalized.normalizedName.toLowerCase();

    for (const master of masterCatalog) {
      const masterBrandLower = master.brand.toLowerCase();
      const masterNameLower = master.canonicalName.toLowerCase();

      const brandMatches = normBrandLower === masterBrandLower || normTitleLower.includes(masterBrandLower);
      if (!brandMatches) continue;

      // Extract core tokens
      const masterTokens = masterNameLower.split(/\s+/).filter((t) => t.length > 2 && t !== masterBrandLower);
      const matchedTokens = masterTokens.filter((token) => normTitleLower.includes(token));

      const tokenRatio = masterTokens.length > 0 ? matchedTokens.length / masterTokens.length : 0;

      if (tokenRatio >= 0.75) {
        const confidence = Number((0.85 + tokenRatio * 0.12).toFixed(2));
        return {
          masterProduct: master,
          confidence,
          matchStatus: confidence >= 0.95 ? 'AUTO_MATCH' : 'HIGH_CONFIDENCE',
          matchReason: `Coincidencia por Marca (${master.brand}) y términos (${matchedTokens.join(', ')})`,
        };
      }
    }

    // 4. FUZZY TOKEN OVERLAP
    let bestMatch: MasterProduct | undefined;
    let highestScore = 0;

    for (const master of masterCatalog) {
      const score = this.calculateTokenSimilarity(normalized.normalizedName, master.canonicalName);
      if (score > highestScore) {
        highestScore = score;
        bestMatch = master;
      }
    }

    if (bestMatch && highestScore >= 0.70) {
      return {
        masterProduct: bestMatch,
        confidence: Number(highestScore.toFixed(2)),
        matchStatus: highestScore >= 0.85 ? 'HIGH_CONFIDENCE' : 'REVIEW',
        matchReason: `Coincidencia fuzzy (${Math.round(highestScore * 100)}% similitud semántica)`,
      };
    }

    return {
      confidence: Number(highestScore.toFixed(2)),
      matchStatus: 'UNMATCHED',
      matchReason: 'Sin coincidencia suficiente en catálogo maestro',
    };
  }

  private static calculateTokenSimilarity(strA: string, strB: string): number {
    const tokensA = new Set(strA.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter((t) => t.length > 2));
    const tokensB = new Set(strB.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter((t) => t.length > 2));

    if (tokensA.size === 0 || tokensB.size === 0) return 0;

    let intersection = 0;
    for (const t of tokensA) {
      if (tokensB.has(t)) intersection++;
    }

    const union = new Set([...tokensA, ...tokensB]).size;
    return union > 0 ? intersection / union : 0;
  }

  public static validateQuality(normalized: NormalizedProduct): ValidationResult {
    const flags: string[] = [];

    if (!normalized.normalizedName || normalized.normalizedName.length < 3) {
      flags.push('Nombre de producto ausente o demasiado corto');
    }

    if (isNaN(normalized.rawPrice) || normalized.rawPrice <= 0) {
      flags.push('Precio cero o negativo');
    } else if (normalized.rawPrice > 50000) {
      flags.push('Precio anormalmente alto (> $50,000 MXN)');
    }

    if (!normalized.sourceUrl || !normalized.sourceUrl.startsWith('http')) {
      flags.push('sourceUrl inválido o ausente (fallo de provenance)');
    }

    if (flags.length > 0) {
      return {
        isValid: false,
        qualityStatus: 'REJECTED',
        flags,
      };
    }

    return {
      isValid: true,
      qualityStatus: 'VALID',
      flags: [],
    };
  }
}
