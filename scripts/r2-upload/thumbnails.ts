/**
 * Generate video thumbnail JPGs with ffmpeg and upload them to R2
 * alongside the MP4s.
 *
 * Usage:
 *   npx tsx scripts/r2-upload/thumbnails.ts --generate     extract first-frame JPG for every local .mp4
 *   npx tsx scripts/r2-upload/thumbnails.ts --upload       upload all local .jpg files to R2 (sync — skip existing)
 *   npx tsx scripts/r2-upload/thumbnails.ts --all          generate then upload
 *
 * Required env vars match scripts/r2-upload/upload.ts.
 */

import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  type ListObjectsV2CommandOutput,
} from '@aws-sdk/client-s3';
import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const VIDEOS_DIR = path.join(PROJECT_ROOT, 'public', 'element-videos');

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(`Error: missing required environment variable ${name}`);
    process.exit(1);
  }
  return v;
}

function getEnv() {
  return {
    accountId: requireEnv('R2_ACCOUNT_ID'),
    accessKeyId: requireEnv('R2_ACCESS_KEY_ID'),
    secretAccessKey: requireEnv('R2_SECRET_ACCESS_KEY'),
    bucketName: requireEnv('R2_BUCKET_NAME'),
  };
}

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

function listMp4s(): string[] {
  return fs
    .readdirSync(VIDEOS_DIR)
    .filter((f) => f.endsWith('.mp4'))
    .sort();
}

function jpgPathFor(mp4Path: string): string {
  return mp4Path.replace(/\.mp4$/i, '.jpg');
}

function generateThumbnails() {
  const mp4s = listMp4s();
  if (mp4s.length === 0) {
    console.log('No .mp4 files found in', VIDEOS_DIR);
    return;
  }
  console.log(`Generating thumbnails for ${mp4s.length} videos...`);
  let generated = 0;
  let skipped = 0;
  for (const filename of mp4s) {
    const mp4 = path.join(VIDEOS_DIR, filename);
    const jpg = jpgPathFor(mp4);
    if (fs.existsSync(jpg)) {
      skipped++;
      continue;
    }
    // -ss 1.5: pick a frame 1.5s in (skips any fade-in / black frames).
    // -vframes 1: single frame.
    // -q:v 3: high quality JPEG (1=best, 31=worst).
    // -vf scale=1200:-2: width 1200, height auto (multiple of 2).
    try {
      execFileSync(
        'ffmpeg',
        [
          '-y',
          '-ss',
          '1.5',
          '-i',
          mp4,
          '-vframes',
          '1',
          '-q:v',
          '3',
          '-vf',
          'scale=1200:-2',
          jpg,
        ],
        { stdio: ['ignore', 'ignore', 'pipe'] }
      );
      generated++;
      process.stdout.write(`.`);
    } catch (err) {
      console.error(`\nfailed on ${filename}:`, err instanceof Error ? err.message : err);
    }
  }
  console.log(`\nGenerated ${generated} thumbnail(s), ${skipped} already existed.`);
}

async function listBucketKeys(client: S3Client, bucketName: string): Promise<Set<string>> {
  const keys = new Set<string>();
  let token: string | undefined;
  do {
    const resp: ListObjectsV2CommandOutput = await client.send(
      new ListObjectsV2Command({ Bucket: bucketName, ContinuationToken: token })
    );
    for (const obj of resp.Contents ?? []) {
      if (obj.Key) keys.add(obj.Key);
    }
    token = resp.IsTruncated ? resp.NextContinuationToken : undefined;
  } while (token);
  return keys;
}

async function uploadThumbnails() {
  const env = getEnv();
  const client = createClient(env);
  const localJpgs = fs.readdirSync(VIDEOS_DIR).filter((f) => f.endsWith('.jpg')).sort();
  if (localJpgs.length === 0) {
    console.log('No .jpg files found. Run --generate first.');
    return;
  }
  console.log(`Checking bucket "${env.bucketName}" for existing thumbnails...`);
  const existing = await listBucketKeys(client, env.bucketName);
  const toUpload = localJpgs.filter((f) => !existing.has(f));
  if (toUpload.length === 0) {
    console.log('All thumbnails already in bucket — nothing to upload.');
    return;
  }
  console.log(`Uploading ${toUpload.length} thumbnail(s)...`);
  for (const filename of toUpload) {
    const body = fs.readFileSync(path.join(VIDEOS_DIR, filename));
    await client.send(
      new PutObjectCommand({
        Bucket: env.bucketName,
        Key: filename,
        Body: body,
        ContentType: 'image/jpeg',
        CacheControl: 'public, max-age=31536000, immutable',
      })
    );
    process.stdout.write(`.`);
  }
  console.log(`\nDone.`);
}

async function main() {
  const cmd = process.argv[2];
  if (cmd === '--generate') {
    generateThumbnails();
  } else if (cmd === '--upload') {
    await uploadThumbnails();
  } else if (cmd === '--all') {
    generateThumbnails();
    await uploadThumbnails();
  } else {
    console.log(`
Usage:
  npx tsx scripts/r2-upload/thumbnails.ts --generate
  npx tsx scripts/r2-upload/thumbnails.ts --upload
  npx tsx scripts/r2-upload/thumbnails.ts --all
`);
    process.exit(1);
  }
}

main().catch((err: unknown) => {
  console.error('Fatal error:', err instanceof Error ? err.message : err);
  process.exit(1);
});
