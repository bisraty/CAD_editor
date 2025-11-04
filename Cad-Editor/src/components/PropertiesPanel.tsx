import type { SelectionInfo } from "../three/SelectionManager";
import * as THREE from "three";

export const PropertiesPanel = ({ selected }: { selected: SelectionInfo | null }) => {
  if (!selected) {
    return <div style={{ padding: "8px", color: "white" }}>No selection</div>;
  }

  const { type, object, normal, area, length } = selected;

  const vecToString = (v?: THREE.Vector3) =>
    v ? [v.x, v.y, v.z].map((n) => n.toFixed(2)).join(", ") : "—";

  const eulerToString = (e?: THREE.Euler) =>
    e ? [e.x, e.y, e.z].map((n) => n.toFixed(2)).join(", ") : "—";

  return (
    <div style={{ padding: "8px", color: "white" }}>
      <h3>Selection: {type}</h3>

      {type === "shape" && object && (
        <>
          <p><b>Position:</b> {vecToString(object.position)}</p>
          <p><b>Rotation:</b> {eulerToString(object.rotation)}</p>
          <p><b>Scale:</b> {vecToString(object.scale)}</p>
        </>
      )}

      {type === "face" && normal && area !== undefined && (
        <>
          <p><b>Normal:</b> {vecToString(normal)}</p>
          <p><b>Area:</b> {area.toFixed(4)}</p>
        </>
      )}

      {type === "edge" && length !== undefined && (
        <>
          <p><b>Length:</b> {length.toFixed(4)}</p>
        </>
      )}
    </div>
  );
};
