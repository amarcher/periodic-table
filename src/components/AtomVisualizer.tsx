import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerformanceMonitor } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import type { Element } from '../types/element';
import { categoryColors } from '../utils/colors';
import {
  getAtomConfig, getCategoryEffect, getDetailLevel, getValenceIndices, hasUnfilledValence,
  getValenceBoundingRadius,
  getHybridAxes, distributeHybridElectrons, getValenceElectronCount,
  HYBRIDIZABLE,
  DEFAULT_VIEW_MODE,
  type AtomViewMode, type OrbitalType, type Hybridization,
} from './atom/atomConfig';
import { Nucleus } from './atom/Nucleus';
import { ElectronShell } from './atom/ElectronShell';
import { HybridOrbital } from './atom/HybridOrbital';
import { CategoryEffects } from './atom/CategoryEffects';
import { trackValenceToggle, trackOrbitalFilter, trackUnfilledToggle, trackHybridization } from '../utils/analytics';
import './AtomVisualizer.css';
import { useMediaVisible } from '../hooks/useDisplayPreferences';
import { trackDiagnostic } from '../utils/analytics';

interface AtomVisualizerProps {
  element: Element;
  viewMode?: AtomViewMode;
  onViewModeChange?: (mode: AtomViewMode) => void;
  onContextLost: () => void;
}

/**
 * OrbitControls with auto-rotate + a dolly-in/out lerp when `valenceOnly`
 * toggles. Lerp scales the camera's orbit vector so auto-rotate keeps working.
 */
function AtomCameraRig({
  valenceOnly,
  valenceRadius,
  fullCameraZ,
}: {
  valenceOnly: boolean;
  valenceRadius: number;
  fullCameraZ: number;
}) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const invalidate = useThree((s) => s.invalidate);

  const valenceCameraZ = useMemo(() => {
    const fov = (camera.fov * Math.PI) / 180;
    return (valenceRadius / Math.tan(fov / 2)) * 1.3;
  }, [valenceRadius, camera.fov]);

  // After mount, rAF often hasn't fired during the clip-path view transition;
  // nudge the render loop so the first frame actually paints.
  useEffect(() => {
    const id = requestAnimationFrame(() => invalidate());
    return () => cancelAnimationFrame(id);
  }, [invalidate, fullCameraZ]);

  useFrame((_, delta) => {
    const targetDist = valenceOnly ? valenceCameraZ : fullCameraZ;
    const currentDist = camera.position.length();
    if (currentDist < 0.001) return;
    if (Math.abs(currentDist - targetDist) < 0.01) return;
    const t = 1 - Math.exp(-delta / 0.7);
    const next = currentDist + (targetDist - currentDist) * t;
    camera.position.multiplyScalar(next / currentDist);
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableZoom={false}
      enablePan={false}
      autoRotate
      autoRotateSpeed={1.5}
      minPolarAngle={Math.PI / 4}
      maxPolarAngle={(3 * Math.PI) / 4}
    />
  );
}

/**
 * Renders a hybridization view: several teardrop lobes arranged along the
 * geometric axes for sp/sp²/sp³, with electrons distributed by Hund's rule.
 * Replaces the element's valence shell rendering when active.
 */
function HybridView({
  mode,
  element,
  valenceRadius,
  color,
}: {
  mode: Hybridization;
  element: Element;
  valenceRadius: number;
  color: string;
}) {
  const axes = useMemo(() => getHybridAxes(mode), [mode]);
  const config = useMemo(() => getAtomConfig(element.atomicNumber), [element.atomicNumber]);
  const valenceElectrons = useMemo(
    () => getValenceElectronCount(config.subshells),
    [config.subshells]
  );
  const nOrbitals = axes.hybrid.length + axes.pPairs.length;
  const electronsPerOrbital = useMemo(
    () => distributeHybridElectrons(valenceElectrons, nOrbitals),
    [valenceElectrons, nOrbitals]
  );

  return (
    <>
      {axes.hybrid.map((axis, i) => (
        <HybridOrbital
          key={`h${i}`}
          axis={axis}
          valenceRadius={valenceRadius}
          color={color}
          electronCount={electronsPerOrbital[i]}
          phaseOffset={(i * Math.PI) / 2}
        />
      ))}
      {axes.pPairs.map((pair, i) => {
        const orbIdx = axes.hybrid.length + i;
        const totalInP = electronsPerOrbital[orbIdx];
        // Split the p-orbital's electrons between its two opposing lobes
        const firstLobe = totalInP >= 1 ? 1 : 0;
        const secondLobe = totalInP >= 2 ? 1 : 0;
        return (
          <group key={`p${i}`}>
            <HybridOrbital
              axis={pair[0]}
              valenceRadius={valenceRadius}
              color={color}
              electronCount={firstLobe}
              phaseOffset={(orbIdx * Math.PI) / 2}
            />
            <HybridOrbital
              axis={pair[1]}
              valenceRadius={valenceRadius}
              color={color}
              electronCount={secondLobe}
              phaseOffset={(orbIdx * Math.PI) / 2 + Math.PI}
            />
          </group>
        );
      })}
    </>
  );
}

let reducedQuality = false;

function CanvasHealth({ onContextLost }: { onContextLost: () => void }) {
  const canvas = useThree(s => s.gl.domElement);
  useEffect(() => {
    canvas.addEventListener('webglcontextlost', onContextLost);
    return () => canvas.removeEventListener('webglcontextlost', onContextLost);
  }, [canvas, onContextLost]);
  return null;
}

