import { MeshTransmissionMaterial, Float, Text } from "@react-three/drei";
import { useCursor } from "@react-three/drei";
import { useState } from "react";

export function Portal({
  label,
  position = [0, 1.5, -3] as [number, number, number],
  onEnter,
}: {
  label: string;
  position?: [number, number, number];
  onEnter?: () => void;
}) {
  const [hovered, set] = useState(false);
  useCursor(hovered);

  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={1}>
        <mesh
          onPointerOver={() => set(true)}
          onPointerOut={() => set(false)}
          onClick={() => onEnter?.()}
        >
          <torusKnotGeometry args={[0.6, 0.16, 128, 16]} />
          <MeshTransmissionMaterial
            thickness={0.6}
            transmission={1}
            roughness={0.1}
            anisotropy={0.2}
          />
        </mesh>
        <Text
          position={[0, -1.1, 0]}
          fontSize={0.25}
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      </Float>
    </group>
  );
}
