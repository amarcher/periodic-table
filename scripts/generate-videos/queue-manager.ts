import type { VideoApiClient, GenerationResult } from './api-client.ts';

export interface QueueJob {
  atomicNumber: number;
  symbol: string;
  name: string;
  prompt: string;
  negativePrompt: string;
}

interface JobResult {
  atomicNumber: number;
  result: GenerationResult;
}

const POLL_INTERVAL_MS = 5_000;
const MAX_POLL_ATTEMPTS = 120; // 10 minutes

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function backoffDelay(attempt: number): number {
  // Exponential backoff: 2s, 4s, 8s, 16s, 32s, capped at 60s
  return Math.min(2_000 * Math.pow(2, attempt), 60_000);
}

function rateLimitDelay(attempt: number): number {
  // Aggressive backoff for rate limits: 15s, 30s, 60s, 60s
  return Math.min(15_000 * Math.pow(2, attempt), 60_000);
}

export class QueueManager {
  private readonly client: VideoApiClient;
  private readonly concurrency: number;
  private readonly maxRetries: number;
  private readonly jobs: QueueJob[] = [];

  constructor(client: VideoApiClient, concurrency: number, maxRetries: number) {
    this.client = client;
    this.concurrency = concurrency;
    this.maxRetries = maxRetries;
  }

  addJob(job: QueueJob): void {
    this.jobs.push(job);
  }

  async *run(): AsyncGenerator<JobResult> {
    const total = this.jobs.length;
    let completed = 0;
    let jobIndex = 0;

    console.log(`\nStarting generation of ${total} videos with concurrency=${this.concurrency}\n`);

    // Use a pool of active Promises, yielding results as they resolve
    const active = new Map<number, Promise<JobResult>>();

    const launchNext = (): void => {
      while (active.size < this.concurrency && jobIndex < this.jobs.length) {
        const job = this.jobs[jobIndex++]!;
        const promise = this.processJob(job).then((result) => {
          active.delete(job.atomicNumber);
          return result;
        });
        active.set(job.atomicNumber, promise);
      }
    };

    launchNext();

    while (active.size > 0) {
      // Race all active promises
      const result = await Promise.race(active.values());
      completed++;

      const pct = Math.round((completed / total) * 100);
      const statusIcon = result.result.status === 'completed' ? '✓' : '✗';
      console.log(
        `[${pct}%] ${statusIcon} ${result.atomicNumber} ${this.jobs.find((j) => j.atomicNumber === result.atomicNumber)?.symbol ?? ''} — ${result.result.status}`,
      );

      yield result;
      launchNext();
    }

    console.log(`\nGeneration complete. ${completed}/${total} processed.\n`);
  }

  private async processJob(job: QueueJob): Promise<JobResult> {
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          const delay = backoffDelay(attempt - 1);
          console.log(
            `  Retrying ${job.atomicNumber} ${job.symbol} (attempt ${attempt + 1}) after ${Math.round(delay / 1000)}s...`,
          );
          await sleep(delay);
        } else {
          // Stagger initial submissions by 3s to avoid bursting rate limits
          const stagger = this.jobs.indexOf(job) * 3_000;
          if (stagger > 0) await sleep(stagger);
        }

        console.log(`  → Submitting ${job.atomicNumber} ${job.name} (${job.symbol})...`);
        const initial = await this.client.generate(job.prompt, job.negativePrompt);

        if (initial.status === 'failed') {
          if (attempt < this.maxRetries) continue;
          return { atomicNumber: job.atomicNumber, result: initial };
        }

        // Poll until completed or failed
        const final = await this.pollUntilDone(initial.id, job);
        return { atomicNumber: job.atomicNumber, result: final };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        const isRateLimited =
          message.includes('429') || message.includes('503') || message.includes('rate limit');

        if (isRateLimited && attempt < this.maxRetries) {
          const delay = rateLimitDelay(attempt);
          console.warn(`  ⏳ Rate limited for ${job.symbol}. Waiting ${Math.round(delay / 1000)}s...`);
          await sleep(delay);
          continue;
        }

        if (attempt >= this.maxRetries) {
          return {
            atomicNumber: job.atomicNumber,
            result: { id: `error-${job.atomicNumber}`, status: 'failed', error: message },
          };
        }
      }
    }

    // Should not reach here
    return {
      atomicNumber: job.atomicNumber,
      result: { id: `error-${job.atomicNumber}`, status: 'failed', error: 'Max retries exceeded' },
    };
  }

  private async pollUntilDone(id: string, job: QueueJob): Promise<GenerationResult> {
    for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
      await sleep(POLL_INTERVAL_MS);

      try {
        const status = await this.client.checkStatus(id);

        if (status.status === 'completed' || status.status === 'failed') {
          return status;
        }

        if (attempt % 6 === 0 && attempt > 0) {
          console.log(`  ⏳ Still processing ${job.symbol} (${Math.round((attempt * POLL_INTERVAL_MS) / 60_000)}min)...`);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn(`  Poll error for ${job.symbol}: ${message}`);
      }
    }

    return {
      id,
      status: 'failed',
      error: `Timed out after ${MAX_POLL_ATTEMPTS} poll attempts`,
    };
  }
}
