import * as THREE from "three";
export type SculptureVariant = "orbit" | "helix" | "core" | "bloom";
export function createVariant(
  variant: SculptureVariant,
  silver: THREE.Material,
  blue: THREE.Material,
) {
  const group = new THREE.Group();
  const geometries: THREE.BufferGeometry[] = [];
  const parts: THREE.Mesh[] = [];
  if (variant === "core") {
    const geometry = new THREE.BoxGeometry(0.42, 0.42, 0.42, 1, 1, 1);
    geometries.push(geometry);
    for (let x = -1; x <= 1; x++)
      for (let y = -1; y <= 1; y++)
        for (let z = -1; z <= 1; z++) {
          const piece = new THREE.Mesh(
            geometry,
            (x + y + z) % 2 === 0 ? blue : silver,
          );
          piece.position.set(x * 0.72, y * 0.72, z * 0.72);
          piece.userData.base = piece.position.clone();
          group.add(piece);
          parts.push(piece);
        }
    group.rotation.set(0.45, 0.55, 0.2);
  }
  if (variant === "helix") {
    // A broad continuous ribbon: radial width .48, vertical pitch 1.5.
    const vertices: number[] = [],
      indices: number[] = [];
    for (let i = 0; i <= 240; i++) {
      const angle = (i / 240) * Math.PI * 4;
      for (const radius of [0.8, 1.28])
        vertices.push(
          Math.cos(angle) * radius,
          (i / 240 - 0.5) * 3,
          Math.sin(angle) * radius,
        );
      if (i < 240) {
        const k = i * 2;
        indices.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3),
    );
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    geometries.push(geometry);
    const ribbon = new THREE.Mesh(geometry, silver);
    group.add(ribbon);
    const curve = new THREE.CatmullRomCurve3(
      Array.from({ length: 161 }, (_, i) => {
        const a = (i / 160) * Math.PI * 4;
        return new THREE.Vector3(
          Math.cos(a) * 1.3,
          (i / 160 - 0.5) * 3,
          Math.sin(a) * 1.3,
        );
      }),
    );
    const edge = new THREE.TubeGeometry(curve, 240, 0.035, 8, false);
    geometries.push(edge);
    group.add(new THREE.Mesh(edge, blue));
    group.rotation.z = -0.25;
  }
  if (variant === "bloom") {
    const geometry = new THREE.BoxGeometry(0.95, 0.12, 0.32);
    geometries.push(geometry);
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const blade = new THREE.Mesh(geometry, i % 3 === 0 ? blue : silver);
      blade.position.set(Math.cos(angle) * 1.65, Math.sin(angle) * 1.65, 0);
      blade.rotation.z = angle;
      blade.userData.base = blade.position.clone();
      group.add(blade);
      parts.push(blade);
    }
    group.rotation.x = 0.45;
  }
  return {
    group,
    update(t: number, scroll: number) {
      if (variant === "core") {
        const spread = 1.1 + 0.25 * (1 + Math.sin(t * 0.7)) + scroll * 0.25;
        parts.forEach((p) =>
          p.position.copy(p.userData.base).multiplyScalar(spread),
        );
        group.rotation.y = 0.55 + t * 0.18 + scroll;
      } else if (variant === "helix") {
        group.rotation.y = t * 0.25 + scroll * 2;
        group.rotation.x = Math.sin(t * 0.3) * 0.1;
      } else if (variant === "bloom") {
        parts.forEach((p) =>
          p.position
            .copy(p.userData.base)
            .multiplyScalar(1 + 0.12 * Math.sin(t * 0.6)),
        );
        group.rotation.z = t * 0.15;
        group.rotation.y = Math.sin(t * 0.3) * 0.35;
      }
    },
    dispose() {
      geometries.forEach((g) => g.dispose());
    },
  };
}
