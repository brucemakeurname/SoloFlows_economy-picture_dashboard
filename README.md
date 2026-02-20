# Economy Picture Dashboard

PowerBI-like financial dashboard for Solo Flows business planning.

## Stack

- **Frontend**: Vite + React + TypeScript + Tailwind CSS v4 + Recharts
- **Backend**: PHP REST API (cPanel native)
- **Database**: MySQL

## Setup

```bash
npm install
npm run dev
```

## Deploy to cPanel

1. `npm run build` — produces `dist/`
2. Upload `dist/*` to `public_html/`
3. Upload `api/*` to `public_html/api/`
4. Import `database/schema.sql` + `database/seed.sql` via phpMyAdmin
5. Update `api/config.php` with MySQL credentials
