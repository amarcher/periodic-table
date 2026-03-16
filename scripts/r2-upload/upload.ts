/**
 * R2 upload script for element videos.
 *
 * Usage:
 *   npx tsx scripts/r2-upload/upload.ts --all              upload all videos from public/element-videos/
 *   npx tsx scripts/r2-upload/upload.ts --file <path>      upload a single video file
 *   npx tsx scripts/r2-upload/upload.ts --sync             upload only files not already in the bucket
 *   npx tsx scripts/r2-upload/upload.ts --list             list all objects in the bucket
 *   npx tsx scripts/r2-upload/upload.ts --update-manifest  generate/update src/data/videoManifest.ts
 *
 * Required env vars:
 *   R2_ACCOUNT_ID
 *   R2_ACCESS_KEY_ID
 *   R2_SECRET_ACCESS_KEY
 *   R2_BUCKET_NAME
 *   R2_PUBLIC_URL   e.g. https://videos.example.com  or  https://pub-abc123.r2.dev
 */

import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  type ListObjectsV2CommandOutput,
  type _Object,
} from '@aws-sdk/client-s3';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const VIDEOS_DIR = path.join(PROJECT_ROOT, 'public', 'element-videos');

// ---------------------------------------------------------------------------
// Env validation
// ---------------------------------------------------------------------------

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Error: missing required environment variable ${name}`);
    console.error('Copy .env.example to .env and fill in the R2_* values.');
    process.exit(1);
  }
  return value;
}

function getEnv(): {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl: string;
} {
  return {
    accountId: requireEnv('R2_ACCOUNT_ID'),
    accessKeyId: requireEnv('R2_ACCESS_KEY_ID'),
    secretAccessKey: requireEnv('R2_SECRET_ACCESS_KEY'),
    bucketName: requireEnv('R2_BUCKET_NAME'),
    publicUrl: requireEnv('R2_PUBLIC_URL').replace(/\/$/, ''),
  };
}

// ---------------------------------------------------------------------------
// S3 client
// ---------------------------------------------------------------------------

function createClient(env: ReturnType<typeof getEnv>): S3Client {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${env.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.accessKeyId,
      secretAccessKey: env.secretAccessKey,
    },
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parse atomicNumber from filenames like "010-Ne-veo31fast.mp4" → 10 */
export function parseAtomicNumber(filename: string): number | null {
  const match = /^(\d{3})-/.exec(path.basename(filename));
  if (!match) return null;
  const n = parseInt(match[1], 10);
  return Number.isNaN(n) ? null : n;
}

/** Parse element symbol from filenames like "010-Ne-veo31fast.mp4" → "Ne" */
export function parseSymbol(filename: string): string | null {
  const match = /^\d{3}-([A-Za-z]{1,3})-/.exec(path.basename(filename));
  return match ? match[1] : null;
}

function humanBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function listBucketKeys(
  client: S3Client,
  bucketName: string
): Promise<string[]> {
  const keys: string[] = [];
  let continuationToken: string | undefined;

  do {
    const resp: ListObjectsV2CommandOutput = await client.send(
      new ListObjectsV2Command({
        Bucket: bucketName,
        ContinuationToken: continuationToken,
      })
    );
    for (const obj of resp.Contents ?? []) {
      if (obj.Key) keys.push(obj.Key);
    }
    continuationToken = resp.IsTruncated ? resp.NextContinuationToken : undefined;
  } while (continuationToken);

  return keys;
}

// ---------------------------------------------------------------------------
// Upload
// ---------------------------------------------------------------------------

async function uploadFile(
  client: S3Client,
  bucketName: string,
  filePath: string
): Promise<void> {
  const filename = path.basename(filePath);
  const stat = fs.statSync(filePath);
  const body = fs.readFileSync(filePath);

  process.stdout.write(`  Uploading ${filename} (${humanBytes(stat.size)})... `);

  await client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: filename,
      Body: body,
      ContentType: 'video/mp4',
      CacheControl: 'public, max-age=31536000, immutable',
    })
  );

  console.log('done');
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

async function cmdList(
  client: S3Client,
  env: ReturnType<typeof getEnv>
): Promise<void> {
  console.log(`\nListing objects in bucket "${env.bucketName}"...\n`);

  let continuationToken: string | undefined;
  let totalSize = 0;
  let count = 0;
  const rows: Array<{ key: string; size: number; lastModified: Date | undefined }> = [];

  do {
    const resp: ListObjectsV2CommandOutput = await client.send(
      new ListObjectsV2Command({
        Bucket: env.bucketName,
        ContinuationToken: continuationToken,
      })
    );
    for (const obj of (resp.Contents ?? []) as _Object[]) {
      if (obj.Key) {
        rows.push({ key: obj.Key, size: obj.Size ?? 0, lastModified: obj.LastModified });
        totalSize += obj.Size ?? 0;
        count++;
      }
    }
    continuationToken = resp.IsTruncated ? resp.NextContinuationToken : undefined;
  } while (continuationToken);

  if (count === 0) {
    console.log('Bucket is empty.');
    return;
  }

  for (const row of rows) {
    const date = row.lastModified?.toISOString().slice(0, 10) ?? 'unknown';
    console.log(`  ${row.key.padEnd(40)} ${humanBytes(row.size).padStart(10)}  ${date}`);
  }

  console.log(`\n${count} object(s), ${humanBytes(totalSize)} total`);
}

async function cmdAll(
  client: S3Client,
  env: ReturnType<typeof getEnv>
): Promise<void> {
  const files = fs
    .readdirSync(VIDEOS_DIR)
    .filter((f) => f.endsWith('.mp4'))
    .map((f) => path.join(VIDEOS_DIR, f));

  if (files.length === 0) {
    console.log(`No .mp4 files found in ${VIDEOS_DIR}`);
    return;
  }

  console.log(`\nUploading ${files.length} file(s) from ${VIDEOS_DIR} to "${env.bucketName}"...\n`);

  let totalBytes = 0;
  for (const f of files) {
    totalBytes += fs.statSync(f).size;
  }
  console.log(`Total size: ${humanBytes(totalBytes)}\n`);

  for (const filePath of files) {
    await uploadFile(client, env.bucketName, filePath);
  }

  console.log(`\nAll uploads complete.`);
}

async function cmdFile(
  client: S3Client,
  env: ReturnType<typeof getEnv>,
  filePath: string
): Promise<void> {
  const resolved = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);

  if (!fs.existsSync(resolved)) {
    console.error(`Error: file not found: ${resolved}`);
    process.exit(1);
  }

  console.log(`\nUploading single file to "${env.bucketName}"...\n`);
  await uploadFile(client, env.bucketName, resolved);
  console.log('\nUpload complete.');
}

async function cmdSync(
  client: S3Client,
  env: ReturnType<typeof getEnv>
): Promise<void> {
  console.log(`\nSyncing ${VIDEOS_DIR} → "${env.bucketName}"...\n`);

  const localFiles = fs
    .readdirSync(VIDEOS_DIR)
    .filter((f) => f.endsWith('.mp4'));

  if (localFiles.length === 0) {
    console.log('No local .mp4 files found.');
    return;
  }

  process.stdout.write('Fetching existing bucket keys... ');
  const existingKeys = new Set(await listBucketKeys(client, env.bucketName));
  console.log(`${existingKeys.size} object(s) already in bucket.\n`);

  const toUpload = localFiles.filter((f) => !existingKeys.has(f));

  if (toUpload.length === 0) {
    console.log('Everything is up to date — nothing to upload.');
    return;
  }

  console.log(`${toUpload.length} new file(s) to upload:\n`);
  for (const filename of toUpload) {
    await uploadFile(client, env.bucketName, path.join(VIDEOS_DIR, filename));
  }
  console.log('\nSync complete.');
}

async function cmdUpdateManifest(env: ReturnType<typeof getEnv>): Promise<void> {
  // Import and run the manifest generator
  const { generateManifest } = await import('./generate-manifest.js');
  await generateManifest(env.publicUrl);
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------

function printUsage(): void {
  console.log(`
