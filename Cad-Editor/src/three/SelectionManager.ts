import * as THREE from "three";

export type SelectionType = "shape" | "face" | "edge";

export interface SelectionInfo {
  type: SelectionType;
  object: THREE.Object3D;
  normal?: THREE.Vector3;
  area?: number;
  length?: number;
}

export class SelectionManager {
  camera: THREE.Camera;
  scene: THREE.Scene;
  raycaster: THREE.Raycaster;
  pointer: THREE.Vector2;
  selected: THREE.Object3D | null = null;
  highlight: THREE.Object3D | null = null;
  info: SelectionInfo | null = null;

  constructor(camera: THREE.Camera, scene: THREE.Scene) {
    this.camera = camera;
    this.scene = scene;
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
  }

  clearHighlight() {
    if (this.highlight) {
      this.scene.remove(this.highlight);
      this.highlight = null;
    }
  }

  pick(event: MouseEvent) {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);
    const intersects = this.raycaster
  .intersectObjects(this.scene.children, true)
  // Filter out helpers, grids, and transform gizmo
  .filter(
    (i) =>
      !(
        i.object.type.includes("Helper") ||
        i.object.name === "grid-helper" ||
        i.object.name === "TransformControlsPlane" ||
        i.object.name === "TransformControlsGizmo"
      )
  );


    this.clearHighlight();
    this.info = null;
    this.selected = null;
    if (intersects.length === 0) return;

    const hit = intersects[0];
    const obj = hit.object;
console.log("Clicked:", hit.object.name || hit.object.type);

    // find parent Group that contains the mesh
    let group: THREE.Object3D | null = obj;
    while (group && !(group instanceof THREE.Group)) {
      group = group.parent;
    }
    if (!group) group = obj;

    // find the mesh child inside the group
    const mesh = (group as THREE.Group).children.find(
      (c) => c instanceof THREE.Mesh
    ) as THREE.Mesh | undefined;

    // if we don't find a mesh, just treat the group as a shape
    if (!mesh || !(mesh.geometry instanceof THREE.BufferGeometry)) {
      const box = new THREE.BoxHelper(group, 0x00ff00);
      this.scene.add(box);
      this.highlight = box;
      this.selected = group;
      this.info = { type: "shape", object: group };
      return;
    }

    // ✅ Face selection
    if (hit.face) {
      const pos = mesh.geometry.attributes.position;
      const vA = new THREE.Vector3().fromBufferAttribute(pos, hit.face.a);
      const vB = new THREE.Vector3().fromBufferAttribute(pos, hit.face.b);
      const vC = new THREE.Vector3().fromBufferAttribute(pos, hit.face.c);
      const area = new THREE.Triangle(vA, vB, vC).getArea();
      const normal = hit.face.normal.clone();

      const geo = new THREE.BufferGeometry().setFromPoints([vA, vB, vC, vA]);
      const line = new THREE.Line(
        geo,
        new THREE.LineBasicMaterial({ color: 0xffff00 })
      );
      line.position.copy(mesh.position);
      this.scene.add(line);

      this.highlight = line;
      this.selected = group;
      this.info = { type: "face", object: group, normal, area };
      return;
    }

    // ✅ Edge selection
    const edgeGeom = new THREE.EdgesGeometry(mesh.geometry);
    const edges = edgeGeom.attributes.position;
    let closest: [THREE.Vector3, THREE.Vector3] | null = null;
    let minDist = Infinity;
    const ray = this.raycaster.ray;

    for (let i = 0; i < edges.count; i += 2) {
      const a = new THREE.Vector3().fromBufferAttribute(edges, i);
      const b = new THREE.Vector3().fromBufferAttribute(edges, i + 1);
      const dist = this.distanceToSegment(ray, a, b);
      if (dist < minDist) {
        minDist = dist;
        closest = [a, b];
      }
    }

    if (closest && minDist < 0.05) {
      const [a, b] = closest;
      const lineGeo = new THREE.BufferGeometry().setFromPoints([a, b]);
      const line = new THREE.Line(
        lineGeo,
        new THREE.LineBasicMaterial({ color: 0x00ffff })
      );
      line.position.copy(mesh.position);
      this.scene.add(line);

      this.highlight = line;
      this.selected = group;
      this.info = { type: "edge", object: group, length: a.distanceTo(b) };
      return;
    }

    // ✅ Default shape highlight
    const box = new THREE.BoxHelper(group, 0x00ff00);
    this.scene.add(box);
    this.highlight = box;
    this.selected = group;
    this.info = { type: "shape", object: group };
  }

  // Compute shortest distance between ray and segment
  distanceToSegment(ray: THREE.Ray, a: THREE.Vector3, b: THREE.Vector3): number {
    const seg = b.clone().sub(a);
    const segLen = seg.length();
    seg.normalize();
    const v = new THREE.Vector3().crossVectors(ray.direction, seg);
    if (v.lengthSq() < 1e-8) return Infinity;
    const n = new THREE.Vector3().crossVectors(seg, v).normalize();
    const t = ray.direction.dot(n);
    if (Math.abs(t) < 1e-6) return Infinity;
    const d = (a.clone().sub(ray.origin)).dot(n) / t;
    const pRay = ray.origin.clone().add(ray.direction.clone().multiplyScalar(d));
    const proj = a.clone().add(seg.multiplyScalar(
      THREE.MathUtils.clamp(seg.dot(pRay.clone().sub(a)), 0, segLen)
    ));
    return pRay.distanceTo(proj);
  }
}
