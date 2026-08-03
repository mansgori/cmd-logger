import { CommandStats, ICommandLogRepository } from '../../domain/repositories/ICommandLogRepository.js';

export class GetCommandStatsUseCase {
  constructor(private readonly repository: ICommandLogRepository) {}

  async execute(): Promise<CommandStats> {
    return this.repository.getStats();
  }
}
