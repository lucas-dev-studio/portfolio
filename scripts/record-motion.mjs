import { chromium } from '@playwright/test';
import path from 'node:path';
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1440,height:900},recordVideo:{dir:path.resolve('../../work/motion-recording'),size:{width:1440,height:900}}});
const page=await context.newPage();
await page.goto('http://127.0.0.1:5173/');
await page.locator('.sculpture-canvas[data-ready="true"]').waitFor();
await page.waitForTimeout(2000);
const scrollTo=async (target,duration=1800)=>{
 await page.evaluate(async ({target,duration})=>{
  const start=scrollY,begin=performance.now();
  await new Promise(resolve=>{
   const frame=(now)=>{const t=Math.min(1,(now-begin)/duration);const eased=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;window.scrollTo({top:start+(target-start)*eased,behavior:'instant'});if(t<1)requestAnimationFrame(frame);else resolve();};requestAnimationFrame(frame);
  });
 },{target,duration});
};
const position=async selector=>page.locator(selector).evaluate(el=>el.getBoundingClientRect().top+scrollY);
await scrollTo((await page.locator('.hero-sequence').evaluate(el=>el.getBoundingClientRect().top+scrollY+el.clientHeight-900)),3500);
await page.waitForTimeout(1200);
await scrollTo(await position('#servicos'),2400);
await page.waitForTimeout(1200);
await scrollTo(await position('.idea-story'),1800);
await page.waitForTimeout(600);
const story=await position('.idea-story');
const storyHeight=await page.locator('.idea-story').evaluate(el=>el.clientHeight);
await scrollTo(story+storyHeight-900,5000);
await page.waitForTimeout(700);
for(const selector of ['.work-sandbox','.work-educacional','#sobre-sandbox','#sobre-educacional','#sobre','#processo','.studio-faq','#contato']){
 await scrollTo(await position(selector)-30,1800);
 await page.waitForTimeout(900);
}
await scrollTo(await position('.studio-footer'),1500);
await page.waitForTimeout(900);
await context.close();
await page.video().saveAs(path.resolve('../preview-motion.webm'));
await browser.close();
console.log('Preview saved: outputs/preview-motion.webm');
