import fs from 'node:fs';
import path from 'node:path';
import { API_KEY_ENV_VARS, VEO_COST_PER_SECOND } from './config.ts';
import type { ToolName } from './config.ts';

const VEO_MODEL_IDS: Partial<Record<ToolName, string>> = {
  veo2: 'veo-2.0-generate-001',
  veo3: 'veo-3.0-generate-001',
  veo3fast: 'veo-3.0-fast-generate-001',
  veo31: 'veo-3.1-generate-preview',
  veo31fast: 'veo-3.1-fast-generate-preview',
};

const DEFAULT_DURATION_SECONDS = 8;

export interface GenerationResult {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  error?: string;
  cost?: number;
}

export interface VideoApiClient {
  name: string;
  generate(prompt: string, negativePrompt: string): Promise<GenerationResult>;
  checkStatus(id: string): Promise<GenerationResult>;
  download(url: string, outputPath: string): Promise<void>;
}

// ── Shared helpers ────────────────────────────────────────────────────────────

function requireApiKey(tool: ToolName): string {
  const envVar = API_KEY_ENV_VARS[tool];
  const key = process.env[envVar];
  if (!key) {
    throw new Error(`Missing environment variable: ${envVar}`);
  }
  return key;
}

async function downloadFile(url: string, outputPath: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download failed: ${response.status} ${response.statusText}`);
  }
  const buffer = await response.arrayBuffer();
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, Buffer.from(buffer));
}

// ── Veo (Google AI — works for Veo 2, 3, 3 Fast, 3.1, 3.1 Fast) ────────────

export class VeoClient implements VideoApiClient {
  readonly name: string;
  private readonly apiKey: string;
  private readonly modelId: string;
  private readonly costPerSecond: number;
  private readonly baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  constructor(tool: ToolName) {
    this.name = tool;
    this.modelId = VEO_MODEL_IDS[tool] ?? 'veo-2.0-generate-001';
    this.apiKey = requireApiKey(tool);
    this.costPerSecond = VEO_COST_PER_SECOND[this.modelId] ?? 0.35;
  }

  async generate(prompt: string, _negativePrompt: string): Promise<GenerationResult> {
    // Veo via Gemini API does not support negativePrompt — it must be omitted
    // personGeneration is only supported on Veo 2
    const parameters: Record<string, unknown> = {
      aspectRatio: '16:9',
      durationSeconds: DEFAULT_DURATION_SECONDS,
      resolution: '720p',
    };
    if (this.modelId === 'veo-2.0-generate-001') {
      parameters.personGeneration = 'dont_allow';
    }

    const response = await fetch(
      `${this.baseUrl}/models/${this.modelId}:predictLongRunning?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters,
        }),
      },
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`${this.name} generate failed: ${response.status} ${text}`);
    }

    const data = (await response.json()) as { name?: string };
    const operationId = data.name ?? `${this.name}-${Date.now()}`;
    // Estimate assumes 2 samples (actual count confirmed on completion)
    const estimatedCost = this.costPerSecond * DEFAULT_DURATION_SECONDS * 2;

    return {
      id: operationId,
      status: 'pending',
      cost: estimatedCost,
    };
  }

  async checkStatus(id: string): Promise<GenerationResult> {
    const response = await fetch(
      `${this.baseUrl}/${id}?key=${this.apiKey}`,
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`${this.name} status check failed: ${response.status} ${text}`);
    }

    const data = (await response.json()) as {
      done?: boolean;
      error?: { message: string };
      response?: {
        generateVideoResponse?: {
          generatedSamples?: Array<{ video?: { uri: string } }>;
        };
      };
    };

    if (data.error) {
      return { id, status: 'failed', error: data.error.message };
    }

    if (data.done) {
      const samples = data.response?.generateVideoResponse?.generatedSamples ?? [];
      const videoUrl = samples[0]?.video?.uri;
      // Google charges per second per sample generated, not per request
      const cost = this.costPerSecond * DEFAULT_DURATION_SECONDS * samples.length;
      return { id, status: 'completed', videoUrl, cost };
    }

    return { id, status: 'processing' };
  }

  async download(url: string, outputPath: string): Promise<void> {
    // Veo download URLs require the API key
    const authedUrl = url.includes('?') ? `${url}&key=${this.apiKey}` : `${url}?key=${this.apiKey}`;
    await downloadFile(authedUrl, outputPath);
  }
}

// ── Runway ────────────────────────────────────────────────────────────────────

export class RunwayClient implements VideoApiClient {
  readonly name = 'runway';
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.runwayml.com/v1';

  constructor() {
    this.apiKey = requireApiKey('runway');
  }

