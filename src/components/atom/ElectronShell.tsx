import { useRef, useMemo, forwardRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Trail } from '@react-three/drei';
import * as THREE from 'three';
import type { SubshellConfig, DetailLevel } from './atomConfig';

interface ElectronShellProps {
  subshell: SubshellConfig;
  index: number;
  color: string;
  totalSubshells: number;
  detailLevel: DetailLevel;
  dimmed?: boolean;
  hidden?: boolean;
  showUnfilled?: boolean;
}

function smoothRadial(value: number, exponent = 0.7, minFraction = 0.12): number {
  const smoothed = Math.sign(value) * Math.pow(Math.abs(value), exponent);
  if (Math.abs(smoothed) < minFraction) {
    return Math.sign(smoothed || 1) * minFraction;
  }
  return smoothed;
}

function generateOrbitalPath(type: string, radius: number, segments: number): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  switch (type) {
    case 's':
      for (let i = 0; i <= segments; i++) {
        const t = (i / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(t) * radius, 0, Math.sin(t) * radius));
      }
      break;
    case 'p':
      for (let i = 0; i <= segments; i++) {
        const t = (i / segments) * Math.PI * 2;
        const r = radius * smoothRadial(Math.cos(t), 0.45, 0.20);
        points.push(new THREE.Vector3(r * Math.cos(t), 0, r * Math.sin(t)));
      }
      break;
    case 'd':
      for (let i = 0; i <= segments; i++) {
        const t = (i / segments) * Math.PI * 2;
        const r = radius * smoothRadial(Math.abs(Math.cos(2 * t)), 0.4, 0.22);
        points.push(new THREE.Vector3(r * Math.cos(t), 0, r * Math.sin(t)));
      }
      break;
    case 'f':
      for (let i = 0; i <= segments; i++) {
        const t = (i / segments) * Math.PI * 2;
        const r = radius * smoothRadial(Math.abs(Math.cos(3 * t)), 0.35, 0.25);
        points.push(new THREE.Vector3(r * Math.cos(t), 0, r * Math.sin(t)));
      }
      break;
  }
  return points;
}

function getOrientations(type: string): [number, number, number][] {
  switch (type) {
    case 's': return [[0, 0, 0]];
    case 'p': return [[0, 0, 0], [Math.PI / 2, 0, 0], [0, 0, Math.PI / 2]];
    case 'd': return [
      [0, 0, 0], [Math.PI / 2, 0, 0], [0, 0, Math.PI / 2],
      [Math.PI / 4, 0, Math.PI / 4], [Math.PI / 4, Math.PI / 4, 0],
    ];
    case 'f': return [
      [0, 0, 0], [Math.PI / 2, 0, 0], [0, 0, Math.PI / 2],
      [Math.PI / 3, 0, Math.PI / 3], [Math.PI / 3, Math.PI / 3, 0],
      [0, Math.PI / 3, Math.PI / 3], [Math.PI / 4, Math.PI / 4, Math.PI / 4],
    ];
    default: return [[0, 0, 0]];
  }
}

function getPointOnOrbital(type: string, radius: number, t: number): THREE.Vector3 {
  switch (type) {
    case 's': return new THREE.Vector3(Math.cos(t) * radius, 0, Math.sin(t) * radius);
    case 'p': { const r = radius * smoothRadial(Math.cos(t), 0.45, 0.20); return new THREE.Vector3(r * Math.cos(t), 0, r * Math.sin(t)); }
    case 'd': { const r = radius * smoothRadial(Math.abs(Math.cos(2 * t)), 0.4, 0.22); return new THREE.Vector3(r * Math.cos(t), 0, r * Math.sin(t)); }
    case 'f': { const r = radius * smoothRadial(Math.abs(Math.cos(3 * t)), 0.35, 0.25); return new THREE.Vector3(r * Math.cos(t), 0, r * Math.sin(t)); }
    default: return new THREE.Vector3(0, 0, 0);
  }
}

