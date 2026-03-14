import { memo } from 'react';
import type { Element } from '../types/element';
import { categoryColors } from '../utils/colors';
import './ElementCell.css';

interface ElementCellProps {
  element: Element;
  onClick: (element: Element, e: React.MouseEvent) => void;
  tabIndex?: number;
}

export const ElementCell = memo(function ElementCell({ element, onClick, tabIndex = -1 }: ElementCellProps) {
  const color = categoryColors[element.category];

  return (
    <button
      className="element-cell"
      onClick={(e) => onClick(element, e)}
      tabIndex={tabIndex}
      data-row={element.gridRow}
      data-col={element.gridColumn}
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
}, (prev, next) =>
  prev.element.atomicNumber === next.element.atomicNumber &&
  prev.onClick === next.onClick &&
  prev.tabIndex === next.tabIndex
);
