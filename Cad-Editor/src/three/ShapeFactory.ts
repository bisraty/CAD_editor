import * as THREE from "three";

export type PrimitiveType = "box" | "sphere" | "cylinder";

export class ShapeFactory {
  static create(type: PrimitiveType): THREE.Group {
    let mesh: THREE.Mesh;
    switch (type) {
      case "sphere":
        mesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.5, 16, 16),
          new THREE.MeshStandardMaterial({ color: 0xff8848, flatShading: true })
        );
        break;
      case "cylinder":
        mesh = new THREE.Mesh(
          new THREE.CylinderGeometry(0.4, 0.4, 1, 16, 1),
          new THREE.MeshStandardMaterial({ color: 0x44ffab, flatShading: true })
        );
        break;
      default:
        mesh = new THREE.Mesh(
          new THREE.BoxGeometry(1, 1, 1),
          new THREE.MeshStandardMaterial({ color: 0x4477fb, flatShading: true })
        );
    }

    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(mesh.geometry),
      new THREE.LineBasicMaterial({ color: 0xffffff })
    );

    const group = new THREE.Group();
    group.add(mesh);
    group.add(edges);
    group.userData = { type };
    return group;
  }
}
