import { CommandLog } from '../../domain/entities/CommandLog.js';
import { ICommandLogRepository, LogFilter } from '../../domain/repositories/ICommandLogRepository.js';

export class GetCommandHistoryUseCase {
  constructor(private readonly repository: ICommandLogRepository) {}

  async execute(filter?: LogFilter): Promise<CommandLog[]> {
    return this.repository.find(filter);
  }
}
