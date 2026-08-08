import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';

// ── Validate that all required Firebase env vars are present ──
// If any are missing, the app will fail silently in production.
// This check makes the problem obvious immediately.
const REQUIRED_VARS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const;

const missingVars = REQUIRED_VARS.filter(
  (key) => !import.meta.env[key]
);

if (missingVars.length > 0) {
  const msg = `[ApplyFlow] Missing Firebase environment variables: ${missingVars.join(', ')}.\n` +
    'Add these to Vercel: Project → Settings → Environment Variables, then redeploy.';
  console.error(msg);
  // Show a visible banner in the page so it is impossible to miss
  if (typeof document !== 'undefined') {
    document.body.innerHTML = `<div style="font-family:monospace;padding:32px;background:#fff1f2;color:#991b1b;font-size:14px;border:2px solid #fecaca;border-radius:12px;margin:40px auto;max-width:640px;">
      <strong>⚠ Firebase Not Configured</strong><br><br>
      Missing environment variables:<br><code>${missingVars.join('<br>')}</code><br><br>
      Go to <strong>Vercel → Settings → Environment Variables</strong> and add the VITE_FIREBASE_* values from your .env file, then redeploy.
    </div>`;
  }
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Enable persistent IndexedDB cache with multi-tab support.
// This caches Firestore data locally so:
// 1. Subsequent page loads are near-instant (data served from cache first)
// 2. Offline writes are queued and auto-sync when connection restores
// 3. Multiple browser tabs stay in sync
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

export default app;

