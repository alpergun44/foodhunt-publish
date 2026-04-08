/**
 * FoodHunt — Firebase Auth Integration
 * Verifies Firebase ID tokens and creates/updates local user accounts
 */

let admin = null;
let firebaseInitialized = false;

function initFirebase() {
  if (firebaseInitialized) return;
  try {
    const firebaseAdmin = require('firebase-admin');

    // Initialize with service account if available
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.cert(serviceAccount),
      });
    } else if (process.env.FIREBASE_PROJECT_ID) {
      // Fallback: use project ID with default credentials
      firebaseAdmin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
    } else {
      console.warn('Firebase not configured — FIREBASE_SERVICE_ACCOUNT or FIREBASE_PROJECT_ID env var required');
      return;
    }

    admin = firebaseAdmin;
    firebaseInitialized = true;
    console.log('Firebase Admin initialized successfully');
  } catch (err) {
    console.warn('Firebase Admin init failed:', err.message);
  }
}

// Try to initialize on module load
initFirebase();

/**
 * Verify Firebase ID token and return decoded user info
 */
async function verifyFirebaseToken(idToken) {
  if (!admin) throw new Error('Firebase not initialized');
  const decoded = await admin.auth().verifyIdToken(idToken);
  return {
    uid: decoded.uid,
    email: decoded.email || null,
    name: decoded.name || null,
    phone: decoded.phone_number || null,
    picture: decoded.picture || null,
    provider: decoded.firebase?.sign_in_provider || 'unknown',
  };
}

/**
 * Check if Firebase is available
 */
function isFirebaseReady() {
  return firebaseInitialized && admin !== null;
}

module.exports = { verifyFirebaseToken, isFirebaseReady, initFirebase };
