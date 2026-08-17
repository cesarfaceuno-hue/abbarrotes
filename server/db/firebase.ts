import { initializeApp, getApp, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// Cache para instancias de aplicaciones y bases de datos por tenant (projectId:databaseId)
const appCache = new Map<string, App>();
const dbCache = new Map<string, Firestore>();

/**
 * Inicialización perezosa del SDK Admin soportando multi-tenancy.
 * Permite inicializar aplicaciones para diferentes proyectos o bases de datos
 * basándose en el contexto del tenant.
 */
export function getFirebaseAdmin(config: { projectId: string; databaseId?: string }): { db: Firestore } {
  const { projectId, databaseId = '(default)' } = config;
  const cacheKey = `${projectId}:${databaseId}`;

  // 1. Recuperar o inicializar la instancia de App
  if (!appCache.has(cacheKey)) {
    try {
      // Intentar obtener una app existente por nombre si ya fue inicializada
      const app = getApp(cacheKey);
      appCache.set(cacheKey, app);
    } catch {
      // Si no existe, inicializar una nueva instancia de App
      const app = initializeApp({
        projectId: projectId,
      }, cacheKey); // Usar cacheKey como nombre único de la instancia
      appCache.set(cacheKey, app);
    }
  }

  // 2. Recuperar o inicializar la instancia de Firestore
  if (!dbCache.has(cacheKey)) {
    const app = appCache.get(cacheKey)!;
    const db = getFirestore(app, databaseId);
    dbCache.set(cacheKey, db);
  }

  return { db: dbCache.get(cacheKey)! };
}
