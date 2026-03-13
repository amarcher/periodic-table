import type { Element } from '../types/element';
import { categoryColors } from '../utils/colors';
import './ElementCell.css';

interface ElementCellProps {
  element: Element;
  onClick: (element: Element, e: React.MouseEvent) => void;
}

export function ElementCell({ element, onClick }: ElementCellProps) {
  const color = categoryColors[element.category];

  return (
    <button
      className="element-cell"
      onClick={(e) => onClick(element, e)}
      style={{
        gridRow: element.gridRow,
        gridColumn: element.gridColumn,
        '--cat-color': color,
      } as React.CSSProperties}
    >
      <span className="element-cell__number">{element.atomicNumber}</span>
      <span className="element-cell__symbol">{element.symbol}</span>
      <span className="element-cell__name">{element.name}</span>
      <span className="element-cell__mass">{element.atomicMass.toFixed(2)}</span>
    </button>
  );
}
