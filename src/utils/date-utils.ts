export class DateUtils {
  public static getUnixTime(date: Date): number {
    return Math.floor(date.getTime() / 1000);
  }
}
