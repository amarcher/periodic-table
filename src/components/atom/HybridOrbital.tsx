import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface HybridOrbitalProps {
  axis: [number, number, number];
  valenceRadius: number;
  color: string;
  electronCount: number;
  phaseOffset: number;
}

const LATHE_SEGMENTS = 32;
const LATHE_PROFILE_SAMPLES = 32;

/**
 * A single hybrid-orbital lobe (sp/sp²/sp³) rendered as a LatheGeometry teardrop.
 * The lobe axis determines lobe direction (unit vector in world space). Electrons
 * bob along the lobe's long axis — a kid-friendly density cue that avoids the
 * awkward figure-8 cusp of textbook p-orbital dumbbells while still reading as
 * "these electrons live along this axis."
 */
export function HybridOrbital({
  axis,
  valenceRadius,
  color,
  electronCount,
  phaseOffset,
}: HybridOrbitalProps) {
  const length = 1.4 * valenceRadius;
  const amplitude = 0.35 * valenceRadius;

  const axisVec = useMemo(
    () => new THREE.Vector3(axis[0], axis[1], axis[2]).normalize(),
    [axis]
  );

  // Rotate default lathe axis (+Y) onto the target lobe direction
  const quaternion = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), axisVec);
    return q;
  }, [axisVec]);

  const lobeGeometry = useMemo(() => {
    const points: THREE.Vector2[] = [];
    for (let i = 0; i <= LATHE_PROFILE_SAMPLES; i++) {
      const s = i / LATHE_PROFILE_SAMPLES;
      const h = s * length;
      // Asymmetric teardrop: peak near s=0.4, tapers to zero at both ends.
      // 0.001 clamp prevents degenerate triangles at the tips.
      const width = Math.max(amplitude * Math.sin(Math.PI * s) * (1 - 0.3 * s), 0.001);
      points.push(new THREE.Vector2(width, h));
    }
    return new THREE.LatheGeometry(points, LATHE_SEGMENTS);
  }, [length, amplitude]);

  const lobeMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color,
      emissive: new THREE.Color(color),
      emissiveIntensity: 1.2,
      transparent: true,
      opacity: 0.32,
      roughness: 0.4,
      toneMapped: false,
      side: THREE.DoubleSide,
    });
  }, [color]);

  const electronGroupRefs = useRef<(THREE.Group | null)[]>([]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    for (let e = 0; e < electronCount; e++) {
      const ref = electronGroupRefs.current[e];
      if (!ref) continue;
      // Paired electrons (when electronCount=2) bob 180° out of phase so they
      // never overlap.
      const phase = t * 1.2 + phaseOffset + e * Math.PI;
      const h = length * (0.55 + 0.35 * Math.sin(phase));
      ref.position.set(0, h, 0);
    }
  });

  return (
    <group quaternion={quaternion}>
      <mesh geometry={lobeGeometry} material={lobeMaterial} />
      {Array.from({ length: electronCount }).map((_, i) => (
        <group
          key={i}
          ref={(el) => {
            electronGroupRefs.current[i] = el;
          }}
        >
          <mesh>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial
              color="white"
              emissive="white"
              emissiveIntensity={3}
              toneMapped={false}
            />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.28, 12, 12]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.22}
              toneMapped={false}
              side={THREE.BackSide}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
