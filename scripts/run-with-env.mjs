#!/usr/bin/env node
// Runs a command with the key=value pairs from .env added to its environment.
// The scripts in this repo read process.env and there is no dotenv dependency.
//   node scripts/run-with-env.mjs npx tsx scripts/generate-videos/clips.ts --dry-run
import { readFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const envFile = resolve(dirname(fileURLToPath(import.meta.url)), '..', '.env');
const env = { ...process.env };
for (const line of readFileSync(envFile, 'utf8').split('\n')) {
  const match = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/.exec(line);
  if (match && !line.trim().startsWith('#')) env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
}
const [cmd, ...args] = process.argv.slice(2);
if (!cmd) { console.error('usage: run-with-env.mjs <command> [args...]'); process.exit(2); }
spawn(cmd, args, { stdio: 'inherit', env }).on('exit', code => process.exit(code ?? 1));
