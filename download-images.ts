import { access, mkdir, writeFile } from 'node:fs/promises';
import { images, type ImageAsset } from '../config/images';

const assets: ImageAsset[] = [];
function collect(value: unknown): void {
  if (!value || typeof value !== 'object') return;
  if ('src' in value && typeof value.src === 'string') {
    if (value.src.startsWith('/images/')) assets.push(value as ImageAsset);
  } else for (const item of Object.values(value)) collect(item);
}
async function main() {
collect(images);
await mkdir('public/images', { recursive: true });
const queue = assets.flatMap(asset => [...new Set([320, 640, asset.width])].filter(width => width <= asset.width).map(width => async () => {
  const id = asset.src.split('/').pop()!.replace('.jpg', '');
  const path = `public/images/${id}${width === asset.width ? '' : '-' + width}.jpg`;
  try { await access(path); return; } catch {}
  const height = Math.round(width * asset.height / asset.width);
  const url = new URL(`https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&h=${height}&q=85`);
  const response = await fetch(url, { signal: AbortSignal.timeout(45000) });
  if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) throw new Error(`${id}: HTTP ${response.status}`);
  const data = Buffer.from(await response.arrayBuffer());
  await writeFile(path, data);
  console.log(`${id}: saved ${data.length} bytes`);
}));
const failures: string[] = [];
await Promise.all(Array.from({ length: 4 }, async () => {
  for (;;) {
    const task = queue.shift(); if (!task) return;
    try { await task(); } catch (error) { failures.push(String(error)); }
  }
}));
if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
}
void main();
