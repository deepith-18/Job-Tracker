# 💼 JobTracker

[![Vite](https://img.shields.io/badge/Vite-8.2.0-blueviolet.svg?style=flat-square&logo=vite)](https://vite.dev/)
[![React](https://img.shields.io/badge/React-19.0-blue.svg?style=flat-square&logo=react)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC.svg?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-12.0-FFCA28.svg?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![Zustand](https://img.shields.io/badge/Zustand-5.0-orange.svg?style=flat-square)](https://github.com/pmndrs/zustand)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

JobTracker is a modern, high-performance web application designed to help job seekers organize their job search, manage application statuses, track targets, analyze data insights, and prepare for interviews. Built with **React 19**, **Vite**, **TypeScript**, **Zustand**, and **Firebase**, it features a fully-responsive layout, rich dashboards, and state-of-the-art interactive modules.

---

## 📖 Table of Contents

1. [Features](#-features)
2. [Tech Stack](#%EF%B8%8F-tech-stack)
3. [Project Structure](#-project-structure)
4. [Getting Started](#-getting-started)
   - [Prerequisites](#prerequisites)
   - [Installation](#installation)
   - [Environment Variables](#environment-variables)
   - [Running Locally](#running-locally)
   - [Building for Production](#building-for-production)
5. [Core Architecture & State](#%EF%B8%8F-core-architecture--state)
6. [Deployment](#🚀-deployment)
7. [License](#📄-license)

---

## ✨ Features

JobTracker is packed with modules designed for end-to-end career management:

*   **5 Primary Sections**:
    *   📊 **Dashboard**: High-level overview of application statuses, upcoming tasks, and key search statistics.
    *   📂 **Applications Tracker**: Kanban board and list view of all active/past job applications with drag-and-drop mechanics (`@hello-pangea/dnd`).
    *   📝 **Work Journal & Prep**: Document interview preparation, mock sessions, mindset tracking, and email templates.
    *   💡 **Insights & Analytics**: Real-time analytics, skills radar charts, tech trends, and goal tracking using `recharts`.
    *   ⚙️ **Settings**: Manage profile information, theme preferences, and credentials.

*   **Premium Tools & Interactive Utilities**:
    *   🤖 **ATS Optimizer**: Align resumes and cover letters with keyword matching profiles.
    *   📈 **Salary & Offer Tools**: Compute packages, compare multiple offers dynamically with a comparison matrix, and run negotiation scripts.
    *   🤝 **Referral CRM**: Keep track of alumni networks, professional contacts, and follow-ups.
    *   🗺️ **Career Roadmap**: Set career directions, target skills, and trace roadmap milestones.
    *   🏢 **Company Intel**: Collect repository logs, research notes, and tech stacks of target companies.

---

## 🛠️ Tech Stack

*   **Frontend Library**: [React 19](https://react.dev/)
*   **Build Tool**: [Vite](https://vite.dev/)
*   **State Management**: [Zustand](https://github.com/pmndrs/zustand) (Simple, fast, and scalable atomic state store)
*   **Routing**: [React Router DOM v7](https://reactrouter.com/)
*   **Styling**: [TailwindCSS v4](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/) (Smooth transitions and animations)
*   **Database & Auth**: [Firebase v12](https://firebase.google.com/) (Firestore & Firebase Authentication)
*   **Visualizations**: [Recharts](https://recharts.org/) (Interactive analytics and radar charts)
*   **Icons**: [Lucide React](https://lucide.dev/)

---

## 📁 Project Structure

```text
JobTracker/
├── public/                 # Static public assets (icons, logos)
├── src/
│   ├── assets/             # Images, SVGs, and graphics
│   ├── components/         # Reusable UI elements and layout containers
│   │   ├── analytics/      # Analytics and insights components
│   │   ├── applications/   # Application forms, cards, and list views
│   │   ├── dashboard/      # Kanban boards, quick action bars, empty states
│   │   ├── layout/         # AppShell, ProtectedRoutes, MobileCommandHub
│   │   └── ui/             # Drawer, Button, Modal, Badge, Loading spinner, ConfirmDialog
│   ├── firebase/           # Firebase initialization, authentication, and Firestore handlers
│   ├── hooks/              # Custom React hooks (useAuth, useApplications)
│   ├── pages/              # High-level route pages (Dashboard, AtsOptimizer, SalaryNegotiation, etc.)
│   ├── store/              # Zustand global state stores (authStore, applicationStore)
│   ├── types/              # Shared TypeScript interfaces & types
│   ├── App.tsx             # Application router & base component
│   ├── index.css           # Global CSS and Tailwind CSS configuration
│   └── main.tsx            # Application entrypoint
├── .env.example            # Reference file for environment variables
├── package.json            # Node.js dependencies and run scripts
├── tailwind.config.js      # Custom utility classes and themes config
└── tsconfig.json           # TypeScript configuration
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
*   [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
*   [npm](https://www.npmjs.com/) (or yarn / pnpm)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/deepith-18/Job-Tracker.git
    cd Job-Tracker
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### Environment Variables

Create a `.env` file in the root directory based on the `.env.example` file and fill in your Firebase credentials:

```ini
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Running Locally

To start the Vite development server locally:

```bash
npm run dev
```

The application will run by default on `http://localhost:5173`. Open your browser to explore the dashboard!

### Building for Production

To build a minified production bundle:

```bash
npm run build
```

This compiles your TypeScript code and exports the production-ready assets to the `/dist` directory. You can preview the build using `npm run preview`.

---

## ⚡ Core Architecture & State

*   **Zustand Stores**:
    *   [`authStore.ts`](file:///c:/JobTracker/src/store/authStore.ts): Manages active user authentication sessions, loading indicators, and user metadata synchronization with Firebase Auth.
    *   [`applicationStore.ts`](file:///c:/JobTracker/src/store/applicationStore.ts): Orchestrates local caches of job applications, state modifications, search queries, and real-time syncing of changes back to Cloud Firestore.
*   **Authentication Gateway**:
    *   Protected routes are wrapped with [`ProtectedRoute.tsx`](file:///c:/JobTracker/src/components/layout/ProtectedRoute.tsx), preventing unauthorized access and automatically redirecting guests to the login/registration gateway.

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.
