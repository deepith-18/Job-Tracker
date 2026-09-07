// Job Orbit Universal Content Script
// Automatically detects job postings, handles accurate extraction on Indeed/LinkedIn/ATSs,
// auto-detects submissions, and syncs OAuth credentials.

(function () {
  // Prevent double injection
  if (window.__jobOrbitInjected) return;
  window.__jobOrbitInjected = true;

  const api = typeof chrome !== 'undefined' ? chrome : browser;

  // ----------------------------------------------------
  // 1. Check if Current Page is the Job Orbit Portal
  // ----------------------------------------------------
  function isJobOrbitPortal() {
    const host = window.location.hostname.toLowerCase();
    const title = (document.title || '').toLowerCase();
    const desc = document.querySelector('meta[name="description"]')?.content?.toLowerCase() || '';
    return (
      host.includes('job-tracker') ||
      host.includes('joborbit') ||
      host === 'localhost' ||
      host === '127.0.0.1' ||
      title.includes('job orbit') ||
      desc.includes('job orbit') ||
      !!document.querySelector('meta[content*="Job Orbit"]') ||
      !!localStorage.getItem('joborbit_theme_storage')
    );
  }

  // ----------------------------------------------------
  // 2. Automatic OAuth Session Detection (Job Orbit Only)
  // ----------------------------------------------------
  async function extractFirebaseSession() {
    return new Promise((resolve) => {
      try {
        const req = indexedDB.open('firebaseLocalStorageDb');
        req.onerror = () => resolve(null);
        req.onsuccess = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains('firebaseLocalStorage')) {
            return resolve(null);
          }
          const tx = db.transaction('firebaseLocalStorage', 'readonly');
          const store = tx.objectStore('firebaseLocalStorage');
          const getReq = store.getAll();
          getReq.onsuccess = () => {
            const items = getReq.result;
            if (items && items.length > 0) {
              for (const item of items) {
                const val = item.value;
                if (val && val.uid && val.stsTokenManager) {
                  return resolve({
                    uid: val.uid,
                    email: val.email || '',
                    idToken: val.stsTokenManager.accessToken,
                    refreshToken: val.stsTokenManager.refreshToken,
                    expiresAt: val.stsTokenManager.expirationTime
                  });
                }
              }
            }
            resolve(null);
          };
          getReq.onerror = () => resolve(null);
        };
      } catch (err) {
        resolve(null);
      }
    });
  }

  // If on Job Orbit Portal:
  if (isJobOrbitPortal()) {
    // Clean up any stray widget elements if previously injected
    const strayWidget = document.getElementById('job-orbit-widget-root');
    if (strayWidget) strayWidget.remove();

    // Auto-sync session to background
    extractFirebaseSession().then((session) => {
      if (session && session.uid) {
        api.runtime.sendMessage({
          type: 'SYNC_ORBIT_SESSION',
          auth: session,
          portalUrl: window.location.origin
        });
      }
    });

    // Respond to popup requests for active tab session
    api.runtime.onMessage.addListener((req, sender, sendResponse) => {
      if (req.type === 'REQUEST_ORBIT_SESSION') {
        extractFirebaseSession().then((session) => {
          sendResponse({ success: !!session, auth: session });
        });
        return true;
      }
      return true;
    });

    // DO NOT initialize job tracker or widget on Job Orbit portal!
    return;
  }

  // ----------------------------------------------------
  // 3. Last Known Valid Job Cache (Avoids Confirmation Screen Pollution)
  // ----------------------------------------------------
  let cachedValidJob = null;
  let applicationSubmittedCaptured = false;

  const INVALID_ROLE_REGEX = /(application (has been )?submitted|thank you for applying|thanks for applying|application received|we have received|job orbit|search jobs|sign in|log in|find jobs|jobs in |career opportunities|\d+[\s\w,]+ jobs|jobs,\s*employment|search results|job search|browse jobs|open positions|current openings|explore careers)/i;

  function isValidRole(role) {
    if (!role || typeof role !== 'string') return false;
    const clean = role.trim();
    if (clean.length < 2 || clean.length > 120) return false;
    // Don't accept phrases that contain job counts like "14,500 Developer Jobs"
    if (/\b\d{2,}\b.*jobs/i.test(clean)) return false;
    if (/jobs\s+in\b/i.test(clean)) return false;
    if (clean.toLowerCase().startsWith('top ') && clean.toLowerCase().includes('jobs')) return false;
    return !INVALID_ROLE_REGEX.test(clean);
  }

  function isValidCompany(company) {
    if (!company || typeof company !== 'string') return false;
    const clean = company.trim().toLowerCase();
    if (clean.length < 2 || clean.length > 80) return false;
    // Reject generic job boards and platforms
    const blocked = [
      'indeed', 'linkedin', 'glassdoor', 'ziprecruiter', 'job orbit',
      'job-tracker', 'target company', 'careers', 'jobs', 'apply', 'unknown company'
    ];
    if (blocked.includes(clean)) return false;
    if (clean.includes('job-tracker') || clean.includes('job orbit')) return false;
    return true;
  }

  // ----------------------------------------------------
  // 4. Platform-Specific Scrapers
  // ----------------------------------------------------
  function extractJobFromPage() {
    const hostname = window.location.hostname.toLowerCase();
    let job = {
      role: '',
      company: '',
      jobLink: window.location.href,
      notes: '',
      source: detectSourceFromDomain(),
      status: 'Wishlist'
    };

    // --- A. INDEED SPECIALIZED SCRAPER (Global: indeed.com, in.indeed.com, indeed.co.uk, etc.) ---
    if (hostname.includes('indeed.')) {
      job.source = 'Indeed';

      // 1. Resolve canonical clean job URL from search parameters or permalink
      const searchParams = new URLSearchParams(window.location.search);
      const vjk = searchParams.get('vjk') || searchParams.get('jk');
      if (vjk) {
        job.jobLink = `https://${window.location.hostname}/viewjob?jk=${vjk}`;
      } else if (window.location.pathname.includes('/viewjob')) {
        job.jobLink = window.location.origin + window.location.pathname + (window.location.search.includes('jk=') ? `?jk=${searchParams.get('jk')}` : '');
      }

      // 2. Extract Indeed Role
      // Target active job detail pane (works in both split-screen search & full viewjob)
      const detailContainer = document.querySelector(
        '#jobsearch-ViewjobPaneWrapper, #viewJobSSRRoot, .jobsearch-RightPane, .fastviewjob, .jobsearch-ViewJob, [data-testid="jobsearch-ViewjobPaneWrapper"]'
      );

      const searchRoot = detailContainer || (window.location.pathname.includes('/viewjob') ? document : null);

      if (searchRoot) {
        const titleNode = searchRoot.querySelector(
          '[data-testid="jobsearch-JobInfoHeader-title"], .jobsearch-JobInfoHeader-title, h1[class*="JobInfoHeader"], [data-testid="simpler-jobTitle"], h2.jobTitle, .jobsearch-JobInfoHeader-title span, h1'
        );

        if (titleNode) {
          let rawTitle = titleNode.textContent.replace(/- job post/i, '').replace(/\bnew\b/i, '');
          const cleanRole = cleanText(rawTitle);
          if (isValidRole(cleanRole)) {
            job.role = cleanRole;
          }
        }

        // 3. Extract Indeed Company
        const compNode = searchRoot.querySelector(
          '[data-testid="inlineHeader-companyName"] a, [data-testid="inlineHeader-companyName"], [data-company-name="true"], [data-testid="company-name"], div[data-testid="jobsearch-CompanyInfoContainer"] a, .jobsearch-CompanyInfoContainer a, .jobsearch-JobInfoHeader-companyNameLink, .companyOverviewLink, .jobsearch-CompanyReview--heading'
        );

        if (compNode) {
          const cleanComp = cleanText(compNode.textContent);
          if (isValidCompany(cleanComp)) {
            job.company = cleanComp;
          }
        }

        // 4. Notes / Snippet
        const descNode = searchRoot.querySelector('#jobDescriptionText, .jobsearch-jobDescriptionText');
        if (descNode) {
          job.notes = descNode.textContent.slice(0, 400).trim() + '...';
        }
      }
    }

    // --- B. LINKEDIN SPECIALIZED SCRAPER ---
    else if (hostname.includes('linkedin.com')) {
      job.source = 'LinkedIn';
      const roleElem = document.querySelector(
        '.job-details-jobs-unified-top-card__job-title, .jobs-unified-top-card__job-title, h1.t-24, h1[class*="job-title"], [data-job-id] h1, .job-view-layout h1'
      );
      const companyElem = document.querySelector(
        '.job-details-jobs-unified-top-card__company-name a, .job-details-jobs-unified-top-card__company-name, .jobs-unified-top-card__company-name, .jobs-unified-top-card__subtitle-primary-grouping a, .job-details-jobs-unified-top-card__primary-description a'
      );
      if (roleElem && roleElem.textContent.trim()) {
        const cleanRole = cleanText(roleElem.textContent);
        if (isValidRole(cleanRole)) job.role = cleanRole;
      }
      if (companyElem && companyElem.textContent.trim()) {
        const cleanComp = cleanText(companyElem.textContent);
        if (isValidCompany(cleanComp)) job.company = cleanComp;
      }

      // Clean LinkedIn URL to permalink if possible
      const currentUrl = new URL(window.location.href);
      const currentJobId = currentUrl.searchParams.get('currentJobId');
      if (currentJobId) {
        job.jobLink = `https://www.linkedin.com/jobs/view/${currentJobId}/`;
      }
    }

    // --- C. GLASSDOOR SCRAPER ---
    else if (hostname.includes('glassdoor.')) {
      job.source = 'Glassdoor';
      const roleElem = document.querySelector('[data-test="job-title"], .JobDetails_jobTitle__Rw_gn, h1');
      const compElem = document.querySelector('[data-test="employer-name"], .EmployerProfile_employerName__XemMm, [data-test="employerName"]');
      if (roleElem) job.role = cleanText(roleElem.textContent);
      if (compElem) job.company = cleanText(compElem.textContent.replace(/[★\d.]+/g, ''));
    }

    // --- D. ZIPRECRUITER SCRAPER ---
    else if (hostname.includes('ziprecruiter.')) {
      job.source = 'ZipRecruiter';
      const roleElem = document.querySelector('.job_title, h1[class*="jobTitle"], h1');
      const compElem = document.querySelector('.hiring_company_text, a[class*="companyName"], [data-testid="company-name"]');
      if (roleElem) job.role = cleanText(roleElem.textContent);
      if (compElem) job.company = cleanText(compElem.textContent);
    }

    // --- E. GREENHOUSE SCRAPER ---
    else if (hostname.includes('greenhouse.io') || document.querySelector('#app-body, .app-title')) {
      job.source = 'Greenhouse';
      const roleElem = document.querySelector('.app-title, h1.app-title, h1');
      const compElem = document.querySelector('.company-name, .logo img');
      if (roleElem) job.role = cleanText(roleElem.textContent);
      if (compElem && compElem.alt) job.company = cleanText(compElem.alt);
      else if (compElem) job.company = cleanText(compElem.textContent);
    }

    // --- F. LEVER SCRAPER ---
    else if (hostname.includes('lever.co')) {
      job.source = 'Lever';
      const roleElem = document.querySelector('.posting-headline h2, h2');
      const compElem = document.querySelector('.main-header-logo img') || document.querySelector('.posting-headline .company-name');
      if (roleElem) job.role = cleanText(roleElem.textContent);
      if (compElem && compElem.alt) job.company = cleanText(compElem.alt);
      else if (compElem) job.company = cleanText(compElem.textContent);
    }

    // --- G. WORKDAY SCRAPER ---
    else if (hostname.includes('myworkdayjobs.com') || hostname.includes('workday.com')) {
      job.source = 'Workday';
      const roleElem = document.querySelector('[data-automation-id="jobPostingHeader"], h2[data-automation-id="jobPostingTitle"], h1');
      if (roleElem) job.role = cleanText(roleElem.textContent);
      const hostParts = hostname.split('.');
      if (hostParts.length > 2 && hostParts[0] !== 'www') {
        job.company = cleanText(capitalize(hostParts[0]));
      }
    }

    // --- H. ASHBY SCRAPER ---
    else if (hostname.includes('ashbyhq.com')) {
      job.source = 'Ashby';
      const roleElem = document.querySelector('h1');
      const compElem = document.querySelector('header img, nav img');
      if (roleElem) job.role = cleanText(roleElem.textContent);
      if (compElem && compElem.alt) job.company = cleanText(compElem.alt);
    }

    // --- I. SCHEMA.ORG JSON-LD FALLBACK (For 90%+ of company websites) ---
    if (!isValidRole(job.role) || !isValidCompany(job.company)) {
      try {
        const scripts = document.querySelectorAll('script[type="application/ld+json"]');
        for (const script of scripts) {
          try {
            const json = JSON.parse(script.textContent);
            const posting = findJobPostingSchema(json);
            if (posting) {
              if (!isValidRole(job.role) && posting.title) {
                const cleanR = cleanText(posting.title);
                if (isValidRole(cleanR)) job.role = cleanR;
              }
              if (!isValidCompany(job.company) && posting.hiringOrganization && posting.hiringOrganization.name) {
                const cleanC = cleanText(posting.hiringOrganization.name);
                if (isValidCompany(cleanC)) job.company = cleanC;
              }
              if (posting.description && !job.notes) {
                job.notes = cleanText(posting.description.replace(/<[^>]+>/g, ' ')).slice(0, 400) + '...';
              }
              if (isValidRole(job.role) && isValidCompany(job.company)) break;
            }
          } catch (e) {}
        }
      } catch (e) {}
    }

    // --- J. METADATA & TITLE FALLBACK ---
    if (!isValidRole(job.role) || !isValidCompany(job.company)) {
      const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content') || document.title;
      const parsed = parseRoleAndCompanyFromTitle(ogTitle);
      if (!isValidRole(job.role) && isValidRole(parsed.role)) job.role = parsed.role;
      if (!isValidCompany(job.company) && isValidCompany(parsed.company)) job.company = parsed.company;
    }

    // Validate final values
    if (!isValidRole(job.role)) {
      if (cachedValidJob && isValidRole(cachedValidJob.role)) {
        job.role = cachedValidJob.role;
        job.company = cachedValidJob.company || job.company;
        job.jobLink = cachedValidJob.jobLink || job.jobLink;
      } else {
        job.role = '';
      }
    }

    if (!isValidCompany(job.company)) {
      if (cachedValidJob && isValidCompany(cachedValidJob.company)) {
        job.company = cachedValidJob.company;
      } else {
        const guessed = cleanText(guessCompanyFromDomain(hostname));
        if (isValidCompany(guessed)) {
          job.company = guessed;
        } else {
          job.company = '';
        }
      }
    }

    // Update cache if valid
    if (isValidRole(job.role) && isValidCompany(job.company)) {
      cachedValidJob = { ...job };
    }

    return job;
  }

  function findJobPostingSchema(obj) {
    if (!obj) return null;
    if (obj['@type'] === 'JobPosting') return obj;
    if (Array.isArray(obj['@graph'])) {
      return obj['@graph'].find(item => item && item['@type'] === 'JobPosting');
    }
    if (Array.isArray(obj)) {
      return obj.find(item => item && item['@type'] === 'JobPosting');
    }
    return null;
  }

  function parseRoleAndCompanyFromTitle(title) {
    if (!title) return { role: '', company: '' };
    // Format: "Software Engineer at Google"
    const atMatch = title.match(/^(.*?)\s+(?:at|@)\s+(.*?)(?:\s+[-|•].*)?$/i);
    if (atMatch) return { role: cleanText(atMatch[1]), company: cleanText(atMatch[2]) };

    // Format: "Software Engineer - Google - New York"
    const hyphenMatch = title.match(/^(.*?)\s+[-|•]\s+(.*?)(?:\s+[-|•].*)?$/);
    if (hyphenMatch) {
      return { role: cleanText(hyphenMatch[1]), company: cleanText(hyphenMatch[2]) };
    }

    return { role: cleanText(title), company: '' };
  }

  function detectSourceFromDomain() {
    const host = window.location.hostname.toLowerCase();
    if (host.includes('linkedin.')) return 'LinkedIn';
    if (host.includes('indeed.')) return 'Indeed';
    if (host.includes('glassdoor.')) return 'Glassdoor';
    if (host.includes('ziprecruiter.')) return 'ZipRecruiter';
    if (host.includes('greenhouse.io')) return 'Greenhouse';
    if (host.includes('lever.co')) return 'Lever';
    if (host.includes('myworkdayjobs.com') || host.includes('workday.com')) return 'Workday';
    if (host.includes('ashbyhq.com')) return 'Ashby';
    if (host.includes('smartrecruiters.com')) return 'SmartRecruiters';
    if (host.includes('wellfound.com') || host.includes('angel.co')) return 'Wellfound';
    if (host.includes('dice.com')) return 'Dice';
    if (host.includes('joinhandshake.com') || host.includes('handshake.com')) return 'Handshake';
    if (host.includes('simplyhired.')) return 'SimplyHired';
    if (host.includes('monster.')) return 'Monster';

    const siteName = document.querySelector('meta[property="og:site_name"]')?.getAttribute('content');
    if (siteName && siteName.trim().length > 1 && siteName.length < 30) {
      return cleanText(siteName);
    }
    return guessCompanyFromDomain(host) || 'Company Site';
  }

  function guessCompanyFromDomain(host) {
    const parts = host.replace(/^www\./, '').split('.');
    if (parts.length > 0 && !['jobs', 'careers', 'indeed', 'apply', 'work', 'boards'].includes(parts[0])) {
      return capitalize(parts[0]);
    }
    if (parts.length > 1) return capitalize(parts[1]);
    return '';
  }

  function cleanText(text) {
    return text ? text.replace(/\s+/g, ' ').replace(/[|•·\n\r]/g, ' ').trim() : '';
  }

  function capitalize(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
  }

  // ----------------------------------------------------
  // 5. On-Page Toast Notification Helper
  // ----------------------------------------------------
  function showToast(title, desc, type = 'success') {
    let root = document.getElementById('job-orbit-widget-root');
    if (!root) {
      root = document.createElement('div');
      root.id = 'job-orbit-widget-root';
      document.body.appendChild(root);
    }

    const toast = document.createElement('div');
    toast.className = `job-orbit-toast ${type}`;

    const icon = document.createElement('div');
    icon.className = 'job-orbit-toast-icon';

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');

    if (type === 'success') {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', '12');
      circle.setAttribute('cy', '12');
      circle.setAttribute('r', '10');
      const check = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      check.setAttribute('d', 'M9 12l2 2 4-4');
      svg.appendChild(circle);
      svg.appendChild(check);
    } else {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', '12');
      circle.setAttribute('cy', '12');
      circle.setAttribute('r', '10');
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', '12');
      line.setAttribute('y1', '8');
      line.setAttribute('x2', '12');
      line.setAttribute('y2', '12');
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      dot.setAttribute('x1', '12');
      dot.setAttribute('y1', '16');
      dot.setAttribute('x2', '12.01');
      dot.setAttribute('y2', '16');
      svg.appendChild(circle);
      svg.appendChild(line);
      svg.appendChild(dot);
    }
    icon.appendChild(svg);

    const content = document.createElement('div');
    content.className = 'job-orbit-toast-content';

    const toastTitle = document.createElement('div');
    toastTitle.className = 'job-orbit-toast-title';
    toastTitle.textContent = title;

    const toastDesc = document.createElement('div');
    toastDesc.className = 'job-orbit-toast-desc';
    toastDesc.textContent = cleanText(desc.replace(/<[^>]+>/g, ' '));

    content.appendChild(toastTitle);
    content.appendChild(toastDesc);
    toast.appendChild(icon);
    toast.appendChild(content);

    root.appendChild(toast);
    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 4200);
  }

  // ----------------------------------------------------
  // 6. Auto-Submission Detection (Accurate & Reliable)
  // ----------------------------------------------------
  function handleDetectedApplicationSubmit() {
    if (applicationSubmittedCaptured) return;

    // Refresh extraction or fall back to cached job
    let job = extractJobFromPage();
    if ((!isValidRole(job.role) || !isValidCompany(job.company)) && cachedValidJob) {
      job = { ...cachedValidJob };
    }

    if (!isValidRole(job.role) || !isValidCompany(job.company)) {
      return;
    }

    applicationSubmittedCaptured = true;
    job.status = 'Applied';

    api.runtime.sendMessage({
      type: 'AUTO_JOB_APPLIED',
      data: job
    }, (res) => {
      if (res && res.success) {
        showToast(
          'Application Tracked',
          `Added ${job.role} at ${job.company} to your pipeline.`,
          'success'
        );
      } else if (res && res.error === 'NOT_LOGGED_IN') {
        showToast(
          'Account Not Connected',
          `Detected application for ${job.role}, but extension is not connected. Open the extension to link your account.`,
          'warning'
        );
      } else {
        console.warn('Job Orbit auto-track failed:', res?.error);
      }
    });
  }

  // A. Monitor Button & Link Clicks
  document.addEventListener('click', (e) => {
    // Keep cached job fresh on any page interaction
    const current = extractJobFromPage();
    if (isValidRole(current.role) && isValidCompany(current.company)) {
      cachedValidJob = { ...current };
    }

    const target = e.target.closest('button, input[type="submit"], a, [role="button"]');
    if (!target) return;

    const rawText = (target.textContent || target.value || '').toLowerCase();
    const cleanBtn = cleanText(rawText).toLowerCase();
    const ariaLabel = (target.getAttribute('aria-label') || '').toLowerCase();

    // Check for submission patterns across LinkedIn, Indeed, Greenhouse, Lever, Workday, etc.
    const isSubmit =
      cleanBtn.includes('submit application') ||
      cleanBtn.includes('submit your application') ||
      cleanBtn.includes('submit resume') ||
      cleanBtn.includes('send application') ||
      cleanBtn === 'submit' ||
      cleanBtn === 'apply now' && (target.closest('form') || target.closest('[role="dialog"]')) ||
      ariaLabel.includes('submit application') ||
      ariaLabel.includes('submit your application') ||
      target.getAttribute('data-control-name') === 'submit_unify' ||
      (target.getAttribute('type') === 'submit' && (cleanBtn.includes('submit') || cleanBtn.includes('apply')));

    if (isSubmit) {
      setTimeout(() => {
        handleDetectedApplicationSubmit();
      }, 1200);
    }
  }, true);

  // B. Monitor HTML Form Submissions (Greenhouse, Lever, Company Portals)
  document.addEventListener('submit', (e) => {
    const current = extractJobFromPage();
    if (isValidRole(current.role) && isValidCompany(current.company)) {
      cachedValidJob = { ...current };
    }

    setTimeout(() => {
      handleDetectedApplicationSubmit();
    }, 1200);
  }, true);

  // C. Monitor Dedicated Confirmation Headers/Banners (e.g. "Thank you for applying")
  const successExactRegex = /(your application (has been )?submitted|thank you for applying|thanks for applying|application received|we have received your application|you've applied)/i;

  let lastCheckedTime = 0;
  function checkPageForConfirmation() {
    if (applicationSubmittedCaptured) return;
    const now = Date.now();
    if (now - lastCheckedTime < 2000) return;
    lastCheckedTime = now;

    // Only inspect prominent headings / modal alerts
    const headings = document.querySelectorAll(
      'h1, h2, h3, [role="alert"], [data-testid*="confirm"], [data-testid*="success"], .application-complete, .success-title'
    );
    for (const h of headings) {
      const text = cleanText(h.textContent);
      if (successExactRegex.test(text) && text.length < 90) {
        handleDetectedApplicationSubmit();
        break;
      }
    }
  }

  const observer = new MutationObserver(() => {
    checkPageForConfirmation();
  });

  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // D. Listen for clicks on job cards in split-view (Indeed, LinkedIn) to re-extract dynamically
  document.addEventListener('click', (e) => {
    const card = e.target.closest(
      '.job_seen_beacon, [data-jk], li.css-5lfssm, a[id^="job_"], .jobs-search-results-list__list-item, [data-occludable-job-id]'
    );
    if (card) {
      setTimeout(() => {
        extractJobFromPage();
        initFloatingWidget();
      }, 400);
    }
  });

  // ----------------------------------------------------
  // 7. Floating On-Page Quick Widget (Non-Intrusive, Dismissable)
  // ----------------------------------------------------
  let isWidgetDismissed = false;

  function initFloatingWidget() {
    if (isWidgetDismissed) return;
    const job = extractJobFromPage();

    // Must have BOTH a valid role and a valid company to show widget!
    if (!isValidRole(job.role) || !isValidCompany(job.company)) {
      const existing = document.getElementById('job-orbit-floating-pill');
      if (existing) existing.remove();
      return;
    }

    let root = document.getElementById('job-orbit-widget-root');
    if (!root) {
      root = document.createElement('div');
      root.id = 'job-orbit-widget-root';
      document.body.appendChild(root);
    }

    // Update existing or create new
    let container = document.getElementById('job-orbit-floating-pill');
    if (container) return;

    container = document.createElement('div');
    container.id = 'job-orbit-floating-pill';

    const pill = document.createElement('div');
    pill.className = 'job-orbit-pill';
    pill.title = `Job Orbit Quick Track: ${job.role} at ${job.company}`;

    const pillIcon = document.createElement('div');
    pillIcon.className = 'job-orbit-pill-icon';
    const pillSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    pillSvg.setAttribute('viewBox', '0 0 24 24');
    pillSvg.setAttribute('fill', 'none');
    pillSvg.setAttribute('stroke', 'currentColor');
    pillSvg.setAttribute('stroke-width', '2');
    pillSvg.setAttribute('stroke-linecap', 'round');
    pillSvg.setAttribute('stroke-linejoin', 'round');
    const pillPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pillPath.setAttribute('d', 'M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z');
    pillSvg.appendChild(pillPath);
    pillIcon.appendChild(pillSvg);

    const pillText = document.createElement('div');
    pillText.className = 'job-orbit-pill-text';
    pillText.textContent = 'Track to Job Orbit';

    const closePill = document.createElement('span');
    closePill.className = 'job-orbit-pill-close';
    closePill.title = 'Hide';
    closePill.textContent = '✕';

    pill.appendChild(pillIcon);
    pill.appendChild(pillText);
    pill.appendChild(closePill);
    container.appendChild(pill);

    closePill.addEventListener('click', (e) => {
      e.stopPropagation();
      container.remove();
      isWidgetDismissed = true;
    });

    pill.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleDrawer();
    });

    function toggleDrawer() {
      const existingDrawer = document.getElementById('job-orbit-drawer');
      if (existingDrawer) {
        existingDrawer.remove();
        return;
      }

      const currentJob = extractJobFromPage();
      if (!isValidRole(currentJob.role) && cachedValidJob) {
        currentJob.role = cachedValidJob.role;
        currentJob.company = cachedValidJob.company;
        if (cachedValidJob.source) currentJob.source = cachedValidJob.source;
        if (cachedValidJob.jobLink) currentJob.jobLink = cachedValidJob.jobLink;
      }
      if (!currentJob.source) {
        currentJob.source = detectSourceFromDomain() || 'Company Site';
      }

      const drawer = document.createElement('div');
      drawer.id = 'job-orbit-drawer';
      drawer.className = 'job-orbit-card';

      // Header
      const header = document.createElement('div');
      header.className = 'job-orbit-card-header';
      const brand = document.createElement('div');
      brand.className = 'job-orbit-brand';

      const brandSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      brandSvg.setAttribute('viewBox', '0 0 24 24');
      brandSvg.setAttribute('fill', 'none');
      brandSvg.setAttribute('stroke', 'currentColor');
      brandSvg.setAttribute('stroke-width', '2');
      brandSvg.setAttribute('stroke-linecap', 'round');
      brandSvg.setAttribute('stroke-linejoin', 'round');
      const bRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bRect.setAttribute('x', '2');
      bRect.setAttribute('y', '7');
      bRect.setAttribute('width', '20');
      bRect.setAttribute('height', '14');
      bRect.setAttribute('rx', '2');
      bRect.setAttribute('ry', '2');
      brandSvg.appendChild(bRect);
      brand.appendChild(brandSvg);

      const brandTitle = document.createElement('span');
      brandTitle.textContent = 'Track to Job Orbit';
      brand.appendChild(brandTitle);

      const closeBtn = document.createElement('button');
      closeBtn.className = 'job-orbit-close-btn';
      closeBtn.id = 'job-orbit-close-drawer';
      closeBtn.textContent = '✕';
      header.appendChild(brand);
      header.appendChild(closeBtn);

      // Body
      const body = document.createElement('div');
      body.className = 'job-orbit-card-body';

      // Role field
      const fieldRole = document.createElement('div');
      fieldRole.className = 'job-orbit-field';
      const labelRole = document.createElement('label');
      labelRole.className = 'job-orbit-label';
      labelRole.textContent = 'Role / Position';
      const inputRole = document.createElement('input');
      inputRole.type = 'text';
      inputRole.className = 'job-orbit-input';
      inputRole.id = 'orbit-input-role';
      inputRole.value = currentJob.role || '';
      fieldRole.appendChild(labelRole);
      fieldRole.appendChild(inputRole);

      // Company field
      const fieldComp = document.createElement('div');
      fieldComp.className = 'job-orbit-field';
      const labelComp = document.createElement('label');
      labelComp.className = 'job-orbit-label';
      labelComp.textContent = 'Company';
      const inputComp = document.createElement('input');
      inputComp.type = 'text';
      inputComp.className = 'job-orbit-input';
      inputComp.id = 'orbit-input-company';
      inputComp.value = currentJob.company || '';
      fieldComp.appendChild(labelComp);
      fieldComp.appendChild(inputComp);

      // Status field
      const fieldStatus = document.createElement('div');
      fieldStatus.className = 'job-orbit-field';
      const labelStatus = document.createElement('label');
      labelStatus.className = 'job-orbit-label';
      labelStatus.textContent = 'Pipeline Status';
      const selectStatus = document.createElement('select');
      selectStatus.className = 'job-orbit-select';
      selectStatus.id = 'orbit-input-status';
      ['Applied', 'Wishlist', 'OA/Assessment', 'Interview'].forEach((st) => {
        const opt = document.createElement('option');
        opt.value = st;
        opt.textContent = st;
        if (st === 'Applied') opt.selected = true;
        selectStatus.appendChild(opt);
      });
      fieldStatus.appendChild(labelStatus);
      fieldStatus.appendChild(selectStatus);

      // Save button
      const saveBtn = document.createElement('button');
      saveBtn.className = 'job-orbit-save-btn';
      saveBtn.id = 'job-orbit-save-submit';
      saveBtn.textContent = 'Save to Pipeline';

      body.appendChild(fieldRole);
      body.appendChild(fieldComp);
      body.appendChild(fieldStatus);
      body.appendChild(saveBtn);

      drawer.appendChild(header);
      drawer.appendChild(body);

      container.insertBefore(drawer, pill);

      closeBtn.addEventListener('click', () => {
        drawer.remove();
      });

      saveBtn.addEventListener('click', async () => {
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving Application...';

        const role = inputRole.value.trim();
        const company = inputComp.value.trim();
        const status = selectStatus.value;

        api.runtime.sendMessage({
          type: 'SAVE_JOB',
          data: {
            role,
            company,
            status,
            jobLink: currentJob.jobLink || window.location.href,
            source: currentJob.source || detectSourceFromDomain() || 'Company Site',
            notes: currentJob.notes || '',
            appliedDate: status === 'Applied' ? new Date().toISOString() : null
          }
        }, (res) => {
          if (res && res.success) {
            drawer.remove();
            showToast('Application Saved', `Added ${role} at ${company} to your pipeline.`, 'success');
          } else if (res && res.error === 'NOT_LOGGED_IN') {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Sign in to Extension';
            showToast('Account Not Connected', 'Please click the Job Orbit extension icon to sign in.', 'warning');
          } else {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Retry Save';
            alert('Could not save: ' + (res?.error || 'Check extension popup connection'));
          }
        });
      });
    }

    root.appendChild(container);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ----------------------------------------------------
  // 8. Message Listener for Extension Popup
  // ----------------------------------------------------
  api.runtime.onMessage.addListener((req, sender, sendResponse) => {
    if (req.type === 'GET_PAGE_JOB') {
      const job = extractJobFromPage();
      sendResponse({ success: true, job });
    }
    return true;
  });

  // Delay widget injection slightly to allow dynamic SPAs (Indeed, LinkedIn, Workday) to render
  setTimeout(initFloatingWidget, 1500);

  // Periodic check for SPA route navigation (e.g. clicking different jobs in Indeed search list)
  let lastUrl = window.location.href;
  setInterval(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      applicationSubmittedCaptured = false;
      extractJobFromPage();
      initFloatingWidget();
    }
  }, 2000);

})();
