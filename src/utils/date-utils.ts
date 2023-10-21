import * as chrono from 'chrono-node';

export class DateUtils {
  public static getUnixTime(date: Date): number {
    return Math.floor(date.getTime() / 1000);
  }

  public static prettyPrintTimestamp(milliseconds: number): string {
    const seconds = milliseconds / 1000;
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    const output = [];

    if (d === 1) {
      output.push(`${d} day`);
    } else if (d > 1) {
      output.push(`${d} days`);
    }

    if (h === 1) {
      output.push(`${h} hour`);
    } else if (h > 1) {
      output.push(`${h} hours`);
    }

    if (m === 1) {
      output.push(`${m} minute`);
    } else if (m > 1) {
      output.push(`${m} minutes`);
    }

    if (s === 1) {
      output.push(`${s} second`);
    } else if (s > 1) {
      output.push(`${s} seconds`);
    }

    return output.join(', ');
  }

  private static weekdays: string[] = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  public static getWeekdayFromNumber(number: number): string {
    return this.weekdays[number];
  }

  public static parseTime(timeStr: string) {
    const now = new Date();
    const parsedTime = chrono.parseDate(
      timeStr,
      { instant: now, timezone: 'Europe/Berlin' },
      { forwardDate: true }
    );

    if (!parsedTime) {
      // parsed time is null if parse is unsuccessful
      throw new Error(`Could not parse the time: ${timeStr}`);
    }

    parsedTime.setSeconds(0);
    parsedTime.setMilliseconds(0);
    return parsedTime;
  }
}