/** Glowing electron orb — forwardRef so parent can animate position */
const ElectronOrb = forwardRef<THREE.Group, { color: string; opacity?: number }>(
  function ElectronOrb({ color, opacity = 1 }, ref) {
    return (
      <group ref={ref}>
        <mesh>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshStandardMaterial
            color="white"
            emissive="white"
            emissiveIntensity={3 * opacity}
            transparent={opacity < 1}
            opacity={opacity}
            toneMapped={false}
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.18, 10, 10]} />
          <meshBasicMaterial color={color} transparent opacity={0.25 * opacity} toneMapped={false} />
        </mesh>
      </group>
    );
  }
);

/** Ghost electron — wireframe hollow orb for unfilled slots */
const GhostElectronOrb = forwardRef<THREE.Group, { color: string }>(
  function GhostElectronOrb({ color }, ref) {
    const matRef = useRef<THREE.MeshBasicMaterial>(null);

    useFrame((state) => {
      if (matRef.current) {
        matRef.current.opacity = 0.15 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      }
    });

    return (
      <group ref={ref}>
        <mesh>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshBasicMaterial
            ref={matRef}
            color={color}
            wireframe
            transparent
            opacity={0.25}
            toneMapped={false}
          />
        </mesh>
      </group>
    );
  }
);

/** Electron with trail wrapper */
function TrackedElectron({ color, onRef, idx, opacity }: { color: string; onRef: (idx: number, el: THREE.Group | null) => void; idx: number; opacity?: number }) {
  const ref = useCallback((el: THREE.Group | null) => { onRef(idx, el); }, [onRef, idx]);
  return (
    <Trail width={0.4} length={6} decay={1.2} color={color} attenuation={(w: number) => w * w}>
      <ElectronOrb ref={ref} color={color} opacity={opacity} />
    </Trail>
  );
}

/** Electron without trail */
function PlainElectron({ color, onRef, idx, opacity }: { color: string; onRef: (idx: number, el: THREE.Group | null) => void; idx: number; opacity?: number }) {
  const ref = useCallback((el: THREE.Group | null) => { onRef(idx, el); }, [onRef, idx]);
  return <ElectronOrb ref={ref} color={color} opacity={opacity} />;
}

/** Ghost electron (no trail) */
function GhostElectron({ color, onRef, idx }: { color: string; onRef: (idx: number, el: THREE.Group | null) => void; idx: number }) {
  const ref = useCallback((el: THREE.Group | null) => { onRef(idx, el); }, [onRef, idx]);
  return <GhostElectronOrb ref={ref} color={color} />;
}

