# CivicFix — Frontend

Web app for **CivicFix**, a civic issue reporting and management platform connecting citizens, municipal departments, field workers and administrators.

Backend: [CivicFix-Backend](https://github.com/noobdivya/CivicFix-Backend)

**Current status:** Feature 1 — Landing page (live dashboard, map, contact form).

## Tech stack
- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS v4 — dark (default) and light themes
- Leaflet + OpenStreetMap tiles (no API key)
- lucide-react icons; charts are hand-built SVG

## Getting started

Prerequisites: [Node.js](https://nodejs.org/) 20+ and the [CivicFix backend](https://github.com/noobdivya/CivicFix-Backend) running on port 8080.

```bash
cp .env.example .env.local    # Windows PowerShell: copy .env.example .env.local
npm install
npm run dev                   # http://localhost:3000
```

| Variable | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080` | Base URL of the CivicFix API |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Lint |

## Landing page

- **Header** — logo, navigation, live clock, system status (`/api/health`), theme toggle
- **Live dashboard** — KPI tiles, map with status layers & filters, resolution gauge, issues by category, hotspot areas, 14-day trend, recent reports, status distribution, activity feed (refreshes every 30 s)
- **Report an issue**, **login portals** (citizen / worker / admin), **messages from officials**, **about**, **contact form**

## Project structure

```
src/app/                    layout, page, global styles, favicon
src/components/command/     header + live dashboard panels
src/components/landing/     landing sections, map (map/)
src/lib/api.ts              all backend calls & types
src/lib/status.ts           issue status colours & labels
src/lib/theme.ts            light/dark theme hook
```
