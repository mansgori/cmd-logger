---
name: cmd-logger-architecture
description: Clean Architecture and SOLID principles design guide for cmd-logger CLI tool. Use when adding features, refactoring layers, or extending storage and execution providers.
---

# `cmd-logger` Architecture & SOLID Design Skill

This skill defines the architectural blueprint for the `cmd-logger` codebase. All new features, storage drivers, and CLI commands must conform to this design.

---

## 1. Architectural Layers

The codebase is organized into 4 concentric Clean Architecture layers:

```
+-------------------------------------------------------------+
|                     Interface / CLI Layer                   |
|  - Commander.js commands                                    |
|  - Console table formatters & CLI input parsing             |
|                                                             |
|   +-----------------------------------------------------+   |
|   |                 Infrastructure Layer                |   |
|   |  - JsonFileCommandLogRepository                     |   |
|   |  - NodeProcessExecutor                              |   |
|   |  - SystemEnvironmentExtractor                       |   |
|   |                                                     |   |
|   |   +---------------------------------------------+   |   |
|   |   |              Application Layer              |   |   |
|   |   |  - LogCommandUseCase                        |   |   |
|   |   |  - ExecuteAndLogCommandUseCase              |   |   |
|   |   |  - GetCommandHistoryUseCase                 |   |   |
|   |   |  - GetCommandStatsUseCase                   |   |   |
|   |   |                                             |   |   |
|   |   |   +-------------------------------------+   |   |   |
|   |   |   |            Domain Layer             |   |   |   |
|   |   |   |  - CommandLog entity                |   |   |   |
|   |   |   |  - Value Objects (Status, Duration) |   |   |   |
|   |   |   |  - Repository Interfaces            |   |   |   |
|   |   |   |  - Service Interfaces               |   |   |   |
|   |   |   +-------------------------------------+   |   |   |
|   |   +---------------------------------------------+   |   |
|   +-----------------------------------------------------+   |
+-------------------------------------------------------------+
```

---

## 2. Layer Responsibilities & Rules

### Domain Layer (`src/domain/`)
- **Entities**: Business models containing state and core business rules. (e.g. `CommandLog.ts`).
- **Value Objects**: Immutable data carriers enforcing validity (e.g. `ExecutionStatus`, `DurationMs`).
- **Abstractions**: Interface contracts (`ICommandLogRepository`, `IProcessExecutor`).
- **Constraint**: Must NOT depend on Node filesystem (`fs`), `child_process`, `commander`, or third-party CLI packages.

### Application Layer (`src/application/`)
- **Use Cases**: Single-purpose classes orchestrating domain flow (e.g. `ExecuteAndLogCommandUseCase`).
- **Input/Output DTOs**: Plain TypeScript types defining command input and result.
- **Constraint**: Only depends on Domain interfaces. Injected with infrastructure implementations at runtime.

### Infrastructure Layer (`src/infrastructure/`)
- **Persistence Adapters**: Filesystem or database implementations of `ICommandLogRepository` (e.g. `JsonFileCommandLogRepository`).
- **System Services**: OS/Process wrappers implementing `IProcessExecutor` (e.g. `NodeProcessExecutor`).
- **Constraint**: Implements Domain interfaces cleanly without exposing infrastructure leaks to upper layers.

### Interface Layer (`src/interface/`)
- **CLI Commands**: CLI entry points parsing arguments, calling use cases, and rendering outputs.
- **Formatters**: Presenting log output into tabular or JSON format.

---

## 3. SOLID Examples in `cmd-logger`

### Single Responsibility Principle (SRP)
```typescript
// BAD: Mixing process execution, logging, and console formatting in one function
function runAndLog(cmd: string) {
  const start = Date.now();
  const res = execSync(cmd);
  fs.writeFileSync('log.json', JSON.stringify({ cmd, duration: Date.now() - start }));
  console.log(`Executed ${cmd}`);
}

// GOOD: Separated into ProcessExecutor, Repository, and UseCase
class ExecuteAndLogCommandUseCase {
  constructor(
    private readonly processExecutor: IProcessExecutor,
    private readonly repository: ICommandLogRepository,
    private readonly envExtractor: IEnvironmentExtractor
  ) {}
  ...
}
```

### Dependency Inversion Principle (DIP)
```typescript
// High-level UseCase depends on ICommandLogRepository abstraction
export class GetCommandHistoryUseCase {
  constructor(private readonly repository: ICommandLogRepository) {}

  async execute(filter: LogFilter): Promise<CommandLog[]> {
    return this.repository.find(filter);
  }
}
```

---

## 4. How to Extend `cmd-logger`

1. **Add a new Storage Backend** (e.g. SQLite):
   - Create `src/infrastructure/repositories/SqliteCommandLogRepository.ts`.
   - Implement `ICommandLogRepository`.
   - Wire it in `src/interface/cli/index.ts` via dependency injection.
2. **Add a new CLI Command**:
   - Create a use case in `src/application/use-cases/`.
   - Register command under `src/interface/cli/commands/`.
