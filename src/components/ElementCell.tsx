import { motion } from 'framer-motion';
import type { Element } from '../types/element';
import { categoryColors } from '../utils/colors';
import './ElementCell.css';

interface ElementCellProps {
  element: Element;
  onClick: (element: Element) => void;
}

export function ElementCell({ element, onClick }: ElementCellProps) {
  const color = categoryColors[element.category];

  return (
    <motion.button
      className="element-cell"
      layoutId={`element-${element.atomicNumber}`}
      onClick={() => onClick(element)}
      style={{
        gridRow: element.gridRow,
        gridColumn: element.gridColumn,
        '--cat-color': color,
      } as React.CSSProperties}
      whileHover={{ scale: 1.08, zIndex: 10 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <span className="element-cell__number">{element.atomicNumber}</span>
      <span className="element-cell__symbol">{element.symbol}</span>
      <span className="element-cell__name">{element.name}</span>
      <span className="element-cell__mass">{element.atomicMass.toFixed(2)}</span>
    </motion.button>
  );
}
