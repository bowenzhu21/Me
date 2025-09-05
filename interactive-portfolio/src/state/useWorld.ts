// useWorld.ts
import { create } from "zustand";

export type World = "BRIDGE" | "DJ" | "GYM";

interface Store {
  world: World;
  setWorld: (w: World) => void;
  lastHeard: string;
  setLastHeard: (t: string) => void;
}

export const useWorld = create<Store>((set) => ({
  world: "BRIDGE",
  setWorld: (world) => set({ world }),
  lastHeard: "",
  setLastHeard: (lastHeard) => set({ lastHeard }),
}));
