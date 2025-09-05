import { useMemo } from "react";
import { MeshReflectorMaterial } from "@react-three/drei";

export function BayWater({
  size = 200,
  position = [0, -1.05, 0] as [number, number, number],
  color = "#0a2a3d",
}: {
  size?: number;
  position?: [number, number, number];
  color?: string;
}) {
  const params = useMemo(
    () => ({
      blur: [300, 150] as [number, number],
      resolution: 1024,
      mixBlur: 1,
      mixStrength: 1.2,
      roughness: 0.9,
      depthScale: 0.5,
      minDepthThreshold: 0.4,
      maxDepthThreshold: 1.25,
      color,
      metalness: 0,
    }),
    [color]
  );

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={position} receiveShadow>
      <planeGeometry args={[size, size]} />
      <MeshReflectorMaterial {...params} />
    </mesh>
  );
}
