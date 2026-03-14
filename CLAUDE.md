# CLAUDE.md

## Project Overview

Interactive periodic table web app for kids. Vite + React + TypeScript + Framer Motion. Dark theme with glass-morphism design.

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run preview` — preview production build
- `npx tsc --noEmit` — type check without emitting

## Architecture

- **State**: Single `useState<Element | null>` in `App.tsx` controls which element detail is open
- **Animation**: Framer Motion `layoutId` on `ElementCell` and `ElementDetail` creates the hero "emerge from grid" transition. `AnimatePresence` handles mount/unmount.
- **Layout**: CSS Grid with 18 columns, 10 rows. Each element has explicit `gridRow`/`gridColumn` in the data (no empty placeholder divs). Rows 9–10 are lanthanides/actinides.
- **Data**: All 118 elements are in `src/data/elements.ts` as a static TypeScript array. No API calls.
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

## Accessibility

- `ElementDetail` is a focus-trapped `role="dialog"` modal — close button is auto-focused on mount, Tab cycles within
- Escape closes the detail view; focus returns to the originating grid cell
- The close transition uses the originating cell's rect for the clip-path animation in both directions

## Conventions

- CSS uses `color-mix(in srgb, ...)` for translucent category colors (no `hsl(from ...)` relative color syntax)
- Category colors are passed as `--cat-color` CSS custom property via inline styles
- Component CSS files are co-located with their `.tsx` files
- BEM-like class naming: `.component__element--modifier`
