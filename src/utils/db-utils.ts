import { Exp, Reminder, Sticker } from '@prisma/client';
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

  public static async getStickerByName(
    stickerName: string,
    guildId: Snowflake
  ): Promise<Sticker> {
    const sticker = await Db.sticker.findFirst({
      where: {
        stickerName,
        guildId,
      },
    });
    return sticker;
  }

  public static async createSticker(data: Sticker): Promise<void> {
    await Db.sticker.create({ data });
  }

  public static async deleteStickerById(interactionId: Snowflake) {
    await Db.sticker.delete({
      where: {
        interactionId,
      },
    });
  }

  public static async deleteStickersById(interactionIds: Snowflake[]) {
    await Db.sticker.deleteMany({
      where: {
        interactionId: {
          in: interactionIds,
        },
      },
    });
  }

  //exp
  public static async getExpByGuild(guildId: Snowflake): Promise<Exp[]> {
    const exp = await Db.exp.findMany({
      where: { guildId },
      orderBy: { xp: 'desc' },
    });

    return exp;
  }

  public static async getExpByUser(
    guildId: Snowflake,
    userId: Snowflake
  ): Promise<Exp> {
    const exp = await Db.exp.findUnique({
      where: {
        userId_guildId: { userId, guildId },
      },
    });
    return exp;
  }

  public static async upsertExp(
    guildId: Snowflake,
    userId: Snowflake,
    xp: number,
    level: number,
    xpLock: Date
  ): Promise<void> {
    await Db.exp.upsert({
      where: { userId_guildId: { userId, guildId } },
      create: {
        guildId,
        userId,
        xp: xp,
        level: 1,
        xpLock: new Date(),
      },
      update: {
        xp,
        level,
        xpLock,
      },
    });
  }

  public static async deleteExpById(
    guildId: Snowflake,
    userIds: Snowflake | Snowflake[]
  ) {
    await Db.exp.deleteMany({
      where: {
        guildId,
        userId: {
          in: userIds,
        },
      },
    });
  }
}
