import type { Element } from '../../types/element';
import './DensityViz.css';

interface DensityVizProps {
  element: Element;
  catColor: string;
}

function getDensityContext(density: number): string {
  if (density < 0.01) return 'So light it floats in air!';
  if (density < 1) return 'Floats on water!';
  if (density < 3) return 'A bit heavier than water';
  if (density < 8) return 'About as dense as common metals';
  if (density < 12) return 'Heavier than iron!';
  if (density < 18) return 'Heavier than lead!';
  return 'One of the densest things on Earth!';
}

export function DensityViz({ element, catColor }: DensityVizProps) {
  const density = element.density!;
  const isGas = density < 0.01;

  return (
    <div className="dviz" style={{ '--cat-color': catColor } as React.CSSProperties}>
      <div className="dviz__header">
        <span className="dviz__label">Density</span>
        <span className="dviz__value">{density} g/cm³</span>
      </div>

      {isGas ? <GasScene symbol={element.symbol} /> : <LiquidScene symbol={element.symbol} density={density} />}

      <span className="dviz__context">{getDensityContext(density)}</span>
    </div>
  );
}

function GasScene({ symbol }: { symbol: string }) {
  return (
    <div className="dviz__scene dviz__scene--gas">
      <div className="dviz__balloon">
        <div className="dviz__balloon-body">
          <span className="dviz__balloon-symbol">{symbol}</span>
        </div>
        <div className="dviz__balloon-string" />
      </div>
      {/* floating clouds */}
      <div className="dviz__cloud dviz__cloud--1" />
      <div className="dviz__cloud dviz__cloud--2" />
    </div>
  );
}

function LiquidScene({ symbol, density }: { symbol: string; density: number }) {
  const floats = density < 1;
  // For floaters: how much is submerged (Archimedes: fraction = density/water_density)
  // For sinkers: depth clamped visually
  const submersionPct = floats ? Math.min(density, 1) * 100 : 100;
  // Sinkers: how far down the block goes (log scale for visual spread)
  const sinkDepth = !floats ? Math.min(Math.log10(density) / Math.log10(23) * 100, 95) : 0;

  return (
    <div className="dviz__scene dviz__scene--liquid">
      {/* water body */}
      <div className="dviz__water">
        <div className="dviz__water-surface">
          <div className="dviz__ripple dviz__ripple--1" />
          <div className="dviz__ripple dviz__ripple--2" />
        </div>
        <div className="dviz__water-body">
          {/* bubbles for sinkers */}
          {!floats && (
            <>
              <div className="dviz__bubble dviz__bubble--1" />
              <div className="dviz__bubble dviz__bubble--2" />
              <div className="dviz__bubble dviz__bubble--3" />
            </>
          )}
        </div>
      </div>

      {/* element block */}
      <div
        className={`dviz__block ${floats ? 'dviz__block--float' : 'dviz__block--sink'}`}
        style={{
          '--submersion': `${submersionPct}%`,
          '--sink-depth': `${sinkDepth}%`,
        } as React.CSSProperties}
      >
        <span className="dviz__block-symbol">{symbol}</span>
      </div>
    </div>
  );
}
