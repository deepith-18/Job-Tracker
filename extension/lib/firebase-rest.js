// Firebase REST & Firestore Helper for Job Orbit Browser Extension
// Works in both Chrome and Firefox (Manifest V3)

const FIREBASE_CONFIG = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  projectId: "job-tracker-e81f9",
  authDomain: "job-tracker-e81f9.firebaseapp.com"
};

// Cross-browser storage helper
const browserStorage = {
  async get(keys) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      return new Promise((resolve) => chrome.storage.local.get(keys, resolve));
    } else if (typeof browser !== 'undefined' && browser.storage && browser.storage.local) {
      return browser.storage.local.get(keys);
    }
    return {};
  },
  async set(data) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      return new Promise((resolve) => chrome.storage.local.set(data, resolve));
    } else if (typeof browser !== 'undefined' && browser.storage && browser.storage.local) {
      return browser.storage.local.set(data);
    }
  },
  async remove(keys) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      return new Promise((resolve) => chrome.storage.local.remove(keys, resolve));
    } else if (typeof browser !== 'undefined' && browser.storage && browser.storage.local) {
      return browser.storage.local.remove(keys);
    }
  }
};

/**
 * Sign in to Firebase with Email and Password
 */
async function firebaseSignIn(email, password) {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_CONFIG.apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      returnSecureToken: true
    })
  });

  const data = await res.json();
  if (!res.ok) {
    const errorMsg = data.error?.message || 'Login failed';
    if (errorMsg === 'EMAIL_NOT_FOUND' || errorMsg === 'INVALID_LOGIN_CREDENTIALS') {
      throw new Error('Invalid email or password.');
    }
    if (errorMsg === 'INVALID_PASSWORD') {
      throw new Error('Incorrect password.');
    }
    throw new Error(errorMsg);
  }

  const authData = {
    idToken: data.idToken,
    refreshToken: data.refreshToken,
    expiresAt: Date.now() + (parseInt(data.expiresIn, 10) * 1000),
    uid: data.localId,
    email: data.email
  };

  await browserStorage.set({ jobOrbitAuth: authData });
  return authData;
}

/**
 * Refresh expired Firebase token
 */
async function refreshFirebaseToken(refreshToken) {
  const url = `https://securetoken.googleapis.com/v1/token?key=${FIREBASE_CONFIG.apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(refreshToken)}`
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error('Session expired. Please log in again.');
  }

  const updatedAuth = {
    idToken: data.id_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + (parseInt(data.expires_in, 10) * 1000),
    uid: data.user_id
  };

  // Merge with existing
  const current = await getStoredAuth();
  const merged = { ...current, ...updatedAuth };
  await browserStorage.set({ jobOrbitAuth: merged });
  return merged;
}

/**
 * Get current authenticated user session, refreshing token if needed
 */
async function getStoredAuth() {
  const { jobOrbitAuth } = await browserStorage.get('jobOrbitAuth');
  if (!jobOrbitAuth) return null;

  // Check if expired (or within 2 minutes of expiry)
  if (jobOrbitAuth.expiresAt && Date.now() > jobOrbitAuth.expiresAt - 120000) {
    if (jobOrbitAuth.refreshToken) {
      try {
        return await refreshFirebaseToken(jobOrbitAuth.refreshToken);
      } catch (err) {
        console.warn('Auto-refresh failed:', err);
        return null;
      }
    }
  }

  return jobOrbitAuth;
}

/**
 * Sign out
 */
async function firebaseSignOut() {
  await browserStorage.remove('jobOrbitAuth');
}

/**
 * Save an application directly into Firestore: collection `applications`
 * Matches exactly the schema in Job Orbit's `src/types/index.ts`
 */
async function saveApplicationToFirestore(appData) {
  const auth = await getStoredAuth();
  if (!auth || !auth.uid) {
    throw new Error('NOT_LOGGED_IN');
  }

  const nowIso = new Date().toISOString();
  const appliedDateIso = appData.status === 'Applied' ? nowIso : (appData.appliedDate || null);

  // Firestore REST JSON format
  const fields = {
    uid: { stringValue: auth.uid },
    email: { stringValue: auth.email || '' },
    company: { stringValue: appData.company || 'Unknown Company' },
    role: { stringValue: appData.role || 'Position' },
    status: { stringValue: appData.status || 'Applied' },
    jobLink: { stringValue: appData.jobLink || '' },
    notes: { stringValue: appData.notes || '' },
    interviewNotes: { stringValue: '' },
    source: { stringValue: appData.source || 'Extension Auto-Track' },
    rating: { integerValue: (appData.rating || 3).toString() },
    rejectionReasons: { arrayValue: { values: [] } },
    interviewDates: { arrayValue: { values: [] } },
    createdAt: { timestampValue: nowIso },
    updatedAt: { timestampValue: nowIso }
  };

  if (appliedDateIso) {
    fields.appliedDate = { timestampValue: appliedDateIso };
  } else {
    fields.appliedDate = { nullValue: null };
  }
  fields.deadline = { nullValue: null };
  fields.firstResponseDate = { nullValue: null };

  const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/applications`;

  const headers = {
    'Content-Type': 'application/json'
  };

  if (auth.idToken) {
    headers['Authorization'] = `Bearer ${auth.idToken}`;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ fields })
  });

  const responseData = await res.json();
  if (!res.ok) {
    console.error('Firestore save error:', responseData);
    const msg = responseData.error?.message || 'Failed to save application to Firestore';
    throw new Error(msg);
  }

  // Extract created document ID (last part of name path)
  const docId = responseData.name ? responseData.name.split('/').pop() : '';
  return { id: docId, success: true };
}

// Attach to global scope for Firefox background scripts and workers
globalThis.FIREBASE_CONFIG = FIREBASE_CONFIG;
globalThis.browserStorage = browserStorage;
globalThis.firebaseSignIn = firebaseSignIn;
globalThis.firebaseSignOut = firebaseSignOut;
globalThis.getStoredAuth = getStoredAuth;
globalThis.saveApplicationToFirestore = saveApplicationToFirestore;

// Export for ES modules / service worker / window
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    FIREBASE_CONFIG,
    browserStorage,
    firebaseSignIn,
    firebaseSignOut,
    getStoredAuth,
    saveApplicationToFirestore
  };
}
