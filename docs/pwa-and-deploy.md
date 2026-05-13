# PWA & Deployment

How the app is installable, offline-capable, and shipped to Tencent Cloud EdgeOne. Pairs with [architecture.md](./architecture.md) for the underlying tooling.

## PWA Goals

- Installable on Android, iOS Safari (16+), Chromium desktop, Edge.
- Fully offline after first load — all UI, fonts, lesson content, and SFX precached.
- Updates are non-blocking: the new SW activates on next idle; a toast offers an immediate reload.
- Splash icon, theme color, and identity match the [design-system.md](./design-system.md).

## Web App Manifest

`public/manifest.webmanifest`:

```json
{
  "name": "打字星球",
  "short_name": "打字星球",
  "description": "K-12 学生的打字练习星球",
  "lang": "zh-CN",
  "start_url": "/?utm_source=pwa",
  "scope": "/",
  "display": "standalone",
  "orientation": "any",
  "background_color": "#0B0F1A",
  "theme_color": "#5B6CFF",
  "categories": ["education", "games"],
  "icons": [
    { "src": "/icons/icon-192.png",  "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png",  "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-mask.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "shortcuts": [
    {
      "name": "Continue last lesson",
      "url": "/?continue=1",
      "icons": [{ "src": "/icons/shortcut-continue.png", "sizes": "192x192" }]
    }
  ]
}
```

Icons:
- Source SVG at `src/assets/icon.svg`; `npm run icons:build` rasterizes to all sizes + maskable.
- Maskable icon honors the 80% safe zone.

## Service Worker (Workbox via `vite-plugin-pwa`)

`vite.config.ts` excerpt:

```ts
VitePWA({
  registerType: "prompt",       // do not auto-update silently
  injectRegister: "auto",
  manifest: false,              // we ship our own manifest.webmanifest
  workbox: {
    globPatterns: [
      "**/*.{js,css,html,svg,png,woff2,opus,json}"
    ],
    navigateFallback: "/index.html",
    runtimeCaching: [
      {
        urlPattern: /\/icons\/.*\.png$/,
        handler: "CacheFirst",
        options: { cacheName: "icons", expiration: { maxEntries: 32, maxAgeSeconds: 60 * 60 * 24 * 90 } }
      },
      {
        urlPattern: /\/fonts\/.*\.woff2$/,
        handler: "CacheFirst",
        options: { cacheName: "fonts", expiration: { maxEntries: 16, maxAgeSeconds: 60 * 60 * 24 * 365 } }
      },
      {
        urlPattern: /\/sfx\/.*\.opus$/,
        handler: "CacheFirst",
        options: { cacheName: "sfx", expiration: { maxEntries: 8 } }
      }
    ]
  }
});
```

### Update flow
- `registerType: "prompt"` — the new SW waits to activate.
- App calls `useRegisterSW` from `virtual:pwa-register/react`; on `onNeedRefresh`, shows a bottom toast ("New version ready — Reload"). Clicking Reload calls `updateSW(true)`.
- The toast does not auto-dismiss; the user must act or close it.

### Offline behavior
- All lesson content is bundled into the JS chunks and precached by Workbox.
- Fonts, icons, and SFX are precached on first load.
- If the user opens the app fully offline on first run, the SW is not yet installed — show a graceful inline error: "First load needs network. Reconnect and try again." This is the only network-required moment.

## Tencent Cloud EdgeOne Deployment

EdgeOne is used for static hosting + CDN. The build output `dist/` is uploaded as-is.

### Project configuration (one-time, in EdgeOne console)
- **Site**: bind your domain (e.g. `typing.example.com`).
- **Acceleration type**: General web acceleration.
- **Origin**: COS bucket (Tencent Cloud Object Storage) holding `dist/`, OR EdgeOne Pages source connection.
- **HTTPS**: Force HTTPS; HSTS enabled (max-age 31536000).
- **HTTP/3 (QUIC)**: enabled.
- **IPv6**: enabled.

### Cache rules
EdgeOne rules engine (order matters — first match wins):

| Match                                                | Browser Cache | Edge Cache | Notes                                |
| ---------------------------------------------------- | ------------- | ---------- | ------------------------------------ |
| `/assets/*` (Vite-hashed JS/CSS/fonts/images)        | 1 year        | 1 year     | `immutable`; hashed names.           |
| `/icons/*`, `/fonts/*`, `/sfx/*`                     | 1 year        | 1 year     | Stable filenames.                    |
| `/manifest.webmanifest`                              | 1 hour        | 1 hour     | Allow occasional updates.            |
| `/sw.js`, `/workbox-*.js`, `/registerSW.js`          | **no-cache**  | 5 min      | SW must update predictably.           |
| `/index.html` and `/` (SPA root)                     | **no-cache**  | 5 min      | New deploys take effect on next load. |
| Any 404 → fallback to `/index.html` (SPA)            | n/a           | n/a        | "Rewrite to /index.html" rule.        |

### Headers
Add via EdgeOne rules:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-site
```

CSP: defer to a follow-up; v1.0 ships without a strict CSP because Workbox-injected scripts and PWA install dialogs complicate it. Track in [roadmap.md](./roadmap.md).

### Compression
EdgeOne enables Brotli by default for text MIME types. Verify `Content-Encoding: br` is served for `.js` and `.css`.

## CI / Build pipeline

`.github/workflows/ci.yml`:

1. `npm ci`
2. `npm run lint && npm run typecheck`
3. `npm test -- --run`
4. `npm run build`
5. `npm run test:e2e` against `dist/` via `vite preview`
6. Artifact: upload `dist/` as `dist-${{ github.sha }}.zip`

Deploy step (separate workflow, manual approval on `main`):

- Auth to Tencent Cloud via `TENCENT_SECRET_ID` / `TENCENT_SECRET_KEY` (GitHub Action secrets).
- Sync `dist/` to COS bucket via the `tencentcloud/cos-action` action.
- Trigger EdgeOne cache purge for `/`, `/index.html`, `/manifest.webmanifest`, `/sw.js`.
- Smoke test: `curl -fI https://typing.example.com/` returns 200 and `cache-control: no-cache`.

Rollbacks: keep the last 5 builds in COS under `releases/<sha>/`. To roll back, repoint the EdgeOne origin folder to a prior release SHA via console.

## Local Preview of Built Bundle

```
npm run build && npm run preview
```

`vite preview` serves `dist/` on `:4173` with SPA-fallback. Use this to verify the SW registers and updates correctly.

## Lighthouse Targets

Run on the production preview, mobile profile. Target scores:
- Performance ≥ 90
- Accessibility = 100
- Best Practices ≥ 95
- SEO ≥ 90 (not a primary metric, but easy wins)
- PWA: installable + offline ✔

The `npm run lighthouse` script (uses `lighthouse-ci`) gates these in CI on `main` only.

## Domains and Environments

| Env       | URL                                | Source           |
| --------- | ---------------------------------- | ---------------- |
| Local     | `http://localhost:5173`            | `npm run dev`     |
| Preview   | `http://localhost:4173`            | `npm run preview` |
| Staging   | `https://stg.typing.example.com`   | `develop` branch |
| Prod      | `https://typing.example.com`       | `main` tag       |

Final domain TBD by the operator; this doc lists the convention.
