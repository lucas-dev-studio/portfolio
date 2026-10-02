import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
const browser = await chromium.launch();
const page = await browser.newPage({viewport:{width:1440,height:900}});
const errors=[];
page.on('pageerror', e=>errors.push(e.message));
await mkdir('docs/studio-review',{recursive:true});
await page.goto('http://127.0.0.1:5176/');
for(const chapter of ['hero','sandbox','education','systems','contact']){
 const host=page.locator(`[data-scene="${chapter}"]`);
 await page.locator(({hero:'#inicio',sandbox:'#sobre-sandbox',education:'#sobre-educacional',systems:'#servicos',contact:'#contato'})[chapter]).evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));
 await host.locator('canvas').waitFor();
 await page.waitForFunction(chapter=>document.querySelector(`[data-scene="${chapter}"]`)?.getAttribute('data-ready')==='true',chapter);
 await page.waitForTimeout(1400);
 await page.screenshot({path:`docs/studio-review/desktop-${chapter}.png`});
}
await page.setViewportSize({width:390,height:844});
await page.goto('http://127.0.0.1:5176/');
for(const chapter of ['hero','sandbox','education','systems','contact']){
 const host=page.locator(`[data-scene="${chapter}"]`);
 await page.locator(({hero:'#inicio',sandbox:'#sobre-sandbox',education:'#sobre-educacional',systems:'#servicos',contact:'#contato'})[chapter]).evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));
 await host.locator('canvas').waitFor();
 await page.waitForFunction(chapter=>document.querySelector(`[data-scene="${chapter}"]`)?.getAttribute('data-ready')==='true',chapter);
 await page.waitForTimeout(1000);
 await page.screenshot({path:`docs/studio-review/mobile-${chapter}.png`});
}
for (const service of ['automation', 'ai']) {
 await page.setViewportSize({width:1440,height:900});
 await page.locator('#servicos').evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));
 await page.getByRole('button',{name: service==='ai'?'IA':'Automação',exact:true}).click();
 await page.waitForFunction(service=>document.querySelector('[data-scene="systems"]')?.getAttribute('data-service')===service && document.querySelector('[data-scene="systems"]')?.getAttribute('data-ready')==='true',service);
 await page.waitForTimeout(800);
 await page.screenshot({path:`docs/studio-review/desktop-systems-${service}.png`});
}
console.log(JSON.stringify({errors}));
await browser.close();
