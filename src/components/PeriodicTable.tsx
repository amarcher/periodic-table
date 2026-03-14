import { useCallback, useRef, useState } from 'react';
import type { Element } from '../types/element';
import { elements } from '../data/elements';
import { ElementCell } from './ElementCell';
import './PeriodicTable.css';

// Build spatial lookup: grid position → element index
// Sorted rows/cols for finding nearest neighbors
const gridMap = new Map<string, number>();
const rowSet = new Set<number>();
const colsByRow = new Map<number, number[]>();

elements.forEach((el, i) => {
  gridMap.set(`${el.gridRow},${el.gridColumn}`, i);
  rowSet.add(el.gridRow);
  const cols = colsByRow.get(el.gridRow) ?? [];
  cols.push(el.gridColumn);
  colsByRow.set(el.gridRow, cols);
});

const sortedRows = [...rowSet].sort((a, b) => a - b);
colsByRow.forEach((cols) => cols.sort((a, b) => a - b));

function findNeighbor(row: number, col: number, dir: 'up' | 'down' | 'left' | 'right'): Element | null {
  if (dir === 'left' || dir === 'right') {
    const cols = colsByRow.get(row);
    if (!cols) return null;
    const idx = cols.indexOf(col);
    const next = dir === 'left' ? idx - 1 : idx + 1;
    if (next < 0 || next >= cols.length) return null;
    const key = `${row},${cols[next]}`;
    const elIdx = gridMap.get(key);
    return elIdx != null ? elements[elIdx] : null;
  }

  // Up/down: find nearest element in adjacent row at same or closest column
  const rowIdx = sortedRows.indexOf(row);
  const nextRowIdx = dir === 'up' ? rowIdx - 1 : rowIdx + 1;
  if (nextRowIdx < 0 || nextRowIdx >= sortedRows.length) return null;
  const nextRow = sortedRows[nextRowIdx];
  const cols = colsByRow.get(nextRow);
  if (!cols || cols.length === 0) return null;

  // Exact match first
  if (cols.includes(col)) {
    const elIdx = gridMap.get(`${nextRow},${col}`);
    return elIdx != null ? elements[elIdx] : null;
  }

  // Nearest column
  let closest = cols[0];
  let minDist = Math.abs(cols[0] - col);
  for (let i = 1; i < cols.length; i++) {
    const dist = Math.abs(cols[i] - col);
    if (dist < minDist) { closest = cols[i]; minDist = dist; }
  }
  const elIdx = gridMap.get(`${nextRow},${closest}`);
  return elIdx != null ? elements[elIdx] : null;
}

interface PeriodicTableProps {
  onElementClick: (element: Element, e: React.MouseEvent) => void;
}

export function PeriodicTable({ onElementClick }: PeriodicTableProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0); // Hydrogen

  const handleFocus = useCallback((e: React.FocusEvent) => {
    const target = e.target as HTMLElement;
    const row = Number(target.dataset.row);
    const col = Number(target.dataset.col);
    if (!row || !col) return;
    const key = `${row},${col}`;
    const idx = gridMap.get(key);
    if (idx != null) setActiveIndex(idx);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const dirMap: Record<string, 'up' | 'down' | 'left' | 'right'> = {
      ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    };
    const dir = dirMap[e.key];
    if (!dir) return;

    const active = document.activeElement as HTMLElement;
    if (!active || !gridRef.current?.contains(active)) return;

    const row = Number(active.dataset.row);
    const col = Number(active.dataset.col);
    if (!row || !col) return;

    const neighbor = findNeighbor(row, col, dir);
    if (!neighbor) return;

    e.preventDefault();
    const idx = elements.indexOf(neighbor);
    setActiveIndex(idx);
    const target = gridRef.current.querySelector<HTMLElement>(
      `[data-row="${neighbor.gridRow}"][data-col="${neighbor.gridColumn}"]`
    );
    target?.focus();
  }, []);

  return (
    <div className="periodic-table-wrapper">
      <div
        ref={gridRef}
        className="periodic-table"
        role="grid"
        aria-label="Periodic table of elements"
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
      >
        {elements.map((el, i) => (
          <ElementCell key={el.atomicNumber} element={el} onClick={onElementClick} tabIndex={i === activeIndex ? 0 : -1} />
        ))}
        {/* Lanthanide / Actinide labels */}
        <div className="table-label table-label--lan" style={{ gridRow: 9, gridColumn: 1, gridColumnEnd: 3 }}>
          Lanthanides
        </div>
        <div className="table-label table-label--act" style={{ gridRow: 10, gridColumn: 1, gridColumnEnd: 3 }}>
          Actinides
        </div>
      </div>
    </div>
  );
}
