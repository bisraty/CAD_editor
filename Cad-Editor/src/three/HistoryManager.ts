import * as THREE from "three";
import { IOManager } from "./IOManager";

export class HistoryManager {
  private undoStack: string[] = [];
  private redoStack: string[] = [];
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  // Capture current scene state
  snapshot() {
    const json = IOManager.serialize(this.scene);
    this.undoStack.push(json);
    // Clear redo stack on new action
    this.redoStack = [];
  }

  canUndo() {
    return this.undoStack.length > 1; 
  }

  canRedo() {
    return this.redoStack.length > 0;
  }

  undo() {
    if (!this.canUndo()) return;
    const current = this.undoStack.pop();
    if (!current) return;
    const previous = this.undoStack[this.undoStack.length - 1];
    if (previous) {
      this.redoStack.push(current);
      IOManager.import(previous, this.scene);
    }
  }

  redo() {
    if (!this.canRedo()) return;
    const json = this.redoStack.pop()!;
    this.undoStack.push(json);
    IOManager.import(json, this.scene);
  }
}
