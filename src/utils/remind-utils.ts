import { Reminder } from '@prisma/client';
import {
  ActionRowBuilder,
  EmbedBuilder,
  SelectMenuBuilder,
  EmbedField,
  SelectMenuOptionBuilder,
} from 'discord.js';
import { EmbedUtils } from '.';
import { DateUtils } from './date-utils';

export class RemindUtils {
  public static createDeleteReminderActionRow(
    reminders: Reminder[]
  ): ActionRowBuilder<SelectMenuBuilder> {
    const rowData = this.getRowData(reminders);
    return new ActionRowBuilder<SelectMenuBuilder>().addComponents(
      new SelectMenuBuilder()
        .setCustomId('delete-reminder')
        .setPlaceholder('Select one or more reminders to delete')
        .addOptions(rowData)
        .setMinValues(1)
        .setMaxValues(rowData.length)
    );
  }

  public static createReminderListEmbed(reminders: Reminder[]): EmbedBuilder {
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
    const embedList: EmbedField[] = reminderList.map((reminder) => {
      return {
        name: reminder.id,
        value: reminder.text,
        inline: false,
      };
    });

    const embed = EmbedUtils.reminderListEmbed(
      'Here is a list of all your set reminders.',
      embedList
    );
    return embed;
  }

  private static getRowData(reminders: Reminder[]): SelectMenuOptionBuilder[] {
    const rowData: SelectMenuOptionBuilder[] = reminders.map(
      (reminder, index) => {
        return new SelectMenuOptionBuilder()
          .setLabel(`ID: ${(index + 1).toString().padStart(3, '0')}`)
          .setDescription(
            `${reminder.parsedTime.toLocaleString()} | ${reminder.message}`
          )
          .setValue(reminder.interactionId);
      }
    );
    return rowData;
  }
}
