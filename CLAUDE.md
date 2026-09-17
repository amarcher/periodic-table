# CLAUDE.md

## Project Overview

Interactive periodic table web app for general science education (students, teachers, curious people of any age). Vite + React + TypeScript + Framer Motion. Dark theme with glass-morphism design.

## Commands

- `npm run dev` — start dev server
- `npm run build` — generates sitemap, type-checks, builds for production
- `npm run preview` — preview production build
- `npm test` — run vitest suite once
- `npm run test:watch` — watch mode
- `npx tsc --noEmit` — type check without emitting
- `npm run generate:sitemap` — regenerate `public/sitemap.xml` from `src/data/elements.ts` (also runs as part of `build`)
- `vercel dev --listen 3000` — exercise the serverless OG function locally (see Routing below)

## Architecture

- **Routing**: `react-router-dom` v7 data router. Two routes, both rendering `<App/>`: `/` (homepage) and `/element/:symbol` (detail view). Selection is derived from `useParams().symbol` via `getElementBySymbol`; there is no `useState<Element | null>` anymore. Unknown symbols redirect to `/`.
- **Animation**: `document.startViewTransition({ update, types })` with an async `update` callback that awaits `navigate(path, { flushSync: true })`. **Do not** wrap `navigate()` in `flushSync` from `react-dom` — RRv7's data router wraps its internal `setState` in `React.startTransition`, which `flushSync` cannot pierce, so the detail wouldn't unmount before the NEW-snapshot capture and the close morph would silently no-op. Passing `{ flushSync: true }` to RRv7's `navigate` routes through `ReactDOM.flushSync` inside the router. Typed clip-path keyframes live in `ElementDetail.css` keyed on `:active-view-transition-type(detail-open|detail-close)`. Clicks/voice/close go through the transition; browser back/forward bypasses it by design.
- **Layout**: CSS Grid with 18 columns, 10 rows. Each element has explicit `gridRow`/`gridColumn` in the data (no empty placeholder divs). Rows 9–10 are lanthanides/actinides.
- **Data**: All 118 elements are in `src/data/elements.ts` as a static TypeScript array. No API calls. Use `getElementBySymbol(symbol)` (case-insensitive) for lookups.
- **Video thumbnails**: Each video has a sibling `.jpg` poster generated from a 1.5s frame via `scripts/r2-upload/thumbnails.ts`. `videoManifest.ts` builds URLs from `videoData.ts` + `VITE_VIDEO_CDN_URL`.
- **Mobile detail layout (≤899px)**: The media zone is a full-viewport (`100svh`) hero — the 16:9 video letterboxed via `object-fit: contain` over a blurred poster backdrop, so nothing is cropped. Where scroll-driven animations are supported, the hero is `position: sticky` and shrinks to a pinned 16:9 mini-player driven by a named `scroll-timeline: --detail-scroll` on `.detail__layout`. Three coupled gotchas, all in `ElementDetail.css`: (1) the scroller needs `overflow-anchor: none` or scroll anchoring cancels every scroll by the shrink amount, pinning `scrollTop` at 0; (2) the shrinking flow height would let content race up at 2× and hide under the hero, so `hero-spacer-grow` inflates `.detail__top-row`'s top margin at the same rate; (3) the timeline is *named* because the media zone's `overflow: hidden` makes it a scroll container that would capture an anonymous `scroll(nearest)` from descendants. Fallback (no support, or reduced motion) is a static full-viewport hero that scrolls away. Use `svh` (not `dvh`) in hero math so the stage doesn't resize when the browser toolbar collapses.
- **Styling**: Vanilla CSS with `color-mix()` for category-colored translucent backgrounds. Google Fonts loaded via CSS `@import`.

## Key Files

- `src/data/elements.ts` — largest file (~2800 lines), all element data. Accuracy is critical — verify changes against authoritative sources.
- `src/types/element.ts` — `Element` interface and `ElementCategory` union type
- `src/utils/colors.ts` — category-to-color mapping (10 categories)
- `src/components/ElementDetail.tsx` — the detail overlay with staggered animations and orbital ring decorations

## Voice Agent (ElevenLabs)

