import React from "react";

interface ToolbarProps {
  onAddShape: (type: "box" | "sphere" | "cylinder") => void;
  onSketchMode: (tool: "rectangle" | "circle") => void;
  isCircleSketchOn: boolean;
  isRectangleSketchOn: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onAddShape,
  onSketchMode,
  isCircleSketchOn,
  isRectangleSketchOn,
}) => (
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

    <button
      style={{
        background: isRectangleSketchOn ? "#ff5533" : "#1a1a1a",
        color: "white",
        border: "none",
        padding: "6px 10px",
        borderRadius: "4px",
      }}
      onClick={() => onSketchMode("rectangle")}
    >
      {isRectangleSketchOn ? "Exit Rectangle Sketch" : "Rectangle Sketch"}
    </button>

    <button
      style={{
        background: isCircleSketchOn ? "#ff5533" : "#1a1a1a",
        color: "white",
        border: "none",
        padding: "6px 10px",
        borderRadius: "4px",
      }}
      onClick={() => onSketchMode("circle")}
    >
      {isCircleSketchOn ? "Exit Circle Sketch" : "Circle Sketch"}
    </button>
  </div>
);
