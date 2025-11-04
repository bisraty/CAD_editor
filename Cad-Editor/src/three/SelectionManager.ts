import * as THREE from "three";

export class SelectionManager {
  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();
  selected: THREE.Object3D | null = null;
  highlight: THREE.Object3D | null = null;

  camera: THREE.Camera;
  scene: THREE.Scene;

  constructor(camera: THREE.Camera, scene: THREE.Scene) {
    this.camera = camera;
    this.scene = scene;
  }

  pick(event: MouseEvent) {
    this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);

    const intersects = this.raycaster.intersectObjects(this.scene.children, true);
    if (intersects.length > 0) {
      const target = intersects[0].object;
      this.select(target);
    }
  }

  select(object: THREE.Object3D) {
    if (this.selected === object) return;
    this.clearHighlight();
    this.selected = object;
    this.highlightObject(object);
  }

  clearHighlight() {
    if (this.highlight) {
      this.scene.remove(this.highlight);
      this.highlight = null;
    }
  }

  highlightObject(object: THREE.Object3D) {
    const mesh = object as THREE.Mesh;
    if (!mesh.geometry) return;
    const edges = new THREE.EdgesGeometry(mesh.geometry);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffff00 }));
    mesh.add(line);
    this.highlight = line;
  }
}
