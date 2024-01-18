import type { Schedule } from 'aws-cdk-lib/aws-events';
import awsCronParser from 'aws-cron-parser';

/**
 * Takes a schedule and figures out its frequency. Supports both CRON and RATE schedules.
 *
 * @param schedule - An AWS EventBridge Schedule
 * @returns an enum representing the rate at which a schedule runs
 */
export const scheduleFrequency = (
	schedule: Schedule,
): 'DAILY' | 'WEEKLY' | 'OTHER' => {
	// RATE and CRON are both 4 characters long
	const type = schedule.expressionString.substring(0, 4);
	const expression = schedule.expressionString.substring(
		5,
		schedule.expressionString.length - 1,
	);

	let frequencyInMilliseconds: number | undefined;

	if (type === 'rate') {
		frequencyInMilliseconds = scheduleFromRate(expression);
	} else if (type === 'cron') {
		frequencyInMilliseconds = scheduleFromCron(expression);
	} else {
		throw new Error(`Unexpected schedule type: ${type}`);
	}

	const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
	if (frequencyInMilliseconds / DAY_IN_MILLISECONDS > 7) {
		return 'OTHER';
	} else if (frequencyInMilliseconds / DAY_IN_MILLISECONDS > 1) {
		return 'WEEKLY';
	} else {
		return 'DAILY';
	}
};

/**
 * Parse a AWS EventBridge RATE expression, eg. `rate(4 hours)`
 * @param expression
 * @returns period between executions in milliseconds
 */
const scheduleFromRate = (expression: string): number => {
	// Parse the RATE type of schedule, eg `rate(5 hours)`
	const [amountString, type] = expression.split(' ');
	const typeInMilliseconds: Record<string, number> = {
		days: 24 * 60 * 60 * 1000,
		hours: 60 * 60 * 1000,
		minutes: 60 * 1000,
		seconds: 1000,
	};

	if (type === undefined || amountString === undefined) {
		throw new Error(`Malformed Rate expression: ${expression}`);
	}

	const typeMultiplier =
		typeInMilliseconds[type] ?? typeInMilliseconds[`${type}s`];
	const amount = parseInt(amountString);

	if (typeMultiplier === undefined) {
		throw new Error(`Unexpected rate type: ${expression}`);
	}

	return typeMultiplier * amount;
};

/**
 * Parse a AWS EventBridge CRON expression, eg. `cron(* * * 4 * *)`
 * @param expression
 * @returns period between executions in milliseconds
 */
const scheduleFromCron = (expression: string): number => {
	// AWS uses a non-standard CRON expression so we need to rely on a cron library specifically designed
	// for parsing AWS cron expressions.
	const parsedExpression = awsCronParser.parse(expression);
	const occurence = awsCronParser.next(parsedExpression, new Date());

	if (!occurence) {
		throw new Error(`First occurence of schedule not found: ${expression}`);
	}

	const nextOccurrence = awsCronParser.next(parsedExpression, occurence);

	if (!nextOccurrence) {
		throw new Error(`Second occurrence of schedule not found: ${expression}`);
	}

	return nextOccurrence.getTime() - occurence.getTime();
};
