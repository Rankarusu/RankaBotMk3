import { Reminder } from '@prisma/client';
import { Db } from '../services';
import { Snowflake } from 'discord.js';

export class DbUtils {
  public static async getAllReminders(): Promise<Reminder[]> {
    const reminders = await Db.reminder.findMany();
    return reminders;
  }

  public static async getRemindersByUserId(
    interactionId: Snowflake
  ): Promise<Reminder[]> {
    const reminders = await Db.reminder.findMany({
      where: { userId: interactionId },
      orderBy: { parsedTime: 'asc' },
    });
    return reminders;
  }

  public static async createReminder(data: Reminder): Promise<void> {
    await Db.reminder.create({ data });
  }

  public static async deleteReminderById(
    interactionId: Snowflake
  ): Promise<void> {
    await Db.reminder.delete({
      where: {
        interactionId,
      },
    });
  }

  public static async deleteRemindersById(
    interactionIds: Snowflake[]
  ): Promise<void> {
    await Db.reminder.deleteMany({
      where: {
        interactionId: {
          in: interactionIds,
        },
      },
    });
  }
}
