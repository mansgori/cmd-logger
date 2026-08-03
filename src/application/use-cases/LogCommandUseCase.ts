import { CommandLog, ExecutionStatus } from '../../domain/entities/CommandLog.js';
import { ICommandLogRepository } from '../../domain/repositories/ICommandLogRepository.js';
import { IEnvironmentExtractor } from '../../domain/services/IEnvironmentExtractor.js';
import { cryptoRandomString } from '../../infrastructure/utils/id.js';

export interface LogCommandInput {
  readonly command: string;
  readonly status?: ExecutionStatus;
  readonly exitCode?: number;
  readonly durationMs?: number;
  readonly metadata?: Record<string, string>;
}

export class LogCommandUseCase {
  constructor(
    private readonly repository: ICommandLogRepository,
    private readonly envExtractor: IEnvironmentExtractor
  ) {}

  async execute(input: LogCommandInput): Promise<CommandLog> {
    const status: ExecutionStatus = input.status ?? (input.exitCode === 0 ? 'success' : 'failure');
    const environment = this.envExtractor.extractContext();

    const log = new CommandLog({
      id: cryptoRandomString(),
      command: input.command,
      status: status,
      exitCode: input.exitCode ?? (status === 'success' ? 0 : 1),
      durationMs: input.durationMs ?? 0,
      timestamp: new Date(),
      environment: environment,
      metadata: input.metadata,
    });

    await this.repository.save(log);
    return log;
  }
}
