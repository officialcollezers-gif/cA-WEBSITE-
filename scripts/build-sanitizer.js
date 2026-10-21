import { build } from 'esbuild';
// Vercel's CommonJS loader does not support require(ESM). Bundle the current
// sanitizer and parser together rather than downgrading or weakening sanitization.
await build({ entryPoints: ['server/sanitizer-entry.js'], outfile: 'server/generated/sanitizer.cjs', bundle: true, platform: 'node', target: 'node22', format: 'cjs', legalComments: 'eof' });
