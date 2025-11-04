/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useState,
} from "react";
import * as THREE from "three";
import { SceneManager } from "../three/SceneManager";
import { ShapeFactory, type PrimitiveType } from "../three/ShapeFactory";
import { SelectionManager } from "../three/SelectionManager";
import { TransformManager } from "../three/TransformManager";
import { addGridHelper, snapToGrid } from "../three/utils";
import { IOManager } from "../three/IOManager";
import { HistoryManager } from "../three/HistoryManager"; //  added

export interface Canvas3DRef {
  addShape: (type: PrimitiveType) => void;
  enterSketchMode: (tool?: "rectangle" | "circle") => void;
  exportScene: () => void;
  importScene: (json: string) => void;
  undo: () => void;
  redo: () => void;
}

const Canvas3D = forwardRef<
  Canvas3DRef,
  { onSelect: (info: import("../three/SelectionManager").SelectionInfo | null) => void }
>(({ onSelect }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"normal" | "sketch">("normal");
  const [sketchTool, setSketchTool] = useState<"rectangle" | "circle">("rectangle");

  const managerRef = useRef<SceneManager | null>(null);
  const selectionRef = useRef<SelectionManager | null>(null);
  const transformRef = useRef<TransformManager | null>(null);
  const historyRef = useRef<HistoryManager | null>(null); //  undo/redo stack

  // Sketch Mode state
  const drawing = useRef(false);
  const startPoint = useRef<THREE.Vector3 | null>(null);
  const previewMesh = useRef<THREE.Mesh | null>(null);

  // Track shape placement index to space them out
  const shapeCounter = useRef(0);

  // Initialize SceneManager (only once)
  useEffect(() => {
    if (!containerRef.current) return;

    // Create manager once
    if (!managerRef.current) {
      const manager = new SceneManager(containerRef.current);
      managerRef.current = manager;

      addGridHelper(manager.scene);

      selectionRef.current = new SelectionManager(manager.camera, manager.scene);
      transformRef.current = new TransformManager(
        manager.camera,
        manager.renderer,
        manager.scene
      );
      historyRef.current = new HistoryManager(manager.scene);
      historyRef.current.snapshot(); // initial base state

      // Main render loop
      const loop = () => {
        requestAnimationFrame(loop);
        transformRef.current?.update();
        manager.render();
      };
      loop();
    }

    //  Attach click listener to renderer canvas
    const renderer = managerRef.current!.renderer;
    const canvas = renderer.domElement;

    const handleClick = (e: MouseEvent) => {
      console.log("Canvas click detected");
      if (mode === "sketch") return;

      const selection = selectionRef.current;
      const transform = transformRef.current;
      if (!selection || !transform) return;

      selection.pick(e);

      const info = selection.info;
      if (info) {
        transform.detach();
        if (info.type === "shape") transform.attach(info.object);
        onSelect(info);
      } else {
        transform.detach();
        onSelect(null);
      }
    };

    canvas.addEventListener("click", handleClick);

    return () => {
      canvas.removeEventListener("click", handleClick);
    };
  }, [mode, onSelect]);

  // Public API methods (for Toolbar/FileMenu)
  useImperativeHandle(ref, () => ({
    addShape: (type: PrimitiveType) => {
      const mgr = managerRef.current;
      if (!mgr) return;

      // Grid-based placement logic
      const spacing = 2.5;
      const cols = 5;
      const i = shapeCounter.current++;

      const x = (i % cols) * spacing - ((cols - 1) * spacing) / 2;
      const z = Math.floor(i / cols) * spacing - 5;

      const mesh = ShapeFactory.create(type);
      mesh.position.set(x, 0.5, z);

      mgr.scene.add(mesh);
      historyRef.current?.snapshot(); //  record
    },

    enterSketchMode: (tool = "rectangle") => {
      setSketchTool(tool);
      setMode((m) => (m === "sketch" ? "normal" : "sketch"));
    },

    exportScene: () => {
      const mgr = managerRef.current;
      if (mgr) IOManager.export(mgr.scene);
    },

    importScene: (json: string) => {
      const mgr = managerRef.current;
      if (mgr) {
        IOManager.import(json, mgr.scene);
        historyRef.current?.snapshot();
      }
    },

    //  Undo/Redo bindings
    undo: () => historyRef.current?.undo(),
    redo: () => historyRef.current?.redo(),
  }));

  // Sketch Mode Handlers
  useEffect(() => {
    const mgr = managerRef.current;
    if (!mgr) return;
    const { camera, renderer, scene } = mgr;

    const getXZPoint = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const point = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, point);
      point.x = snapToGrid(point.x);
      point.z = snapToGrid(point.z);
      return point;
    };

    const onMouseDown = (e: MouseEvent) => {
      if (mode !== "sketch") return;
      drawing.current = true;
      startPoint.current = getXZPoint(e);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!drawing.current || !startPoint.current || mode !== "sketch") return;
      const current = getXZPoint(e);

      const makePreview = (shape: THREE.Shape, color: number) => {
        const geo = new THREE.ShapeGeometry(shape);
        const mat = new THREE.MeshBasicMaterial({ color, wireframe: true });
        if (previewMesh.current) scene.remove(previewMesh.current);
        previewMesh.current = new THREE.Mesh(geo, mat);
        previewMesh.current.position.set(startPoint.current!.x, 0.01, startPoint.current!.z);
        scene.add(previewMesh.current);
      };

      if (sketchTool === "rectangle") {
        const w = current.x - startPoint.current.x;
        const h = current.z - startPoint.current.z;
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(w, 0);
        shape.lineTo(w, h);
        shape.lineTo(0, h);
        shape.lineTo(0, 0);
        makePreview(shape, 0x22ccff);
      } else if (sketchTool === "circle") {
        const radius = startPoint.current.distanceTo(current);
        const shape = new THREE.Shape();
        shape.absarc(0, 0, radius, 0, Math.PI * 2, false);
        makePreview(shape, 0x44ff88);
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      if (!drawing.current || !startPoint.current || mode !== "sketch") return;
      drawing.current = false;
      const end = getXZPoint(e);

      if (previewMesh.current) {
        scene.remove(previewMesh.current);
        previewMesh.current = null;
      }

      let mesh: THREE.Mesh;

      if (sketchTool === "rectangle") {
        const width = end.x - startPoint.current.x;
        const height = end.z - startPoint.current.z;
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(width, 0);
        shape.lineTo(width, height);
        shape.lineTo(0, height);
        shape.lineTo(0, 0);
        const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.5, bevelEnabled: false });
        const material = new THREE.MeshStandardMaterial({ color: 0xff5533 });
        mesh = new THREE.Mesh(geometry, material);
        mesh.name = `extrude-rectangle`;
      } else {
        const radius = startPoint.current.distanceTo(end);
        const shape = new THREE.Shape();
        shape.absarc(0, 0, radius, 0, Math.PI * 2, false);
        const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.5, bevelEnabled: false });
        const material = new THREE.MeshStandardMaterial({ color: 0xffaa00 });
        mesh = new THREE.Mesh(geometry, material);
        mesh.name = `extrude-circle`;
      }

      mesh.position.set(startPoint.current.x, 0, startPoint.current.z);
      scene.add(mesh);
      historyRef.current?.snapshot(); //  record after extrusion
    };

    const canvas = renderer.domElement;
    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseup", onMouseUp);

    return () => {
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseup", onMouseUp);
    };
  }, [mode, sketchTool]);

  // Disable OrbitControls and Transform Gizmo during sketch
  useEffect(() => {
    const transform = transformRef.current;
    if (!transform) return;

    if (mode === "sketch") {
      transform.orbit.enabled = false;
      transform.orbit.enableZoom = false;
      transform.orbit.enablePan = false;
      (transform.transform as any).visible = false;
    } else {
      transform.orbit.enabled = true;
      transform.orbit.enableZoom = true;
      transform.orbit.enablePan = true;
      (transform.transform as any).visible = true;
    }
  }, [mode]);

  // Keyboard shortcuts for TransformControls
  useEffect(() => {
    const transform = transformRef.current;
    if (!transform) return;

    const handleKey = (e: KeyboardEvent) => {
      if (!transform) return;
      switch (e.key.toLowerCase()) {
        case "t":
          transform.transform.setMode("translate");
          break;
        case "r":
          transform.transform.setMode("rotate");
          break;
        case "s":
          transform.transform.setMode("scale");
          break;
        case "z":
          if (e.ctrlKey) historyRef.current?.undo();
          break;
        case "y":
          if (e.ctrlKey) historyRef.current?.redo();
          break;
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100vh",
        background: "#000",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {mode === "sketch" && (
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            color: "white",
            background: "#ff5533",
            padding: "4px 8px",
            pointerEvents: "none",
          }}
        >
          ✏️ Sketch Mode Active ({sketchTool}) — Camera Locked
        </div>
      )}
    </div>
  );
});

export default Canvas3D;
