# The Periodic Table

An interactive, visually stunning periodic table web app designed to make science fun and accessible for kids. Click any element to see it expand into a detailed card with properties, electron configurations, and kid-friendly fun facts.

![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)

## Features

- **All 118 elements** with accurate atomic masses, electron configurations, melting/boiling points, density, and electronegativity
- **Hero animation** — clicking an element smoothly expands it from its grid position into a centered detail card using Framer Motion's `layoutId`
- **Glass-morphism design** — dark theme with luminous, category-colored element cells
- **10 category colors** — alkali metals, noble gases, transition metals, lanthanides, and more each have a distinct hue
- **Kid-friendly fun facts** — 3–4 engaging facts per element
- **Decorative orbital rings** — animated CSS ellipses behind the element symbol in the detail view
- **Keyboard accessible** — press Escape to close the detail view
- **Responsive** — works on desktop and mobile
- **Zero images** — pure CSS/SVG, instant load

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

## Project Structure

```
src/
├── main.tsx
├── App.tsx / App.css
├── components/
│   ├── PeriodicTable.tsx/.css   # CSS Grid layout
│   ├── ElementCell.tsx/.css     # Individual element buttons
│   ├── ElementDetail.tsx/.css   # Fullscreen detail overlay
│   └── CategoryLegend.tsx/.css  # Color legend
├── data/
│   └── elements.ts              # All 118 elements
├── types/
│   └── element.ts               # TypeScript interfaces
└── utils/
    └── colors.ts                # Category color mapping
```

## License

MIT
