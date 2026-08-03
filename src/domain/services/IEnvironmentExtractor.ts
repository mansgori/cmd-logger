import { EnvironmentContext } from '../entities/CommandLog.js';

export interface IEnvironmentExtractor {
  extractContext(): EnvironmentContext;
}
