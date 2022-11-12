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

    const dDisplay = d > 0 ? d + (d == 1 ? ' day, ' : ' days, ') : '';
    const hDisplay = h > 0 ? h + (h == 1 ? ' hour, ' : ' hours, ') : '';
    const mDisplay = m > 0 ? m + (m == 1 ? ' minute, ' : ' minutes, ') : '';
    const sDisplay = s > 0 ? s + (s == 1 ? ' second' : ' seconds') : '';
    return dDisplay + hDisplay + mDisplay + sDisplay;
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
