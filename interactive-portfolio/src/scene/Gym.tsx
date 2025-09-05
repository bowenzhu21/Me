import { Environment, OrbitControls, Html, MeshReflectorMaterial, GradientTexture, Grid } from "@react-three/drei";
import { Portal } from "./Portals";
import { useWorld } from "../state/useWorld";

function Backdrop() {
  return (
    <group>
      <mesh position={[0, 1.4, -5]}>
        <planeGeometry args={[16, 6]} />
        <meshBasicMaterial toneMapped={false}>
          <GradientTexture stops={[0, 0.6, 1]} colors={["#0f1115", "#111827", "#0f1115"]} size={1024} />
        </meshBasicMaterial>
      </mesh>
      <mesh position={[8, 1.4, -2]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[6, 6]} />
        <meshBasicMaterial color="#0f1115" />
      </mesh>
      <mesh position={[-8, 1.4, -2]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[6, 6]} />
        <meshBasicMaterial color="#0f1115" />
      </mesh>
    </group>
  );
}

function SquatRack({ position = [-2.2, -0.2, -2.2] as [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[-0.4, 1.1, 0]} castShadow>
        <boxGeometry args={[0.08, 2.2, 0.1]} />
        <meshStandardMaterial color="#2b2f36" roughness={0.8} />
      </mesh>
      <mesh position={[0.4, 1.1, 0]} castShadow>
        <boxGeometry args={[0.08, 2.2, 0.1]} />
        <meshStandardMaterial color="#2b2f36" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.6, 0]} castShadow>
        <boxGeometry args={[1.0, 0.06, 0.1]} />
        <meshStandardMaterial color="#1f2329" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.4, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 1.6, 16]} />
        <meshStandardMaterial color="#b0b6c2" metalness={0.6} roughness={0.4} />
      </mesh>
      {[ -0.62, -0.52, 0.52, 0.62 ].map((x, i) => (
        <mesh key={i} position={[x, 1.4, 0]} castShadow>
          <torusGeometry args={[0.14 + (i % 2) * 0.05, 0.03, 12, 24]} />
          <meshStandardMaterial color="#20242b" roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

function Bench({ position = [0.6, -0.7, -1.6] as [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[1.2, 0.08, 0.3]} />
        <meshStandardMaterial color="#20242b" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.28, 0]}>
        <boxGeometry args={[0.9, 0.06, 0.3]} />
        <meshStandardMaterial color="#2b3038" roughness={0.8} />
      </mesh>
      <mesh position={[-0.45, 0.15, 0]}>
        <boxGeometry args={[0.06, 0.3, 0.3]} />
        <meshStandardMaterial color="#1f2329" />
      </mesh>
      <mesh position={[0.45, 0.15, 0]}>
        <boxGeometry args={[0.06, 0.3, 0.3]} />
        <meshStandardMaterial color="#1f2329" />
      </mesh>
    </group>
  );
}

export function GymScene() {
  const setWorld = useWorld((s) => s.setWorld);
  return (
    <>
      {/* Indoor gym vibe */}
      <color attach="background" args={["#0f1115"]} />
      <fog attach="fog" args={["#0f1115", 8, 45]} />

      <Backdrop />

      {/* Rubber floor with mild reflection */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.02, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <MeshReflectorMaterial blur={[120, 50]} resolution={1024} mixBlur={0.5} mixStrength={0.8} roughness={0.95} depthScale={0.35} minDepthThreshold={0.3} maxDepthThreshold={1.2} color="#1b1d22" metalness={0.02} />
      </mesh>
      {/* Grid paint lines */}
      <Grid position={[0, -0.999, 0]} args={[60, 60]} cellSize={0.5} cellThickness={0.3} sectionSize={3} sectionThickness={1} cellColor="#23262d" sectionColor="#2e3340" fadeDistance={18} infiniteGrid />

      {/* Equipment */}
      <SquatRack />
      <Bench />

      {/* GitHub link panel */}
      <Html position={[0, 1.8, -3.4]} center>
        <div
          style={{
            background: "rgba(0,0,0,0.7)",
            padding: "1rem 2rem",
            borderRadius: "12px",
            color: "white",
            fontFamily: "Poppins, sans-serif",
          }}
        >
          <h2>GymBro App</h2>
          <a
            href="https://github.com/bowenzhu21/GymBro"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#81C784", fontWeight: "bold" }}
          >
            View on GitHub →
          </a>
        </div>
      </Html>

      {/* Back portal moved back-right */}
      <Portal label="Back to Bridge" onEnter={() => setWorld("BRIDGE")} position={[3, 1.2, -3]} />

      {/* Lighting */}
      <ambientLight intensity={0.25} />
      <spotLight position={[-2, 5, 2]} angle={0.7} penumbra={0.7} color="#cfe8ff" intensity={1.8} castShadow />
      <spotLight position={[2, 5, 2]} angle={0.7} penumbra={0.7} color="#cfe8ff" intensity={1.8} castShadow />
      <spotLight position={[0, 4, -4]} angle={0.9} penumbra={0.6} color="#ffcc99" intensity={1.2} />
      <Environment preset="warehouse" />
      <OrbitControls />
    </>
  );
}
