---
name: cmd-logger-code-guide
description: Coding guidelines, TypeScript style conventions, immutability, error handling, and testing standards for cmd-logger.
---

# `cmd-logger` Code Style & Conventions Skill

This skill documents coding standards, naming conventions, error handling strategies, and testing patterns for `cmd-logger`.

---

## 1. Naming Conventions

- **Files & Directories**: `kebab-case` or `PascalCase` for classes (e.g. `CommandLog.ts`, `JsonFileCommandLogRepository.ts`, `execute-command.use-case.ts`).
- **Classes & Interfaces**: `PascalCase`. Interfaces prefix with `I` (e.g. `ICommandLogRepository`).
- **Variables & Functions**: `camelCase`.
- **Constants**: `UPPER_SNAKE_CASE`.
- **Types & Enums**: `PascalCase`.

---

## 2. Type Safety & Immutability Rules

1. **No `any`**: Always use strict typing or Zod validation schemas.
2. **Readonly Properties**: Domain entities must define properties as `readonly`.
```typescript
// GOOD
export class CommandLog {
  readonly id: string;
  readonly command: string;
  readonly status: 'success' | 'failure';
  readonly durationMs: number;
  readonly timestamp: Date;
  ...
}
```
3. **Explicit Function Return Types**: Always annotate return types on public methods.

---

## 3. Error Handling Pattern

Do not throw generic unhandled errors. Use domain-specific error classes or Result wrappers:

```typescript
export class CommandExecutionError extends Error {
  constructor(
    public readonly command: string,
    public readonly exitCode: number,
    public readonly stderr: string
  ) {
    super(`Command "${command}" failed with exit code ${exitCode}`);
    this.name = 'CommandExecutionError';
  }
}
```

---

## 4. Unit Testing Conventions

- Test files must reside in `tests/` matching source folder hierarchy.
- Use mock objects implementing interfaces rather than real filesystem I/O for use case tests.

```typescript
describe('ExecuteAndLogCommandUseCase', () => {
  it('should execute process and persist log entry', async () => {
    const mockRepo = new MockCommandLogRepository();
    const mockExecutor = new MockProcessExecutor({ exitCode: 0, durationMs: 150 });
    const useCase = new ExecuteAndLogCommandUseCase(mockExecutor, mockRepo, mockEnv);

    const result = await useCase.execute('echo hello');

    expect(result.status).toBe('success');
    expect(mockRepo.logs).toHaveLength(1);
  });
});
```
