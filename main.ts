// A working best-site-01 entry (Node 22, standard library only): the site is this directory's app/ folder, plain
// static files a browser opens at app/index.html (ES modules, CSS, no build step), its content held in its own files:
// nothing it runs, styles or shows loads over the network. The program hands it in: it copies app/ and screenshots/
// from beside this file to /output and writes /output/dossier.json, the summary the judge reads (your screenshots, the
// first load's files and bytes, and your source), with the vendored make.fun library. Leave vendor/makefun-frontend.ts
// as it is: the scorer requires dossier.json to be byte for byte what its own copy writes.
//
// A starting point, not a winner: a plain recipe collection, a list of recipes and a page for each. Build the site the
// brief asks for in app/ (its content, ease of use, a phone layout, its look), put 3 or 4 PNG or JPEG screenshots of
// it running in screenshots/ (the first by name is the cover; one may be a 390 x 844 phone view; shots.json says which
// views this starter's were taken of), and run it.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files and directories in app/ or
// 16 MiB of app files: app/ counts beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 16777216 }),
);

// ---------------------------------------------------------------------------
// Authored check (fix pass 3): verify the dossier just written, then exit.
// This block only READS. It re-reads out/dossier.json and the screenshot
// files on disk and compares hashes, so a passing run leaves dossier.json
// byte-identical to a run without this block: nothing here writes to the
// repo or changes any output. Any mismatch is a hard failure — a message
// on stderr and exit code 1 — so a bad dossier can never slip through
// silently. What it checks, against the dossier buildDossier actually
// writes ({ schema, cover, text, images: [{ name, media_type, sha256,
// base64 }] }, images in name order, the first the cover):
//   - schema is exactly "makefun/dossier/v1";
//   - cover is an integer inside the images array;
//   - images is a non-empty array and text is a non-empty string;
//   - per screenshot: the file exists in the output, and the sha256 of
//     the output file, the sha256 recorded in the dossier, and the sha256
//     of the repo's own screenshots/ file are all the same;
//   - where the dossier embeds base64, the sha256 of the decoded bytes
//     matches the dossier's sha256 too.
// ---------------------------------------------------------------------------

const failVerify = (message: string): never => {
  console.error(`verify dossier: ${message}`);
  process.exit(1);
};

const sha256Hex = (bytes: Uint8Array): string =>
  createHash('sha256').update(bytes).digest('hex');

const dossierPath = join(out, 'dossier.json');
let dossier: unknown;
try {
  dossier = JSON.parse(readFileSync(dossierPath, 'utf8'));
} catch (err) {
  failVerify(`cannot read or parse ${dossierPath}: ${(err as Error).message}`);
}
const doc = dossier as {
  schema?: unknown;
  cover?: unknown;
  text?: unknown;
  images?: Array<{ name?: unknown; media_type?: unknown; sha256?: unknown; base64?: unknown }>;
};

if (doc.schema !== 'makefun/dossier/v1') {
  failVerify(`schema is ${JSON.stringify(doc.schema)}, expected "makefun/dossier/v1"`);
}
if (!Array.isArray(doc.images) || doc.images.length === 0) {
  failVerify('images is empty or not an array');
}
if (typeof doc.text !== 'string' || doc.text.length === 0) {
  failVerify('text is empty or not a string');
}
if (!Number.isInteger(doc.cover) || (doc.cover as number) < 0 || (doc.cover as number) >= doc.images.length) {
  failVerify(`cover is ${String(doc.cover)}, outside 0..${doc.images.length - 1}`);
}

for (const image of doc.images) {
  if (typeof image.name !== 'string' || image.name.length === 0) {
    failVerify('an image entry has no name');
  }
  if (typeof image.sha256 !== 'string' || image.sha256.length === 0) {
    failVerify(`screenshots/${image.name}: dossier records no sha256`);
  }
  if (image.media_type !== 'image/png' && image.media_type !== 'image/jpeg') {
    failVerify(`screenshots/${image.name}: media_type is ${JSON.stringify(image.media_type)}, expected image/png or image/jpeg`);
  }
  const outShot = join(out, 'screenshots', image.name as string);
  if (!existsSync(outShot)) {
    failVerify(`screenshots/${image.name}: missing from output`);
  }
  const repoShot = join(here, 'screenshots', image.name as string);
  if (!existsSync(repoShot)) {
    failVerify(`screenshots/${image.name}: missing from repo screenshots/`);
  }
  const outHash = sha256Hex(readFileSync(outShot));
  if (outHash !== image.sha256) {
    failVerify(`screenshots/${image.name}: sha256 of output file ${outHash} != dossier ${image.sha256}`);
  }
  const repoHash = sha256Hex(readFileSync(repoShot));
  if (repoHash !== image.sha256) {
    failVerify(`screenshots/${image.name}: sha256 of repo file ${repoHash} != dossier ${image.sha256}`);
  }
  if (typeof image.base64 === 'string' && image.base64.length > 0) {
    const embeddedHash = sha256Hex(Buffer.from(image.base64, 'base64'));
    if (embeddedHash !== image.sha256) {
      failVerify(`screenshots/${image.name}: sha256 of embedded base64 ${embeddedHash} != dossier ${image.sha256}`);
    }
  }
}
