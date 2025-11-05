/* eslint-disable @typescript-eslint/no-explicit-any */
import * as THREE from "three";

export class IOManager {
  // Serialize scene, excluding helpers */
  static serialize(scene: THREE.Scene): string {
    const data: any = { objects: [] };

    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh && !obj.name.includes("helper")) {
        const mesh = obj as THREE.Mesh;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        const geom: any = mesh.geometry;
        const params = geom.parameters ?? {};

        // Detect sketch tool type from mesh name
        let sketchTool: "rectangle" | "circle" | undefined;
        if (mesh.name.includes("circle")) sketchTool = "circle";
        else if (mesh.name.includes("rect")) sketchTool = "rectangle";

        data.objects.push({
          name: mesh.name || "mesh",
          type: geom.type ?? "UnknownGeometry",
          position: mesh.position.toArray(),
          rotation: [mesh.rotation.x, mesh.rotation.y, mesh.rotation.z],
          scale: mesh.scale.toArray(),
          color: mat?.color?.getHex() ?? 0xffffff, 
          geometryParams: params,
          sketchTool,
        });
      }
    });

    return JSON.stringify(data, null, 2);
  }

  // Export scene as downloadable JSON
  static export(scene: THREE.Scene) {
    try {
      const json = IOManager.serialize(scene);
      const blob = new Blob([json], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "cad_scene.json";
      link.click();
      console.log(" Scene exported successfully");
    } catch (err) {
      console.error("❌ Scene export failed:", err);
    }
  }

  // Import scene from simplified JSON structure
  static import(json: string, scene: THREE.Scene) {
    try {
      const data = typeof json === "string" ? JSON.parse(json) : json;

      // Preserve helpers (grid, etc.)
      const preserved = scene.children.filter(
        (o) => o.type.includes("Helper") || o.name === "grid-helper"
      );
      scene.clear();
      preserved.forEach((h) => scene.add(h));

      //  Ensure lighting exists
      const hasLight = preserved.some((o) => o.type.includes("Light"));
      if (!hasLight) {
        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        const directional = new THREE.DirectionalLight(0xffffff, 0.8);
        directional.position.set(5, 10, 5);
        scene.add(ambient);
        scene.add(directional);
      }

      // Grid layout for primitives only
      const spacing = 2.5;
      const cols = 5;
      let primitiveIndex = 0;

      data.objects.forEach((obj: any) => {
        let geometry: THREE.BufferGeometry;

        switch (obj.type) {
          case "BoxGeometry":
            geometry = new THREE.BoxGeometry(
              obj.geometryParams.width ?? 1,
              obj.geometryParams.height ?? 1,
              obj.geometryParams.depth ?? 1
            );
            break;
          case "SphereGeometry":
            geometry = new THREE.SphereGeometry(
              obj.geometryParams.radius ?? 0.5,
              16,
              16
            );
            break;
          case "CylinderGeometry":
            geometry = new THREE.CylinderGeometry(
              obj.geometryParams.radiusTop ?? 0.4,
              obj.geometryParams.radiusBottom ?? 0.4,
              obj.geometryParams.height ?? 1,
              16
            );
            break;
          case "ExtrudeGeometry": {
            const tool = obj.sketchTool || "rectangle";
            let shape: THREE.Shape;

            if (tool === "circle") {
              shape = new THREE.Shape();
              shape.absarc(0, 0, obj.geometryParams.radius ?? 1, 0, Math.PI * 2);
            } else {
              const w = obj.geometryParams.width ?? 1;
              const h = obj.geometryParams.height ?? 1;
              shape = new THREE.Shape([
                new THREE.Vector2(0, 0),
                new THREE.Vector2(w, 0),
                new THREE.Vector2(w, h),
                new THREE.Vector2(0, h),
              ]);
            }

            geometry = new THREE.ExtrudeGeometry(shape, {
              depth: obj.geometryParams.depth ?? 0.5,
              bevelEnabled: false,
            });
            break;
          }
          default:
            geometry = new THREE.BoxGeometry(1, 1, 1);
            break;
        }

        //  Correct material color
        const material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(obj.color ?? 0xffffff),
          roughness: 0.4,
          metalness: 0.2,
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = obj.name;
        mesh.userData = {};

        // Restore original transform
        mesh.position.fromArray(obj.position);
        mesh.rotation.set(obj.rotation[0], obj.rotation[1], obj.rotation[2]);
        mesh.scale.fromArray(obj.scale);

        // Apply grid offset only to primitives
        const isPrimitive =
          obj.type === "BoxGeometry" ||
          obj.type === "SphereGeometry" ||
          obj.type === "CylinderGeometry";

        if (isPrimitive) {
          const x =
            (primitiveIndex % cols) * spacing - ((cols - 1) * spacing) / 2;
          const z = Math.floor(primitiveIndex / cols) * spacing - 5;
          mesh.position.x = x;
          mesh.position.z = z;
          primitiveIndex++;
        }

        // Center vertically
        mesh.geometry.computeBoundingBox();
        const bbox = mesh.geometry.boundingBox;
        if (bbox) {
          const height = bbox.max.y - bbox.min.y;
          mesh.position.y = height / 2;
        }

        // Add edge outlines
        const edges = new THREE.LineSegments(
          new THREE.EdgesGeometry(mesh.geometry),
          new THREE.LineBasicMaterial({ color: 0xffffff })
        );
        mesh.add(edges);

        scene.add(mesh);
      });
    } catch (err) {
      console.error(" Failed to import scene:", err);
    }
  }
}
