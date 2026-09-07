// Job Orbit Extension Popup Logic
// Controls authentication state, page job fetching, and direct Firestore saving

const api = typeof chrome !== 'undefined' ? chrome : browser;

let activeTabJob = {
  role: '',
  company: '',
  jobLink: '',
  notes: '',
  source: 'Browser Extension'
};

document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  await checkAuthAndInitialize();
});

function setupEventListeners() {
  // Login form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  // 1-Click Tab Sync button for Google OAuth
  const btnSyncTab = document.getElementById('btn-sync-tab');
  if (btnSyncTab) {
    btnSyncTab.addEventListener('click', handleSyncFromTab);
  }

  // Save job button
  const btnSave = document.getElementById('btn-save-job');
  if (btnSave) {
    btnSave.addEventListener('click', handleSaveJob);
  }

  // Sign out button
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', handleLogout);
  }

  // Open portal button
  const btnOpenPortal = document.getElementById('btn-open-portal');
  if (btnOpenPortal) {
    btnOpenPortal.addEventListener('click', () => {
      api.runtime.sendMessage({ type: 'OPEN_DASHBOARD' });
    });
  }
}

async function handleSyncFromTab() {
  const btn = document.getElementById('btn-sync-tab');
  const errorBox = document.getElementById('login-error');
  errorBox.classList.add('hidden');

  const originalContent = btn.textContent;
  btn.disabled = true;
  btn.textContent = '⚡ Scanning open tabs...';

  try {
    const tabs = await new Promise((resolve) => api.tabs.query({}, resolve));
    let matchedAuth = null;
    let matchedOrigin = null;

    for (const tab of tabs) {
      if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('about:')) continue;
      try {
        const res = await new Promise((resolve) => {
          api.tabs.sendMessage(tab.id, { type: 'REQUEST_ORBIT_SESSION' }, (resp) => {
            if (api.runtime.lastError) return resolve(null);
            resolve(resp);
          });
        });

        if (res && res.success && res.auth && res.auth.uid) {
          matchedAuth = res.auth;
          try {
            matchedOrigin = new URL(tab.url).origin;
          } catch (e) {}
          break;
        }
      } catch (e) { }
    }

    if (matchedAuth) {
      btn.textContent = '✓ Found! Connecting...';
      api.runtime.sendMessage({
        type: 'SYNC_ORBIT_SESSION',
        auth: matchedAuth,
        portalUrl: matchedOrigin
      }, (syncRes) => {
        btn.disabled = false;
        btn.textContent = originalContent;
        if (syncRes && syncRes.success) {
          checkAuthAndInitialize();
        } else {
          errorBox.textContent = 'Found session but sync failed: ' + (syncRes?.error || '');
          errorBox.classList.remove('hidden');
        }
      });
    } else {
      btn.disabled = false;
      btn.textContent = originalContent;
      errorBox.textContent = 'No active Job Orbit tab found. Open your Job Orbit web app in a browser tab, log in, and click Auto-Connect again.';
      errorBox.classList.remove('hidden');
    }
  } catch (err) {
    btn.disabled = false;
    btn.textContent = originalContent;
    errorBox.textContent = 'Scan error: ' + (err.message || 'Unknown');
    errorBox.classList.remove('hidden');
  }
}

async function checkAuthAndInitialize() {
  const badge = document.getElementById('connection-badge');
  const text = document.getElementById('connection-text');
  const authSection = document.getElementById('auth-section');
  const trackerSection = document.getElementById('tracker-section');

  api.runtime.sendMessage({ type: 'CHECK_AUTH' }, async (res) => {
    if (res && res.loggedIn) {
      // Logged in
      badge.className = 'badge badge-connected';
      text.textContent = res.email ? res.email.split('@')[0] : 'Connected';
      badge.title = `Connected as ${res.email}`;

      authSection.classList.add('hidden');
      trackerSection.classList.remove('hidden');

      // Fetch active tab information
      await loadActiveTabJob();
    } else {
      // Logged out
      badge.className = 'badge badge-disconnected';
      text.textContent = 'Sign In';

      authSection.classList.remove('hidden');
      trackerSection.classList.add('hidden');
    }
  });
}

function detectSourceFromUrl(url) {
  if (!url) return 'Company Site';
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (host.includes('linkedin.')) return 'LinkedIn';
    if (host.includes('indeed.')) return 'Indeed';
    if (host.includes('glassdoor.')) return 'Glassdoor';
    if (host.includes('ziprecruiter.')) return 'ZipRecruiter';
    if (host.includes('greenhouse.io')) return 'Greenhouse';
    if (host.includes('lever.co')) return 'Lever';
    if (host.includes('workday') || host.includes('myworkdayjobs')) return 'Workday';
    if (host.includes('ashbyhq')) return 'Ashby';
    if (host.includes('smartrecruiters')) return 'SmartRecruiters';
    if (host.includes('wellfound') || host.includes('angel.co')) return 'Wellfound';
    if (host.includes('dice.com')) return 'Dice';
    if (host.includes('handshake')) return 'Handshake';
    if (host.includes('simplyhired.')) return 'SimplyHired';
    if (host.includes('monster.')) return 'Monster';
    return 'Company Site';
  } catch (e) {
    return 'Company Site';
  }
}

