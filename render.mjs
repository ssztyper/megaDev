// Renders a kb page to static HTML the way the desk will see it.
// usage: node render.mjs [route]   (default /kb/incidents/4471-split) -> rendered/<name>.html
import { createServer } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import { render } from 'svelte/server';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname);
const route = process.argv[2] ?? '/kb/incidents/4471-split';
const server = await createServer({
  root,
  logLevel: 'error',
  appType: 'custom',
  server: { middlewareMode: true },
  resolve: { alias: { '#lib': path.join(root, 'src/lib') } },
  plugins: [
    svelte({
      extensions: ['.svelte', '.svx'],
      compilerOptions: { dev: false },
      preprocess: mdsvex({ extensions: ['.svx'], layout: { runbook: path.join(root, 'src/lib/layouts/runbook.svelte') } }),
    }),
  ],
});
try {
  const mod = await server.ssrLoadModule(`/src/routes${route}/+page.svx`);
  const { body, head } = render(mod.default);
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>${head}</head><body>${body}</body></html>`;
  mkdirSync(path.join(root, 'rendered'), { recursive: true });
  const out = path.join(root, 'rendered', route.split('/').filter(Boolean).pop() + '.html');
  writeFileSync(out, html);
  console.log('wrote', out, html.length, 'bytes');
} finally {
  await server.close();
}
