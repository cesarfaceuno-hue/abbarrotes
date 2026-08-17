import { MasterProduct } from '../types.js';
import { GlobalProductRepository } from '../db/repositories/GlobalProductRepository.js';
import { InventoryRepository } from '../db/repositories/InventoryRepository.js';

// --- THRESHOLDS CENTRALIZADOS ---
export const MATCH_THRESHOLDS = {
  HIGH: 0.85,
  MEDIUM: 0.60,
  LOW: 0.35,
  AMBIGUITY_GAP: 0.08, // Si la diferencia entre el top score y el segundo score es menor a esto, es ambiguo
};

export interface NormalizedValue<T> {
  originalValue: T;
  normalizedValue: T;
}

export interface NormalizedProductDetails {
  name: NormalizedValue<string>;
  brand: NormalizedValue<string>;
  barcode?: NormalizedValue<string>;
  sku?: NormalizedValue<string>;
  presentation?: NormalizedValue<string>;
  unit?: NormalizedValue<string>;
}

export interface DiscoveryQuery {
  query: string;
  tenantId: string;
  storeId: string;
  context?: Record<string, any>;
}

export interface DiscoveryResult {
  candidates: MasterProduct[];
  source: string;
  timestamp: string;
  query: string;
  metadata?: Record<string, any>;
}

export interface MatchResult {
  candidate: MasterProduct;
  score: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'NO_MATCH';
  reasons: string[];
  decision: 'MATCH' | 'NO_MATCH' | 'AMBIGUOUS' | 'REVIEW';
}

// --- NORMALIZATION ENGINE ---
export class NormalizationEngine {
  public static removeAccents(str: string): string {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  public static cleanText(str: string): string {
    if (!str) return '';
    return this.removeAccents(str)
      .toLowerCase()
      .replace(/[^a-z0-9\s\-\.\/]/g, '') // conservar letras, números, espacios, guión, punto y diagonal
      .replace(/\s+/g, ' ')
      .trim();
  }

  public static normalizeCommonAbbreviations(str: string): string {
    let clean = this.cleanText(str);
    const abbreviations: Record<string, string> = {
      'pza': 'pieza',
      'pzas': 'pieza',
      'pz': 'pieza',
      'pzs': 'pieza',
      'piezas': 'pieza',
      'l': 'litro',
      'lt': 'litro',
      'lts': 'litro',
      'litros': 'litro',
      'kg': 'kilo',
      'kgs': 'kilo',
      'kilos': 'kilo',
      'kg.': 'kilo',
      'g': 'gramo',
      'gr': 'gramo',
      'grs': 'gramo',
      'gramos': 'gramo',
      'ml': 'mililitros',
      'mls': 'mililitros',
      'mililitros': 'mililitros',
    };

    const words = clean.split(' ').map(word => {
      return abbreviations[word] || word;
    });

    return words.join(' ');
  }

  public static normalizeDetails(
    name: string,
    brand: string,
    barcode?: string,
    sku?: string,
    presentation?: string,
    unit?: string
  ): NormalizedProductDetails {
    return {
      name: {
        originalValue: name,
        normalizedValue: this.normalizeCommonAbbreviations(name),
      },
      brand: {
        originalValue: brand,
        normalizedValue: this.cleanText(brand),
      },
      barcode: barcode
        ? {
            originalValue: barcode,
            normalizedValue: barcode.replace(/\D/g, ''),
          }
        : undefined,
      sku: sku
        ? {
            originalValue: sku,
            normalizedValue: sku.trim().toUpperCase(),
          }
        : undefined,
      presentation: presentation
        ? {
            originalValue: presentation,
            normalizedValue: this.normalizeCommonAbbreviations(presentation),
          }
        : undefined,
      unit: unit
        ? {
            originalValue: unit,
            normalizedValue: this.cleanText(unit),
          }
        : undefined,
    };
  }
}

// --- DISCOVERY ENGINE ---
export class DiscoveryEngine {
  private globalProductRepo = new GlobalProductRepository();
  private inventoryRepo = new InventoryRepository();

  async discover(search: DiscoveryQuery): Promise<DiscoveryResult> {
    const { query, tenantId, storeId } = search;
    if (!query || query.trim() === '') {
      return {
        candidates: [],
        source: 'GlobalProductRepository',
        timestamp: new Date().toISOString(),
        query,
      };
    }

    const cleanQuery = NormalizationEngine.cleanText(query);
    const stopWords = new Set(['de', 'la', 'el', 'en', 'un', 'al', 'con', 'del', 'los', 'las', 'una', 'para', 'por', 'y', 'o']);
    const queryTokens = cleanQuery.split(' ').filter(t => t.length > 2 && !stopWords.has(t));

    // 1. Obtener productos de forma aislada y global
    const allGlobalProducts = await this.globalProductRepo.getAll();
    
    // 2. Filtrar candidatos usando un matching de tokens significativos
    const candidates = allGlobalProducts.filter(product => {
      // Búsqueda por coincidencia de código de barras (solo si hay dígitos en el query)
      const digits = query.replace(/\D/g, '');
      if (digits && product.barcode && product.barcode.includes(digits)) {
        return true;
      }

      const nameClean = NormalizationEngine.cleanText(product.canonicalName);
      const brandClean = NormalizationEngine.cleanText(product.brand);

      // Si la consulta tiene tokens significativos, al menos uno debe coincidir
      if (queryTokens.length > 0) {
        return queryTokens.some(token => 
          nameClean.includes(token) || brandClean.includes(token)
        );
      }

      return nameClean.includes(cleanQuery) || brandClean.includes(cleanQuery);
    });

    return {
      candidates,
      source: 'GlobalProductRepository',
      timestamp: new Date().toISOString(),
      query,
    };
  }
}

// --- MATCHING ENGINE ---
export class MatchingEngine {
  public static calculateTokenSimilarity(strA: string, strB: string): number {
    const tokensA = new Set(strA.split(/\s+/).filter(t => t.length > 1));
    const tokensB = new Set(strB.split(/\s+/).filter(t => t.length > 1));

    if (tokensA.size === 0 || tokensB.size === 0) return 0;

    let intersection = 0;
    for (const t of tokensA) {
      if (tokensB.has(t)) {
        intersection++;
      }
    }

    const union = new Set([...tokensA, ...tokensB]).size;
    return union > 0 ? intersection / union : 0;
  }

