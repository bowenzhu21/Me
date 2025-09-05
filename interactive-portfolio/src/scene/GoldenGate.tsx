import { Suspense, useEffect, useState } from "react";
import { useGLTF } from "@react-three/drei";
import type * as THREE from "three";

type GLTFResult = {
  scene: THREE.Group;
};

function GoldenGateModel({ url, position = [0, -1, -6] as [number, number, number], scale = 1, rotation = [0, Math.PI, 0] as [number, number, number] }: { url: string; position?: [number, number, number]; scale?: number; rotation?: [number, number, number] }) {
  const gltf = useGLTF(url) as unknown as GLTFResult;
  return <primitive object={gltf.scene} position={position} rotation={rotation} scale={scale} />;
}

export function GoldenGate({ url, position, scale, rotation }: { url: string; position?: [number, number, number]; scale?: number; rotation?: [number, number, number] }) {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(url, { method: "HEAD" })
      .then((r) => {
        if (cancelled) return;
        if (!r.ok) {
          setAvailable(false);
          return;
        }
        const ct = r.headers.get("content-type") || "";
        // Vite dev server returns text/html (index.html) for unknown assets; treat that as missing
        if (/text\/html/i.test(ct)) {
          setAvailable(false);
          return;
        }
        // Accept common GLB/GLTF types
        if (/model|octet-stream/i.test(ct)) {
          setAvailable(true);
        } else {
          setAvailable(false);
        }
      })
      .catch(() => {
        if (!cancelled) setAvailable(false);
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (!available) return null;
  return (
    <Suspense fallback={null}>
      <GoldenGateModel url={url} position={position} scale={scale} rotation={rotation} />
    </Suspense>
  );
}

// Note: Do not preload by default; if the model is missing it can throw
// and blank the scene. We'll only attempt to load when the HEAD check passes.
