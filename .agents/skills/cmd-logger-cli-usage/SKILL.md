---
name: cmd-logger-cli-usage
description: Usage guide, shell hooks, and CLI command reference for cmd-logger.
---

# `cmd-logger` CLI Usage & Integration Skill

This skill explains how users interact with the `cmd-logger` command-line tool, wrap commands, and configure logging.

---

## 1. CLI Commands

### Command Execution Wrapper (`exec`)
Executes any shell command while capturing output status, duration, and system context:
```bash
cmd-logger exec -- npm run build
cmd-logger exec -- git status
```

### Manual Command Logging (`log`)
Manually logs a command execution entry:
```bash
cmd-logger log "docker compose up" --status success --duration 4200
```

### Querying Log History (`list`)
Displays logged commands in tabular format with filtering options:
```bash
# Show last 10 logs
cmd-logger list

# Filter by status
cmd-logger list --status failure

# Filter by search term and limit
cmd-logger list --search "git" --limit 5
```

### Execution Statistics (`stats`)
Displays execution metrics and analytics:
```bash
cmd-logger stats
```

---

## 2. Shell Integration / Alias Setup

To automatically log commands in a project, add aliases or shell wrappers in `.bashrc` / `.zshrc`:

```bash
# Log git commands automatically
alias git="cmd-logger exec -- git"

# Log npm commands automatically
alias npm="cmd-logger exec -- npm"
```
