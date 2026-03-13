import type { Element } from '../types/element';
import { elements } from '../data/elements';
import { ElementCell } from './ElementCell';
import './PeriodicTable.css';

interface PeriodicTableProps {
  onElementClick: (element: Element) => void;
}

export function PeriodicTable({ onElementClick }: PeriodicTableProps) {
  return (
    <div className="periodic-table-wrapper">
      <div className="periodic-table">
        {elements.map((el) => (
          <ElementCell key={el.atomicNumber} element={el} onClick={onElementClick} />
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
