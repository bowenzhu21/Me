// src/App.tsx
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useState } from "react";
import { BridgeScene } from "./scene/Bridge";
import { DJScene } from "./scene/DJ";
import { GymScene } from "./scene/Gym";
import { useWorld } from "./state/useWorld";
import type { World } from "./state/useWorld";
import { useVoice } from "./voice/useVoice";
import type { Intent } from "./voice/useVoice";
import Hyperspace from "./effects/Hyperspace";

function ApproachCamera({
  progress,
  target,
}: {
  progress: number;
  target: { position: [number, number, number]; lookAt?: [number, number, number] };
}) {
  const { camera } = useThree();
  useFrame(() => {
    const t = progress;
    const ease = t * t * (3 - 2 * t);
    const [tx, ty, tz] = target.position;
    const sx = 0, sy = 1.5, sz = 4;
    camera.position.x = sx + (tx - sx) * ease;
    camera.position.y = sy + (ty - sy) * ease;
    camera.position.z = sz + (tz - sz) * ease;
    const [lx, ly, lz] = target.lookAt ?? target.position;
    camera.lookAt(lx, ly, lz);
  });
  return null;
}

export default function App() {
  const world = useWorld((s) => s.world);
  const setWorld = useWorld((s) => s.setWorld);
  const setLastHeard = useWorld((s) => s.setLastHeard);
  // Transition state
  const [phase, setPhase] = useState<"idle" | "approach" | "flash" | "hyper">("idle");
  const [prog, setProg] = useState(0);
  const [pendingWorld, setPendingWorld] = useState<World | null>(null);
  const [approachTarget, setApproachTarget] = useState<{ position: [number, number, number]; lookAt?: [number, number, number] } | null>(null);

  const startTransition = useCallback((to: World, target: { position: [number, number, number]; lookAt?: [number, number, number] }) => {
    if (phase !== "idle") return;
    setPendingWorld(to);
    setApproachTarget(target);
    setPhase("approach");
    setProg(0);
  }, [phase]);

  // Voice intents -> DJ uses transition; others switch directly
  const onIntent = useCallback(
    (intent: Intent, raw: string) => {
      setLastHeard(raw);
      if (intent === "DJ" && world === "BRIDGE") {
        startTransition("DJ", { position: [-1.4, 1.2, -2.2], lookAt: [-1.4, 1.2, -3] });
      } else if (intent === "DJ") {
        // from other worlds, just switch for now
        setWorld("DJ");
      }
      else if (intent === "GYM") setWorld("GYM");
      else if (intent === "HOME") setWorld("BRIDGE");
    },
    [setLastHeard, setWorld, startTransition, world]
  );

  const { start, speak, listening } = useVoice(onIntent);

  // Drive phases
  useEffect(() => {
    if (phase === "idle") return;
    let raf = 0;
    const D = phase === "approach" ? 1100 : phase === "flash" ? 300 : 1800;
    const t0 = performance.now();
    const loop = (t: number) => {
      const p = Math.min(1, (t - t0) / D);
      setProg(p);
      if (p < 1) raf = requestAnimationFrame(loop);
      else {
        if (phase === "approach") setPhase("flash");
        else if (phase === "flash") setPhase("hyper");
        else if (phase === "hyper") {
          if (pendingWorld) setWorld(pendingWorld);
          setPendingWorld(null);
          setPhase("idle");
          setProg(0);
        }
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [phase, pendingWorld, setWorld]);

  const greet = () =>
    speak(
      "Hey! Welcome to Bowen's portfolio at the Golden Gate Bridge. Say DJ to see the AI DJ, or Gym to see the Gym app."
    );

  return (
    <div className="canvas-fullscreen">
      <Canvas camera={{ position: [0, 1.5, 4], fov: 50 }}>
        {phase !== "hyper" && world === "BRIDGE" && (
          <BridgeScene
            onEnterDJ={() => startTransition("DJ", { position: [-1.4, 1.2, -2.2], lookAt: [-1.4, 1.2, -3] })}
            onEnterGYM={() => startTransition("GYM", { position: [1.4, 1.2, -2.2], lookAt: [1.4, 1.2, -3] })}
          />
        )}
        {phase !== "hyper" && world === "DJ" && (
          <DJScene onBackToBridge={() => startTransition("BRIDGE", { position: [3, 1.2, -2.2], lookAt: [3, 1.2, -3] })} />
        )}
        {phase !== "hyper" && world === "GYM" && (
          <GymScene onBackToBridge={() => startTransition("BRIDGE", { position: [3, 1.2, -2.2], lookAt: [3, 1.2, -3] })} />
        )}
        {phase === "hyper" && <color attach="background" args={["#06122e"]} />}
        {phase === "approach" && approachTarget && (
          <ApproachCamera target={approachTarget} progress={prog} />
        )}
        {phase === "hyper" && <Hyperspace progress={prog} />}
      </Canvas>

      {phase === "flash" && (
        <div style={{ position: "fixed", inset: 0, background: "white", opacity: Math.min(1, prog * 1.2), pointerEvents: "none" }} />
      )}

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
