import { test, expect } from "@playwright/test";
import { createSculptureGeometry, helixPosition, satellitePosition } from "../src/components/sculpture-geometry";
import { Vector3, type BufferGeometry } from "three";

test("actual meshes have disjoint radial shells under arbitrary rotation",()=>{
 const geometry=createSculptureGeometry();
 const shell=(g:BufferGeometry)=>{const a=g.getAttribute("position");const radii=Array.from({length:a.count},(_,i)=>new Vector3().fromBufferAttribute(a,i).length());return {min:Math.min(...radii),max:Math.max(...radii)}};
 const outer=shell(geometry.outer),inner=shell(geometry.inner),core=shell(geometry.core);
 expect(outer.min-inner.max).toBeGreaterThan(.3);
 expect(inner.min-core.max).toBeGreaterThan(.55);
 for(let i=0;i<7;i++){
  const r=.11*(i%3===0?1.7:.8);
  expect(satellitePosition(i).length()-r-outer.max).toBeGreaterThan(.4);
  for(let j=i+1;j<7;j++)expect(satellitePosition(i).distanceTo(satellitePosition(j))).toBeGreaterThan(r+.187);
 }
 for(let i=0;i<10;i++)for(let j=i+1;j<10;j++)expect(helixPosition(i).distanceTo(helixPosition(j))-.48).toBeGreaterThan(.3);
 Object.values(geometry).forEach(g=>g.dispose());
});

test("hero sculpture mounts and its pause control works",async({page})=>{
 await page.goto("/");
 await expect(page.locator(".ns-hero-object .sculpture-canvas")).toHaveAttribute("data-ready","true");
 await page.getByRole("button",{name:"Pausar animação 3D"}).click();
 await expect(page.getByRole("button",{name:"Reproduzir animação 3D"})).toBeVisible();
 await page.emulateMedia({reducedMotion:"reduce"});
 await expect(page.getByRole("button",{name:"Animação desativada pela preferência de movimento reduzido"})).toBeDisabled();
});
