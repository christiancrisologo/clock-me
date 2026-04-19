# Clock-Me

<div align="center">
  <p><em>A developer-focused productivity tracker for tasks, sprints, and execution analytics.</em></p>
</div>

---

## Overview

Clock-Me helps software teams and individual developers track execution time, compare estimates versus actual effort, and understand sprint throughput with actionable analytics.

It supports local-first usage and optional Supabase sync for multi-device resilience.

## What Is New

- Supabase schema now uses `cm_` prefixes for table names:
  - `cm_tasks`
  - `cm_sprints`
  - `cm_analytics_snapshots`
- Column names remain clean and readable (`id`, `updated_at`, `snapshot_id`, etc.).
- Sync now persists derived analytics snapshots in addition to tasks and sprints.
- Manual synchronization options were expanded:
  - **Sync Now** merges local and remote data by latest `updatedAt`.
  - **Force Backup** pushes local as source of truth and removes remote-only rows.
- Header quick-save action triggers a forced cloud backup for one-click protection.
- Productivity analytics include period-based snapshots (`day`, `week`, `month`) and top-performing task highlights.

## Core Features

- Dual task classification:
  - **regular** for straightforward items.
  - **sprintly** for phase-based work (In progress, Code Review, Testing).
- Sprint analytics dashboard:
  - Sprint completion metrics.
  - Efficiency calculations.
  - Development vs waiting-time visualization.
- Productivity trends:
  - Daily, weekly, and monthly groupings.
  - Historical chart data generated from task history.
- Cloud sync with conflict handling:
  - Merge strategy based on the latest `updatedAt`.
  - Safe offline fallback when Supabase is unavailable.
- Data portability:
  - CSV export of tracked tasks.
  - CSV import with duplicate filtering.

## Sync Behavior

- Auto-sync can be toggled in Settings.
- Connection checks are performed periodically when configured.
- `Sync Now`:
  - Pulls remote records.
  - Merges by latest `updatedAt`.
  - Pushes merged result back to Supabase.
- `Force Backup`:
  - Treats local state as canonical.
  - Deletes remote-only task and sprint records.
  - Upserts local tasks, sprints, and analytics snapshots.

## Tech Stack

- React 19 + Vite
- TypeScript
- Supabase JavaScript client
- Recharts for visualizations
- date-fns for temporal grouping and formatting
- Lucide React for icons

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

- Copy `.env.example` to `.env.local`.
- Set:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

3. Apply database migration:

- Migration file:
  - `supabase/migrations/20260419000100_create_clock_me_schema.sql`

- With Supabase CLI:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

4. Start development server:

```bash
npm run dev
```

5. Optional type-check:

```bash
npm run lint
```

## Database Tables

The migration creates these public tables:

- `cm_tasks`
- `cm_sprints`
- `cm_analytics_snapshots`

Each table is created with row-level security enabled and permissive anon/authenticated policies intended for app-level prototyping workflows.

---

<div align="center">
  Built by <strong>Christian Crisologo</strong>.
</div>
