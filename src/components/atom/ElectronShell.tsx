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
        const r = radius * Math.cos(t);
        points.push(new THREE.Vector3(r * Math.cos(t), 0, r * Math.sin(t)));
      }
      break;
    case 'd':
      for (let i = 0; i <= segments; i++) {
        const t = (i / segments) * Math.PI * 2;
        const r = radius * Math.abs(Math.cos(2 * t));
        points.push(new THREE.Vector3(r * Math.cos(t), 0, r * Math.sin(t)));
      }
      break;
    case 'f':
      for (let i = 0; i <= segments; i++) {
        const t = (i / segments) * Math.PI * 2;
        const r = radius * Math.abs(Math.cos(3 * t));
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
    case 'p': { const r = radius * Math.cos(t); return new THREE.Vector3(r * Math.cos(t), 0, r * Math.sin(t)); }
    case 'd': { const r = radius * Math.abs(Math.cos(2 * t)); return new THREE.Vector3(r * Math.cos(t), 0, r * Math.sin(t)); }
    case 'f': { const r = radius * Math.abs(Math.cos(3 * t)); return new THREE.Vector3(r * Math.cos(t), 0, r * Math.sin(t)); }
    default: return new THREE.Vector3(0, 0, 0);
  }
}

/** Glowing electron orb — forwardRef so parent can animate position */
const ElectronOrb = forwardRef<THREE.Group, { color: string }>(
  function ElectronOrb({ color }, ref) {
    return (
      <group ref={ref}>
        <mesh>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshStandardMaterial
            color="white"
            emissive="white"
            emissiveIntensity={3}
            toneMapped={false}
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.18, 10, 10]} />
          <meshBasicMaterial color={color} transparent opacity={0.25} toneMapped={false} />
        </mesh>
      </group>
    );
  }
);

/** Electron with trail wrapper */
function TrackedElectron({ color, onRef, idx }: { color: string; onRef: (idx: number, el: THREE.Group | null) => void; idx: number }) {
  const ref = useCallback((el: THREE.Group | null) => { onRef(idx, el); }, [onRef, idx]);
  return (
    <Trail width={0.4} length={6} decay={1.2} color={color} attenuation={(w: number) => w * w}>
      <ElectronOrb ref={ref} color={color} />
    </Trail>
  );
}

/** Electron without trail */
function PlainElectron({ color, onRef, idx }: { color: string; onRef: (idx: number, el: THREE.Group | null) => void; idx: number }) {
  const ref = useCallback((el: THREE.Group | null) => { onRef(idx, el); }, [onRef, idx]);
  return <ElectronOrb ref={ref} color={color} />;
}

export function ElectronShell({ subshell, index, color, totalSubshells, detailLevel }: ElectronShellProps) {
  const electronRefs = useRef<(THREE.Group | null)[]>([]);

  const orientations = useMemo(() => getOrientations(subshell.type), [subshell.type]);

  const electronsPerOrientation = useMemo(() => {
    const result: number[] = new Array(orientations.length).fill(0);
    for (let i = 0; i < subshell.electronCount; i++) {
      result[i % orientations.length]++;
    }
    return result;
  }, [subshell.electronCount, orientations.length]);

  const tubeSegments = detailLevel === 'high' ? 64 : detailLevel === 'medium' ? 48 : 32;

  const orbitalTubes = useMemo(() => {
    return orientations.map((rotation) => {
      const pathPoints = generateOrbitalPath(subshell.type, subshell.radius, 128);
      const curve = new THREE.CatmullRomCurve3(pathPoints, true);
      const tubeGeo = new THREE.TubeGeometry(curve, tubeSegments, 0.025, 6, true);
      const tubeMat = new THREE.MeshStandardMaterial({
        color,
        emissive: new THREE.Color(color),
        emissiveIntensity: 0.8,
        transparent: true,
        opacity: 0.35,
        toneMapped: false,
        roughness: 0.5,
      });
      const mesh = new THREE.Mesh(tubeGeo, tubeMat);
      mesh.rotation.set(rotation[0], rotation[1], rotation[2]);
      return mesh;
    });
  }, [subshell.type, subshell.radius, color, orientations, tubeSegments]);

  const shouldUseTrail = useMemo(() => {
    if (detailLevel === 'high') return true;
    if (detailLevel === 'medium') return index >= totalSubshells - 2;
    return index >= totalSubshells - 1;
  }, [detailLevel, index, totalSubshells]);

  const speed = Math.max(0.6 - index * 0.03, 0.15);

  const quaternions = useMemo(() => {
    return orientations.map((rotation) => {
      const euler = new THREE.Euler(rotation[0], rotation[1], rotation[2]);
      return new THREE.Quaternion().setFromEuler(euler);
    });
  }, [orientations]);

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed;
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
  });

  const displayCount = Math.min(
    subshell.electronCount,
    subshell.type === 's' ? 2 : subshell.type === 'p' ? 6 : 8
  );

  const handleRef = useCallback((idx: number, el: THREE.Group | null) => {
    electronRefs.current[idx] = el;
  }, []);

  const ElectronComponent = shouldUseTrail ? TrackedElectron : PlainElectron;

  return (
    <group>
      {orbitalTubes.map((tube, i) => (
        <primitive key={i} object={tube} />
      ))}
      {Array.from({ length: displayCount }).map((_, i) => (
        <ElectronComponent key={i} idx={i} color={color} onRef={handleRef} />
      ))}
    </group>
  );
}
