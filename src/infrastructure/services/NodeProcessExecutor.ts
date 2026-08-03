import { spawn } from 'child_process';
import { IProcessExecutor, ProcessResult } from '../../domain/services/IProcessExecutor.js';

export class NodeProcessExecutor implements IProcessExecutor {
  async execute(command: string, cwd?: string): Promise<ProcessResult> {
    const startTime = Date.now();

    return new Promise<ProcessResult>((resolve) => {
      const child = spawn(command, {
        shell: true,
        stdio: 'inherit',
        cwd: cwd ?? process.cwd(),
      });

      child.on('close', (code) => {
        const durationMs = Date.now() - startTime;
        resolve({
          exitCode: code ?? 1,
          durationMs,
        });
      });

      child.on('error', () => {
        const durationMs = Date.now() - startTime;
        resolve({
          exitCode: 1,
          durationMs,
        });
      });
    });
  }
}
