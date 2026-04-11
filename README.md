# Clock-Me 🕒

<div align="center">
  <p><em>The ultimate productivity and time-tracking companion for modern software developers.</em></p>
</div>

---

## 🚀 Overview

**Clock-Me** is high-performance web application designed specifically for developers to measure task efficiency, track internal development phases, and visualize sprint velocity. Built with a focus on rich aesthetics and micro-interactions, it transforms mundane time tracking into a data-driven experience.

## ✨ Key Features

- **🎯 Dual Task Modes**:
  - **Regular Tasks**: Fast, one-click tracking for standalone items.
  - **Sprintly Tasks**: Sophisticated tracking across multiple phases (Development, Code Review, Testing) to measure waiting impact.
- **📊 Advanced Analytics**:
  - **Sprint Velocity**: Track delivered points and total active time.
  - **Efficiency Ratios**: Compare actual vs. estimated hours with real-time feedback.
  - **Time Distribution**: Visualize exactly where your time is going across your sprint commits.
- **📈 Productivity Trends**: Analyze your performance over days, weeks, or months with historical trend visualizations.
- **☁️ Cloud Sync & Offline Mode**: Seamless background synchronization with **Supabase**, with a dedicated "Offline Mode" indicator when connection is lost.
- **📥 Data Export**: Download your entire task history and performance data as high-fidelity CSV files for independent reporting.

## 🛠️ How to Use

### 1. Managing Tasks
- **Creation**: Click the `+ New Task` button in the header. Choose **Regular** for quick items or **Sprintly** for complex features that require review and testing phases.
- **Tracking**: Use the `Play/Pause` buttons on each task card. For Sprintly tasks, the app automatically tracks time in the "In Progress" phase by default.
- **Manual Adjustments**: Switch task statuses via the dropdown menu to manually log time into "Code Review" or "Testing" phases.

### 2. Measuring Efficiency
- **Overview**: Use the **Performance Metrics** bar at the top of the Tasks view to see your total time spent and overall dev efficiency.
- **Deep Dive**: Use the **Sprint Analytics** tab to see a breakdown of time spent per task, including "Wait Time" (time spent in Review/Testing) vs. "Dev Time".

### 3. Sync & Backup
- Configure your Supabase credentials in the **Settings** view to enable cloud backup.
- Use the **Manual Sync** or **Force Backup** options to reconcile data between different devices.

## 💻 Tech Stack

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Backend**: [Supabase](https://supabase.com/)
- **Styling**: Vanilla CSS (Custom tokens)
- **Utilities**: [Date-fns](https://date-fns.org/), [Clsx](https://github.com/lukeed/clsx)

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
  Built with ❤️ for the developer community.
</div>
