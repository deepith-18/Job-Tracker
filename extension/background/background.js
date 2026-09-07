// Job Orbit - Background Service Worker
// Manages authentication, Firestore API calls, and background coordination

// In Chrome Service Worker, importScripts loads the library.
// In Firefox Background Script, it is pre-loaded via manifest.json scripts array.
if (typeof saveApplicationToFirestore === 'undefined' && typeof importScripts === 'function') {
  try {
    importScripts('../lib/firebase-rest.js');
  } catch (e) {
    try {
      importScripts('/lib/firebase-rest.js');
    } catch (e2) {
      console.error('Failed to import firebase-rest.js:', e2);
    }
  }
}

const api = typeof chrome !== 'undefined' ? chrome : browser;

// Listener for runtime messages from Content Scripts and Popup
api.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || !message.type) return false;

  // Handle messages asynchronously
  (async () => {
    try {
      switch (message.type) {
        case 'CHECK_AUTH': {
          const auth = await getStoredAuth();
          sendResponse({
            success: true,
            loggedIn: !!(auth && auth.uid),
            email: auth ? auth.email : null,
            uid: auth ? auth.uid : null
          });
          break;
        }

        case 'SIGN_IN': {
          const authData = await firebaseSignIn(message.email, message.password);
          sendResponse({ success: true, auth: authData });
          break;
        }

        case 'SIGN_OUT': {
          await firebaseSignOut();
          sendResponse({ success: true });
          break;
        }

        case 'SYNC_ORBIT_SESSION': {
          if (message.auth && message.auth.uid) {
            const dataToStore = { jobOrbitAuth: message.auth };
            if (message.portalUrl) {
              dataToStore.jobOrbitPortalUrl = message.portalUrl;
            }
            await browserStorage.set(dataToStore);
            sendResponse({ success: true, email: message.auth.email, uid: message.auth.uid });
          } else {
            sendResponse({ success: false, error: 'Invalid session data' });
          }
          break;
        }

        case 'SAVE_JOB': {
          const result = await saveApplicationToFirestore(message.data);
          
          // Flash badge on icon to give visual feedback
          try {
            if (api.action) {
              api.action.setBadgeText({ text: '✓' });
              api.action.setBadgeBackgroundColor({ color: '#10b981' });
              setTimeout(() => {
                api.action.setBadgeText({ text: '' });
              }, 3000);
            }
          } catch (badgeErr) {
            // Non-fatal
          }

          sendResponse({ success: true, id: result.id });
          break;
        }

        case 'AUTO_JOB_APPLIED': {
          // Triggered when content script detects an application was just submitted
          const auth = await getStoredAuth();
          if (!auth || !auth.uid) {
            sendResponse({ success: false, error: 'NOT_LOGGED_IN' });
            return;
          }

          const jobData = {
            ...message.data,
            status: 'Applied',
            source: message.data.source || 'Auto-Detected Submission'
          };

          const result = await saveApplicationToFirestore(jobData);

          try {
            if (api.action) {
              api.action.setBadgeText({ text: 'NEW' });
              api.action.setBadgeBackgroundColor({ color: '#6366f1' });
              setTimeout(() => {
                api.action.setBadgeText({ text: '' });
              }, 4000);
            }
          } catch (e) {}

          sendResponse({ success: true, id: result.id });
          break;
        }

        case 'OPEN_DASHBOARD': {
          // Opens user's Job Orbit web app
          const stored = await browserStorage.get('jobOrbitPortalUrl');
          const defaultUrl = (stored && stored.jobOrbitPortalUrl) ? stored.jobOrbitPortalUrl : 'http://localhost:5173';
          api.tabs.create({ url: message.url || defaultUrl });
          sendResponse({ success: true });
          break;
        }

        default:
          sendResponse({ success: false, error: 'Unknown message type' });
      }
    } catch (err) {
      console.error('Background worker error processing message:', err);
      sendResponse({ success: false, error: err.message || 'Internal error' });
    }
  })();

  // Return true to indicate we will send a response asynchronously
  return true;
});
