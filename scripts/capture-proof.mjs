import {chromium} from 'playwright';
const browser=await chromium.launch();
const page=await browser.newPage({viewport:{width:1440,height:900}});
await page.goto(process.env.SHOWCASE_BASE_URL || 'http://127.0.0.1:5176/');
await page.locator('[data-scene="hero"][data-ready="true"]').waitFor({timeout:15000});
await page.waitForTimeout(800);
await page.screenshot({path:process.env.SHOWCASE_BASE_URL ? 'docs/live-review.png' : 'docs/studio-review/desktop-hero-start.png'});
if(!process.env.SHOWCASE_BASE_URL){
 await page.evaluate(()=>window.scrollTo({top:240,behavior:'instant'}));
 await page.waitForTimeout(500);
 await page.screenshot({path:'docs/studio-review/desktop-hero-scroll.png'});
 await page.locator('#servicos').evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));
 await page.getByRole('button',{name:'IA',exact:true}).click();
 await page.locator('[data-service="ai"][data-ready="true"]').waitFor();
 await page.getByRole('button',{name:'Pausar animações',exact:true}).click();
 await page.waitForTimeout(500);
 await page.screenshot({path:'docs/studio-review/desktop-systems-paused.png'});
}
await browser.close();
