// src/three/IOManager.ts
import * as THREE from "three";

export class IOManager {
  static export(scene: THREE.Scene) {
    const json = scene.toJSON();
    const blob = new Blob([JSON.stringify(json)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "scene.json";
    link.click();
  }

  static import(jsonString: string, scene: THREE.Scene) {
    const loader = new THREE.ObjectLoader();
    const parsed = JSON.parse(jsonString);
    const newScene = loader.parse(parsed);
    scene.add(...newScene.children);
  }
}
