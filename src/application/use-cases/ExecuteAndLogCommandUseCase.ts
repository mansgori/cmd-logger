import { CommandLog } from '../../domain/entities/CommandLog.js';
import { ICommandLogRepository } from '../../domain/repositories/ICommandLogRepository.js';
import { IProcessExecutor } from '../../domain/services/IProcessExecutor.js';
import { IEnvironmentExtractor } from '../../domain/services/IEnvironmentExtractor.js';
import { cryptoRandomString } from '../../infrastructure/utils/id.js';

export interface ExecuteAndLogInput {
  readonly command: string;
  readonly cwd?: string;
  readonly metadata?: Record<string, string>;
}

export class ExecuteAndLogCommandUseCase {
  constructor(
    private readonly processExecutor: IProcessExecutor,
    private readonly repository: ICommandLogRepository,
    private readonly envExtractor: IEnvironmentExtractor
  ) {}

  async execute(input: ExecuteAndLogInput): Promise<CommandLog> {
    const environment = this.envExtractor.extractContext();
    const result = await this.processExecutor.execute(input.command, input.cwd);

    const log = new CommandLog({
      id: cryptoRandomString(),
      command: input.command,
      status: result.exitCode === 0 ? 'success' : 'failure',
      exitCode: result.exitCode,
      durationMs: result.durationMs,
      timestamp: new Date(),
      environment: environment,
      metadata: input.metadata,
    });

    await this.repository.save(log);
    return log;
  }
}
