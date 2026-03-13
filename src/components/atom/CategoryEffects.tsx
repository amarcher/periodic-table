import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import type { CategoryEffect } from './atomConfig';

interface CategoryEffectsProps {
  effect: CategoryEffect;
  color: string;
  nucleusRadius: number;
}

function Aura({ color, nucleusRadius }: { color: string; nucleusRadius: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.1;
      ref.current.scale.setScalar(scale);
    }
  });
  return (
    <group>
      <mesh ref={ref}>
        <sphereGeometry args={[nucleusRadius * 3, 32, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
      <Sparkles
        count={30}
        scale={nucleusRadius * 6}
        size={2}
        speed={0.4}
        color={color}
        opacity={0.6}
      />
    </group>
  );
}

function Sparks({ color, nucleusRadius }: { color: string; nucleusRadius: number }) {
  return (
    <Sparkles
      count={40}
      scale={nucleusRadius * 5}
      size={4}
      speed={1.5}
      color={color}
      noise={1}
      opacity={0.8}
    />
  );
}

function Pulse({ color, nucleusRadius }: { color: string; nucleusRadius: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const emissiveColor = useMemo(() => new THREE.Color(color), [color]);
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime * 2;
      const pulse = 1 + Math.sin(t) * 0.3;
      ref.current.scale.setScalar(pulse);
      const mat = ref.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.3 + Math.sin(t) * 0.35;
      mat.opacity = 0.12 - Math.sin(t) * 0.06;
    }
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[nucleusRadius * 2, 32, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={emissiveColor}
        emissiveIntensity={0.5}
        transparent
        opacity={0.1}
        toneMapped={false}
      />
    </mesh>
  );
}

function Metallic({ color, nucleusRadius }: { color: string; nucleusRadius: number }) {
  const emissive = useMemo(() => new THREE.Color(color), [color]);
  return (
    <mesh>
      <sphereGeometry args={[nucleusRadius * 1.05, 32, 32]} />
      <meshStandardMaterial
        color="#aabbcc"
        metalness={0.95}
        roughness={0.05}
        emissive={emissive}
        emissiveIntensity={0.3}
        toneMapped={false}
      />
    </mesh>
  );
}

function Shimmer({ color, nucleusRadius }: { color: string; nucleusRadius: number }) {
  return (
    <Sparkles
      count={15}
      scale={nucleusRadius * 4}
      size={1.5}
      speed={0.3}
      color={color}
      opacity={0.5}
    />
  );
}

export function CategoryEffects({ effect, color, nucleusRadius }: CategoryEffectsProps) {
  switch (effect) {
    case 'aura':
      return <Aura color={color} nucleusRadius={nucleusRadius} />;
    case 'sparks':
      return <Sparks color={color} nucleusRadius={nucleusRadius} />;
    case 'pulse':
      return <Pulse color={color} nucleusRadius={nucleusRadius} />;
    case 'metallic':
      return <Metallic color={color} nucleusRadius={nucleusRadius} />;
    case 'shimmer':
      return <Shimmer color={color} nucleusRadius={nucleusRadius} />;
    case 'none':
      return null;
  }
}
