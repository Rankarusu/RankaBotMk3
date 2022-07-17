import { Reminder } from '@prisma/client';
import {
  MessageActionRow,
  MessageEmbed,
  MessageSelectMenu,
  MessageSelectOptionData,
} from 'discord.js';
import { EmbedUtils } from '.';
import { DateUtils } from './date-utils';

export class RemindUtils {
  public static createDeleteReminderActionRow(
    reminders: Reminder[]
  ): MessageActionRow {
    const rowData = this.getRowData(reminders);
    return new MessageActionRow().addComponents(
      new MessageSelectMenu()
        .setCustomId('delete-reminder')
        .setPlaceholder('Select one or more reminders to delete')
        .addOptions(rowData)
        .setMinValues(1)
        .setMaxValues(rowData.length)
    );
  }

  public static createReminderListEmbed(reminders: Reminder[]): MessageEmbed {
    const reminderList = reminders.map((reminder, index) => {
      return {
        time: reminder.parsedTime.toLocaleString(),
        id: `ID: ${(index + 1).toString().padStart(3, '0')}`,
        text: `<t:${DateUtils.getUnixTime(reminder.parsedTime)}:f> | ${
          reminder.message
        }`,
        message: reminder.message,
        interactionId: reminder.interactionId,
      };
    });

    const embed = EmbedUtils.reminderListEmbed(
      'Here is a list of all your set reminders.',
      reminderList
    );
    return embed;
  }

  private static getRowData(reminders: Reminder[]): MessageSelectOptionData[] {
    const rowData: MessageSelectOptionData[] = reminders.map(
      (reminder, index) => {
        return {
          label: `ID: ${(index + 1).toString().padStart(3, '0')}`,
          description: `${reminder.parsedTime.toLocaleString()} | ${
            reminder.message
          }`,
          value: reminder.interactionId,
        };
      }
    );
    return rowData;
  }
}
