// src/App.tsx
import { Canvas } from "@react-three/fiber";
import { useCallback } from "react";
import { BridgeScene } from "./scene/Bridge";
import { DJScene } from "./scene/DJ";
import { GymScene } from "./scene/Gym";
import { useWorld } from "./state/useWorld";
import { useVoice } from "./voice/useVoice";
import type { Intent } from "./voice/useVoice";
// no World type needed here

export default function App() {
  const world = useWorld((s) => s.world);
  const setWorld = useWorld((s) => s.setWorld);
  const setLastHeard = useWorld((s) => s.setLastHeard);
  // Voice intents -> set world directly (no hyperspace)
  const onIntent = useCallback(
    (intent: Intent, raw: string) => {
      setLastHeard(raw);
      if (intent === "DJ") setWorld("DJ");
      else if (intent === "GYM") setWorld("GYM");
      else if (intent === "HOME") setWorld("BRIDGE");
    },
    [setLastHeard, setWorld]
  );

  const { start, speak, listening } = useVoice(onIntent);

  // No hyperspace or keyboard overrides

  const greet = () =>
    speak(
      "Hey! Welcome to Bowen's portfolio at the Golden Gate Bridge. Say DJ to see the AI DJ, or Gym to see the Gym app."
    );

  return (
    <div className="canvas-fullscreen">
      <Canvas camera={{ position: [0, 1.5, 4], fov: 50 }}>
        {world === "BRIDGE" && <BridgeScene />}
        {world === "DJ" && <DJScene />}
        {world === "GYM" && <GymScene />}
      </Canvas>

      {/* UI overlay */}
      <div
        style={{
          position: "fixed",
          left: 16,
          bottom: 16,
          display: "flex",
          gap: 8,
          zIndex: 10,
        }}
      >
        <button onClick={greet}>Intro (TTS)</button>
        <button onClick={start}>{listening ? "Listening..." : "Speak"}</button>
      </div>
    </div>
  );
}
