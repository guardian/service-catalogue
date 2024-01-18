import { Duration } from 'aws-cdk-lib';
import { Schedule } from 'aws-cdk-lib/aws-events';
import { scheduleFrequency } from './schedule';

describe('EventBridge expression parsing', () => {
	it('should correctly identify task frequency from CRON', () => {
		expect(
			scheduleFrequency(
				Schedule.cron({
					hour: '1',
				}),
			),
		).toBe('DAILY');
		expect(
			scheduleFrequency(
				Schedule.cron({
					minute: '1',
					hour: '1',
					weekDay: '1',
				}),
			),
		).toBe('WEEKLY');
		expect(
			scheduleFrequency(
				Schedule.cron({
					minute: '1',
					hour: '1',
					day: '1',
				}),
			),
		).toBe('OTHER');
	});

	it('should correctly identify task frequency from RATE', () => {
		expect(scheduleFrequency(Schedule.rate(Duration.days(1)))).toBe('DAILY');
		expect(scheduleFrequency(Schedule.rate(Duration.days(7)))).toBe('WEEKLY');
		expect(scheduleFrequency(Schedule.rate(Duration.days(30)))).toBe('OTHER');
	});

	it('should correctly identify task frequency from EXPRESSION', () => {
		expect(scheduleFrequency(Schedule.expression('rate(1 days)'))).toBe(
			'DAILY',
		);
	});

	it('should throw error from invalid EXPRESSION', () => {
		expect(() => scheduleFrequency(Schedule.expression('asdf'))).toThrow(Error);
		expect(() => scheduleFrequency(Schedule.expression('asdf(asdf)'))).toThrow(
			Error,
		);
	});
});
