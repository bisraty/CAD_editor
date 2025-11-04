import * as THREE from "three";

export class SketchManager {
  private drawing = false;
  private start: THREE.Vector3 | null = null;
  private previewMesh: THREE.Mesh | null = null;
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  startRectangle(x: number, z: number) {
    this.drawing = true;
    this.start = new THREE.Vector3(x, 0, z);
  }

  updateRectangle(x: number, z: number) {
    if (!this.drawing || !this.start) return;

    const width = x - this.start.x;
    const height = z - this.start.z;
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(width, 0);
    shape.lineTo(width, height);
    shape.lineTo(0, height);
    shape.lineTo(0, 0);

    const geo = new THREE.ShapeGeometry(shape);
    const mat = new THREE.MeshBasicMaterial({ color: 0x22ccff, wireframe: true });
    if (this.previewMesh) this.scene.remove(this.previewMesh);

    this.previewMesh = new THREE.Mesh(geo, mat);
    this.previewMesh.position.set(this.start.x, 0.01, this.start.z);
    this.scene.add(this.previewMesh);
  }

  finishRectangle(extrudeDepth = 1): THREE.Mesh | null {
    if (!this.drawing || !this.start) return null;
    this.drawing = false;

    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(1, 0);
    shape.lineTo(1, 1);
    shape.lineTo(0, 1);
    shape.lineTo(0, 0);

    const extrudeSettings = { depth: extrudeDepth, bevelEnabled: false };
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const material = new THREE.MeshStandardMaterial({ color: 0xff5533 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(this.start);

    if (this.previewMesh) {
      this.scene.remove(this.previewMesh);
      this.previewMesh = null;
    }

    this.scene.add(mesh);
    return mesh;
  }
}
