# CLAUDE.md

## Project Overview

Interactive periodic table web app for kids. Vite + React + TypeScript + Framer Motion. Dark theme with glass-morphism design.

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
- **Styling**: Vanilla CSS with `color-mix()` for category-colored translucent backgrounds. Google Fonts loaded via CSS `@import`.

## Key Files

- `src/data/elements.ts` — largest file (~2800 lines), all element data. Accuracy is critical — verify changes against authoritative sources.
- `src/types/element.ts` — `Element` interface and `ElementCategory` union type
- `src/utils/colors.ts` — category-to-color mapping (10 categories)
- `src/components/ElementDetail.tsx` — the detail overlay with staggered animations and orbital ring decorations

## Voice Agent (ElevenLabs)

- **Hook**: `src/hooks/useElementConversation.ts` — manages the ElevenLabs voice session, sends contextual updates on element clicks/closes, and registers client tools
- **Client tools**: `navigate_to_element` and `go_back_to_table` are registered via `useConversation({ clientTools })` so the voice agent can control the UI
- **Agent config**: `agent_configs/Chemical-Element-Periodic-Table-Guide.json` — the agent's prompt, voice, and tool settings (managed via `@elevenlabs/cli`)
- **Tool configs**: `tool_configs/` — JSON schemas for client tools, also managed via CLI
- **ID mapping**: `agents.json` and `tools.json` are gitignored (contain agent IDs that grant conversation access). After a fresh clone, run `elevenlabs agents pull` and `elevenlabs tools pull` to regenerate them
- **Skill**: `/11labs-push` pushes config changes to ElevenLabs (dry-run first, then push)
- **Contract with routing**: the tool JSON schemas are URL-agnostic — `navigate_to_element({name})` takes an element name or symbol; the hook resolves it to an `Element` and calls `onNavigate(element)`. `App.tsx` turns that into `navigate(/element/${element.symbol})`. **Do not push the voice agent configs unless you also update the tool schemas.** `notifyElementChange` is fired from a `useEffect` keyed on the URL param, so the voice agent stays in sync regardless of whether the user clicked, spoke, pasted a URL, or hit the browser back button.

## Deep-Linkable Element URLs & OG Tags

- **Route shape**: `/element/:symbol` is deep-linkable. A browser visit hydrates the SPA; a social-crawler visit is rewritten to `/api/element-og` via a `has: user-agent` rule in `vercel.json` and returned as a static per-element HTML doc.
- **Serverless function**: `api/element-og.ts` reads the symbol from the URL path (or `?symbol=` query param for `vercel dev`, which ignores `has` rewrites), looks up the element via `getElementBySymbol`, and returns title/description plus `og:image` (the R2 video poster, falling back to `/og-image.png`) and `og:video` tags when a video exists.
- **Crawler UA list**: Facebook, Twitter, WhatsApp, Slack, LinkedIn, Discord, Telegram, **Applebot + AppleNewsBot** (iMessage), Pinterest, Reddit, Skype. If you add another crawler, update `vercel.json` only — there is no secondary UA check inside the handler, so there's nothing to keep in sync.
- **Sitemap**: `scripts/generate-sitemap.mjs` rewrites `public/sitemap.xml` with 119 entries (homepage + 118 elements). Runs automatically via `npm run build`. After deploy, resubmit `https://www.periodictable.tech/sitemap.xml` in Google Search Console.
- **Thumbnails**: 88 of 118 elements have videos. Run `npx tsx scripts/r2-upload/thumbnails.ts --all` with R2 creds in `.env` to generate first-frame JPGs locally and upload them to R2 alongside the MP4s. Elements without videos fall back to the homepage OG image.
- **Env var for the OG handler**: set `VIDEO_CDN_URL` in Vercel to the R2 public URL (`https://pub-31265833619c4b07a0d5cae75480e369.r2.dev`). A safe default is baked in so the function still works if the env var is unset.

## Accessibility

- `ElementDetail` is a focus-trapped `role="dialog"` modal — close button is auto-focused on mount, Tab cycles within
- Escape closes the detail view; focus returns to the originating grid cell
- The close transition uses the originating cell's rect for the clip-path animation in both directions

## Conventions

- CSS uses `color-mix(in srgb, ...)` for translucent category colors (no `hsl(from ...)` relative color syntax)
- Category colors are passed as `--cat-color` CSS custom property via inline styles
- Component CSS files are co-located with their `.tsx` files
- BEM-like class naming: `.component__element--modifier`
