import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";

export class TransformManager {
  transform: TransformControls;
  orbit: OrbitControls;

  constructor(camera: THREE.Camera, renderer: THREE.WebGLRenderer, scene: THREE.Scene) {
    this.orbit = new OrbitControls(camera, renderer.domElement);
    this.orbit.enableDamping = true;

    this.transform = new TransformControls(camera, renderer.domElement);

    // Fix for TS type mismatch
    scene.add(this.transform as unknown as THREE.Object3D);

    this.transform.addEventListener("dragging-changed", (event) => {
      this.orbit.enabled = !event.value;
    });
  }

  attach(object: THREE.Object3D) {
    this.transform.attach(object);
  }

  detach() {
    this.transform.detach();
  }

  update() {
    this.orbit.update();
  }
}
