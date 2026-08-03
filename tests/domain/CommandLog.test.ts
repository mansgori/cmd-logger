import { describe, expect, it } from 'vitest';
import { CommandLog } from '../../src/domain/entities/CommandLog.js';

describe('CommandLog Entity', () => {
  it('should instantiate a valid CommandLog', () => {
    const log = new CommandLog({
      id: 'test-id-123',
      command: 'npm test',
      status: 'success',
      exitCode: 0,
      durationMs: 250,
      timestamp: new Date('2026-01-01T00:00:00Z'),
      environment: {
        user: 'testuser',
        hostname: 'testhost',
        cwd: '/project',
        os: 'macOS',
        gitBranch: 'main',
      },
    });

    expect(log.id).toBe('test-id-123');
    expect(log.command).toBe('npm test');
    expect(log.status).toBe('success');
    expect(log.exitCode).toBe(0);
    expect(log.durationMs).toBe(250);
  });

  it('should throw an error if command is empty', () => {
    expect(() => {
      new CommandLog({
        id: 'test-id',
        command: '',
        status: 'success',
        exitCode: 0,
        durationMs: 100,
        timestamp: new Date(),
        environment: { user: 'u', hostname: 'h', cwd: '/', os: 'mac' },
      });
    }).toThrow('Command cannot be empty');
  });

  it('should serialize and deserialize JSON accurately', () => {
    const original = new CommandLog({
      id: 'id-456',
      command: 'git status',
      status: 'failure',
      exitCode: 1,
      durationMs: 50,
      timestamp: new Date('2026-05-10T12:00:00Z'),
      environment: { user: 'dev', hostname: 'laptop', cwd: '/repo', os: 'linux' },
    });

    const json = original.toJSON();
    const restored = CommandLog.fromJSON(json);

    expect(restored.id).toBe(original.id);
    expect(restored.command).toBe(original.command);
    expect(restored.status).toBe(original.status);
    expect(restored.timestamp.toISOString()).toBe(original.timestamp.toISOString());
  });
});
