import React from "react";

interface ToolbarProps {
  onAddShape: (type: "box" | "sphere" | "cylinder") => void;
  onSketchMode: (tool: "rectangle" | "circle") => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ onAddShape, onSketchMode }) => (
  <div
    style={{
      display: "flex",
      gap: "8px",
      padding: "8px",
      background: "#333",
      color: "white",
    }}
  >
    <button onClick={() => onAddShape("box")}>Box</button>
    <button onClick={() => onAddShape("sphere")}>Sphere</button>
    <button onClick={() => onAddShape("cylinder")}>Cylinder</button>
    <button onClick={() => onSketchMode("rectangle")}>Rectangle Sketch</button>
    <button onClick={() => onSketchMode("circle")}>Circle Sketch</button>

  </div>
);
