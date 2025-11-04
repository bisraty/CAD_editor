// src/components/Layout.tsx
import  { useRef, useState } from "react";
import type { Object3D } from "three";
import Canvas3D, { type Canvas3DRef } from "./Canvas3D";
import { Toolbar } from "./Toolbar";
import { PropertiesPanel } from "./PropertiesPanel";
import { FileMenu } from "./FileMenu";

const Layout = () => {
  const canvasRef = useRef<Canvas3DRef>(null);
  const [selected, setSelected] = useState<Object3D | null>(null);

  const handleAddShape = (type: "box" | "sphere" | "cylinder") => {
    canvasRef.current?.addShape(type);
  };

  const handleSketchMode = (tool: "rectangle" | "circle") => {
    canvasRef.current?.enterSketchMode(tool);
  };

  const handleExport = () => canvasRef.current?.exportScene();
  const handleImport = (json: string) => canvasRef.current?.importScene(json);

  return (
    <div style={{ display: "flex", flexDirection: "row", height: "100vh" }}>
      <div style={{ flex: 1, position: "relative" }}>
        <Toolbar onAddShape={handleAddShape} onSketchMode={handleSketchMode} />
        <FileMenu onExport={handleExport} onImport={handleImport} />
        <Canvas3D ref={canvasRef} onSelect={setSelected} />
      </div>
      <div style={{ width: "300px", background: "#222" }}>
        <PropertiesPanel selected={selected} />
      </div>
    </div>
  );
};

export default Layout;
