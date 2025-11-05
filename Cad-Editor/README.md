# 🧩 React + Three.js CAD Editor

A minimal browser-based CAD editor built using **React** and **plain Three.js** (no React-Three-Fiber).  
Supports 3D primitive creation, 2D sketching + extrusion, entity selection, transformations, and import/export — all inside a single interactive canvas.

---

## 🚀 Live Demo

**Deployed URL:** https://beamish-meerkat-fd3dd1.netlify.app/ 

---

## 🧰 Tech Stack

- **React (TypeScript)** — UI and state management  
- **Three.js** — 3D rendering and geometry operations  
- **Vite** or **CRA** — development/build environment  
- **Plain DOM integration** (no react-three-fiber)

---

## 📁 Project Structure

The following describes the source layout and purpose of key folders/files in this repository.

- src/
  - three/ — Core Three.js helpers and managers
    - SceneManager.ts — Scene, camera, renderer setup
    - ShapeFactory.ts — Box, Sphere, Cylinder primitives
    - SketchManager.ts — (optional future extension) sketch-specific logic
    - SelectionManager.ts — Raycasting for edge/face/shape selection
    - TransformManager.ts — Move, rotate, scale via TransformControls
    - HistoryManager.ts — Undo/Redo system
    - IOManager.ts — Import/Export scene as JSON
    - utils.ts — Helpers: grid, snapping, etc.
  - components/ — React UI components
    - Canvas3D.tsx — Three.js renderer & canvas logic
    - Toolbar.tsx — Buttons for create, sketch, transform, undo/redo
    - PropertiesPanel.tsx — Shows info about selected entity
    - FileMenu.tsx — Import/Export controls
    - Layout.tsx — App layout (toolbar + canvas + side panel)
  - hooks/
    - useCADApp.ts — Global app state management (optional)
  - App.tsx — Application root
  - index.tsx — Entrypoint / DOM mounting

Place new features in the most appropriate manager under src/three/ and keep UI concerns inside src/components/. This layout keeps rendering/geometry logic separate from React UI code.

---

## 🧩 Core Features

### 🔷 1. Primitive Shape Creation
- Create **Box**, **Sphere**, and **Cylinder** using toolbar buttons.  
- Each shape has distinct faces and edges (outlined using `EdgesGeometry`).  
- Click on:
  - **Face** → highlight and display its **normal vector** and **area**  
  - **Edge** → highlight and display its **length**  
  - **Shape body** → select the entire object for transformation

---

### 🟩 2. 2D Sketch Mode & Extrusion
- Enter **Sketch Mode** (choose **Rectangle** or **Circle** tool)  
- Draw directly on the **XZ plane** (click and drag)  
- **Snap-to-grid** precision for accurate shapes  
- Real-time **wireframe preview** while sketching  
- On mouse release → automatically **extrudes** the 2D sketch into a 3D mesh using `THREE.ExtrudeGeometry`

---

### 🔶 3. Selection & Transformation
- Click any entity to select (**face**, **edge**, or **shape**)  
- Transform selected objects using keyboard shortcuts:
  - **T** → Translate  
  - **R** → Rotate  
  - **S** → Scale  
- The **Transform gizmo** (`TransformControls`) appears on the selected object  
- The **Properties Panel** displays real-time position, rotation, and scale

---

## 🧪 Future Directions

- **Sketch-specific logic** (e.g., lines, curves, polygons)
- **Advanced extrusion options** (e.g., bevel, chamfer)
- **More complex transformations** (e.g., rotation around arbitrary axes)
- **Improved selection** (e.g., multi-select, edge selection)
- **Better integration with CAD tools** (e.g., import/export from .stl, .obj, .dxf)

---

## 🧩 Core Features

### 🔷 1. Primitive Shape Creation
- Create **Box**, **Sphere**, and **Cylinder** using toolbar buttons.  
- Each shape has distinct faces and edges (outlined using `EdgesGeometry`).  
- Click on:
  - **Face** → highlight and display its **normal vector** and **area**  
  - **Edge** → highlight and display its **length**  
  - **Shape body** → select the entire object for transformation

---

### 🟩 2. 2D Sketch Mode & Extrusion
- Enter **Sketch Mode** (choose **Rectangle** or **Circle** tool)  
- Draw directly on the **XZ plane** (click and drag)  
- **Snap-to-grid** precision for accurate shapes  
- Real-time **wireframe preview** while sketching  
- On mouse release → automatically **extrudes** the 2D sketch into a 3D mesh using `THREE.ExtrudeGeometry`

---

### 🔶 3. Selection & Transformation
- Click any entity to select (**face**, **edge**, or **shape**)  
- Transform selected objects using keyboard shortcuts:
  - **T** → Translate  
  - **R** → Rotate  
  - **S** → Scale  
- The **Transform gizmo** (`TransformControls`) appears on the selected object  
- The **Properties Panel** displays real-time position, rotation, and scale

---

## 🧪 Future Directions

- **Sketch-specific logic** (e.g., lines, curves, polygons)
- **Advanced extrusion options** (e.g., bevel, chamfer)
- **More complex transformations** (e.g., rotation around arbitrary axes)
- **Improved selection** (e.g., multi-select, edge selection)
- **Better integration with CAD tools** (e.g., import/export from .stl, .obj, .dxf)
