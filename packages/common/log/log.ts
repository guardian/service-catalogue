// These follow the non-aliased methods available on Node's console object:
// https://nodejs.org/api/console.html#consoletracemessage-args.
export const LOG_LEVELS = ['error', 'log', 'debug', 'warn', 'trace'] as const;

export type LogLevel = typeof LOG_LEVELS[number];

export function getLogLevel(logArg?: string): LogLevel {
	const defaultLogLevel: LogLevel = 'log';

	if (!logArg) {
		return defaultLogLevel;
	}

	return LOG_LEVELS.includes(logArg as LogLevel)
		? (logArg as LogLevel)
		: defaultLogLevel;
}

// Overrides the global console.* functions so call early.
export function configureLogging(logLevel: LogLevel) {
	const shouldLog = (level: LogLevel) => {
		return LOG_LEVELS.indexOf(level) <= LOG_LEVELS.indexOf(logLevel);
	};

	const _console = console;
	global.console = {
		...global.console,
		log: (message?: unknown, ...optionalParams: unknown[]) => {
			shouldLog('log') && _console.log(message, ...optionalParams);
		},
		warn: (message?: unknown, ...optionalParams: unknown[]) => {
			shouldLog('warn') && _console.warn(message, ...optionalParams);
		},
		error: (message?: unknown, ...optionalParams: unknown[]) => {
			shouldLog('error') && _console.error(message, ...optionalParams);
		},
		debug: (message?: unknown, ...optionalParams: unknown[]) => {
			shouldLog('debug') && _console.debug(message, ...optionalParams);
		},
		trace: (message?: unknown, ...optionalParams: unknown[]) => {
			shouldLog('trace') && _console.trace(message, ...optionalParams);
		},
	};
}
