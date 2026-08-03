import { execSync } from 'child_process';
import * as os from 'os';
import { EnvironmentContext } from '../../domain/entities/CommandLog.js';
import { IEnvironmentExtractor } from '../../domain/services/IEnvironmentExtractor.js';

export class SystemEnvironmentExtractor implements IEnvironmentExtractor {
  extractContext(): EnvironmentContext {
    let gitBranch: string | undefined;
    try {
      gitBranch = execSync('git rev-parse --abbrev-ref HEAD', { stdio: ['pipe', 'pipe', 'ignore'] })
        .toString()
        .trim();
    } catch {
      gitBranch = undefined;
    }

    return {
      user: os.userInfo().username || process.env.USER || 'unknown',
      hostname: os.hostname(),
      cwd: process.cwd(),
      os: `${os.type()} ${os.release()}`,
      gitBranch,
    };
  }
}
