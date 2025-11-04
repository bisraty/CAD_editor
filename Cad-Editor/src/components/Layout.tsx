import  { useRef, useState } from "react";
import Canvas3D, { type Canvas3DRef } from "./Canvas3D";
import { Toolbar } from "./Toolbar";
import { PropertiesPanel } from "./PropertiesPanel";
import { FileMenu } from "./FileMenu";
import type { SelectionInfo } from "../three/SelectionManager";

const Layout = () => {
  const canvasRef = useRef<Canvas3DRef>(null);
const [selected, setSelected] = useState<SelectionInfo | null>(null);

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
         <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between",  }}>
              <Toolbar onAddShape={handleAddShape} onSketchMode={handleSketchMode} />
                  <FileMenu onExport={handleExport} onImport={handleImport} />
                  <div  style={{
      display: "flex",
      gap: "8px",
      padding: "8px",
      background: "#333",
      color: "white",
    }}>
                      <button onClick={() => canvasRef.current?.undo?.()}>Undo</button>
                     <button onClick={() => canvasRef.current?.redo?.()}>Redo</button></div>      

              </div>    
        
        <Canvas3D ref={canvasRef} onSelect={setSelected} />
      </div>
      <div style={{ width: "300px", background: "#222" }}>
        <PropertiesPanel selected={selected} />
      </div>
    </div>
  );
};

export default Layout;
