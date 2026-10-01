import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const failures = [];
async function files(dir) {
  const result = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Symlink not allowed: ${path}`);
    if (entry.isDirectory()) result.push(...await files(path));
    else result.push(path);
  }
  return result;
}
const allowed = /^(?:index\.html|404\.html|_headers|favicon\.svg|robots\.txt|sitemap\.xml|social-preview\.png|images\/sandbox\.png|assets\/[a-zA-Z0-9_.-]+\.(?:js|css|woff2?))$/;
const secretPatterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\bAKIA[0-9A-Z]{16}\b/,
  /\b(?:ghp_|github_pat_|sk-proj-)[A-Za-z0-9_-]{20,}\b/,
  /\beyJ[A-Za-z0-9_-]{12,}\.eyJ[A-Za-z0-9_-]{12,}\.[A-Za-z0-9_-]{16,}\b/,
  /(?:api[_-]?key|client[_-]?secret|password|access[_-]?token)\s*[=:]\s*["'][A-Za-z0-9_+/=-]{20,}["']/i,
];
const dist = join(root, 'dist');
const published = await files(dist);
for (const path of published) {
  const name = relative(dist, path).replaceAll('\\', '/');
  if (!allowed.test(name)) failures.push(`Unexpected public file: ${name}`);
  if (/\.(?:js|css|html|svg)$/.test(name)) {
    const content = await readFile(path, 'utf8');
    if (secretPatterns.some(pattern => pattern.test(content))) failures.push(`Potential secret in ${name} (value suppressed)`);
    if (/sourceMappingURL=/.test(content)) failures.push(`Source map reference in ${name}`);
  }
}
const source = [...await files(join(root, 'src')), ...await files(join(root, 'public'))];
for (const path of source) {
  if (/\.(?:tsx?|css|html|svg)$/.test(path)) {
    const content = await readFile(path, 'utf8');
    if (secretPatterns.some(pattern => pattern.test(content))) failures.push(`Potential secret in ${relative(root, path)} (value suppressed)`);
  }
}
const lock = JSON.parse(await readFile(join(root, 'package-lock.json'), 'utf8'));
for (const [name, pkg] of Object.entries(lock.packages)) {
  if (!name) continue;
  if (!pkg.integrity || !pkg.resolved?.startsWith('https://registry.npmjs.org/')) failures.push(`Unpinned or non-registry package: ${name}`);
}
for (const entry of await readdir(root)) {
  if (entry.startsWith('.env')) failures.push(`Environment file requires explicit review: ${entry}`);
}
if (Object.keys(process.env).some(key => key.startsWith('VITE_'))) failures.push('Unexpected VITE_ environment variable; review before building');
if (failures.length) {
  failures.forEach(failure => console.error(failure));
  process.exitCode = 1;
} else {
  console.log(`Release checks passed: ${published.length} public files, ${source.length} source/public files, ${Object.keys(lock.packages).length - 1} locked dependencies. Pattern scan is not proof of absence of secrets.`);
}