export function ElectronShell({ subshell, index, color, totalSubshells, detailLevel, dimmed = false, hidden = false, showUnfilled = false }: ElectronShellProps) {
  const electronRefs = useRef<(THREE.Group | null)[]>([]);
  const ghostRefs = useRef<(THREE.Group | null)[]>([]);

  const orientations = useMemo(() => getOrientations(subshell.type), [subshell.type]);

  const electronsPerOrientation = useMemo(() => {
    const result: number[] = new Array(orientations.length).fill(0);
    for (let i = 0; i < subshell.electronCount; i++) {
      result[i % orientations.length]++;
    }
    return result;
  }, [subshell.electronCount, orientations.length]);

  const unfilledCount = showUnfilled ? subshell.maxElectrons - subshell.electronCount : 0;

  const ghostsPerOrientation = useMemo(() => {
    if (unfilledCount === 0) return [];
    const result: number[] = new Array(orientations.length).fill(0);
    for (let i = 0; i < unfilledCount; i++) {
      result[i % orientations.length]++;
    }
    return result;
  }, [unfilledCount, orientations.length]);

  // Visual parameters based on dimmed state
  const tubeOpacity = dimmed ? 0.08 : 0.35;
  const tubeEmissive = dimmed ? 0.2 : 0.8;
  const electronOpacity = dimmed ? 0.15 : 1;

  const tubeSegments = detailLevel === 'high' ? 64 : detailLevel === 'medium' ? 48 : 32;

  const orbitalTubes = useMemo(() => {
    return orientations.map((rotation) => {
      const pathPoints = generateOrbitalPath(subshell.type, subshell.radius, 128);
      const curve = new THREE.CatmullRomCurve3(pathPoints, true);
      const tubeGeo = new THREE.TubeGeometry(curve, tubeSegments, 0.025, 6, true);
      const tubeMat = new THREE.MeshStandardMaterial({
        color,
        emissive: new THREE.Color(color),
        emissiveIntensity: tubeEmissive,
        transparent: true,
        opacity: tubeOpacity,
        toneMapped: false,
        roughness: 0.5,
      });
      const mesh = new THREE.Mesh(tubeGeo, tubeMat);
      mesh.rotation.set(rotation[0], rotation[1], rotation[2]);
      return mesh;
    });
  }, [subshell.type, subshell.radius, color, orientations, tubeSegments, tubeOpacity, tubeEmissive]);

  const shouldUseTrail = useMemo(() => {
    if (dimmed) return false;
    if (detailLevel === 'high') return true;
    if (detailLevel === 'medium') return index >= totalSubshells - 2;
    return index >= totalSubshells - 1;
  }, [detailLevel, index, totalSubshells, dimmed]);

  const speed = Math.max(0.6 - index * 0.03, 0.15);

  const quaternions = useMemo(() => {
    return orientations.map((rotation) => {
      const euler = new THREE.Euler(rotation[0], rotation[1], rotation[2]);
      return new THREE.Quaternion().setFromEuler(euler);
    });
  }, [orientations]);

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed;

    // Animate real electrons
    let childIdx = 0;
    for (let o = 0; o < orientations.length; o++) {
      const count = electronsPerOrientation[o];
      const quat = quaternions[o];
      for (let e = 0; e < count; e++) {
        const ref = electronRefs.current[childIdx];
        if (ref) {
          const phase = t + (e / count) * Math.PI * 2 + o * 1.3;
          const pathPos = getPointOnOrbital(subshell.type, subshell.radius, phase);
          pathPos.applyQuaternion(quat);
          ref.position.copy(pathPos);
        }
        childIdx++;
      }
    }

    // Animate ghost electrons
    if (unfilledCount > 0 && ghostsPerOrientation.length > 0) {
      let ghostIdx = 0;
      for (let o = 0; o < orientations.length; o++) {
        const realCount = electronsPerOrientation[o];
        const ghostCount = ghostsPerOrientation[o];
        const quat = quaternions[o];
        const totalInOrientation = realCount + ghostCount;
        for (let e = 0; e < ghostCount; e++) {
          const ref = ghostRefs.current[ghostIdx];
          if (ref) {
            // Offset ghosts to interleave with real electrons
            const phase = t + ((realCount + e) / totalInOrientation) * Math.PI * 2 + o * 1.3;
            const pathPos = getPointOnOrbital(subshell.type, subshell.radius, phase);
            pathPos.applyQuaternion(quat);
            ref.position.copy(pathPos);
          }
          ghostIdx++;
        }
      }
    }
  });

  const displayCount = Math.min(
    subshell.electronCount,
    subshell.type === 's' ? 2 : subshell.type === 'p' ? 6 : 8
  );

  const handleRef = useCallback((idx: number, el: THREE.Group | null) => {
    electronRefs.current[idx] = el;
  }, []);

  const handleGhostRef = useCallback((idx: number, el: THREE.Group | null) => {
    ghostRefs.current[idx] = el;
  }, []);

  const ElectronComponent = shouldUseTrail ? TrackedElectron : PlainElectron;

  if (hidden) return null;

  return (
    <group>
      {orbitalTubes.map((tube, i) => (
        <primitive key={i} object={tube} />
      ))}
      {Array.from({ length: displayCount }).map((_, i) => (
        <ElectronComponent key={i} idx={i} color={color} onRef={handleRef} opacity={electronOpacity} />
      ))}
      {unfilledCount > 0 && Array.from({ length: unfilledCount }).map((_, i) => (
        <GhostElectron key={`ghost-${i}`} idx={i} color={color} onRef={handleGhostRef} />
      ))}
    </group>
  );
}
