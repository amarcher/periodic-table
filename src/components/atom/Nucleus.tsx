import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface NucleusProps {
  radius: number;
  showIndividual: boolean;
  protons: number;
  color: string;
}

export function Nucleus({ radius, showIndividual, protons, color }: NucleusProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3;
    }
  });

  const nucleonPositions = useMemo(() => {
    if (!showIndividual) return [];
    const positions: [number, number, number][] = [];
    if (protons === 1) {
      positions.push([0, 0, 0]);
    } else if (protons === 2) {
      positions.push([-0.15, 0, 0], [0.15, 0, 0]);
    } else if (protons === 3) {
      positions.push([0, 0.18, 0], [-0.15, -0.09, 0], [0.15, -0.09, 0]);
    } else {
      positions.push([0, 0.18, 0.1], [-0.15, -0.09, -0.1], [0.15, -0.09, -0.1], [0, 0, 0.2]);
    }
    return positions;
  }, [protons, showIndividual]);

  if (showIndividual) {
    return (
      <group ref={groupRef}>
        {nucleonPositions.map((pos, i) => (
          <mesh key={i} position={pos}>
            <sphereGeometry args={[0.18, 16, 16]} />
            <MeshDistortMaterial
              color={color}
              emissive={color}
              emissiveIntensity={1.8}
              roughness={0.3}
              distort={0.15}
              speed={2}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>
    );
  }

  return (
    <group ref={groupRef}>
      {/* Core sphere with organic distortion */}
      <mesh>
        <sphereGeometry args={[radius, 32, 32]} />
        <MeshDistortMaterial
          color={color}
          emissive={color}
          emissiveIntensity={2.5}
          roughness={0.2}
          metalness={0.1}
          distort={0.3}
          speed={2}
          toneMapped={false}
        />
      </mesh>

      {/* Inner glow layer */}
      <mesh>
        <sphereGeometry args={[radius * 1.4, 32, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.15}
          side={THREE.BackSide}
          toneMapped={false}
        />
      </mesh>

      {/* Outer ambient glow */}
      <mesh>
        <sphereGeometry args={[radius * 2.0, 32, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.06}
          side={THREE.BackSide}
          toneMapped={false}
        />
      </mesh>

      {/* Point light from nucleus center */}
      <pointLight color={color} intensity={0.5} distance={12} />
    </group>
  );
}
