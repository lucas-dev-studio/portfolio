// Local test harness for the static Pages artifact and its _headers file.
// Cloudflare edge behavior must also be verified after deployment.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve('dist');
const rules = [];
for (const line of (await readFile(resolve(root, '_headers'), 'utf8')).split(/\r?\n/)) {
  if (!line.trim() || line.startsWith('#')) continue;
  if (!/^\s/.test(line)) rules.push({ path: line.trim(), headers: [] });
  else rules.at(-1).headers.push(line.trim());
}
const mime = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.css':'text/css', '.svg':'image/svg+xml', '.png':'image/png', '.woff':'font/woff', '.woff2':'font/woff2' };
createServer(async (req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400); res.end('Bad request'); return; }
  for (const rule of rules) {
    if (!(rule.path === pathname || rule.path.endsWith('*') && pathname.startsWith(rule.path.slice(0,-1)))) continue;
    for (const header of rule.headers) {
      if (header.startsWith('! ')) res.removeHeader(header.slice(2));
      else { const i = header.indexOf(':'); res.setHeader(header.slice(0,i), header.slice(i+1).trim()); }
    }
  }
  if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405); res.end(); return; }
  let path = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  let status = 200;
  try {
    if (!path.startsWith(root + sep) || pathname.includes('\\') || pathname === '/_headers' || !(await stat(path)).isFile()) throw new Error('not found');
  } catch { status = 404; path = resolve(root, '404.html'); }
  const data = await readFile(path);
  res.writeHead(status, { 'Content-Type': mime[extname(path)] || 'application/octet-stream' });
  res.end(req.method === 'HEAD' ? undefined : data);
}).listen(5175, '127.0.0.1', () => console.log('Security preview: http://127.0.0.1:5175'));
