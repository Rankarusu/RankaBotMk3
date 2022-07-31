import { Reminder, Sticker } from '@prisma/client';
import { Db } from '../services';
import { Snowflake } from 'discord.js';

export class DbUtils {
  //reminders

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

  //stickers
  public static async getAllStickers(): Promise<Sticker[]> {
    const stickers = await Db.sticker.findMany();
    return stickers;
  }

  public static async getStickersByGuildId(
    guildId: Snowflake
  ): Promise<Sticker[]> {
    const stickers = await Db.sticker.findMany({
      where: { guildId },
      orderBy: { stickerName: 'asc' },
    });
    return stickers;
  }

  public static async createSticker(data: Sticker): Promise<void> {
    await Db.sticker.create({ data });
  }

  public async deleteStickerById(interactionId: Snowflake) {
    await Db.sticker.delete({
      where: {
        interactionId,
      },
    });
  }

  public async deleteStickersById(interactionIds: Snowflake[]) {
    await Db.sticker.deleteMany({
      where: {
        interactionId: {
          in: interactionIds,
        },
      },
    });
  }
}
