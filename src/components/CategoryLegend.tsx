import { categoryColors, categoryLabels } from '../utils/colors';
import type { ElementCategory } from '../types/element';
import './CategoryLegend.css';

const categories = Object.keys(categoryColors) as ElementCategory[];

export function CategoryLegend() {
  return (
    <div className="category-legend">
      {categories.map((cat) => (
        <div key={cat} className="legend-item">
          <span
            className="legend-dot"
            style={{ background: categoryColors[cat] }}
          />
          <span className="legend-label">{categoryLabels[cat]}</span>
        </div>
      ))}
    </div>
  );
}
