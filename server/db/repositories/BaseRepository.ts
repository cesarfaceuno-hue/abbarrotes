export abstract class BaseRepository {
  protected validateContext(tenantId?: string, storeId?: string) {
    if (!tenantId) throw new Error('TENANT_CONTEXT_REQUIRED');
    if (!storeId) throw new Error('STORE_CONTEXT_REQUIRED');
  }
}
