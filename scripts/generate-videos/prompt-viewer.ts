#!/usr/bin/env npx tsx
/**
 * Generates an HTML page showing all 118 element video prompts.
 * Marks which elements have videos, which are missing, and which are skipped.
 *
 * Usage:  npx tsx scripts/generate-videos/prompt-viewer.ts
 * Opens:  scripts/generate-videos/output/prompt-viewer.html
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildAllPrompts } from './prompt-builder.ts';
import { VIDEO_DATA } from '../../src/data/videoData.ts';
import { elements } from '../../src/data/elements.ts';
import { NEGATIVE_PROMPT } from './config.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const allPrompts = buildAllPrompts();
const hasVideo = new Set(Object.keys(VIDEO_DATA).map(Number));

interface Row {
  atomicNumber: number;
  symbol: string;
  name: string;
  category: string;
  prompt: string;
  startFramePrompt: string;
  endFramePrompt: string;
  negativePrompt: string;
  status: 'has-video' | 'missing' | 'skipped';
  filename: string;
}

const rows: Row[] = allPrompts.map((p) => {
  const el = elements.find((e) => e.atomicNumber === p.atomicNumber)!;
  let status: Row['status'];
  if (hasVideo.has(p.atomicNumber)) {
    status = 'has-video';
  } else if (p.skipVideo) {
    status = 'skipped';
  } else {
    status = 'missing';
  }
  const paddedNum = String(p.atomicNumber).padStart(3, '0');
  return {
    atomicNumber: p.atomicNumber,
    symbol: p.symbol,
    name: p.name,
    category: el.category,
    prompt: p.prompt,
    startFramePrompt: p.startFramePrompt,
    endFramePrompt: p.endFramePrompt,
    negativePrompt: p.negativePrompt,
    status,
    filename: `${paddedNum}-${p.symbol}-veo31fast.mp4`,
  };
});

const totalCount = rows.length;
const hasVideoCount = rows.filter((r) => r.status === 'has-video').length;
const missingCount = rows.filter((r) => r.status === 'missing').length;
const skippedCount = rows.filter((r) => r.status === 'skipped').length;

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Element Video Prompts</title>
<style>
  :root {
    --bg: #0d1117;
    --surface: #161b22;
    --border: #30363d;
    --text: #e6edf3;
    --text-muted: #8b949e;
    --green: #3fb950;
    --red: #f85149;
    --yellow: #d29922;
    --blue: #58a6ff;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
    background: var(--bg);
    color: var(--text);
    line-height: 1.5;
    padding: 24px;
  }
  h1 { font-size: 24px; margin-bottom: 8px; }
  .stats {
    display: flex;
    gap: 24px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }
  .stat {
    padding: 12px 20px;
    border-radius: 8px;
    background: var(--surface);
    border: 1px solid var(--border);
    font-size: 14px;
  }
  .stat strong { font-size: 24px; display: block; }
  .stat.green strong { color: var(--green); }
  .stat.red strong { color: var(--red); }
  .stat.yellow strong { color: var(--yellow); }

  .filters {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
    flex-wrap: wrap;
    align-items: center;
  }
  .filters button {
    padding: 6px 14px;
    border-radius: 6px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text);
    cursor: pointer;
    font-size: 13px;
  }
  .filters button:hover { border-color: var(--blue); }
  .filters button.active { background: var(--blue); color: #000; border-color: var(--blue); }
  .filters input {
    padding: 6px 12px;
    border-radius: 6px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text);
    font-size: 13px;
    width: 220px;
  }

  .neg-prompt-section {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 20px;
  }
  .neg-prompt-section h3 { font-size: 14px; color: var(--text-muted); margin-bottom: 8px; }
  .neg-prompt-section p { font-size: 13px; color: var(--text-muted); }
  .neg-prompt-section .copy-btn {
    margin-top: 8px;
  }

  .element-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 12px;
    transition: border-color 0.15s;
  }
  .element-card:hover { border-color: var(--blue); }
  .element-card.has-video { border-left: 3px solid var(--green); }
  .element-card.missing { border-left: 3px solid var(--red); }
  .element-card.skipped { border-left: 3px solid var(--yellow); }

  .card-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 10px;
    flex-wrap: wrap;
  }
  .atomic-num {
    font-size: 13px;
    color: var(--text-muted);
    min-width: 28px;
  }
  .symbol {
    font-size: 22px;
    font-weight: 700;
    min-width: 40px;
  }
  .el-name {
    font-size: 16px;
    font-weight: 500;
  }
  .category-badge {
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 12px;
    background: var(--border);
    color: var(--text-muted);
  }
  .status-badge {
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 12px;
    font-weight: 600;
    margin-left: auto;
  }
  .status-badge.has-video { background: rgba(63, 185, 80, 0.2); color: var(--green); }
  .status-badge.missing { background: rgba(248, 81, 73, 0.2); color: var(--red); }
  .status-badge.skipped { background: rgba(210, 153, 34, 0.2); color: var(--yellow); }

  .filename {
    font-size: 12px;
    color: var(--text-muted);
    font-family: monospace;
    margin-bottom: 8px;
  }

  .prompt-text {
    font-size: 13px;
    line-height: 1.6;
    color: var(--text);
    white-space: pre-wrap;
    word-break: break-word;
    background: var(--bg);
    padding: 12px;
    border-radius: 6px;
    border: 1px solid var(--border);
    position: relative;
  }

  .copy-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 4px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text-muted);
    cursor: pointer;
    font-size: 12px;
  }
  .copy-btn:hover { color: var(--text); border-color: var(--blue); }
  .copy-btn.copied { color: var(--green); border-color: var(--green); }

  .prompt-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
    margin-bottom: 4px;
    margin-top: 12px;
  }
  .prompt-label:first-of-type { margin-top: 0; }
  .prompt-label.start { color: #58a6ff; }
  .prompt-label.video { color: #e6edf3; }
  .prompt-label.end { color: #d2a8ff; }

  .frame-prompts {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-bottom: 8px;
  }
  @media (max-width: 768px) { .frame-prompts { grid-template-columns: 1fr; } }

  .frame-prompt-box {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 10px;
  }

  .card-actions {
    display: flex;
    gap: 8px;
    margin-top: 8px;
    flex-wrap: wrap;
  }

  .hidden { display: none !important; }
</style>
</head>
<body>

<h1>Element Video Prompts</h1>
<div class="stats">
  <div class="stat green"><strong>${hasVideoCount}</strong>Have Video</div>
  <div class="stat red"><strong>${missingCount}</strong>Missing Video</div>
  <div class="stat yellow"><strong>${skippedCount}</strong>Skipped</div>
  <div class="stat"><strong>${totalCount}</strong>Total Elements</div>
</div>

<div class="filters">
  <button class="active" data-filter="all">All (${totalCount})</button>
  <button data-filter="missing">Missing (${missingCount})</button>
  <button data-filter="has-video">Has Video (${hasVideoCount})</button>
  <button data-filter="skipped">Skipped (${skippedCount})</button>
  <input type="text" id="search" placeholder="Search by name, symbol, or number...">
</div>

<div class="neg-prompt-section">
  <h3>Negative Prompt (same for all elements)</h3>
  <p id="neg-prompt-text">${escapeHtml(NEGATIVE_PROMPT)}</p>
  <button class="copy-btn" onclick="copyText(document.getElementById('neg-prompt-text').textContent, this)">Copy Negative Prompt</button>
</div>

<div id="cards">
${rows
  .map(
    (r) => `
  <div class="element-card ${r.status}" data-status="${r.status}" data-name="${escapeHtml(r.name.toLowerCase())}" data-symbol="${escapeHtml(r.symbol.toLowerCase())}" data-num="${r.atomicNumber}">
    <div class="card-header">
      <span class="atomic-num">#${r.atomicNumber}</span>
      <span class="symbol">${escapeHtml(r.symbol)}</span>
      <span class="el-name">${escapeHtml(r.name)}</span>
      <span class="category-badge">${escapeHtml(r.category)}</span>
      <span class="status-badge ${r.status}">${r.status === 'has-video' ? 'HAS VIDEO' : r.status === 'missing' ? 'MISSING' : 'SKIPPED'}</span>
    </div>
    <div class="filename">${escapeHtml(r.filename)}</div>
    ${
      r.status === 'skipped'
        ? '<div class="prompt-text" style="color: var(--text-muted); font-style: italic;">Video generation skipped for this element (too synthetic/short-lived to visualize meaningfully).</div>'
        : `${r.startFramePrompt || r.endFramePrompt ? `<div class="frame-prompts">
      <div class="frame-prompt-box">
        <div class="prompt-label start">Start Frame (image)</div>
        <div class="prompt-text" id="start-${r.atomicNumber}" style="margin:0;border:0;padding:8px;background:transparent;">${r.startFramePrompt ? escapeHtml(r.startFramePrompt) : '<span style="color:var(--text-muted);font-style:italic">No start frame prompt</span>'}</div>
        ${r.startFramePrompt ? `<button class="copy-btn" style="margin-top:6px" onclick="copyText(document.getElementById('start-${r.atomicNumber}').textContent, this)">Copy Start</button>` : ''}
      </div>
      <div class="frame-prompt-box">
        <div class="prompt-label end">End Frame (image)</div>
        <div class="prompt-text" id="end-${r.atomicNumber}" style="margin:0;border:0;padding:8px;background:transparent;">${r.endFramePrompt ? escapeHtml(r.endFramePrompt) : '<span style="color:var(--text-muted);font-style:italic">No end frame prompt</span>'}</div>
        ${r.endFramePrompt ? `<button class="copy-btn" style="margin-top:6px" onclick="copyText(document.getElementById('end-${r.atomicNumber}').textContent, this)">Copy End</button>` : ''}
      </div>
    </div>` : ''}
    <div class="prompt-label video">Video Prompt</div>
    <div class="prompt-text" id="prompt-${r.atomicNumber}">${escapeHtml(r.prompt)}</div>
    <div class="card-actions">
      <button class="copy-btn" onclick="copyText(document.getElementById('prompt-${r.atomicNumber}').textContent, this)">Copy Video Prompt</button>
      ${r.startFramePrompt ? `<button class="copy-btn" onclick="copyAll3(${r.atomicNumber}, this)">Copy All 3</button>` : ''}
    </div>`
    }
  </div>`
  )
  .join('\n')}
</div>

<script>
function copyText(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    btn.classList.add('copied');
    const orig = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.classList.remove('copied'); btn.textContent = orig; }, 1500);
  });
}

function copyAll3(num, btn) {
  const s = document.getElementById('start-' + num);
  const v = document.getElementById('prompt-' + num);
  const e = document.getElementById('end-' + num);
  const text = 'START FRAME:\\n' + (s ? s.textContent : '') + '\\n\\nVIDEO PROMPT:\\n' + (v ? v.textContent : '') + '\\n\\nEND FRAME:\\n' + (e ? e.textContent : '');
  navigator.clipboard.writeText(text).then(() => {
    btn.classList.add('copied');
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.classList.remove('copied'); btn.textContent = 'Copy All 3'; }, 1500);
  });
}

// Filtering
const buttons = document.querySelectorAll('.filters button');
const cards = document.querySelectorAll('.element-card');
const searchInput = document.getElementById('search');
let currentFilter = 'all';

function applyFilters() {
  const query = searchInput.value.toLowerCase().trim();
  cards.forEach(card => {
    const status = card.dataset.status;
    const name = card.dataset.name;
    const symbol = card.dataset.symbol;
    const num = card.dataset.num;
    const matchesFilter = currentFilter === 'all' || status === currentFilter;
    const matchesSearch = !query || name.includes(query) || symbol.includes(query) || num === query;
    card.classList.toggle('hidden', !(matchesFilter && matchesSearch));
  });
}

buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    buttons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    applyFilters();
  });
});

searchInput.addEventListener('input', applyFilters);
</script>
</body>
</html>`;

const outDir = path.resolve(__dirname, 'output');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const outPath = path.resolve(outDir, 'prompt-viewer.html');
fs.writeFileSync(outPath, html, 'utf-8');
console.log(`\nPrompt viewer written to:\n  ${outPath}\n`);
console.log(`Stats: ${hasVideoCount} have video, ${missingCount} missing, ${skippedCount} skipped\n`);
console.log('Missing videos:');
rows
  .filter((r) => r.status === 'missing')
  .forEach((r) => console.log(`  #${r.atomicNumber} ${r.symbol} — ${r.name}`));
