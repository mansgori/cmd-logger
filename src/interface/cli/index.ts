import { Command } from 'commander';
import { JsonFileCommandLogRepository } from '../../infrastructure/repositories/JsonFileCommandLogRepository.js';
import { NodeProcessExecutor } from '../../infrastructure/services/NodeProcessExecutor.js';
import { SystemEnvironmentExtractor } from '../../infrastructure/services/SystemEnvironmentExtractor.js';

import { LogCommandUseCase } from '../../application/use-cases/LogCommandUseCase.js';
import { ExecuteAndLogCommandUseCase } from '../../application/use-cases/ExecuteAndLogCommandUseCase.js';
import { GetCommandHistoryUseCase } from '../../application/use-cases/GetCommandHistoryUseCase.js';
import { GetCommandStatsUseCase } from '../../application/use-cases/GetCommandStatsUseCase.js';
import { ExecutionStatus } from '../../domain/entities/CommandLog.js';

// Dependency Injection Wiring
const repository = new JsonFileCommandLogRepository();
const processExecutor = new NodeProcessExecutor();
const envExtractor = new SystemEnvironmentExtractor();

const logUseCase = new LogCommandUseCase(repository, envExtractor);
const execUseCase = new ExecuteAndLogCommandUseCase(processExecutor, repository, envExtractor);
const historyUseCase = new GetCommandHistoryUseCase(repository);
const statsUseCase = new GetCommandStatsUseCase(repository);

const program = new Command();

program
  .name('cmd-logger')
  .description('CLI tool to log, track, and analyze command executions in your project')
  .version('1.0.0');

// Command: exec -- <command>
program
  .command('exec')
  .description('Execute a shell command and log its execution metadata')
  .argument('<command...>', 'Command and arguments to execute')
  .action(async (commandParts: string[]) => {
    const fullCommand = commandParts.join(' ');
    try {
      const log = await execUseCase.execute({ command: fullCommand });
      console.log(`\n[cmd-logger] Command logged (${log.status}, ${log.durationMs}ms, exit: ${log.exitCode})`);
      process.exit(log.exitCode);
    } catch (err: any) {
      console.error(`[cmd-logger] Execution error:`, err?.message || err);
      process.exit(1);
    }
  });

// Command: log <command>
program
  .command('log')
  .description('Manually log a command entry')
  .argument('<command>', 'Command string to log')
  .option('-s, --status <status>', 'Execution status: success or failure')
  .option('-c, --exit-code <code >', 'Exit code', parseInt)
  .option('-d, --duration <ms>', 'Duration in milliseconds', parseInt)
  .action(async (command: string, options: { status?: ExecutionStatus; exitCode?: number; duration?: number }) => {
    try {
      const log = await logUseCase.execute({
        command,
        status: options.status,
        exitCode: options.exitCode,
        durationMs: options.duration,
      });
      console.log(`[cmd-logger] Logged command ID: ${log.id}`);
    } catch (err: any) {
      console.error(`[cmd-logger] Failed to log command:`, err?.message || err);
      process.exit(1);
    }
  });

// Command: list
program
  .command('list')
  .description('View logged command execution history')
  .option('-s, --status <status>', 'Filter by status (success|failure)')
  .option('-q, --search <term>', 'Filter by command search term')
  .option('-l, --limit <number>', 'Number of logs to show', (val) => parseInt(val, 10), 10)
  .action(async (options: { status?: ExecutionStatus; search?: string; limit: number }) => {
    try {
      const logs = await historyUseCase.execute({
        status: options.status,
        search: options.search,
        limit: options.limit,
      });

      if (logs.length === 0) {
        console.log('[cmd-logger] No logs found.');
        return;
      }

      console.log(`\n--- Command Execution History (Last ${logs.length}) ---`);
      logs.forEach((log, idx) => {
        const timeStr = log.timestamp.toISOString().replace('T', ' ').substring(0, 19);
        const statusSymbol = log.status === 'success' ? '✓' : '✗';
        console.log(
          `${idx + 1}. [${timeStr}] ${statusSymbol} "${log.command}" (${log.durationMs}ms) [branch: ${log.environment.gitBranch || 'N/A'}]`
        );
      });
    } catch (err: any) {
      console.error(`[cmd-logger] Failed to retrieve logs:`, err?.message || err);
      process.exit(1);
    }
  });

// Command: stats
program
  .command('stats')
  .description('Display summary statistics for command executions')
  .action(async () => {
    try {
      const stats = await statsUseCase.execute();
      console.log('\n--- Command Execution Statistics ---');
      console.log(`Total Commands Executed: ${stats.totalCommands}`);
      console.log(`Successful Executions:  ${stats.successfulCommands}`);
      console.log(`Failed Executions:      ${stats.failedCommands}`);
      console.log(`Success Rate:           ${stats.successRatePercentage}%`);
      console.log(`Average Duration:       ${stats.averageDurationMs} ms`);

      if (stats.topCommands.length > 0) {
        console.log('\nMost Frequent Commands:');
        stats.topCommands.forEach((item, i) => {
          console.log(`  ${i + 1}. "${item.command}" (${item.count} runs)`);
        });
      }
    } catch (err: any) {
      console.error(`[cmd-logger] Failed to compute stats:`, err?.message || err);
      process.exit(1);
    }
  });

program.parse(process.argv);