- **Hook**: `src/hooks/useElementConversation.ts` — manages the ElevenLabs voice session, sends contextual updates on element clicks/closes, and registers client tools. Sessions use `connectionType: 'webrtc'` (not `'websocket'`): WebRTC's acoustic echo cancellation stops the agent from hearing its own voice through the device speaker, which on phones/tablets made it interrupt itself. Don't switch back to websocket without a real-device speaker test.
- **Client tools**: `navigate_to_element` and `go_back_to_table` are registered via `useConversation({ clientTools })` so the voice agent can control the UI
- **Agent config**: `agent_configs/Chemical-Element-Periodic-Table-Guide.json` — the agent's prompt, voice, and tool settings (managed via `@elevenlabs/cli`)
- **Tool configs**: `tool_configs/` — JSON schemas for client tools, also managed via CLI
- **ID mapping**: `agents.json` and `tools.json` are gitignored (contain agent IDs that grant conversation access). After a fresh clone, run `elevenlabs agents pull` and `elevenlabs tools pull` to regenerate them
- **Skill**: `/11labs-push` pushes config changes to ElevenLabs (dry-run first, then push)
- **Contract with routing**: the tool JSON schemas are URL-agnostic — `navigate_to_element({name})` takes an element name or symbol; the hook resolves it to an `Element` and calls `onNavigate(element)`. `App.tsx` turns that into `navigate(/element/${element.symbol})`. **Do not push the voice agent configs unless you also update the tool schemas.** `notifyElementChange` is fired from a `useEffect` keyed on the URL param, so the voice agent stays in sync regardless of whether the user clicked, spoke, pasted a URL, or hit the browser back button.

## Deep-Linkable Element URLs & OG Tags

- **Route shape**: `/element/:symbol` is deep-linkable, and every element gets a **prerendered HTML file at build time**. Crawlers and browsers receive the same document — there is no user-agent sniffing and no serverless OG function. Both were removed (the `has: user-agent` rewrite in #40, the now-deleted `api/element-og.ts` in #49); if you go looking for either, they are gone.
- **Where it is generated**: the `staticPages` Vite plugin in `scripts/static-pages.ts`, wired up in `vite.config.ts`, runs on `closeBundle` and writes `dist/element/<Symbol>.html` plus a lowercase alias directory for each element, then `dist/index.html`, `dist/sitemap.xml` and `dist/404.html`. Titles, descriptions, OG/Twitter tags and JSON-LD all come from `pageMetadata` in `src/utils/seo.ts` — that is the single place to change any page metadata.
- **OG images are video posters**: all 118 elements have a video, so every element page's `og:image` is its R2 poster JPG and `og:video` is the MP4. `pageMetadata` still falls back to `/og-image.png` if a `VIDEO_DATA` entry is ever missing.
- **Env var**: `vite.config.ts` passes **`VITE_VIDEO_CDN_URL`** to the plugin — note the `VITE_` prefix; it is read at build time via `loadEnv`, not at request time. Production is `https://videos.periodictable.tech` (a custom domain over the R2 bucket), and a default R2 URL is baked in if unset. ⚠ **Changing this value requires a rebuild**, because it is baked into the prerendered HTML. `pageMetadata` trims it and strips trailing slashes: a trailing newline in this value once emitted every `og:image`/`og:video` URL broken across two lines, which crawlers reject silently, so previews were imageless sitewide. `scripts/static-pages.test.ts` guards that case.
- **Sitemap**: `scripts/generate-sitemap.mjs` writes `public/sitemap.xml` with 119 entries (homepage + 118 elements) via `npm run generate:sitemap`, and the `staticPages` plugin writes the same list to `dist/sitemap.xml` at the end of the build. Both run as part of `npm run build`. After deploy, resubmit `https://periodictable.tech/sitemap.xml` in Google Search Console.
- **IndexNow (Bing)**: Bing sends more search visitors than Google here. After a production deploy that changes page content or metadata, run `npm run indexnow` (all sitemap URLs) or `npm run indexnow -- /element/Au` (specific paths). The key lives in `public/<32-hex>.txt` and must be live before pinging; the script checks. Google ignores IndexNow.
- **Thumbnails**: all 118 elements have videos. Run `npx tsx scripts/r2-upload/thumbnails.ts --all` with R2 creds in `.env` to generate poster JPGs locally and upload them to R2 alongside the MP4s. The R2 scripts read `process.env` and there is no dotenv in this project, so sourcing `.env` into the shell can trip the sandbox — wrap the command in a small node runner that reads `.env` itself and spawns with that env.
## Accessibility

- `ElementDetail` is a focus-trapped `role="dialog"` modal — close button is auto-focused on mount, Tab cycles within
- Escape closes the detail view; focus returns to the originating grid cell
- The close transition uses the originating cell's rect for the clip-path animation in both directions

## Conventions

- CSS uses `color-mix(in srgb, ...)` for translucent category colors (no `hsl(from ...)` relative color syntax)
- Category colors are passed as `--cat-color` CSS custom property via inline styles
- Component CSS files are co-located with their `.tsx` files
- BEM-like class naming: `.component__element--modifier`
