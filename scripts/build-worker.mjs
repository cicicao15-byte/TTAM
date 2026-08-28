import { mkdir, writeFile } from 'node:fs/promises';

const workerSource = `export default {
  async fetch(request, env) {
    const assetResponse = await env.ASSETS.fetch(request);
    if (assetResponse.status !== 404) return assetResponse;

    const url = new URL(request.url);
    if (request.method === 'GET' && !url.pathname.split('/').pop()?.includes('.')) {
      return env.ASSETS.fetch(new Request(new URL('/index.html', url), request));
    }

    return assetResponse;
  },
};
`;

await mkdir(new URL('../dist/server/', import.meta.url), { recursive: true });
await writeFile(new URL('../dist/server/index.js', import.meta.url), workerSource);