function AtomScene({ element, viewMode, visible, onContextLost }: {
  element: Element; viewMode: AtomViewMode; visible: boolean; onContextLost: () => void;
}) {
  const [lowQuality, setLowQuality] = useState(() => reducedQuality ||
    navigator.hardwareConcurrency <= 4 || ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8) <= 4);
  const config = useMemo(() => getAtomConfig(element.atomicNumber), [element.atomicNumber]);
  const effect = useMemo(() => getCategoryEffect(element.category), [element.category]);
  const detailLevel = useMemo(() => getDetailLevel(element.atomicNumber), [element.atomicNumber]);
  const color = categoryColors[element.category];
  const valenceIndices = useMemo(() => getValenceIndices(config.subshells), [config.subshells]);

  const outermostRadius = useMemo(() => {
    return config.subshells.length > 0
      ? config.subshells[config.subshells.length - 1].radius
      : 2;
  }, [config.subshells]);

  const cameraZ = useMemo(() => outermostRadius * 2.2 + 3, [outermostRadius]);

  const valenceRadius = useMemo(
    () => getValenceBoundingRadius(config.subshells),
    [config.subshells]
  );

  // When hybridization is active, the element's top-n shell (2s+2p for C, etc.)
  // is replaced by hybrid lobes — don't render it through ElectronShell.
  const maxN = useMemo(() => {
    return config.subshells.length > 0
      ? Math.max(...config.subshells.map(s => s.n))
      : 0;
  }, [config.subshells]);

  const hybridActive = viewMode.hybridization !== null && HYBRIDIZABLE.has(element.atomicNumber);

  const isAnyModeActive = viewMode.valenceOnly || viewMode.orbitalFilter !== null || viewMode.showUnfilled;

  return (
    <Canvas
      camera={{ position: [0, 1, cameraZ], fov: 50 }}
      dpr={lowQuality ? 1 : [1, 1.5]}
      frameloop={visible ? 'always' : 'never'}
      gl={{
        antialias: true,
        alpha: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
      }}
      style={{ background: 'transparent' }}
    >
      <CanvasHealth onContextLost={onContextLost} />
      {!lowQuality && <PerformanceMonitor bounds={() => [30, 55]} onDecline={({ fps }) => {
        reducedQuality = true;
        setLowQuality(true);
        trackDiagnostic('atom_quality_reduced', { fps: Math.round(fps) });
      }} />}
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={0.6} />
      <pointLight position={[-10, -5, -10]} intensity={0.3} color={color} />

      <Nucleus
        radius={config.nucleusRadius}
        showIndividual={!lowQuality && config.showIndividualNucleons}
        protons={config.protons}
        color={color}
      />

      {config.subshells.map((subshell, i) => {
        const isValence = valenceIndices.has(i);
        const matchesFilter = viewMode.orbitalFilter === null || subshell.type === viewMode.orbitalFilter;
        const highlighted = (!viewMode.valenceOnly || isValence) && matchesFilter;
        const shellHidden =
          (viewMode.orbitalFilter !== null && !matchesFilter) ||
          (hybridActive && subshell.n === maxN);
        const shellDimmed = isAnyModeActive && !highlighted && !shellHidden;
        const shellShowUnfilled = viewMode.showUnfilled && highlighted && subshell.electronCount < subshell.maxElectrons;

        return (
          <ElectronShell
            key={`${subshell.n}-${subshell.type}`}
            subshell={subshell}
            index={i}
            color={color}
            totalSubshells={config.subshells.length}
            detailLevel={lowQuality ? 'low' : detailLevel}
            dimmed={shellDimmed}
            hidden={shellHidden}
            showUnfilled={shellShowUnfilled}
            isValence={isValence}
          />
        );
      })}

      {hybridActive && (
        <HybridView
          mode={viewMode.hybridization}
          element={element}
          valenceRadius={valenceRadius}
          color={color}
        />
      )}

      {!lowQuality && <CategoryEffects
        effect={effect}
        color={color}
        nucleusRadius={config.nucleusRadius}
      />}

      <AtomCameraRig
        valenceOnly={viewMode.valenceOnly}
        valenceRadius={valenceRadius}
        fullCameraZ={cameraZ}
      />

      {!lowQuality && <EffectComposer>
        <Bloom
          luminanceThreshold={0.15}
          luminanceSmoothing={0.9}
          intensity={1.8}
          mipmapBlur
        />
      </EffectComposer>}
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

      {HYBRIDIZABLE.has(element.atomicNumber) && (
        <div className="atom-controls__segment">
          {(['sp', 'sp2', 'sp3'] as const).map((mode) => {
            const label = mode === 'sp' ? 'sp' : mode === 'sp2' ? 'sp²' : 'sp³';
            const active = viewMode.hybridization === mode;
            return (
              <button
                key={mode}
                className={`atom-controls__pill atom-controls__pill--orbital ${active ? 'atom-controls__pill--active' : ''}`}
                style={active ? ({ '--pill-color': catColor } as React.CSSProperties) : undefined}
                onClick={() => {
                  const next: Hybridization = active ? null : mode;
                  trackHybridization(element.symbol, element.atomicNumber, next);
                  onViewModeChange({
                    ...viewMode,
                    hybridization: next,
                    orbitalFilter: next ? null : viewMode.orbitalFilter,
                  });
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function AtomVisualizer({ element, viewMode = DEFAULT_VIEW_MODE, onViewModeChange, onContextLost }: AtomVisualizerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useMediaVisible(ref);
  return (
    <div className="atom-visualizer" ref={ref}>
      <AtomScene element={element} viewMode={viewMode} visible={visible} onContextLost={onContextLost} />
      {onViewModeChange && (
        <AtomControls element={element} viewMode={viewMode} onViewModeChange={onViewModeChange} />
      )}
    </div>
  );
}
