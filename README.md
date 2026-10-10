# 🎙️ Wispr Flow Studio

> **Voice-First Developer Command Center & Workflow Studio**  
> Built for the **Wispr Flow Shortlisting Task** — 100% voice-driven development backed by **Turso LibSQL (SQLite)** and deployed to **Vercel**.

[![Wispr Flow Referral](https://img.shields.io/badge/Wispr_Flow-Referral_Verified-8b5cf6?style=for-the-badge&logo=microphone)](https://ref.wisprflow.ai/hhg)
[![Database](https://img.shields.io/badge/Database-Turso_%2F_SQLite-06b6d4?style=for-the-badge&logo=sqlite)](https://turso.tech)
[![Deployment](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![Next.js](https://img.shields.io/badge/Framework-Next.js_14-white?style=for-the-badge&logo=next.js)](https://nextjs.org)

---

## ⚡ Task Overview & Mandatory Referral

This project was built for the **Wispr Flow Shortlisting Task** (Hackathon Submission).

* **Mandatory Wispr Referral Link:** [https://ref.wisprflow.ai/hhg](https://ref.wisprflow.ai/hhg) *(Required for participation)*
* **Objective:** Demonstrate how effectively voice-driven development can turn spoken thoughts into working, production-ready software without manual keyboard coding.
* **Submission Form:** [https://forms.gle/Lv9wF8gYVHdEqfJW8](https://forms.gle/Lv9wF8gYVHdEqfJW8)
* **GitHub Repository:** [https://github.com/dubeysanskar/flow](https://github.com/dubeysanskar/flow)
* **Submission Deadline:** October 10, 2026, 11:59 PM

---

## ✨ Features

### 1. 🎤 Hands-Free Voice Dictation & Command Terminal
* Integrated real-time Web Speech recognition and Wispr Flow voice simulation.
* Canvas Web Audio API oscilloscope with dynamic waveform and reactive frequency bars.
* Natural language intent parsing: automatically classifies dictation into TSX React Components, Sprint Tasks, REST API Routes, or Teleprompter Prompts.

### 2. ⚡ ⌘K Command Palette
* Instant fuzzy search and keyboard shortcut navigation (`⌘K` or `Ctrl+K`).
* Trigger voice synthesis presets, navigate database tools, switch views, and export project state.

### 3. 🔥 52-Week Voice Activity Heatmap & Streaks
* GitHub-style annual contribution matrix with 5 activity intensity tiers.
* Real-time calculation of active voice streaks, words spoken per day, and audio recording seconds.

### 4. 🗄️ Turso LibSQL & SQLite Dual Engine
* Powered by `@libsql/client` — works seamlessly across both:
  * **Local Development:** Zero-setup local SQLite file (`file:wispr_flow.db`).
  * **Production (Vercel):** Remote Turso Cloud Database (`libsql://...`).
* Auto-migrating tables:
  * `flows`: Persists synthesized UI components, tasks, code snippets, and prompts.
  * `voice_sessions`: Logs spoken transcripts, word counts, and voice development seconds.
  * `hackathon_metrics`: Real-time audit metrics proving voice-driven development.

### 5. 💾 Export Center (JSON, TypeScript, Markdown)
* Client-side and server-side export pipeline (`/api/export`).
* Download complete SQLite flow archives as structured JSON bundles, TypeScript barrel modules with interfaces, or readable Markdown audit reports.

### 6. 🎉 Confetti Celebrations & Toast Notifications
* Dependency-free multi-shape canvas confetti burst system on voice synthesis success.
* Animated status toasts for database mutations, star toggles, and voice events.

### 7. 🎬 Interactive Demo Video Recording Teleprompter
* Built-in teleprompter modal with adjustable scrolling speed and pause/reset controls.
* Curated step-by-step spoken script guide specifically tailored for recording the required demo video submission with Wispr Flow.

### 8. 🚀 Vercel Ready (`vercel.json`)
* Native `vercel.json` included with serverless function timeouts, custom CORS headers, and edge multi-region deployment.

---

## 🛠️ Tech Stack

* **Frontend:** Next.js 14 App Router, React 18, TypeScript, Tailwind CSS
* **Database:** SQLite & Turso LibSQL (`@libsql/client`)
* **Audio & Speech:** Web Speech API, SVG animated frequency waves
* **Icons:** Lucide React
* **Deployment:** Vercel (`vercel.json`)

---

## 🚀 Getting Started

### 1. Clone the repository
\`\`\`bash
git clone https://github.com/dubeysanskar/flow.git
cd flow
\`\`\`

### 2. Install dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Configure Environment Variables (Optional)
Copy `.env.example` to `.env.local`:
\`\`\`bash
cp .env.example .env.local
\`\`\`

* For local development, **no configuration is required!** The app automatically uses local embedded SQLite (`file:wispr_flow.db`).
* For Turso cloud database:
\`\`\`env
TURSO_DATABASE_URL="libsql://your-database.turso.io"
TURSO_AUTH_TOKEN="your-turso-auth-token"
\`\`\`

### 4. Run Development Server
\`\`\`bash
npm run dev
\`\`\`
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Deploy to Vercel

1. Push to your GitHub repository:
\`\`\`bash
git push origin main
\`\`\`

2. Import repository in [Vercel](https://vercel.com).
3. If using Turso, add environment variables in Vercel project settings:
   * `TURSO_DATABASE_URL`
   * `TURSO_AUTH_TOKEN`
4. Deploy! `vercel.json` is automatically detected.

---

## 📋 Hackathon Submission Checklist

- [x] Wispr Flow account created using referral link: `https://ref.wisprflow.ai/hhg`
- [x] Project built entirely using voice-driven development
- [x] SQLite & Turso LibSQL database integration
- [x] `vercel.json` included for Vercel deployment
- [x] GitHub repository created and pushed: `https://github.com/dubeysanskar/flow`
- [x] Demo video recording teleprompter included
- [x] Submitted via Google Form: `https://forms.gle/Lv9wF8gYVHdEqfJW8`

---

## 👤 Author

* **Sanskar Dubey** — [GitHub](https://github.com/dubeysanskar)
