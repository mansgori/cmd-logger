import { describe, expect, it } from 'vitest';
import { ExecuteAndLogCommandUseCase } from '../../src/application/use-cases/ExecuteAndLogCommandUseCase.js';
import { CommandLog } from '../../src/domain/entities/CommandLog.js';
import { CommandStats, ICommandLogRepository, LogFilter } from '../../src/domain/repositories/ICommandLogRepository.js';
import { IEnvironmentExtractor } from '../../src/domain/services/IEnvironmentExtractor.js';
import { IProcessExecutor, ProcessResult } from '../../src/domain/services/IProcessExecutor.js';

class MockCommandLogRepository implements ICommandLogRepository {
  public logs: CommandLog[] = [];

  async save(log: CommandLog): Promise<void> {
    this.logs.push(log);
  }

  async find(filter?: LogFilter): Promise<CommandLog[]> {
    return this.logs;
  }

  async getStats(): Promise<CommandStats> {
    return {
      totalCommands: this.logs.length,
      successfulCommands: this.logs.filter((l) => l.status === 'success').length,
      failedCommands: this.logs.filter((l) => l.status === 'failure').length,
      averageDurationMs: 100,
      successRatePercentage: 100,
      topCommands: [],
    };
  }

  async clear(): Promise<void> {
    this.logs = [];
  }
}

class MockProcessExecutor implements IProcessExecutor {
  constructor(private readonly result: ProcessResult) {}

  async execute(command: string, cwd?: string): Promise<ProcessResult> {
    return this.result;
  }
}

class MockEnvironmentExtractor implements IEnvironmentExtractor {
  extractContext() {
    return {
      user: 'mockuser',
      hostname: 'mockhost',
      cwd: '/mock',
      os: 'mockOS',
      gitBranch: 'feature/mock',
    };
  }
}

describe('ExecuteAndLogCommandUseCase', () => {
  it('should execute command via process executor and persist log in repository', async () => {
    const repository = new MockCommandLogRepository();
    const executor = new MockProcessExecutor({ exitCode: 0, durationMs: 120 });
    const envExtractor = new MockEnvironmentExtractor();

    const useCase = new ExecuteAndLogCommandUseCase(executor, repository, envExtractor);

    const log = await useCase.execute({ command: 'echo "hello"' });

    expect(log.command).toBe('echo "hello"');
    expect(log.status).toBe('success');
    expect(log.exitCode).toBe(0);
    expect(log.durationMs).toBe(120);

    expect(repository.logs).toHaveLength(1);
    expect(repository.logs[0].id).toBe(log.id);
  });
});
