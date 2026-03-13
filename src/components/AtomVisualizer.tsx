import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import type { Element } from '../types/element';
import { categoryColors } from '../utils/colors';
import { getAtomConfig, getCategoryEffect, getDetailLevel } from './atom/atomConfig';
import { Nucleus } from './atom/Nucleus';
import { ElectronShell } from './atom/ElectronShell';
import { CategoryEffects } from './atom/CategoryEffects';
import './AtomVisualizer.css';

interface AtomVisualizerProps {
  element: Element;
}

function AtomScene({ element }: { element: Element }) {
  const config = useMemo(() => getAtomConfig(element.atomicNumber), [element.atomicNumber]);
  const effect = useMemo(() => getCategoryEffect(element.category), [element.category]);
  const detailLevel = useMemo(() => getDetailLevel(element.atomicNumber), [element.atomicNumber]);
  const color = categoryColors[element.category];

  const cameraZ = useMemo(() => {
    const maxRadius = config.subshells.length > 0
      ? config.subshells[config.subshells.length - 1].radius
      : 2;
    return maxRadius * 2.2 + 3;
  }, [config.subshells]);

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

      {config.subshells.map((subshell, i) => (
        <ElectronShell
          key={`${subshell.n}-${subshell.type}`}
          subshell={subshell}
          index={i}
          color={color}
          totalSubshells={config.subshells.length}
          detailLevel={detailLevel}
        />
      ))}

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

export function AtomVisualizer({ element }: AtomVisualizerProps) {
  return (
    <div className="atom-visualizer">
      <AtomScene element={element} />
    </div>
  );
}
