import { CommandLog, ExecutionStatus } from '../entities/CommandLog.js';

export interface LogFilter {
  readonly status?: ExecutionStatus;
  readonly search?: string;
  readonly limit?: number;
  readonly startDate?: Date;
  readonly endDate?: Date;
}

export interface CommandStats {
  readonly totalCommands: number;
  readonly successfulCommands: number;
  readonly failedCommands: number;
  readonly averageDurationMs: number;
  readonly successRatePercentage: number;
  readonly topCommands: Array<{ command: string; count: number }>;
}

export interface ICommandLogRepository {
  save(log: CommandLog): Promise<void>;
  find(filter?: LogFilter): Promise<CommandLog[]>;
  getStats(): Promise<CommandStats>;
  clear(): Promise<void>;
}
