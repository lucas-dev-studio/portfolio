import * as THREE from 'three';

export const RIB_COUNT = 29;
export const RIB_SPACING = .115;
export const RIB_DEPTH = .064;
export const RIB_BEVEL = .018;
export const MOBILE_BLADE_SPACING = 1.3;
export const MOBILE_BLADE_SCALE = .68;

/** Open-ended ribbon section. Both edges follow the same nonintersecting sweep. */
export function createRibbonSection() {
  const shape = new THREE.Shape();
  shape.moveTo(-2.7, -.9); shape.bezierCurveTo(-1.9, -.7, -1.7, 2.15, .15, 1.85);
  shape.bezierCurveTo(1.65, 1.6, 1.3, -.75, 2.7, -.45);
  shape.lineTo(2.7, -.71); shape.bezierCurveTo(1.08, -1.03, 1.37, 1.31, .13, 1.56);
  shape.bezierCurveTo(-1.47, 1.83, -1.68, -.98, -2.7, -1.15); shape.closePath();
  return shape;
}

export function createRibbonRib() {
  return new THREE.ExtrudeGeometry(createRibbonSection(), { depth: RIB_DEPTH, bevelEnabled: true, bevelSize: .019, bevelThickness: RIB_BEVEL, bevelSegments: 2, steps: 1, curveSegments: 40 });
}

/** Closed concave blade with a tapered lenticular outline and physical edge thickness. */
export function createMobileBlade() {
  const rows = 28, cols = 12, vertices: number[] = [], indices: number[] = [];
  for (let side = 0; side < 2; side++) for (let j = 0; j <= rows; j++) for (let i = 0; i <= cols; i++) {
    const v = j / rows, u = i / cols * 2 - 1;
    const width = .055 + Math.pow(Math.sin(v * Math.PI), .7) * .52;
    vertices.push(u * width + Math.sin(v * Math.PI) * .13, (v - .5) * 1.55, Math.sin(v * Math.PI) * (1 - u * u) * .28 + (side ? -.028 : .028));
  }
  const offset = (rows + 1) * (cols + 1);
  for (let side = 0; side < 2; side++) for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const a = side * offset + j * (cols + 1) + i, b = a + 1, d = a + cols + 1, c = d + 1;
    if (side) indices.push(a, c, b, a, d, c); else indices.push(a, b, c, a, c, d);
  }
  const edge = (a: number, b: number) => indices.push(a, a + offset, b + offset, a, b + offset, b);
  for (let j = 0; j < rows; j++) { edge(j * (cols + 1), (j + 1) * (cols + 1)); edge((j + 1) * (cols + 1) + cols, j * (cols + 1) + cols); }
  for (let i = 0; i < cols; i++) { edge(i + 1, i); edge(rows * (cols + 1) + i, rows * (cols + 1) + i + 1); }
  const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3)); geometry.setIndex(indices); geometry.computeVertexNormals(); return geometry;
}
