import { useEffect, useMemo, useRef, useState } from "react";
import { Environment } from "@react-three/drei";
import type { InstancedMesh } from "three";
import * as THREE from "three";

// Tries to load an HDR environment from /hdr; falls back to preset "night"
export function NightSFEnvironment({ background = true }: { background?: boolean }) {
  const [hdrUrl, setHdrUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const candidates = [
      "/hdr/sf_night.hdr",
      "/hdr/sf_night_2k.hdr",
      "/hdr/night_city.hdr",
    ];
    (async () => {
      for (const url of candidates) {
        try {
          const r = await fetch(url, { method: "HEAD" });
          const ct = r.headers.get("content-type") || "";
          if (r.ok && /hdr|image|octet-stream/i.test(ct)) {
            if (!cancelled) setHdrUrl(url);
            return;
          }
        } catch {
          // ignore
        }
      }
      if (!cancelled) setHdrUrl(null);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (hdrUrl) return <Environment background={background} files={hdrUrl} />;
  return <Environment background={background} preset="night" />;
}

// A simple belt of distant city lights along the horizon line
export function CityLights({
  count = 150,
  color = new THREE.Color("#ffb86b"),
  z = -40,
  width = 80,
}: {
  count?: number;
  color?: THREE.Color;
  z?: number;
  width?: number;
}) {
  const data = useMemo(() => {
    const positions: Array<[number, number, number, number]> = [];
    for (let i = 0; i < count; i += 1) {
      const x = -width / 2 + Math.random() * width;
      const y = 1.5 + Math.random() * 4; // band of lights
      const jitterZ = z + (Math.random() - 0.5) * 6;
      const s = 0.05 + Math.random() * 0.1; // light size
      positions.push([x, y, jitterZ, s]);
    }
    return positions;
  }, [count, width, z]);

  const ref = useRef<InstancedMesh>(null);

  useEffect(() => {
    const m = new THREE.Matrix4();
    data.forEach((p, i) => {
      m.compose(new THREE.Vector3(p[0], p[1], p[2]), new THREE.Quaternion(), new THREE.Vector3(p[3], p[3], p[3]));
      ref.current?.setMatrixAt(i, m);
    });
    if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
  }, [data]);

  return (
    <instancedMesh ref={ref} args={[undefined as unknown as THREE.BufferGeometry, undefined as unknown as THREE.Material, data.length]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color={color} />
    </instancedMesh>
  );
}
