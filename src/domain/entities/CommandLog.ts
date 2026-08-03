export type ExecutionStatus = 'success' | 'failure';

export interface EnvironmentContext {
  readonly user: string;
  readonly hostname: string;
  readonly cwd: string;
  readonly os: string;
  readonly gitBranch?: string;
}

export interface CommandLogProps {
  readonly id: string;
  readonly command: string;
  readonly status: ExecutionStatus;
  readonly exitCode: number;
  readonly durationMs: number;
  readonly timestamp: Date;
  readonly environment: EnvironmentContext;
  readonly metadata?: Record<string, string>;
}

export class CommandLog {
  readonly id: string;
  readonly command: string;
  readonly status: ExecutionStatus;
  readonly exitCode: number;
  readonly durationMs: number;
  readonly timestamp: Date;
  readonly environment: EnvironmentContext;
  readonly metadata: Record<string, string>;

  constructor(props: CommandLogProps) {
    if (!props.command || props.command.trim() === '') {
      throw new Error('Command cannot be empty');
    }
    if (props.durationMs < 0) {
      throw new Error('Duration cannot be negative');
    }

    this.id = props.id;
    this.command = props.command;
    this.status = props.status;
    this.exitCode = props.exitCode;
    this.durationMs = props.durationMs;
    this.timestamp = props.timestamp;
    this.environment = props.environment;
    this.metadata = props.metadata ?? {};
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      command: this.command,
      status: this.status,
      exitCode: this.exitCode,
      durationMs: this.durationMs,
      timestamp: this.timestamp.toISOString(),
      environment: this.environment,
      metadata: this.metadata,
    };
  }

  static fromJSON(data: any): CommandLog {
    return new CommandLog({
      id: data.id,
      command: data.command,
      status: data.status,
      exitCode: data.exitCode,
      durationMs: data.durationMs,
      timestamp: new Date(data.timestamp),
      environment: data.environment,
      metadata: data.metadata,
    });
  }
}
