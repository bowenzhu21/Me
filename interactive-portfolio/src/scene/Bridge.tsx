import { OrbitControls } from "@react-three/drei";
import { Portal } from "./Portals";
import { useWorld } from "../state/useWorld";
import { GoldenGate } from "./GoldenGate";
import { NightSFEnvironment, CityLights } from "./NightSF";
import { BayWater } from "./BayWater";

export function BridgeScene() {
  const setWorld = useWorld((s) => s.setWorld);
  return (
    <>
      {/* Background + fog for coastal night atmosphere */}
      <color attach="background" args={["#0b1530"]} />
      <fog attach="fog" args={["#0b1530", 8, 70]} />

      {/* Water surface (uses normal-mapped waves if /textures/waternormals.jpg exists) */}
      <BayWater />

      { /* Add clouds later if desired */ }

      {/* Golden Gate model if present in /public/models/golden_gate_bridge.glb */}
      <GoldenGate url="/models/golden_gate_bridge.glb" scale={1} />

      {/* Distant city lights */}
      <CityLights />

      {/* Minimal ground/fallback so scene isn't empty if model missing */}
      <mesh position={[0, -1, 0]} receiveShadow>
        <boxGeometry args={[6, 0.2, 6]} />
        <meshStandardMaterial color="#c7c7c7" />
      </mesh>

      <Portal label="Enter DJ World" onEnter={() => setWorld("DJ")} position={[-1.4, 1.2, -3]} />
      <Portal label="Enter Gym World" onEnter={() => setWorld("GYM")} position={[1.4, 1.2, -3]} />

      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 8, 2]} intensity={1.15} color="#ffcf99" castShadow />
      {/* Use environment lighting but keep our solid background to avoid unwanted imagery */}
      <NightSFEnvironment background={false} />
      <OrbitControls />
    </>
  );
}
