# Economy Picture Dashboard

PowerBI-like financial dashboard for Solo Flows business planning.

## Stack

- **Frontend**: Vite 7 + React 19 + TypeScript 5.9 + Tailwind CSS v4 + Recharts 3
- **Data**: Static TypeScript data layer (`src/data/static-data.ts`) — no network calls
- **Backend (dormant)**: PHP 8.2 REST API (cPanel native) + MySQL 5.7
- **Hosting**: cPanel shared hosting on anhcu.art

## Current Architecture

The dashboard runs entirely on **static data** bundled into the frontend build. The PHP API and MySQL database exist but are bypassed due to a Recharts crash caused by MySQL DECIMAL columns returning strings. See `src/data/static-data.ts` header comment for the fix needed before re-enabling the live API.

All CRUD operations (create/update/delete in Data Entry, editable cells in CashFlow) modify React state only — changes are **not persisted** across page reloads.

## Setup

```bash
npm install
npm run dev
```

## Deploy to cPanel

1. `npm run build` — produces `dist/`
2. `git add . && git commit -m "..." && git push origin main`
3. Trigger cPanel pull via UAPI:
   ```bash
   curl -s -H "Authorization: cpanel {user}:{token}" \
     "https://s1001.genhosting.vn:2083/execute/VersionControl/update?repository_root=%2Fhome%2F{user}%2Fanhcu.art&branch=main"
   ```

## Design System

- **Sidebar**: Dark gradient background with branded icon badges and active dot indicators
- **KPI Cards**: Colored accent top borders, hover lift animations, gradient icon backgrounds
- **Charts**: Recharts with custom tooltips, responsive containers, error boundaries
- **Animations**: Staggered card entrance (fade-in-up), page transitions
- **Theme**: Light/dark mode with full token system, Inter + JetBrains Mono fonts
- **Colors**: Blue primary, lime accent, semantic success/warning/destructive

## Pages

| Route | Page | Key Features |
|-------|------|-------------|
| `/` | Overview | Snapshot bar, 4 KPI cards, bar/line/pie/gauge charts |
| `/cashflow` | CashFlow | Editable ledger table, budget vs actual, running balance |
| `/revenue` | Revenue | Channel breakdown, monthly trend, revenue mix pie |
| `/expenses` | Expenses | Top expenses list, COGS vs OpEx, expense trend |
| `/kpi` | KPI Dashboard | Health score ring, status cards with progress bars |
| `/data-entry` | Data Entry | Tabbed forms for accounts, ledger, KPIs |
| `/settings` | Settings | Data sources, period management, export |