Usage:
  npx tsx scripts/r2-upload/upload.ts --all
  npx tsx scripts/r2-upload/upload.ts --file <path>
  npx tsx scripts/r2-upload/upload.ts --sync
  npx tsx scripts/r2-upload/upload.ts --list
  npx tsx scripts/r2-upload/upload.ts --update-manifest
`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    printUsage();
    process.exit(1);
  }

  // --update-manifest only needs R2_PUBLIC_URL, not the full client
  if (command === '--update-manifest') {
    const env = getEnv();
    await cmdUpdateManifest(env);
    return;
  }

  const env = getEnv();
  const client = createClient(env);

  switch (command) {
    case '--all':
      await cmdAll(client, env);
      break;
    case '--file': {
      const filePath = args[1];
      if (!filePath) {
        console.error('Error: --file requires a path argument');
        process.exit(1);
      }
      await cmdFile(client, env, filePath);
      break;
    }
    case '--sync':
      await cmdSync(client, env);
      break;
    case '--list':
      await cmdList(client, env);
      break;
    default:
      console.error(`Unknown command: ${command}`);
      printUsage();
      process.exit(1);
  }
}

main().catch((err: unknown) => {
  console.error('Fatal error:', err instanceof Error ? err.message : err);
  process.exit(1);
});
