import * as THREE from "three";

import { useState } from "react";

export const useCADApp = () => {
  const [mode, setMode] = useState<"normal" | "sketch">("normal");
  const [selected, setSelected] = useState<THREE.Object3D | null>(null);
  return { mode, setMode, selected, setSelected };
};
