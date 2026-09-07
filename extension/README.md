# 🪐 Job Orbit Auto-Tracker Browser Extension

A cross-browser WebExtension (Manifest V3) for **Firefox**, **Chrome**, **Brave**, and **Edge** that automatically detects job postings on any career website and saves them directly to your **Job Orbit** portal in real time.

---

## 🚀 Key Features

* **Real-time Firestore Sync:** Directly writes to your Job Orbit Firebase database (`job-tracker-e81f9`) using your login session.
* **Instant Dashboard Update:** Your Job Orbit dashboard updates live via Firestore `onSnapshot` without needing to refresh.
* **Auto-Submission Detection:** Detects when you click "Submit Application" or land on a "Thank you for applying" confirmation page, automatically marking the job as **`Applied`**.
* **Universal ATS Support:** Smart scrapers for **LinkedIn**, **Indeed**, **Greenhouse**, **Lever**, **Workday**, **Wellfound/AngelList**, **Glassdoor**, and any site with standard Schema.org JSON-LD tags.
* **On-Page Floating Widget:** A sleek floating badge appears on job pages so you can track roles with 1-click or adjust fields.
* **Extension Popup:** Preview parsed details (Role, Company, Status, Dream Rating, Notes) and save or open your dashboard.

---

## 🦊 How to Install in Firefox (Recommended for you)

1. Open **Firefox**.
2. In the address bar, type `about:debugging` and press **Enter**.
3. In the left sidebar, click **This Firefox**.
4. Under **Temporary Extensions**, click **Load Temporary Add-on...**.
5. Navigate to your project folder:
   ```
   c:\Job-Tracker\extension
   ```
6. Select the `manifest.json` file and click **Open**.
7. The **Job Orbit** extension icon 🪐 will now appear in your Firefox toolbar!

---

## 🌐 How to Install in Chrome / Edge / Brave

1. Open your browser and navigate to:
   * Chrome: `chrome://extensions`
   * Edge: `edge://extensions`
   * Brave: `brave://extensions`
2. Toggle on **Developer mode** in the top right corner.
3. Click **Load unpacked** (top left).
4. Select the `c:\Job-Tracker\extension` folder.
5. The extension is now installed! Pin it to your toolbar for quick access.

---

## 💡 How to Use

1. **Sign In (Zero Password Needed if Using Google OAuth!):**
   * If you log in to Job Orbit using **Google OAuth** (or don't have a password):
     * Simply keep your **Job Orbit website open in any browser tab** (e.g., `http://localhost:5173` or your live URL) while logged in.
     * Click the 🪐 Job Orbit icon in your Firefox/Chrome toolbar.
     * Click **"⚡ Auto-Connect from Job Orbit Tab"**.
     * The extension automatically detects your session from the tab and connects instantly!
   * *If you use standard email & password, you can also enter your credentials directly.*
   * The top-right badge will turn green: `● Connected`.

2. **Browse Job Sites (LinkedIn, Indeed, Greenhouse, etc.):**
   * Whenever you open a job posting, a discreet floating **"Track to Job Orbit"** pill appears at the bottom-right corner.
   * Click it to review the role/company and save directly with 1 click!

3. **Auto-Detect When You Apply:**
   * When you submit an application (or finish a LinkedIn Easy Apply), the extension detects the submission and automatically marks the job as **`Applied`** in your portal.
   * A confirmation toast will confirm: *"Application Detected & Saved! 🎉"*

4. **View & Edit in Job Orbit:**
   * Open your Job Orbit web dashboard (e.g. `http://localhost:5173` or your deployed portal).
   * The new job will appear right on your **Kanban board**, **Applications table**, and **Analytics**!
   * Click the job card anytime to edit notes, change rounds, add interview dates, or log LeetCode questions.

---

## 📁 File Structure

```
c:\Job-Tracker\extension\
├── manifest.json              # Universal Manifest V3 for Firefox & Chrome
├── icons\
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── lib\
│   └── firebase-rest.js       # Lightweight Firebase REST & Firestore sync client
├── background\
│   └── background.js          # Service worker coordinating events & database writes
├── content\
│   ├── content.js             # Universal job scraper & submit event listeners
│   └── content.css            # Scoped styles for on-page floating widget & toasts
└── popup\
    ├── popup.html             # Sleek extension popup interface
    ├── popup.css              # Styling matching Job Orbit dark glassmorphism
    └── popup.js               # Popup interactions & active tab query logic
```
