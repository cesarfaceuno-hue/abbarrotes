import { db } from '../db/database.js';
import { CrmCustomer } from '../types.js';

export interface EntityResolutionQuery {
  tenantId?: string;
  externalId?: string;
  phone?: string;
  email?: string;
  rfc?: string;
  name?: string;
  businessName?: string;
}

export interface ResolvedEntityResult {
  customer: CrmCustomer | null;
  matchType: 'EXACT_EXTERNAL_ID' | 'EXACT_TENANT' | 'PHONE' | 'EMAIL' | 'RFC' | 'NORMALIZED_NAME' | 'FUZZY_NAME' | 'NONE';
  confidence: number;
}

export class CrmEntityResolver {
  public static resolveCustomer(query: EntityResolutionQuery): ResolvedEntityResult {
    const customers = db.listCustomers({});

    // 1. Match by externalId if provided
    if (query.externalId) {
      const found = customers.find((c: any) => c.externalId === query.externalId);
      if (found) {
        return { customer: found, matchType: 'EXACT_EXTERNAL_ID', confidence: 1.0 };
      }
    }

    // 2. Match by tenantId exact
    if (query.tenantId) {
      const found = customers.find((c) => c.tenantId === query.tenantId);
      if (found) {
        return { customer: found, matchType: 'EXACT_TENANT', confidence: 0.95 };
      }
    }

    // 3. Match by email
    if (query.email) {
      const normEmail = query.email.trim().toLowerCase();
      const found = customers.find((c) => c.email && c.email.trim().toLowerCase() === normEmail);
      if (found) {
        return { customer: found, matchType: 'EMAIL', confidence: 0.9 };
      }
    }

    // 4. Match by phone
    if (query.phone) {
      const cleanPhone = query.phone.replace(/\D/g, '');
      const found = customers.find((c) => c.phone && c.phone.replace(/\D/g, '') === cleanPhone);
      if (found) {
        return { customer: found, matchType: 'PHONE', confidence: 0.85 };
      }
    }

    // 5. Match by RFC
    if (query.rfc) {
      const normRfc = query.rfc.trim().toUpperCase();
      const found = customers.find((c: any) => c.rfc && c.rfc.trim().toUpperCase() === normRfc);
      if (found) {
        return { customer: found, matchType: 'RFC', confidence: 0.98 };
      }
    }

    // 6. Match by normalized name / business name
    const searchTerm = (query.businessName || query.name || '').trim().toLowerCase();
    if (searchTerm.length >= 3) {
      const exactNameMatch = customers.find(
        (c) =>
          c.name.trim().toLowerCase() === searchTerm ||
          (c as any).businessName?.trim().toLowerCase() === searchTerm
      );
      if (exactNameMatch) {
        return { customer: exactNameMatch, matchType: 'NORMALIZED_NAME', confidence: 0.8 };
      }

      // Fuzzy / Partial match
      for (const c of customers) {
        const cName = c.name.toLowerCase();
        const cBus = ((c as any).businessName || '').toLowerCase();
        if (cName.includes(searchTerm) || searchTerm.includes(cName) || (cBus && (cBus.includes(searchTerm) || searchTerm.includes(cBus)))) {
          return { customer: c, matchType: 'FUZZY_NAME', confidence: 0.65 };
        }
      }
    }

    // Default fallback: return primary demo customer if none found
    const defaultCust = customers[0] || null;
    return {
      customer: defaultCust,
      matchType: 'NONE',
      confidence: defaultCust ? 0.3 : 0.0
    };
  }
}
