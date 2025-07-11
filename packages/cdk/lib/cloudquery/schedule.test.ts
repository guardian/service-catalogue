import { Duration } from 'aws-cdk-lib';
import { Schedule } from 'aws-cdk-lib/aws-events';
import { describe, expect, it } from 'vitest';
import { scheduleFrequencyMs } from './schedule';

describe('EventBridge expression parsing', () => {
	it('should correctly identify task frequency from CRON', () => {
		expect(
			scheduleFrequencyMs(
				Schedule.cron({
					hour: '1',
				}),
			),
		).toBe(Duration.minutes(1).toMilliseconds());
		expect(
			scheduleFrequencyMs(
				Schedule.cron({
					minute: '1',
					hour: '1',
					weekDay: '1',
				}),
			),
		).toBe(Duration.days(7).toMilliseconds());
	});

	it('should correctly identify task frequency from RATE', () => {
		expect(scheduleFrequencyMs(Schedule.rate(Duration.days(1)))).toBe(
			Duration.days(1).toMilliseconds(),
		);
		expect(scheduleFrequencyMs(Schedule.rate(Duration.days(7)))).toBe(
			Duration.days(7).toMilliseconds(),
		);
		expect(scheduleFrequencyMs(Schedule.rate(Duration.days(30)))).toBe(
			Duration.days(30).toMilliseconds(),
		);
	});

	it('should correctly identify task frequency from EXPRESSION', () => {
		expect(scheduleFrequencyMs(Schedule.expression('rate(1 days)'))).toBe(
			Duration.days(1).toMilliseconds(),
		);
	});

	it('should throw error from invalid EXPRESSION', () => {
		expect(() => scheduleFrequencyMs(Schedule.expression('asdf'))).toThrow(
			Error,
		);
		expect(() =>
			scheduleFrequencyMs(Schedule.expression('asdf(asdf)')),
		).toThrow(Error);
	});
});
