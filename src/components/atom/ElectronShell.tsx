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
  isValence?: boolean;
}

// C1-continuous petal shape: never hits zero, no clamp discontinuity.
// cosVal is expected to be the cos(kt) or |cos(kt)| value driving the lobe peaks.
function petal(cosVal: number, exponent: number, floor: number): number {
  return floor + (1 - floor) * Math.pow(Math.abs(cosVal), exponent);
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
        const r = radius * petal(Math.cos(t), 0.8, 0.25);
        points.push(new THREE.Vector3(r * Math.cos(t), 0, r * Math.sin(t)));
      }
      break;
    case 'd':
      for (let i = 0; i <= segments; i++) {
        const t = (i / segments) * Math.PI * 2;
        const r = radius * petal(Math.cos(2 * t), 0.7, 0.28);
        points.push(new THREE.Vector3(r * Math.cos(t), 0, r * Math.sin(t)));
      }
      break;
    case 'f':
      for (let i = 0; i <= segments; i++) {
        const t = (i / segments) * Math.PI * 2;
        const r = radius * petal(Math.cos(3 * t), 0.6, 0.30);
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
    case 'p': { const r = radius * petal(Math.cos(t), 0.8, 0.25); return new THREE.Vector3(r * Math.cos(t), 0, r * Math.sin(t)); }
    case 'd': { const r = radius * petal(Math.cos(2 * t), 0.7, 0.28); return new THREE.Vector3(r * Math.cos(t), 0, r * Math.sin(t)); }
    case 'f': { const r = radius * petal(Math.cos(3 * t), 0.6, 0.30); return new THREE.Vector3(r * Math.cos(t), 0, r * Math.sin(t)); }
    default: return new THREE.Vector3(0, 0, 0);
  }
}

// Fresnel rim shader for the electron core. Rim glows in the element's category
// color; center reads as white-hot. Matches the solar-system project's aesthetic
// of relying on bloom + rim glow over flat emissive.
const ELECTRON_VERT = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vViewDir = normalize(-mvPosition.xyz);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const ELECTRON_FRAG = /* glsl */ `
  uniform vec3 uCore;
  uniform vec3 uRim;
  uniform float uOpacity;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    float fres = pow(1.0 - clamp(dot(vNormal, vViewDir), 0.0, 1.0), 2.5);
    vec3 col = mix(uCore, uRim, fres);
    col += uRim * fres * 1.5;
    gl_FragColor = vec4(col, uOpacity);
  }
`;

function useElectronRimMaterial(color: string, opacity: number): THREE.ShaderMaterial {
  return useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uCore: { value: new THREE.Color('white') },
        uRim: { value: new THREE.Color(color) },
        uOpacity: { value: opacity },
      },
      vertexShader: ELECTRON_VERT,
      fragmentShader: ELECTRON_FRAG,
      transparent: opacity < 1,
      toneMapped: false,
    });
  }, [color, opacity]);
}

/** Glowing electron orb — forwardRef so parent can animate position */
const ElectronOrb = forwardRef<
  THREE.Group,
  { color: string; opacity?: number; isValence?: boolean }
>(function ElectronOrb({ color, opacity = 1, isValence = false }, ref) {
  const rimMat = useElectronRimMaterial(color, opacity);
  // Valence electrons read bigger — visual hierarchy without a separate toggle
  const coreR = isValence ? 0.12 : 0.10;
  const haloR = isValence ? 0.28 : 0.22;
  return (
    <group ref={ref}>
      <mesh material={rimMat}>
        <sphereGeometry args={[coreR, 16, 16]} />
      </mesh>
      <mesh>
        <sphereGeometry args={[haloR, 12, 12]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.22 * opacity}
          toneMapped={false}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
});

/**
 * Static torus markers drawn at canonical empty-slot positions on each orbital
 * orientation. Each orientation holds two electrons (Hund/Pauli); slots sit at
 * the two lobe peaks (t=0 and t=π), so slot 0 is hidden when the orientation
 * has ≥1 real electron, slot 1 when it has 2. This replaces the old orbiting
 * ghost electrons, which read as "dim electrons" rather than "empty slots."
 */
function SlotMarkers({
  subshell,
  orientations,
  electronsPerOrientation,
  color,
  quaternions,
}: {
  subshell: SubshellConfig;
  orientations: [number, number, number][];
  electronsPerOrientation: number[];
  color: string;
  quaternions: THREE.Quaternion[];
}) {
  const slotGeometry = useMemo(() => new THREE.TorusGeometry(0.18, 0.015, 16, 48), []);

  const slotMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color,
      emissive: new THREE.Color(color),
      emissiveIntensity: 1.0,
      transparent: true,
      opacity: 0.55,
      toneMapped: false,
    });
  }, [color]);

  const markers = useMemo(() => {
    // Local tangent at t=0 on every orbital type is (0,0,+1); at t=π it is (0,0,-1).
    // (At lobe peaks, dr/dt = 0 because sin t = 0, so tangent is purely circumferential.)
    const zAxis = new THREE.Vector3(0, 0, 1);
    const results: { position: THREE.Vector3; quaternion: THREE.Quaternion }[] = [];
    for (let o = 0; o < orientations.length; o++) {
      const filled = electronsPerOrientation[o];
      const quat = quaternions[o];
      for (let s = 0; s < 2; s++) {
        if (s < filled) continue;
        const localPos = new THREE.Vector3(s === 0 ? subshell.radius : -subshell.radius, 0, 0);
        const localTangent = new THREE.Vector3(0, 0, s === 0 ? 1 : -1);
        localPos.applyQuaternion(quat);
        localTangent.applyQuaternion(quat).normalize();
        const torusQuat = new THREE.Quaternion().setFromUnitVectors(zAxis, localTangent);
        results.push({ position: localPos, quaternion: torusQuat });
      }
    }
    return results;
  }, [subshell.radius, orientations, electronsPerOrientation, quaternions]);

  useFrame((state) => {
    slotMaterial.opacity = 0.45 + Math.sin(state.clock.elapsedTime * 1.5) * 0.10;
  });

  if (markers.length === 0) return null;

  return (
    <group>
      {markers.map((m, i) => (
        <mesh
          key={i}
          position={m.position}
          quaternion={m.quaternion}
          geometry={slotGeometry}
          material={slotMaterial}
        />
      ))}
    </group>
  );
}

