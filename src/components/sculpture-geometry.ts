import * as THREE from "three";
export function createSculptureGeometry(coreDetail=1) {
 return {
  outer:new THREE.TorusGeometry(1.9,.18,32,128),
  inner:new THREE.TorusGeometry(1.25,.16,32,128),
  core:new THREE.IcosahedronGeometry(.52,coreDetail),
  satellite:new THREE.SphereGeometry(.11,20,20),
  helix:new THREE.SphereGeometry(.24,24,24),
 };
}
export function helixPosition(i:number) {
 return new THREE.Vector3(Math.cos(i*.85)*1.05,(i-4.5)*.38,Math.sin(i*.85)*1.05);
}
export function satellitePosition(i:number) {
 const angle=i*Math.PI*2/7;
 return new THREE.Vector3(Math.cos(angle),Math.sin(angle),Math.sin(angle*2)*.25).normalize().multiplyScalar(2.7);
}
