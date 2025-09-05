import { Billboard, Stars } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { PerspectiveCamera } from "three";

type Props = {
  progress: number; // 0 → 1
};

export default function Hyperspace({ progress }: Props) {
  const { camera } = useThree();
  const baseFovRef = useRef<number>(50);
  const init = useRef(false);
  const streaksRef = useRef<THREE.InstancedMesh>(null);
  const params = useRef({ range: 140, speed: 0 });

  // Precompute streak positions (cylindrical distribution)
  const { positions, scales } = useMemo(() => {
    const COUNT = 1200;
    const pos = new Float32Array(COUNT * 3);
    const scl = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      const r = 0.6 + Math.random() * 7.5; // radius from center
      const a = Math.random() * Math.PI * 2; // around screen
      const z = -Math.random() * 140; // depth ahead of camera
      // Distribute around the whole screen so streaks appear top/bottom/left/right
      pos[i * 3 + 0] = Math.cos(a) * r;          // x ring
      pos[i * 3 + 1] = Math.sin(a) * r * 0.6;    // y ring (slightly squashed)
      pos[i * 3 + 2] = z;
      scl[i] = 0.7 + Math.random() * 1.6; // base length scale
    }
    return { positions: pos, scales: scl };
  }, []);

  useFrame(() => {
    if (!("isPerspectiveCamera" in camera)) return;
    const pcam = camera as PerspectiveCamera;
    if (!pcam.isPerspectiveCamera) return;
    if (!init.current) {
      baseFovRef.current = pcam.fov;
      init.current = true;
    }

    // smootherstep for general easing
    const t = progress;
    const e = t * t * t * (t * (t * 6 - 15) + 10);
    const base = baseFovRef.current;
    const peak = 110;
    const fov = e < 0.5
      ? base + (peak - base) * (e / 0.5)
      : peak - (peak - base) * ((e - 0.5) / 0.5);
    pcam.fov = fov;
    pcam.updateProjectionMatrix();

    const zPunch = 0.6;
    const dir = e < 0.5 ? (e / 0.5) : 1 - (e - 0.5) / 0.5;
    pcam.position.z = 4 - zPunch * dir;

    // Animate streaks speed with accelerated start, slight coast, and eased decel
    const clamp01 = (v: number) => THREE.MathUtils.clamp(v, 0, 1);
    const easeInCubic = (v: number) => v * v * v;
    const easeInQuint = (v: number) => v * v * v * v * v;
    let speedScale = 1;
    if (t < 0.4) {
      // ramp in quickly at start
      speedScale = easeInCubic(clamp01(t / 0.4));
    } else if (t < 0.7) {
      // cruise
      speedScale = 1;
    } else {
      // longer, stronger slow-down toward the end
      const dt = clamp01((t - 0.7) / 0.3);
      speedScale = 1 - easeInQuint(dt);
    }
    params.current.speed = THREE.MathUtils.lerp(6, 120, speedScale);
    const range = params.current.range;
    const speed = params.current.speed * (1 / 60);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();
    const v = new THREE.Vector3();
    if (streaksRef.current) {
      const mesh = streaksRef.current;
      const COUNT = scales.length;
      for (let i = 0; i < COUNT; i++) {
        const ix = i * 3;
        const x = positions[ix + 0];
        const y = positions[ix + 1];
        let z = positions[ix + 2] + speed; // move towards camera
        if (z > 5) z -= range; // loop back
        positions[ix + 2] = z;
        // Elongated quad oriented along -Z (towards camera)
        v.set(x, y, z);
        q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, -1).normalize());
        const lengthScale = THREE.MathUtils.lerp(0.12, 1.9, speedScale);
        s.set(0.02, 2.2 * scales[i] * lengthScale, 0.02);
        m.compose(v, q, s);
        mesh.setMatrixAt(i, m);
      }
      mesh.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Faint stars still visible at start */}
      <Stars radius={200} depth={100} count={4000} factor={2} fade speed={1.5} />

      {/* Streaks */}
      <instancedMesh ref={streaksRef} args={[undefined as unknown as THREE.BufferGeometry, undefined as unknown as THREE.Material, scales.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#d7eeff" transparent opacity={THREE.MathUtils.clamp(progress * 1.4, 0, 1)} blending={THREE.AdditiveBlending} depthWrite={false} />
      </instancedMesh>

      {/* Core white glow that blooms out at entry */}
      <Billboard position={[0, 1.2, -2]}> 
        <mesh>
          <circleGeometry args={[0.6, 48]} />
          <meshBasicMaterial color="white" transparent opacity={THREE.MathUtils.clamp(progress * 1.6, 0, 1)} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      </Billboard>
    </group>
  );
}
