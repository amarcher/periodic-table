import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import type { Element } from '../types/element';
import { categoryColors } from '../utils/colors';
import {
  getAtomConfig, getCategoryEffect, getDetailLevel, getValenceIndices, hasUnfilledValence,
  DEFAULT_VIEW_MODE,
  type AtomViewMode, type OrbitalType,
} from './atom/atomConfig';
import { Nucleus } from './atom/Nucleus';
import { ElectronShell } from './atom/ElectronShell';
import { CategoryEffects } from './atom/CategoryEffects';
import { trackValenceToggle, trackOrbitalFilter, trackUnfilledToggle } from '../utils/analytics';
import './AtomVisualizer.css';

interface AtomVisualizerProps {
  element: Element;
  viewMode?: AtomViewMode;
  onViewModeChange?: (mode: AtomViewMode) => void;
}

function AtomScene({ element, viewMode }: { element: Element; viewMode: AtomViewMode }) {
  const config = useMemo(() => getAtomConfig(element.atomicNumber), [element.atomicNumber]);
  const effect = useMemo(() => getCategoryEffect(element.category), [element.category]);
  const detailLevel = useMemo(() => getDetailLevel(element.atomicNumber), [element.atomicNumber]);
  const color = categoryColors[element.category];
  const valenceIndices = useMemo(() => getValenceIndices(config.subshells), [config.subshells]);

  const cameraZ = useMemo(() => {
    const maxRadius = config.subshells.length > 0
      ? config.subshells[config.subshells.length - 1].radius
      : 2;
    return maxRadius * 2.2 + 3;
  }, [config.subshells]);

  const isAnyModeActive = viewMode.valenceOnly || viewMode.orbitalFilter !== null || viewMode.showUnfilled;

  return (
    <Canvas
      camera={{ position: [0, 1, cameraZ], fov: 50 }}
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
      }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={0.6} />
      <pointLight position={[-10, -5, -10]} intensity={0.3} color={color} />

      <Nucleus
        radius={config.nucleusRadius}
        showIndividual={config.showIndividualNucleons}
        protons={config.protons}
        color={color}
      />

      {config.subshells.map((subshell, i) => {
        const isValence = valenceIndices.has(i);
        const matchesFilter = viewMode.orbitalFilter === null || subshell.type === viewMode.orbitalFilter;
        const highlighted = (!viewMode.valenceOnly || isValence) && matchesFilter;
        const shellHidden = viewMode.orbitalFilter !== null && !matchesFilter;
        const shellDimmed = isAnyModeActive && !highlighted && !shellHidden;
        const shellShowUnfilled = viewMode.showUnfilled && highlighted && subshell.electronCount < subshell.maxElectrons;

        return (
          <ElectronShell
            key={`${subshell.n}-${subshell.type}`}
            subshell={subshell}
            index={i}
            color={color}
            totalSubshells={config.subshells.length}
            detailLevel={detailLevel}
            dimmed={shellDimmed}
            hidden={shellHidden}
            showUnfilled={shellShowUnfilled}
          />
        );
      })}

      <CategoryEffects
        effect={effect}
        color={color}
        nucleusRadius={config.nucleusRadius}
      />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={1.5}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={(3 * Math.PI) / 4}
      />

      <EffectComposer>
        <Bloom
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          intensity={1.5}
          mipmapBlur
        />
      </EffectComposer>
    </Canvas>
  );
}

const ORBITAL_TYPES: OrbitalType[] = ['s', 'p', 'd', 'f'];

function AtomControls({ element, viewMode, onViewModeChange }: {
  element: Element;
  viewMode: AtomViewMode;
  onViewModeChange: (mode: AtomViewMode) => void;
}) {
  const config = useMemo(() => getAtomConfig(element.atomicNumber), [element.atomicNumber]);
  const showUnfilledButton = hasUnfilledValence(config.subshells);
  const presentOrbitalTypes = useMemo(() => {
    const types = new Set(config.subshells.map(s => s.type));
    return ORBITAL_TYPES.filter(t => types.has(t));
  }, [config.subshells]);
  const catColor = categoryColors[element.category];

  return (
    <div className="atom-controls">
      <button
        className={`atom-controls__pill ${viewMode.valenceOnly ? 'atom-controls__pill--active' : ''}`}
        style={viewMode.valenceOnly ? { '--pill-color': catColor } as React.CSSProperties : undefined}
        onClick={() => {
          const next = !viewMode.valenceOnly;
          trackValenceToggle(element.symbol, element.atomicNumber, next);
          onViewModeChange({ ...viewMode, valenceOnly: next });
        }}
      >
        Valence
      </button>

      <div className="atom-controls__segment">
        {presentOrbitalTypes.map(t => (
          <button
            key={t}
            className={`atom-controls__pill atom-controls__pill--orbital ${viewMode.orbitalFilter === t ? 'atom-controls__pill--active' : ''}`}
            style={viewMode.orbitalFilter === t ? { '--pill-color': catColor } as React.CSSProperties : undefined}
            onClick={() => {
              const next = viewMode.orbitalFilter === t ? null : t;
              trackOrbitalFilter(element.symbol, element.atomicNumber, next);
              onViewModeChange({ ...viewMode, orbitalFilter: next });
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {showUnfilledButton && (
        <button
          className={`atom-controls__pill ${viewMode.showUnfilled ? 'atom-controls__pill--active' : ''}`}
          style={viewMode.showUnfilled ? { '--pill-color': catColor } as React.CSSProperties : undefined}
          onClick={() => {
            const next = !viewMode.showUnfilled;
            trackUnfilledToggle(element.symbol, element.atomicNumber, next);
            onViewModeChange({ ...viewMode, showUnfilled: next });
          }}
        >
          Unfilled
        </button>
      )}
    </div>
  );
}

export function AtomVisualizer({ element, viewMode = DEFAULT_VIEW_MODE, onViewModeChange }: AtomVisualizerProps) {
  return (
    <div className="atom-visualizer">
      <AtomScene element={element} viewMode={viewMode} />
      {onViewModeChange && (
        <AtomControls element={element} viewMode={viewMode} onViewModeChange={onViewModeChange} />
      )}
    </div>
  );
}
