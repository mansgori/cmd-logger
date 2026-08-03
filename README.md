# cmd-logger 🚀

A lightweight, clean-architecture CLI tool written in TypeScript to track, log, and analyze command execution history in your software projects.

---

## 📌 Features

- **Command Execution Wrapper (`exec`)**: Intercepts and executes shell commands, recording runtime duration, exit code, Git branch, username, and OS environment.
- **Manual Command Logger (`log`)**: Record arbitrary commands or script executions manually with custom statuses and duration.
- **Log History & Filtering (`list`)**: Query logged commands by status (success/failure), search terms, or date ranges with tabular console output.
- **Analytics & Statistics (`stats`)**: View total execution counts, success rates, average runtime, and top executed commands.
- **Clean Architecture & SOLID Design**: Fully decoupled domain, application use cases, and storage abstractions for high maintainability and testability.

---

## 📦 Installation & Setup

### 1. Clone & Install Dependencies
```bash
git clone git@github.com:mansgori/cmd-logger.git
cd cmd-logger
npm install
```

### 2. Build the Project
```bash
npm run build
```

### 3. (Optional) Link Globally or Create Alias
To run `cmd-logger` anywhere from your shell:
```bash
npm link
# OR add local bin alias:
alias cmd-logger="node /path/to/cmd-logger/bin/cmd-logger.js"
```

---

## 💡 Usage Guide

### 1. Wrap & Execute Commands (`exec`)
Pass any shell command after `--` to execute it while automatically capturing its execution metadata.

```bash
# Execute npm build and log results
cmd-logger exec -- npm run build

# Execute git status
cmd-logger exec -- git status
```

**Output:**
```
[cmd-logger] Command logged (success, 142ms, exit: 0)
```

---

### 2. Log Commands Manually (`log`)
Manually record command entries with custom execution status and metadata.

```bash
# Log a successful deployment
cmd-logger log "docker compose up" --status success --duration 4200 --exit-code 0

# Log a failed test run
cmd-logger log "npm test" --status failure --exit-code 1 --duration 850
```

---

### 3. View Log History (`list`)
Query logged execution history with filtering options.

```bash
# View last 10 logs
cmd-logger list

# Filter by status (success or failure)
cmd-logger list --status failure

# Filter by search term
cmd-logger list --search "git" --limit 5
```

**Example Output:**
```
--- Command Execution History (Last 5) ---
1. [2026-08-03 12:16:13] ✓ "git commit -m 'Initial commit'" (120ms) [branch: main]
2. [2026-08-03 12:16:13] ✓ "echo Testing cmd-logger CLI" (2ms) [branch: main]
3. [2026-08-03 12:14:05] ✗ "npm test" (850ms) [branch: feature/auth]
```

---

### 4. Command Execution Analytics (`stats`)
Get aggregate metrics on executed commands.

```bash
cmd-logger stats
```

**Example Output:**
```
--- Command Execution Statistics ---
Total Commands Executed: 42
Successful Executions:  38
Failed Executions:      4
Success Rate:           90.48%
Average Duration:       215 ms

Most Frequent Commands:
  1. "npm test" (15 runs)
  2. "git status" (12 runs)
  3. "npm run build" (8 runs)
```

---

## ⚡ Automatic Shell Integration

To automatically log commands in your terminal session, add command aliases to your shell configuration file (`~/.bashrc` or `~/.zshrc`):

```bash
# Automatically track git commands
alias git="cmd-logger exec -- git"

# Automatically track npm commands
alias npm="cmd-logger exec -- npm"
```

---

## 🏗️ Architecture & Development

This codebase strictly adheres to **Clean Architecture** and **SOLID Principles**:

```
src/
├── domain/            # Core Domain Entities & Interface Abstractions
│   ├── entities/      # CommandLog entity & Value Objects
│   ├── repositories/  # ICommandLogRepository contract
│   └── services/      # IProcessExecutor & IEnvironmentExtractor contracts
├── application/       # Application Use Cases
│   └── use-cases/     # ExecuteAndLogCommandUseCase, GetCommandHistoryUseCase, etc.
├── infrastructure/    # Technology Adapters (I/O, File System, Subprocess)
│   ├── repositories/  # JsonFileCommandLogRepository
│   └── services/      # NodeProcessExecutor, SystemEnvironmentExtractor
└── interface/         # Presentation Layer (CLI Commander commands & formatters)
    └── cli/
```

### Running Tests
```bash
npm test
```

---

## 📄 License
[MIT](LICENSE)
