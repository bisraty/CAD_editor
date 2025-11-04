import * as THREE from "three";

export const snapToGrid = (value: number, gridSize = 0.1) =>
  Math.round(value / gridSize) * gridSize;

export const addGridHelper = (scene: THREE.Scene) => {
  const grid = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
  scene.add(grid);
};
