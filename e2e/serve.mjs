// Minimal static server for the exported site: /a/b -> /a/b.html; dynamic routes -> /a/[id].html; else index.html.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const root = join(process.cwd(), process.argv[2] ?? 'dist-e2e');
const port = Number(process.env.PORT ?? 4015);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.ico': 'image/x-icon' };
const isFile = async (f) => (await stat(join(root, f)).catch(() => null))?.isFile();

async function pick(pathname) {
  const clean = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, '');
  for (const f of [clean, `${clean}.html`, join(clean, 'index.html')]) if (await isFile(f)) return f;
  const dynamic = clean.replace(/\/[^/]+$/, '/[id]') + '.html';
  return (await isFile(dynamic)) ? dynamic : 'index.html';
}

createServer(async (req, res) => {
  const file = await pick(new URL(req.url, 'http://x').pathname);
  res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' });
  res.end(await readFile(join(root, file)));
}).listen(port, () => console.log(`serving ${root} on ${port}`));