  async generate(prompt: string, negativePrompt: string): Promise<GenerationResult> {
    const response = await fetch(`${this.baseUrl}/image_to_video`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'X-Runway-Version': '2024-11-06',
      },
      body: JSON.stringify({
        promptText: prompt,
        negativePrompt,
        model: 'gen4_turbo',
        ratio: '1280:720',
        duration: 10,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Runway generate failed: ${response.status} ${text}`);
    }

    const data = (await response.json()) as { id?: string };
    return {
      id: data.id ?? `runway-${Date.now()}`,
      status: 'pending',
      cost: 0.25,
    };
  }

  async checkStatus(id: string): Promise<GenerationResult> {
    const response = await fetch(`${this.baseUrl}/tasks/${id}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'X-Runway-Version': '2024-11-06',
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Runway status check failed: ${response.status} ${text}`);
    }

    const data = (await response.json()) as {
      status?: string;
      output?: string[];
      failure?: string;
    };

    if (data.status === 'FAILED') {
      return { id, status: 'failed', error: data.failure ?? 'Unknown error' };
    }

    if (data.status === 'SUCCEEDED') {
      return { id, status: 'completed', videoUrl: data.output?.[0], cost: 0.25 };
    }

    return { id, status: 'processing' };
  }

  async download(url: string, outputPath: string): Promise<void> {
    await downloadFile(url, outputPath);
  }
}

// ── Kling ─────────────────────────────────────────────────────────────────────

export class KlingClient implements VideoApiClient {
  readonly name = 'kling';
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.klingai.com/v1';

  constructor() {
    this.apiKey = requireApiKey('kling');
  }

  async generate(prompt: string, negativePrompt: string): Promise<GenerationResult> {
    const response = await fetch(`${this.baseUrl}/videos/text2video`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'kling-v1-5',
        prompt,
        negative_prompt: negativePrompt,
        cfg_scale: 0.5,
        mode: 'std',
        duration: '10',
        aspect_ratio: '16:9',
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Kling generate failed: ${response.status} ${text}`);
    }

    const data = (await response.json()) as { data?: { task_id?: string } };
    return {
      id: data.data?.task_id ?? `kling-${Date.now()}`,
      status: 'pending',
      cost: 0.2,
    };
  }

  async checkStatus(id: string): Promise<GenerationResult> {
    const response = await fetch(`${this.baseUrl}/videos/text2video/${id}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Kling status check failed: ${response.status} ${text}`);
    }

    const data = (await response.json()) as {
      data?: {
        task_status?: string;
        task_status_msg?: string;
        task_result?: { videos?: Array<{ url: string }> };
      };
    };

    const status = data.data?.task_status;

    if (status === 'failed') {
      return { id, status: 'failed', error: data.data?.task_status_msg ?? 'Unknown error' };
    }

    if (status === 'succeed') {
      const videoUrl = data.data?.task_result?.videos?.[0]?.url;
      return { id, status: 'completed', videoUrl, cost: 0.2 };
    }

    return { id, status: 'processing' };
  }

  async download(url: string, outputPath: string): Promise<void> {
    await downloadFile(url, outputPath);
  }
}

// ── Luma (Dream Machine) ──────────────────────────────────────────────────────

export class LumaClient implements VideoApiClient {
  readonly name = 'luma';
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.lumalabs.ai/dream-machine/v1';

  constructor() {
    this.apiKey = requireApiKey('luma');
  }

  async generate(prompt: string, negativePrompt: string): Promise<GenerationResult> {
    const response = await fetch(`${this.baseUrl}/generations/video`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        negative_prompt: negativePrompt,
        model: 'ray-2',
        resolution: '720p',
        duration: '9s',
        loop: true,
        aspect_ratio: '16:9',
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Luma generate failed: ${response.status} ${text}`);
    }

    const data = (await response.json()) as { id?: string };
    return {
      id: data.id ?? `luma-${Date.now()}`,
      status: 'pending',
      cost: 0.15,
    };
  }

  async checkStatus(id: string): Promise<GenerationResult> {
    const response = await fetch(`${this.baseUrl}/generations/${id}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Luma status check failed: ${response.status} ${text}`);
    }

    const data = (await response.json()) as {
      state?: string;
      failure_reason?: string;
      assets?: { video?: string };
    };

    if (data.state === 'failed') {
      return { id, status: 'failed', error: data.failure_reason ?? 'Unknown error' };
    }

    if (data.state === 'completed') {
      return { id, status: 'completed', videoUrl: data.assets?.video, cost: 0.15 };
    }

    return { id, status: 'processing' };
  }

  async download(url: string, outputPath: string): Promise<void> {
    await downloadFile(url, outputPath);
  }
}

// ── Pika ──────────────────────────────────────────────────────────────────────

export class PikaClient implements VideoApiClient {
  readonly name = 'pika';
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.pika.art/v2';

  constructor() {
    this.apiKey = requireApiKey('pika');
  }

  async generate(prompt: string, negativePrompt: string): Promise<GenerationResult> {
    const response = await fetch(`${this.baseUrl}/generate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        negativePrompt,
        options: {
          aspectRatio: '16:9',
          frameRate: 24,
          duration: 8,
          resolution: 720,
          loop: true,
        },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Pika generate failed: ${response.status} ${text}`);
    }

    const data = (await response.json()) as { taskId?: string; id?: string };
    return {
      id: data.taskId ?? data.id ?? `pika-${Date.now()}`,
      status: 'pending',
      cost: 0.1,
    };
  }

  async checkStatus(id: string): Promise<GenerationResult> {
    const response = await fetch(`${this.baseUrl}/tasks/${id}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Pika status check failed: ${response.status} ${text}`);
    }

    const data = (await response.json()) as {
      status?: string;
      errorMessage?: string;
      video?: { url?: string };
    };

    if (data.status === 'failed') {
      return { id, status: 'failed', error: data.errorMessage ?? 'Unknown error' };
    }

    if (data.status === 'finished' || data.status === 'completed') {
      return { id, status: 'completed', videoUrl: data.video?.url, cost: 0.1 };
    }

    return { id, status: 'processing' };
  }

  async download(url: string, outputPath: string): Promise<void> {
    await downloadFile(url, outputPath);
  }
}

// ── Factory ───────────────────────────────────────────────────────────────────

export function createClient(tool: ToolName): VideoApiClient {
  switch (tool) {
    case 'veo2':
    case 'veo3':
    case 'veo3fast':
    case 'veo31':
    case 'veo31fast':
      return new VeoClient(tool);
    case 'runway':
      return new RunwayClient();
    case 'kling':
      return new KlingClient();
    case 'luma':
      return new LumaClient();
    case 'pika':
      return new PikaClient();
  }
}
