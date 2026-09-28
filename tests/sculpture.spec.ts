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

test("additional 3D scenes mount near view and their pause controls work",async({page})=>{
 await page.goto("/");
 for(const selector of [".service-sculpture",".about-sculpture",".contact-sculpture"]){
  const panel=page.locator(selector);
  await panel.scrollIntoViewIfNeeded();
  await expect(panel.locator(".sculpture-canvas")).toHaveAttribute("data-ready","true");
  const button=panel.getByRole("button");
  await button.click();
  await expect(button).toHaveAttribute("aria-pressed","true");
  await panel.screenshot({path:`../preview-3d-${selector.slice(1)}.png`});
 }
 await page.emulateMedia({reducedMotion:"reduce"});
 await expect(page.locator(".contact-sculpture button")).toBeDisabled();
});
