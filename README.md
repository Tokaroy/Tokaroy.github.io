# InfoSec Sources Hub (GitHub Pages Ready)

This is a React + Vite site for publishing your **official** bibliography/sources list for an infosec paper, with an optional **private draft** mode for edits.

## How the data works

### Official sources (public)
- Stored in: `public/sources.json`
- The site loads this file and shows it to everyone.

### Draft edits (private)
- Stored in your browser using `localStorage`
- You can add/edit/delete sources in Draft mode without changing the public list.
- When you’re ready to publish, export a new `sources.json` and commit it to the repo.

## Run locally
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## Deploy to GitHub Pages (recommended: GitHub Actions)

This repo includes a workflow at `.github/workflows/deploy.yml`.

1) Push to GitHub
2) In GitHub: **Settings → Pages**
3) Under **Build and deployment**, set **Source** to **GitHub Actions**
4) Push any commit to `main` — it will build and deploy automatically

Your site URL will look like:
`https://YOUR_USERNAME.github.io/YOUR_REPO/`

## Publish updates to the public sources list

1) Open your site → switch to **Draft**
2) Make edits
3) Click **Export sources.json**
4) In GitHub, replace `public/sources.json` with the exported file and **Commit**
5) GitHub Pages redeploys automatically and everyone sees the update
