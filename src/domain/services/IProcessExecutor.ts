export interface ProcessResult {
  readonly exitCode: number;
  readonly durationMs: number;
}

export interface IProcessExecutor {
  execute(command: string, cwd?: string): Promise<ProcessResult>;
}
