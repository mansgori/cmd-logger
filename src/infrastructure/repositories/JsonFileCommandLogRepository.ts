import * as fs from 'fs/promises';
import * as path from 'path';
import { CommandLog } from '../../domain/entities/CommandLog.js';
import { CommandStats, ICommandLogRepository, LogFilter } from '../../domain/repositories/ICommandLogRepository.js';

export class JsonFileCommandLogRepository implements ICommandLogRepository {
  private readonly filePath: string;

  constructor(customPath?: string) {
    this.filePath = customPath ?? path.join(process.cwd(), '.cmd-logger', 'logs.json');
  }

  private async ensureFileExists(): Promise<void> {
    const dir = path.dirname(this.filePath);
    await fs.mkdir(dir, { recursive: true });
    try {
      await fs.access(this.filePath);
    } catch {
      await fs.writeFile(this.filePath, JSON.stringify([], null, 2), 'utf-8');
    }
  }

  private async readRawLogs(): Promise<any[]> {
    await this.ensureFileExists();
    const content = await fs.readFile(this.filePath, 'utf-8');
    try {
      return JSON.parse(content);
    } catch {
      return [];
    }
  }

  private async writeRawLogs(logs: any[]): Promise<void> {
    await this.ensureFileExists();
    await fs.writeFile(this.filePath, JSON.stringify(logs, null, 2), 'utf-8');
  }

  async save(log: CommandLog): Promise<void> {
    const logs = await this.readRawLogs();
    logs.push(log.toJSON());
    await this.writeRawLogs(logs);
  }

  async find(filter?: LogFilter): Promise<CommandLog[]> {
    const rawLogs = await this.readRawLogs();
    let logs = rawLogs.map((item) => CommandLog.fromJSON(item));

    if (filter?.status) {
      logs = logs.filter((l) => l.status === filter.status);
    }

    if (filter?.search) {
      const query = filter.search.toLowerCase();
      logs = logs.filter((l) => l.command.toLowerCase().includes(query));
    }

    if (filter?.startDate) {
      logs = logs.filter((l) => l.timestamp >= filter.startDate!);
    }

    if (filter?.endDate) {
      logs = logs.filter((l) => l.timestamp <= filter.endDate!);
    }

    // Sort newest first
    logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (filter?.limit && filter.limit > 0) {
      logs = logs.slice(0, filter.limit);
    }

    return logs;
  }

  async getStats(): Promise<CommandStats> {
    const logs = await this.find();
    const total = logs.length;
    if (total === 0) {
      return {
        totalCommands: 0,
        successfulCommands: 0,
        failedCommands: 0,
        averageDurationMs: 0,
        successRatePercentage: 0,
        topCommands: [],
      };
    }

    let successCount = 0;
    let totalDurationMs = 0;
    const commandCounts: Record<string, number> = {};

    for (const l of logs) {
      if (l.status === 'success') {
        successCount++;
      }
      totalDurationMs += l.durationMs;
      commandCounts[l.command] = (commandCounts[l.command] || 0) + 1;
    }

    const topCommands = Object.entries(commandCounts)
      .map(([command, count]) => ({ command, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalCommands: total,
      successfulCommands: successCount,
      failedCommands: total - successCount,
      averageDurationMs: Math.round(totalDurationMs / total),
      successRatePercentage: Math.round((successCount / total) * 10000) / 100,
      topCommands,
    };
  }

  async clear(): Promise<void> {
    await this.writeRawLogs([]);
  }
}
