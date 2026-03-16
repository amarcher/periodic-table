import fs from 'node:fs';
import path from 'node:path';

interface CostEntry {
  atomicNumber: number;
  tool: string;
  cost: number;
}

export interface CostSummary {
  total: number;
  byTool: Record<string, number>;
  count: number;
}

export class CostTracker {
  private readonly entries: CostEntry[] = [];

  record(atomicNumber: number, tool: string, cost: number): void {
    this.entries.push({ atomicNumber, tool, cost });
  }

  getTotal(): number {
    return this.entries.reduce((sum, e) => sum + e.cost, 0);
  }

  getSummary(): CostSummary {
    const byTool: Record<string, number> = {};

    for (const entry of this.entries) {
      byTool[entry.tool] = (byTool[entry.tool] ?? 0) + entry.cost;
    }

    return {
      total: this.getTotal(),
      byTool,
      count: this.entries.length,
    };
  }

  save(filePath: string): void {
    const summary = this.getSummary();
    const data = {
      ...summary,
      entries: this.entries,
      generatedAt: new Date().toISOString(),
    };
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`\nCost summary written to ${filePath}`);
  }

  printSummary(): void {
    const summary = this.getSummary();
    console.log('\n── Cost Summary ──────────────────────────────');
    for (const [tool, cost] of Object.entries(summary.byTool)) {
      console.log(`  ${tool.padEnd(12)} $${cost.toFixed(4)}`);
    }
    console.log('  ──────────────────────────────────────────');
    console.log(`  Total (${summary.count} videos): $${summary.total.toFixed(4)}`);
    console.log('──────────────────────────────────────────────\n');
  }
}
