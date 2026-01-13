import { CheckResult } from './scanner.types';
import { runHeadersCheck } from './checks/headers.check';
import { runSslCheck } from './checks/ssl.check';
import { runOwaspCheck } from './checks/owasp.check';
import { runPerformanceCheck } from './checks/performance.check';
import { logger } from '../../utils/logger';

/**
 * Run all security check modules against the given URL in parallel.
 *
 * Uses `Promise.allSettled` so that a failure in one module does not
 * prevent the other modules from completing. Results from fulfilled
 * promises are collected; rejected promises are logged as errors.
 *
 * @returns A flat array of all `CheckResult` items from every successful module.
 */
export async function runAllChecks(url: string): Promise<CheckResult[]> {
  const modules: Array<{
    name: string;
    fn: (url: string) => Promise<CheckResult[]>;
  }> = [
    { name: 'headers', fn: runHeadersCheck },
    { name: 'ssl', fn: runSslCheck },
    { name: 'owasp', fn: runOwaspCheck },
    { name: 'performance', fn: runPerformanceCheck },
  ];

  const settled = await Promise.allSettled(
    modules.map(({ name, fn }) =>
      fn(url).catch((error) => {
        // Re-throw with module name for clearer logging in the settled handler.
        throw new Error(
          `[${name}] ${error instanceof Error ? error.message : String(error)}`,
        );
      }),
    ),
  );

  const results: CheckResult[] = [];

  settled.forEach((outcome, index) => {
    const moduleName = modules[index].name;

    if (outcome.status === 'fulfilled') {
      logger.info(
        `Scanner module "${moduleName}" completed with ${outcome.value.length} check(s)`,
      );
      results.push(...outcome.value);
    } else {
      logger.error(
        `Scanner module "${moduleName}" failed: ${outcome.reason}`,
      );
    }
  });

  return results;
}