/** Electron with trail wrapper */
function TrackedElectron({ color, onRef, idx, opacity, isValence }: { color: string; onRef: (idx: number, el: THREE.Group | null) => void; idx: number; opacity?: number; isValence?: boolean }) {
  const ref = useCallback((el: THREE.Group | null) => { onRef(idx, el); }, [onRef, idx]);
  return (
    <Trail width={0.4} length={6} decay={1.2} color={color} attenuation={(w: number) => w * w}>
      <ElectronOrb ref={ref} color={color} opacity={opacity} isValence={isValence} />
    </Trail>
  );
}

/** Electron without trail */
function PlainElectron({ color, onRef, idx, opacity, isValence }: { color: string; onRef: (idx: number, el: THREE.Group | null) => void; idx: number; opacity?: number; isValence?: boolean }) {
  const ref = useCallback((el: THREE.Group | null) => { onRef(idx, el); }, [onRef, idx]);
  return <ElectronOrb ref={ref} color={color} opacity={opacity} isValence={isValence} />;
}

export function ElectronShell({ subshell, index, color, totalSubshells, detailLevel, dimmed = false, hidden = false, showUnfilled = false, isValence = false }: ElectronShellProps) {
  const electronRefs = useRef<(THREE.Group | null)[]>([]);

  const orientations = useMemo(() => getOrientations(subshell.type), [subshell.type]);

  const electronsPerOrientation = useMemo(() => {
    const result: number[] = new Array(orientations.length).fill(0);
    for (let i = 0; i < subshell.electronCount; i++) {
      result[i % orientations.length]++;
    }
    return result;
  }, [subshell.electronCount, orientations.length]);

  const unfilledCount = showUnfilled ? subshell.maxElectrons - subshell.electronCount : 0;

  // Visual parameters based on dimmed state
  const tubeOpacity = dimmed ? 0.08 : 0.35;
  const tubeEmissive = dimmed ? 0.2 : 0.8;
  const electronOpacity = dimmed ? 0.15 : 1;

  const tubeSegments = detailLevel === 'high' ? 128 : detailLevel === 'medium' ? 96 : 64;

  const orbitalTubes = useMemo(() => {
    return orientations.map((rotation) => {
      const pathPoints = generateOrbitalPath(subshell.type, subshell.radius, 192);
      const curve = new THREE.CatmullRomCurve3(pathPoints, true);
      const tubeGeo = new THREE.TubeGeometry(curve, tubeSegments, 0.025, 16, true);
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
    if (isValence) return true;
    if (detailLevel === 'high') return true;
    if (detailLevel === 'medium') return index >= totalSubshells - 2;
    return index >= totalSubshells - 1;
  }, [detailLevel, index, totalSubshells, dimmed, isValence]);

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
  });

  const displayCount = Math.min(
    subshell.electronCount,
    subshell.type === 's' ? 2 : subshell.type === 'p' ? 6 : 8
  );

  const handleRef = useCallback((idx: number, el: THREE.Group | null) => {
    electronRefs.current[idx] = el;
  }, []);

  const ElectronComponent = shouldUseTrail ? TrackedElectron : PlainElectron;

  if (hidden) return null;

  return (
    <group>
      {orbitalTubes.map((tube, i) => (
        <primitive key={i} object={tube} />
      ))}
      {Array.from({ length: displayCount }).map((_, i) => (
        <ElectronComponent key={i} idx={i} color={color} onRef={handleRef} opacity={electronOpacity} isValence={isValence} />
      ))}
      {unfilledCount > 0 && (
        <SlotMarkers
          subshell={subshell}
          orientations={orientations}
          electronsPerOrientation={electronsPerOrientation}
          color={color}
          quaternions={quaternions}
        />
      )}
    </group>
  );
}
