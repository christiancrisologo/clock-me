# Clock-Me 🕒

<div align="center">
  <p><em>The ultimate productivity and time-tracking companion for modern software developers.</em></p>
</div>

---

## 🚀 Overview

**Clock-Me** is a high-performance web application designed specifically for developers to measure task efficiency, track internal development phases, and visualize sprint velocity. Built with a focus on rich aesthetics and micro-interactions, it transforms mundane time tracking into a data-driven experience.

## ✨ Key Features

- **🎯 Dual Task Modes**:
  - **Regular Tasks**: Fast, one-click tracking for standalone items.
  - **Sprintly Tasks**: Sophisticated tracking across multiple phases (Development, Code Review, Testing) to measure waiting impact.
- **📊 Advanced Analytics Dashboard**:
  - **Real-time Velocity**: Track delivered points and total active time.
  - **Efficiency Ratios**: Compare actual vs. estimated hours with live feedback.
  - **Time Distribution Chart**: Visualize exactly where your time is going (Dev vs. Wait time).
  - **Manual Sync**: Instant "Sync Now" button to reconcile data across devices.
- **📈 Productivity Trends**: Analyze performance over days, weeks, or months with historical trend visualizations.
- **☁️ Cloud Sync & Data Resilience**:
  - **Supabase Integration**: Seamless background synchronization.
  - **Manual Save/Sync**: Dedicated toolbar button for forced backups.
  - **Conflict Resolution**: Smart merging using `updatedAt` timestamps.
- **📂 Data Portability**:
  - **Export to CSV**: Download your entire history for external reporting.
  - **Import from CSV**: Bulk-generate tasks from external files with built-in duplicate filtering (based on JIRA ID or Title).

## 🛠️ How to Use

### 1. Managing Tasks
- **Creation**: Click `+ New Task` in the header. Use **Regular** for quick items or **Sprintly** for features requiring review/testing phases.
- **Tracking**: Use the `Play/Pause` buttons. Sprintly tasks automatically log time into the "In Progress" phase by default.
- **Bulk Operation**: Use the **Import from CSV** feature in Settings to upload multiple tasks at once. The app will automatically assign new UUIDs and skip duplicates.

### 2. Measuring Efficiency
- **Performance Metrics**: View total time and dev efficiency at the top of the Tasks view.
- **Analytics Deep Dive**: Use the **Sprint Analytics** tab for visual distributions of "Wait Time" vs. "Dev Time".

### 3. Synchronization
- **Auto-Sync**: Background sync happens whenever you resume a timer or modify a task.
- **Manual Control**: Use **Sync Now** (merge) or **Force Backup** (overwrite remote) in the Settings view.
- **Quick Save**: Use the diskette icon in the header toolbar for an instant cloud push.

## 💻 Tech Stack

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Backend**: [Supabase](https://supabase.com/)
- **Styling**: Vanilla CSS (Custom design system)
- **State Management**: Custom unified state hooks with `localStorage` persistence.

## 🏗️ Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Environment Setup**:
   Copy `.env.example` to `.env.local` and add your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. **Run Locally**:
   ```bash
   npm run dev
   ```

---

<div align="center">
  Built with ❤️ by <strong>Christian Crisologo</strong> for the developer community.
</div>
