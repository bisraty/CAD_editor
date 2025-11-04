import * as THREE from "three";

export class IOManager {
  static serialize(scene: THREE.Scene): string {
    return JSON.stringify(scene.toJSON());
  }

  static export(scene: THREE.Scene) {
    const json = IOManager.serialize(scene);
    const blob = new Blob([json], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "scene.json";
    link.click();
  }

  static import(json: string, scene: THREE.Scene) {
    const loader = new THREE.ObjectLoader();
    const data = typeof json === "string" ? JSON.parse(json) : json;
    const loadedScene = loader.parse(data);
    // clear old objects except helpers
    scene.children = scene.children.filter(c => c.type.includes("Helper"));
    loadedScene.children.forEach((child) => scene.add(child));
  }
}
