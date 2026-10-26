# JM Kelley Inc. — website

Marketing site for JM Kelley Inc., a Newport Beach general contractor that self-performs its
structural concrete and framing. Replaces the GoDaddy Website Builder site at jmkelleyinc.com.

## Local setup

Requirements: Node.js 20.9+ (22 LTS recommended) and npm. All commands work in PowerShell.

```powershell
npm install
npm run dev        # http://localhost:3000
```

No environment variables are required. Without them the site reads `src/content/fallback/*.json`
and logs form submissions to the terminal.

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / serve it |
| `npm run lint` | ESLint |
| `npm run typecheck` | Generate route types, then `tsc --noEmit` |
| `npm run format` | Prettier (with Tailwind class sorting) |
| `npm run check` | lint + typecheck + build |
