// src/components/PropertiesPanel.tsx
import React, { useEffect, useState } from "react";
import * as THREE from "three";

interface Props {
  selected: THREE.Object3D | null;
}

export const PropertiesPanel: React.FC<Props> = ({ selected }) => {
  interface ObjectProps {
    position: THREE.Vector3;
    rotation: THREE.Euler;
    scale: THREE.Vector3;
    type: string;
  }

  const [props, setProps] = useState<ObjectProps | null>(null);

  useEffect(() => {
    if (!selected) return setProps(null);
    const update = () => {
      setProps({
        position: selected.position.clone(),
        rotation: selected.rotation.clone(),
        scale: selected.scale.clone(),
        type: selected.userData?.type || selected.type,
      });
    };
    update();

    const interval = setInterval(update, 200);
    return () => clearInterval(interval);
  }, [selected]);

  if (!props) return <div style={{ color: "white", padding: "8px" }}>No selection</div>;

  return (
    <div style={{ padding: "8px", color: "white" }}>
      <h3>{props.type}</h3>
      <p>
        <b>Position:</b> {props.position.x.toFixed(2)}, {props.position.y.toFixed(2)}, {props.position.z.toFixed(2)}
      </p>
      <p>
        <b>Rotation:</b> {props.rotation.x.toFixed(2)}, {props.rotation.y.toFixed(2)}, {props.rotation.z.toFixed(2)}
      </p>
      <p>
        <b>Scale:</b> {props.scale.x.toFixed(2)}, {props.scale.y.toFixed(2)}, {props.scale.z.toFixed(2)}
      </p>
    </div>
  );
};
