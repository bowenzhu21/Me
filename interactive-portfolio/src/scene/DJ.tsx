import { Environment, OrbitControls, Html, MeshReflectorMaterial, GradientTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { Portal } from "./Portals";
import { useWorld } from "../state/useWorld";

function Silhouette({ position = [0, 0.6, -0.4] as [number, number, number] }) {
  const color = "#02030a";
  return (
    <group position={position}>
      {/* Torso */}
      <mesh position={[0, 0.35, 0]}>
        <capsuleGeometry args={[0.22, 0.6, 8, 16]} />
        <meshStandardMaterial color={color} roughness={1} metalness={0} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.95, 0]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color={color} roughness={1} metalness={0} />
      </mesh>
      {/* Arms */}
      <mesh position={[-0.38, 0.4, 0]} rotation={[0, 0, Math.PI / 7]}>
        <cylinderGeometry args={[0.08, 0.08, 0.7, 12]} />
        <meshStandardMaterial color={color} roughness={1} metalness={0} />
      </mesh>
      <mesh position={[0.38, 0.4, 0]} rotation={[0, 0, -Math.PI / 7]}>
        <cylinderGeometry args={[0.08, 0.08, 0.7, 12]} />
        <meshStandardMaterial color={color} roughness={1} metalness={0} />
      </mesh>
    </group>
  );
}

function DJBooth({ position = [0, 0, 0] as [number, number, number] }) {
  return (
    <group position={position}>
      {/* Table */}
      <mesh position={[0, 0.1, -0.4]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 0.4, 1.2]} />
        <meshStandardMaterial color="#0a0f18" roughness={0.9} metalness={0.1} />
      </mesh>
      {/* Face panel glow */}
      <mesh position={[0, 0.25, -0.01]}>
        <boxGeometry args={[3.18, 0.18, 0.02]} />
        <meshBasicMaterial color="#13315c" transparent opacity={0.35} />
      </mesh>
      {/* Left deck */}
      <mesh position={[-0.9, 0.34, -0.4]}>
        <cylinderGeometry args={[0.32, 0.32, 0.06, 24]} />
        <meshStandardMaterial color="#1b263b" roughness={0.6} metalness={0.3} />
      </mesh>
      {/* Right deck */}
      <mesh position={[0.9, 0.34, -0.4]}>
        <cylinderGeometry args={[0.32, 0.32, 0.06, 24]} />
        <meshStandardMaterial color="#1b263b" roughness={0.6} metalness={0.3} />
      </mesh>
      {/* Mixer */}
      <mesh position={[0, 0.33, -0.4]}>
        <boxGeometry args={[0.9, 0.08, 0.5]} />
        <meshStandardMaterial color="#14213d" roughness={0.8} metalness={0.2} />
      </mesh>
    </group>
  );
}

function MovingLights() {
  const left = useRef<THREE.SpotLight>(null);
  const right = useRef<THREE.SpotLight>(null);
  const back = useRef<THREE.SpotLight>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (left.current) {
      left.current.target.position.set(Math.sin(t * 0.6) * 1.2, 0.6, -1.2);
      left.current.target.updateMatrixWorld();
    }
    if (right.current) {
      right.current.target.position.set(Math.cos(t * 0.7) * -1.2, 0.7, -1.1);
      right.current.target.updateMatrixWorld();
    }
    if (back.current) {
      back.current.target.position.set(0, 1 + Math.sin(t * 0.9) * 0.4, -1.6);
      back.current.target.updateMatrixWorld();
    }
  });

  return (
    <group>
      <spotLight ref={left} position={[-1.8, 1.6, 1.4]} angle={0.6} penumbra={0.6} color="#3ea6ff" intensity={3.2} castShadow />
      <spotLight ref={right} position={[1.8, 1.6, 1.4]} angle={0.6} penumbra={0.6} color="#8a2be2" intensity={3.2} castShadow />
      <spotLight ref={back} position={[0, 1.2, -0.2]} angle={0.8} penumbra={0.5} color="#00d1ff" intensity={2.8} />
    </group>
  );
}

function LightBeams() {
  const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color("#3ea6ff"), transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending });
  const mat2 = new THREE.MeshBasicMaterial({ color: new THREE.Color("#8a2be2"), transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending });
  return (
    <group position={[0, 0.6, -0.9]}>
      <mesh rotation={[-Math.PI / 2, 0.2, 0]}> 
        <coneGeometry args={[1.6, 3.2, 32, 1, true]} />
        <primitive object={mat} attach="material" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, -0.2, 0]}>
        <coneGeometry args={[1.6, 3.2, 32, 1, true]} />
        <primitive object={mat2} attach="material" />
      </mesh>
    </group>
  );
}

function Backdrop() {
  return (
    <mesh position={[0, 1.6, -4]}>
      <planeGeometry args={[14, 7]} />
      <meshBasicMaterial toneMapped={false}>
        <GradientTexture stops={[0, 0.5, 1]} colors={["#1a004a", "#0047ab", "#00d2ff"]} size={1024} />
      </meshBasicMaterial>
    </mesh>
  );
}

export function DJScene({ onBackToBridge }: { onBackToBridge?: () => void }) {
  const setWorld = useWorld((s) => s.setWorld);
  return (
    <>
      {/* Dark stage background */}
      <color attach="background" args={["#05060a"]} />
      <fog attach="fog" args={["#05060a", 6, 28]} />

      {/* Colorful backdrop for rave atmosphere */}
      <Backdrop />

      {/* Reflective floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.02, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <MeshReflectorMaterial blur={[200, 80]} resolution={1024} mixBlur={0.8} mixStrength={1.4} roughness={0.8} depthScale={0.4} minDepthThreshold={0.3} maxDepthThreshold={1.2} color="#101a33" metalness={0.08} />
      </mesh>

      {/* Booth + performer silhouette */}
      <DJBooth />
      <Silhouette />
      <LightBeams />
      <MovingLights />

      {/* GitHub link panel */}
      {/* Place the link panel further back so the booth is front-and-center */}
      <Html position={[0, 1.6, -3]} center>
        <div style={{ background: "rgba(0,0,0,0.55)", padding: "0.75rem 1.25rem", borderRadius: 10, color: "#eaeaea", fontFamily: "Poppins, sans-serif", fontSize: 14 }}>
          <strong style={{ color: "#8ab4ff" }}>AI DJ Project</strong>
          <div>
            <a href="https://github.com/bowenzhu21/Smart-Mixer" target="_blank" rel="noopener noreferrer" style={{ color: "#8ab4ff" }}>
              View on GitHub →
            </a>
          </div>
        </div>
      </Html>

      {/* Back portal moved further back-right */}
      <Portal label="Back to Bridge" onEnter={onBackToBridge ?? (() => setWorld("BRIDGE"))} position={[3, 1.2, -3]} />

      {/* Subtle base lights + IBL; add gentle front fill so booth is visible */}
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 1.3, 1.2]} intensity={1.2} color="#cfe8ff" distance={6} decay={2} />
      <Environment preset="night" />
      <OrbitControls />
    </>
  );
}