  public static matchSingle(target: NormalizedProductDetails, candidate: MasterProduct): MatchResult {
    let score = 0;
    const reasons: string[] = [];

    // 1. Exact Barcode Match (Peso absoluto: 1.0)
    if (target.barcode && candidate.barcode) {
      const targetBarcode = target.barcode.normalizedValue;
      const candidateBarcode = candidate.barcode.replace(/\D/g, '');
      if (targetBarcode && candidateBarcode && targetBarcode === candidateBarcode) {
        return {
          candidate,
          score: 1.0,
          confidence: 'HIGH',
          reasons: ['Coincidencia exacta por Código de Barras / EAN'],
          decision: 'MATCH',
        };
      }
    }

    // 2. Exact SKU Match (Peso alto: 0.95)
    if (target.sku && candidate.sku) {
      const targetSku = target.sku.normalizedValue;
      const candidateSku = candidate.sku.trim().toUpperCase();
      if (targetSku && candidateSku && targetSku === candidateSku) {
        return {
          candidate,
          score: 0.95,
          confidence: 'HIGH',
          reasons: ['Coincidencia exacta por SKU maestro'],
          decision: 'MATCH',
        };
      }
    }

    // 3. Exact Name Match (Normalized)
    const targetNameNorm = target.name.normalizedValue;
    const candidateNameNorm = NormalizationEngine.normalizeCommonAbbreviations(candidate.canonicalName);
    
    if (targetNameNorm === candidateNameNorm) {
      score += 0.80;
      reasons.push('Coincidencia exacta de nombre normalizado (+0.80)');
    } else {
      // Fuzzy Token Overlap similarity
      const similarity = this.calculateTokenSimilarity(targetNameNorm, candidateNameNorm);
      if (similarity > 0) {
        const fuzzyScore = similarity * 0.65;
        score += fuzzyScore;
        reasons.push(`Coincidencia fuzzy de nombre (${Math.round(similarity * 100)}% similitud) (+${fuzzyScore.toFixed(2)})`);
      }
    }

    // 4. Brand Match
    const targetBrandNorm = target.brand.normalizedValue;
    const candidateBrandNorm = NormalizationEngine.cleanText(candidate.brand);
    
    if (targetBrandNorm === candidateBrandNorm && targetBrandNorm !== '') {
      score += 0.15;
      reasons.push('Coincidencia exacta de marca (+0.15)');
    } else if (targetBrandNorm !== '' && (candidateNameNorm.includes(targetBrandNorm) || targetNameNorm.includes(candidateBrandNorm))) {
      score += 0.08;
      reasons.push('Coincidencia parcial de marca en nombre (+0.08)');
    }

    // 5. Unit / Presentation Match
    if (target.presentation && candidate.presentation) {
      const targetPresNorm = target.presentation.normalizedValue;
      const candidatePresNorm = NormalizationEngine.normalizeCommonAbbreviations(candidate.presentation);
      if (targetPresNorm === candidatePresNorm && targetPresNorm !== '') {
        score += 0.05;
        reasons.push('Coincidencia exacta de presentación (+0.05)');
      }
    }

    // Normalizar el score final para que esté entre 0 y 1
    const finalScore = Math.min(1.0, Number(score.toFixed(2)));

    // Determinar nivel de confianza
    let confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'NO_MATCH' = 'NO_MATCH';
    if (finalScore >= MATCH_THRESHOLDS.HIGH) {
      confidence = 'HIGH';
    } else if (finalScore >= MATCH_THRESHOLDS.MEDIUM) {
      confidence = 'MEDIUM';
    } else if (finalScore >= MATCH_THRESHOLDS.LOW) {
      confidence = 'LOW';
    }

    return {
      candidate,
      score: finalScore,
      confidence,
      reasons,
      decision: confidence === 'HIGH' ? 'MATCH' : confidence === 'MEDIUM' ? 'REVIEW' : 'NO_MATCH',
    };
  }

  public static match(target: NormalizedProductDetails, candidates: MasterProduct[]): MatchResult[] {
    const results = candidates.map(candidate => this.matchSingle(target, candidate));
    
    // Ordenar de mayor a menor score
    results.sort((a, b) => b.score - a.score);

    if (results.length === 0) {
      return [];
    }

    // --- MANEJO DE AMBIGÜEDAD ---
    // Si tenemos al menos 2 candidatos y la diferencia entre los 2 puntajes más altos es muy pequeña
    if (results.length >= 2) {
      const top = results[0];
      const second = results[1];
      
      if (top.score >= MATCH_THRESHOLDS.MEDIUM && (top.score - second.score) < MATCH_THRESHOLDS.AMBIGUITY_GAP) {
        // Marcamos ambos candidatos como ambiguos
        top.decision = 'AMBIGUOUS';
        top.reasons.push(`Ambigüedad detectada: muy cercano al segundo mejor candidato (GAP: ${(top.score - second.score).toFixed(2)})`);
        second.decision = 'AMBIGUOUS';
      }
    }

    return results;
  }
}
