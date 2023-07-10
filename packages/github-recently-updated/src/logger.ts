export const LOG_LEVELS = ['debug', 'log', 'warn', 'error', 'off'] as const;
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

export function configureLogging(logLevel: LogLevel) {
	const shouldLog = (level: LogLevel) => {
		return LOG_LEVELS.indexOf(level) >= LOG_LEVELS.indexOf(logLevel);
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
	};
}
