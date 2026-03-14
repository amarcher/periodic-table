# The Periodic Table

An interactive, visually stunning periodic table web app designed to make science fun and accessible for kids. Click any element to see it expand into a detailed card with properties, electron configurations, and kid-friendly fun facts.

![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)

## Features

- **All 118 elements** with accurate atomic masses, electron configurations, melting/boiling points, density, and electronegativity
- **Hero animation** — clicking an element smoothly expands it from its grid position into a centered detail card using View Transitions with clip-path
- **Glass-morphism design** — dark theme with luminous, category-colored element cells
- **10 category colors** — alkali metals, noble gases, transition metals, lanthanides, and more each have a distinct hue
- **Kid-friendly fun facts** — 3–4 engaging facts per element
- **Voice agent** — ElevenLabs-powered voice buddy that talks to kids about elements, navigates the app by voice, and responds to questions
- **Keyboard accessible** — focus-trapped modal with Escape to close, focus restoration to originating cell
- **Responsive** — works on desktop and mobile

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build

```bash
npm run build
npm run preview
```

## Tech Stack

- **Vite** — fast dev server and build
- **React + TypeScript** — type-safe component model
- **Framer Motion** — layout animations and staggered reveals
- **CSS Grid** — 18-column periodic table layout with explicit element placement
- **Google Fonts** — Inter (UI) + Space Grotesk (element symbols)

## Voice Agent

The app includes an ElevenLabs conversational AI voice agent that acts as a "science buddy" for kids. It can:

- Talk about whichever element is currently open
- Navigate to elements by voice ("show me gold", "what about Ca?")
- Return to the periodic table grid on request

### Setup

1. Copy `.env.example` to `.env` and fill in your ElevenLabs agent ID and API key
2. Install the ElevenLabs CLI: `npm install -g @elevenlabs/cli`
3. Pull agent/tool ID mappings: `elevenlabs agents pull && elevenlabs tools pull`
4. Agent and tool configs are in `agent_configs/` and `tool_configs/`— edit locally, then push with `elevenlabs agents push && elevenlabs tools push`

### Architecture

The voice agent registers two **client tools** via the ElevenLabs SDK — functions that run in the browser and let the agent control the UI:

- `navigate_to_element` — opens a specific element's detail view (matched by name or symbol)
- `go_back_to_table` — closes the detail view and returns to the grid

Tool schemas and the agent prompt are version-controlled in `agent_configs/` and `tool_configs/`. The ID mapping files (`agents.json`, `tools.json`) are gitignored since agent IDs grant conversation access.

## Project Structure

```
src/
├── main.tsx
├── App.tsx / App.css
├── components/
│   ├── PeriodicTable.tsx/.css   # CSS Grid layout
│   ├── ElementCell.tsx/.css     # Individual element buttons
│   ├── ElementDetail.tsx/.css   # Fullscreen detail overlay
│   ├── VoiceAgent.tsx/.css      # Mic button + voice status
│   └── CategoryLegend.tsx/.css  # Color legend
├── hooks/
│   └── useElementConversation.ts # ElevenLabs voice session + client tools
├── data/
│   └── elements.ts              # All 118 elements
├── types/
│   └── element.ts               # TypeScript interfaces
└── utils/
    └── colors.ts                # Category color mapping

agent_configs/                   # ElevenLabs agent prompt & settings
tool_configs/                    # ElevenLabs client tool schemas
```

## License

MIT
