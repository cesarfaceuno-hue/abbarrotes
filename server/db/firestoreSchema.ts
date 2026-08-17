/**
 * ABARROTES IA — FIRESTORE MULTI-TENANT SCHEMA DESIGN
 * 
 * This file serves as the definitive architecture spec and type definition
 * for the Firestore integration. It implements strict "Tenant Isolation"
 * where resources are partitioned hierarchically:
 * 
 *   Organizations (root)
 *       │
 *       ├── Users (subcollection or globally mapped)
 *       │
 *       └── Stores (subcollection)
 *               │
 *               ├── Inventory (subcollection: productId -> InventoryItem)
 *               │
 *               ├── Orders (subcollection: orderId -> Order)
 *               │
 *               └── Ledger (subcollection: movementId -> LedgerMovement)
 * 
 * Global/shared entities reside in non-tenant paths (e.g., `global_catalog`)
 * accessible by all tenants via Read-Only rules.
 */

import { 
  UserRole, 
  SubscriptionStatus, 
  PlanTier 
} from '../types/saas.js';
import { 
  InventoryItem, 
  LedgerMovement, 
  MasterProduct, 
  SupplierSource, 
  SupplierOffer, 
  SalesRecord, 
  DecisionRecord, 
  AuditLog, 
  Opportunity, 
  AgentMemory, 
  AgentPerformance, 
  AgentExecutionEvidence 
} from '../types.js';

// ==========================================
// 1. GLOBAL / MASTER CATALOG COLLECTIONS
// ==========================================

/**
 * Collection: `/global_products`
 * Holds master product catalog canonical records. Read-only for tenant stores.
 */
export interface FirestoreGlobalProduct extends MasterProduct {
  _createdAt: string;
  _updatedAt: string;
}

/**
 * Collection: `/global_suppliers`
 * Holds verified wholesale suppliers. Read-only for tenant stores.
 */
export interface FirestoreGlobalSupplier extends SupplierSource {
  _createdAt: string;
  _updatedAt: string;
}

/**
 * Collection: `/global_supplier_offers`
 * Wholesale price offers scraped from major wholesalers.
 */
export interface FirestoreSupplierOffer extends SupplierOffer {
  _createdAt: string;
  _updatedAt: string;
}


// ==========================================
// 2. TENANT-ISOLATED COLLECTIONS (HIERARCHY)
// ==========================================

/**
 * Collection: `/organizations`
 * Root collection representing the enterprise, customer account, or subscription tenant.
 */
export interface FirestoreOrganization {
  id: string;
  name: string;
  rfc?: string;
  ownerUserId: string;
  planTier: PlanTier;
  subscriptionStatus: SubscriptionStatus;
  trialEndsAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Subcollection: `/organizations/{orgId}/users`
 * Members of the tenant with distinct role-based access control (RBAC).
 */
export interface FirestoreTenantUser {
  uid: string; // Map to Firebase Auth UID
  email: string;
  organizationId: string;
  tenantId: string;
  role: UserRole;
  storeIds: string[]; // Stores this user is allowed to access
  status: 'ACTIVE' | 'INVITED' | 'DISABLED';
  createdAt: string;
  updatedAt: string;
}

/**
 * Subcollection: `/organizations/{orgId}/stores`
 * Branches/locations belonging to the organization.
 */
export interface FirestoreStore {
  id: string;
  organizationId: string;
  tenantId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Subcollection: `/organizations/{orgId}/stores/{storeId}/inventory`
 * Store-specific inventory levels, prices, and settings.
 * ID of each document is the `productId` (e.g., bar-code or SKU identifier).
 */
export interface FirestoreInventoryItem extends InventoryItem {
  _syncedAt: string;
}

/**
 * Subcollection: `/organizations/{orgId}/stores/{storeId}/ledger`
 * Append-Only Kardex register (Ledger movements). Cannot be modified or deleted.
 */
export interface FirestoreLedgerMovement extends LedgerMovement {
  _timestamp: string; // ISO String
}

/**
 * Subcollection: `/organizations/{orgId}/stores/{storeId}/sales`
 * Completed retail/POS sales transactions.
 */
export interface FirestoreSalesRecord extends SalesRecord {
  _createdAt: string;
}


// ==========================================
// 3. AI OPERATIONS & AUDIT TRAIL
// ==========================================

/**
 * Subcollection: `/organizations/{orgId}/agent_runs`
 * Logs agent executions, runs, successes, and failures for this tenant.
 */
export interface FirestoreAgentExecutionEvidence extends AgentExecutionEvidence {
  _createdAt: string;
}

/**
 * Subcollection: `/organizations/{orgId}/audit_logs`
 * Human/machine operational activity trail.
 */
export interface FirestoreAuditLog extends AuditLog {
  _createdAt: string;
}


// ==========================================
// 4. FIREBASE SECURITY RULES BLUEPRINT
// ==========================================
export const FIRESTORE_RULES_EXPLANATION = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper: Verify if user is logged in
    function isAuthenticated() {
      return request.auth != null;
    }

    // Helper: Verify user organization membership
    function isOrgMember(orgId) {
      return isAuthenticated() && 
        exists(/databases/$(database)/documents/organizations/$(orgId)/users/$(request.auth.uid));
    }

    // Helper: Verify user holds a specific role in organization
    function getRole(orgId) {
      return get(/databases/$(database)/documents/organizations/$(orgId)/users/$(request.auth.uid)).data.role;
    }

    // --- Global Catalog Rules ---
    match /global_products/{prodId} {
      allow read: if isAuthenticated();
      allow write: if false; // Scrapers run server-side using Firebase Admin SDK bypassing rules
    }

    match /global_suppliers/{suppId} {
      allow read: if isAuthenticated();
      allow write: if false;
    }

    // --- Multi-Tenant Hierarchy Rules ---
    match /organizations/{orgId} {
      // Organization owners or admins can read/write organizational metadata
      allow read: if isOrgMember(orgId);
      allow write: if isOrgMember(orgId) && (getRole(orgId) == 'OWNER' || getRole(orgId) == 'ADMIN');

      // Users subcollection
      match /users/{userId} {
        allow read: if isOrgMember(orgId);
        allow write: if isOrgMember(orgId) && (getRole(orgId) == 'OWNER' || getRole(orgId) == 'ADMIN');
      }

      // Stores subcollection
      match /stores/{storeId} {
        allow read: if isOrgMember(orgId);
        allow write: if isOrgMember(orgId) && (getRole(orgId) == 'OWNER' || getRole(orgId) == 'ADMIN');

        // Store Inventory (Store-isolated, no cross-store reading unless authorized)
        match /inventory/{productId} {
          allow read: if isOrgMember(orgId);
          allow write: if isOrgMember(orgId) && (getRole(orgId) != 'CASHIER'); // Cashiers can't change prices directly
        }

        // Kardex Ledger (APPEND-ONLY)
        match /ledger/{movementId} {
          allow read: if isOrgMember(orgId);
          allow create: if isOrgMember(orgId);
          allow update, delete: if false; // IMMUTABILITY GUARANTEED
        }

        // POS Sales Records
        match /sales/{saleId} {
          allow read: if isOrgMember(orgId);
          allow create: if isOrgMember(orgId);
          allow update, delete: if false; // Once a sale is posted, it's final
        }
      }

      // AI Executions Trace
      match /agent_runs/{runId} {
        allow read: if isOrgMember(orgId);
        allow write: if false; // Only written via agent engine backend (Admin SDK)
      }
    }
  }
}
`;
