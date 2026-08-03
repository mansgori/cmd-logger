# AGENTS.md - Workspace Rules & Coding Standards

This workspace contains `cmd-logger`, a TypeScript-based CLI tool and library for logging and tracking command executions. All code in this repository must strictly adhere to the following principles.

---

## Core Software Architecture Principles

### 1. SOLID Principles
- **Single Responsibility Principle (SRP)**: Each module, class, and function must have one and only one reason to change. Separate domain validation, use case orchestration, file system persistence, and CLI presentation.
- **Open/Closed Principle (OCP)**: Software entities should be open for extension, but closed for modification. Use interfaces (`ICommandLogRepository`, `IProcessExecutor`) so new storage backends (e.g. SQLite, HTTP API) or execution engines can be added without altering existing use cases.
- **Liskov Substitution Principle (LSP)**: Subtypes must be substitutable for their base types. Implementations of interfaces must fulfill all interface contracts without throwing unexpected runtime errors or altering expected preconditions.
- **Interface Segregation Principle (ISP)**: Keep interfaces small and client-focused. Do not force classes to depend on methods they do not use.
- **Dependency Inversion Principle (DIP)**: High-level modules (Use Cases) must not depend on low-level modules (File System, Child Process). Both must depend on abstractions (Interfaces).

### 2. Clean Architecture Layering
- **`src/domain`**: Pure business logic, entity models (`CommandLog`), value objects, and repository/service interfaces. No external dependencies (no file system, no CLI libraries).
- **`src/application`**: Application use cases (`ExecuteAndLogCommandUseCase`, `GetCommandHistoryUseCase`). Orchestrates domain objects and calls abstractions.
- **`src/infrastructure`**: Concrete implementations of interfaces (`JsonFileCommandLogRepository`, `NodeProcessExecutor`, `SystemEnvironmentExtractor`). Handles I/O, file systems, child processes.
- **`src/interface`**: Presentation and entry points (Commander.js CLI bindings, console formatters). Handles parsing input arguments and rendering console output.

---

## Code Guidelines & Best Practices

1. **TypeScript Strictness**:
   - `strict: true` must remain enabled in `tsconfig.json`.
   - Never use `any`. Use `unknown` with explicit type narrowing or Zod validation schemas when processing untyped data.
2. **Explicit Error Handling**:
   - Prefer Result types or explicit custom domain errors (`CommandExecutionError`, `RepositoryStorageError`) over generic thrown strings or unhandled exceptions.
3. **Immutability**:
   - Domain objects and value objects must be immutable (`readonly` properties).
4. **Testing Standards**:
   - Unit test all domain entities and application use cases using Vitest.
   - Use test doubles (mocks/stubs implementing interfaces) for infrastructure dependencies.
