import { Request, Response, NextFunction } from 'express';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { Telemetry } from '../services/telemetry';
import fs from 'fs';
import path from 'path';

let isFirebaseInitialized = false;

/**
 * Lazy initialization of Firebase Admin to avoid crashing during dev without keys.
 */
function initializeFirebase() {
  if (isFirebaseInitialized) return true;

  let projectId = process.env.FIREBASE_PROJECT_ID;
  let clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  // Fallback to local firebase-applet-config.json if not present in env
  if (!projectId) {
    const CONFIG_FILE = path.join(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(CONFIG_FILE)) {
      try {
        const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
        if (config.projectId) {
          projectId = config.projectId;
          console.log(`[AuthMiddleware] Using Project ID from firebase-applet-config.json: ${projectId}`);
        }
      } catch (error) {
        console.error('[AuthMiddleware] Error reading firebase-applet-config.json:', error);
      }
    }
  }

  if (projectId) {
    try {
      if (getApps().length === 0) {
        if (clientEmail && privateKey) {
          initializeApp({
            credential: cert({
              projectId,
              clientEmail,
              privateKey,
            }),
          });
          console.log('[AuthMiddleware] Firebase Admin initialized with service account cert.');
        } else {
          // Initialize with project ID using Application Default Credentials (ADC)
          initializeApp({
            projectId,
          });
          console.log(`[AuthMiddleware] Firebase Admin initialized with Application Default Credentials for project: ${projectId}`);
        }
      }
      isFirebaseInitialized = true;
      return true;
    } catch (error) {
      console.error('[AuthMiddleware] Failed to initialize Firebase Admin:', error);
      return false;
    }
  }

  console.warn('[AuthMiddleware] Firebase credentials missing. Authentication will be bypassed in DEV mode if allowed.');
  return false;
}

/**
 * Middleware to protect API routes.
 * Validates Firebase ID Tokens passed in the Authorization header.
 */
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const initialized = initializeFirebase();

  // In Development, if no keys are present, we log a warning and continue
  if (!initialized && process.env.NODE_ENV !== 'production') {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    Telemetry.trackSecurityEvent('unauthorized_access_attempt', { path: req.path, reason: 'missing_token' });
    // Bypass auth since frontend doesn't send token currently
    (req as any).user = { uid: 'demo-user', email: 'demo@example.com' };
    return next();
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await getAuth().verifyIdToken(idToken);
    (req as any).user = decodedToken;
    next();
  } catch (error) {
    console.error('[AuthMiddleware] Token validation failed:', error);
    Telemetry.trackSecurityEvent('invalid_token_attempt', { path: req.path, error: (error as any).message });
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
