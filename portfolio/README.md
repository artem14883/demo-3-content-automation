# Artem — 3D Creative Portfolio

A premium, single-page developer/designer portfolio inspired by modern 3D portfolio
sites (moncy.dev / nareshkhatri.site style): dark theme, violet→pink glow, oversized
grotesque typography, smooth scroll reveals, a custom cursor, and interactive WebGL.

## Highlights

- **Hero** — a morphing iridescent 3D blob (Three.js) reacting to the cursor.
- **Marquee** — infinite scrolling skills strip.
- **What I Do** — services + animated stats.
- **My Work** — horizontal, drag-to-scroll project carousel with gradient preview tiles.
- **My Tech Stack** — labelled spheres floating in zero gravity (soft physics).
- **Contact** — form + rotating wireframe globe.
- Custom cursor, preloader, film grain, scroll-reveal animations.
- Fully responsive + `prefers-reduced-motion` support.
- **Graceful degradation:** if the Three.js CDN is unreachable, the layout still looks complete.

## Tech

Plain **HTML + CSS + vanilla JS**, with **Three.js** loaded via an ES-module import map
(rendered in the visitor's browser). No build step required.

## Run locally

Because it uses ES modules, open it via a local server (not `file://`):

```bash
cd portfolio
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploy

It's a static site — no build step.

### GitHub Pages (automated)

A workflow at `.github/workflows/deploy-pages.yml` publishes the `portfolio/`
folder to GitHub Pages on every push to `main` (and the dev branch).

One-time setup: **Repo → Settings → Pages → Build and deployment → Source: GitHub Actions.**
After that, each push redeploys automatically. The live URL appears in the
workflow run summary and under Settings → Pages.

### Vercel / Netlify

- **Vercel**: import the repo, set **Root Directory = `portfolio`**, framework
  preset **Other**, no build command. Deploy.
- **Netlify**: set **Publish directory = `portfolio`**, no build command.

## Customize

- **Name, role, email** — edit the hero and nav in `index.html`.
- **Projects** — edit the `PROJECTS` array at the top of `js/main.js`.
- **Tech stack** — edit `TECH` in `js/main.js` and the `labels`/`colors` arrays in `js/three-scenes.js`.
- **Colors** — tweak the CSS variables in `css/style.css` (`:root`).
- **Contact form** — currently a front-end demo; wire it to a backend or a service
  like Formspree/Getform in `js/main.js`.

## Structure

```
portfolio/
├── index.html
├── css/style.css
├── js/
│   ├── main.js          # cursor, preloader, reveals, work cards, form
│   └── three-scenes.js  # hero blob, tech spheres, contact globe (WebGL)
└── README.md
```
