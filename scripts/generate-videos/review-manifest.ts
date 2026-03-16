import fs from 'node:fs';
import path from 'node:path';

export interface ManifestEntry {
  atomicNumber: number;
  symbol: string;
  name: string;
  status: 'pending' | 'completed' | 'failed' | 'rejected';
  videoPath?: string;
  tool: string;
  prompt: string;
  cost?: number;
  generationId?: string;
}

export function loadManifest(filePath: string): ManifestEntry[] {
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as ManifestEntry[];
}

export function saveManifest(filePath: string, entries: ManifestEntry[]): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(entries, null, 2), 'utf-8');
}

export function generateReviewHtml(entries: ManifestEntry[], outputPath: string): void {
  const completed = entries.filter((e) => e.status === 'completed').length;
  const failed = entries.filter((e) => e.status === 'failed').length;
  const rejected = entries.filter((e) => e.status === 'rejected').length;
  const pending = entries.filter((e) => e.status === 'pending').length;
  const total = entries.length;

  const cards = entries
    .sort((a, b) => a.atomicNumber - b.atomicNumber)
    .map((entry) => {
      const videoTag = entry.videoPath
        ? `<video src="${entry.videoPath}" controls loop muted playsinline class="card__video"></video>`
        : `<div class="card__no-video">No video</div>`;

      const statusClass = `card--${entry.status}`;
      const cost = entry.cost != null ? `$${entry.cost.toFixed(4)}` : '—';

      return `
    <div class="card ${statusClass}" data-atomic="${entry.atomicNumber}" id="card-${entry.atomicNumber}">
      <div class="card__header">
        <span class="card__number">${entry.atomicNumber}</span>
        <span class="card__symbol">${entry.symbol}</span>
        <span class="card__name">${entry.name}</span>
        <span class="card__status badge badge--${entry.status}">${entry.status}</span>
        <span class="card__tool">${entry.tool}</span>
        <span class="card__cost">${cost}</span>
      </div>
      ${videoTag}
      <details class="card__prompt">
        <summary>Prompt</summary>
        <p>${escapeHtml(entry.prompt)}</p>
      </details>
      <div class="card__actions">
        <button class="btn btn--approve" onclick="approve(${entry.atomicNumber})">Approve</button>
        <button class="btn btn--reject" onclick="reject(${entry.atomicNumber})">Reject</button>
      </div>
    </div>`;
    })
    .join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Video Review — Periodic Table</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: system-ui, sans-serif;
      background: #0d1117;
      color: #e6edf3;
      min-height: 100vh;
    }

    .summary-bar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: #161b22;
      border-bottom: 1px solid #30363d;
      padding: 10px 24px;
      display: flex;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;
    }

    .summary-bar h1 { font-size: 1rem; font-weight: 600; margin-right: auto; }

    .stat { font-size: 0.85rem; }
    .stat span { font-weight: 700; }

    .filter-group { display: flex; gap: 8px; }
    .filter-btn {
      padding: 4px 12px;
      border-radius: 20px;
      border: 1px solid #30363d;
      background: transparent;
      color: #e6edf3;
      cursor: pointer;
      font-size: 0.8rem;
      transition: background 0.15s;
    }
    .filter-btn:hover, .filter-btn.active { background: #21262d; }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
      padding: 24px;
    }

    .card {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 8px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: border-color 0.2s;
    }
    .card--completed { border-color: #238636; }
    .card--failed { border-color: #da3633; }
    .card--rejected { border-color: #9e6a03; opacity: 0.6; }
    .card--pending { border-color: #388bfd; }

    .card__header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      background: #0d1117;
      flex-wrap: wrap;
    }

    .card__number { font-size: 0.75rem; color: #8b949e; }
    .card__symbol { font-size: 1.2rem; font-weight: 700; }
    .card__name { font-size: 0.9rem; flex: 1; }
    .card__cost { font-size: 0.75rem; color: #8b949e; margin-left: auto; }

    .badge {
      font-size: 0.65rem;
      padding: 2px 8px;
      border-radius: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .badge--completed { background: #238636; color: #fff; }
    .badge--failed { background: #da3633; color: #fff; }
    .badge--rejected { background: #9e6a03; color: #fff; }
    .badge--pending { background: #388bfd; color: #fff; }

    .card__tool { font-size: 0.7rem; color: #8b949e; }

    .card__video { width: 100%; aspect-ratio: 16/9; object-fit: cover; display: block; }

    .card__no-video {
      aspect-ratio: 16/9;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #0d1117;
      color: #8b949e;
      font-size: 0.85rem;
    }

    .card__prompt {
      padding: 8px 12px;
      font-size: 0.75rem;
      color: #8b949e;
      border-top: 1px solid #21262d;
    }
    .card__prompt summary { cursor: pointer; color: #58a6ff; margin-bottom: 4px; }
    .card__prompt p { line-height: 1.5; margin-top: 6px; }

    .card__actions {
      display: flex;
      gap: 8px;
      padding: 10px 12px;
      border-top: 1px solid #21262d;
    }

    .btn {
      flex: 1;
      padding: 6px 12px;
      border-radius: 6px;
      border: 1px solid;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 600;
      transition: background 0.15s;
    }
    .btn--approve { border-color: #238636; color: #3fb950; background: transparent; }
    .btn--approve:hover { background: #238636; color: #fff; }
    .btn--reject { border-color: #da3633; color: #f85149; background: transparent; }
    .btn--reject:hover { background: #da3633; color: #fff; }

    .card.approved { border-color: #3fb950; }
    .card.rejected-local { opacity: 0.4; }
  </style>
</head>
<body>

<div class="summary-bar">
  <h1>Video Review — Periodic Table Elements</h1>
  <div class="stat">Total: <span>${total}</span></div>
  <div class="stat">Completed: <span id="stat-completed">${completed}</span></div>
  <div class="stat">Failed: <span id="stat-failed">${failed}</span></div>
  <div class="stat">Rejected: <span id="stat-rejected">${rejected}</span></div>
  <div class="stat">Pending: <span id="stat-pending">${pending}</span></div>
  <div class="stat">Approved: <span id="stat-approved">0</span></div>
  <div class="filter-group">
    <button class="filter-btn active" onclick="filter('all')">All</button>
    <button class="filter-btn" onclick="filter('completed')">Completed</button>
    <button class="filter-btn" onclick="filter('failed')">Failed</button>
    <button class="filter-btn" onclick="filter('pending')">Pending</button>
    <button class="filter-btn" onclick="filter('approved')">Approved</button>
    <button class="filter-btn" onclick="filter('rejected-local')">Rejected</button>
  </div>
  <button class="btn btn--approve" style="flex:none;padding:6px 16px" onclick="exportDecisions()">Export Decisions</button>
</div>

<div class="grid" id="grid">
${cards}
</div>

<script>
  // Load saved decisions from localStorage
  const STORAGE_KEY = 'video-review-decisions';

  function loadDecisions() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  }

  function saveDecisions(decisions) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(decisions));
  }

  function applyDecisions() {
    const decisions = loadDecisions();
    let approvedCount = 0;
    for (const [atomicNum, decision] of Object.entries(decisions)) {
      const card = document.getElementById('card-' + atomicNum);
      if (!card) continue;
      card.classList.remove('approved', 'rejected-local');
      if (decision === 'approved') { card.classList.add('approved'); approvedCount++; }
      if (decision === 'rejected') { card.classList.add('rejected-local'); }
    }
    document.getElementById('stat-approved').textContent = String(approvedCount);
  }

  function approve(atomicNumber) {
    const decisions = loadDecisions();
    decisions[atomicNumber] = 'approved';
    saveDecisions(decisions);
    applyDecisions();
  }

  function reject(atomicNumber) {
    const decisions = loadDecisions();
    decisions[atomicNumber] = 'rejected';
    saveDecisions(decisions);
    applyDecisions();
  }

  function filter(type) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');

    document.querySelectorAll('.card').forEach(card => {
      if (type === 'all') {
        card.style.display = '';
      } else if (type === 'approved') {
        card.style.display = card.classList.contains('approved') ? '' : 'none';
      } else if (type === 'rejected-local') {
        card.style.display = card.classList.contains('rejected-local') ? '' : 'none';
      } else {
        card.style.display = card.classList.contains('card--' + type) ? '' : 'none';
      }
    });
  }

  function exportDecisions() {
    const decisions = loadDecisions();
    const blob = new Blob([JSON.stringify(decisions, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'review-decisions.json';
    a.click();
  }

  applyDecisions();
</script>
</body>
</html>`;

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, html, 'utf-8');
  console.log(`\nReview HTML written to ${outputPath}`);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