async function loadActiveTabJob() {
  try {
    const tabs = await queryActiveTabs();
    if (!tabs || tabs.length === 0) return;

    const currentTab = tabs[0];
    activeTabJob.jobLink = currentTab.url || '';

    // Fast-path immediate domain detection
    const urlSource = detectSourceFromUrl(currentTab.url);
    activeTabJob.source = urlSource;

    const sourceInput = document.getElementById('job-source');
    const sourceTag = document.getElementById('tag-source');
    if (sourceInput) sourceInput.value = urlSource;
    if (sourceTag) sourceTag.textContent = urlSource;

    // Ask content script for detected job info
    api.tabs.sendMessage(currentTab.id, { type: 'GET_PAGE_JOB' }, (res) => {
      // If content script responded with job data
      if (res && res.success && res.job) {
        const detected = res.job;
        if (detected.role) activeTabJob.role = detected.role;
        if (detected.company) activeTabJob.company = detected.company;
        if (detected.notes) activeTabJob.notes = detected.notes;
        if (detected.source) activeTabJob.source = detected.source;
        if (detected.jobLink) activeTabJob.jobLink = detected.jobLink;
      } else {
        // Fallback to tab title heuristic
        const parsed = parseTitle(currentTab.title || '');
        if (!activeTabJob.role) activeTabJob.role = parsed.role;
        if (!activeTabJob.company) activeTabJob.company = parsed.company;
      }

      // Populate input fields
      document.getElementById('job-role').value = activeTabJob.role || '';
      document.getElementById('job-company').value = activeTabJob.company || '';
      if (activeTabJob.notes) {
        document.getElementById('job-notes').value = activeTabJob.notes;
      }
      
      const resolvedSource = activeTabJob.source || urlSource;
      if (sourceInput) sourceInput.value = resolvedSource;
      if (sourceTag) sourceTag.textContent = resolvedSource;
    });
  } catch (err) {
    console.warn('Could not query active tab job details:', err);
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const emailInput = document.getElementById('login-email');
  const passInput = document.getElementById('login-password');
  const btn = document.getElementById('btn-login');
  const errorBox = document.getElementById('login-error');

  errorBox.classList.add('hidden');
  btn.disabled = true;
  btn.textContent = 'Connecting...';

  api.runtime.sendMessage({
    type: 'SIGN_IN',
    email: emailInput.value.trim(),
    password: passInput.value
  }, (res) => {
    btn.disabled = false;
    btn.textContent = 'Sign In with Password';

    if (res && res.success) {
      checkAuthAndInitialize();
    } else {
      errorBox.textContent = res?.error || 'Authentication failed. Please check credentials.';
      errorBox.classList.remove('hidden');
    }
  });
}

async function handleSaveJob() {
  const role = document.getElementById('job-role').value.trim();
  const company = document.getElementById('job-company').value.trim();
  const status = document.getElementById('job-status').value;
  const rating = parseInt(document.getElementById('job-rating').value, 10) || 3;
  const notes = document.getElementById('job-notes').value.trim();
  const source = document.getElementById('job-source')?.value.trim() || activeTabJob.source || 'Browser Extension';

  const statusBox = document.getElementById('save-status');
  const btn = document.getElementById('btn-save-job');
  const btnText = document.getElementById('btn-save-text');

  if (!role || !company) {
    showStatus('Please enter both Role and Company name.', 'error');
    return;
  }

  btn.disabled = true;
  btnText.textContent = 'Saving to Portal...';

  const jobPayload = {
    role,
    company,
    status,
    rating,
    notes,
    jobLink: activeTabJob.jobLink || window.location.href,
    source,
    appliedDate: status === 'Applied' ? new Date().toISOString() : null
  };

  api.runtime.sendMessage({
    type: 'SAVE_JOB',
    data: jobPayload
  }, (res) => {
    btn.disabled = false;
    btnText.textContent = 'Save to Job Orbit Portal';

    if (res && res.success) {
      showStatus('✓ Added to Job Orbit in real-time!', 'success');
      setTimeout(() => {
        statusBox.classList.add('hidden');
      }, 3500);
    } else {
      showStatus('Failed to save: ' + (res?.error || 'Unknown error'), 'error');
    }
  });
}

function handleLogout() {
  api.runtime.sendMessage({ type: 'SIGN_OUT' }, () => {
    checkAuthAndInitialize();
  });
}

function showStatus(msg, type) {
  const statusBox = document.getElementById('save-status');
  statusBox.textContent = msg;
  statusBox.className = `save-status ${type}`;
  statusBox.classList.remove('hidden');
}

function queryActiveTabs() {
  return new Promise((resolve) => {
    api.tabs.query({ active: true, currentWindow: true }, resolve);
  });
}

function parseTitle(title) {
  if (!title) return { role: '', company: '' };
  const atMatch = title.match(/^(.*?)\s+(?:at|@)\s+(.*?)(?:\s+[-|•].*)?$/i);
  if (atMatch) return { role: atMatch[1].trim(), company: atMatch[2].trim() };
  const hyphenMatch = title.match(/^(.*?)\s+[-|•]\s+(.*?)$/);
  if (hyphenMatch) return { role: hyphenMatch[1].trim(), company: hyphenMatch[2].trim() };
  return { role: title.trim(), company: '' };
}
