import { Reminder } from '@prisma/client';
import {
  ActionRowBuilder,
  EmbedField,
  SelectMenuBuilder,
  SelectMenuOptionBuilder,
} from 'discord.js';
import { DateUtils, EmbedUtils } from '../../utils';
import { ExtendedEmbedPage } from './extended-embed-page';

export class ReminderEmbedPage extends ExtendedEmbedPage {
  data: Reminder[];

  constructor(
    data: Reminder[],
    pageNum: number,
    lastPageNum: number,
    pageSize: number
  ) {
    super(undefined, pageNum, lastPageNum, pageSize, undefined);
    this.data = data;
    this.embed = this.createEmbed();
    this.additionalRows = this.createSelectMenuRow();
  }

  private createSelectMenuRow() {
    const options = this.createSelectMenuOptions();
    const selectMenuRow =
      new ActionRowBuilder<SelectMenuBuilder>().addComponents(
        new SelectMenuBuilder()
          .setCustomId('delete-reminder')
          .setPlaceholder('Select one or more reminders to delete')
          .addOptions(options)
          .setMinValues(1)
          .setMaxValues(options.length)
      );
    return [selectMenuRow];
  }

  private createSelectMenuOptions() {
    const options: SelectMenuOptionBuilder[] = this.data.map(
      (reminder, index) => {
        const id = (this.pageNum - 1) * this.pageSize + index + 1;
        return new SelectMenuOptionBuilder()
          .setLabel(`ID: ${id.toString().padStart(3, '0')}`)
          .setDescription(
            `${reminder.parsedTime.toLocaleString('de')} | ${reminder.message}`
          )
          .setValue(reminder.interactionId);
      }
    );
    return options;
  }

  private createEmbed() {
    const fields = this.createEmbedFields();
    const embed = EmbedUtils.listEmbed(
      'Here is a list of all your set reminders.',
      'Reminders',
      fields
    ).setFooter({
      text: `${this.footerText} ${this.pageNum}/${this.lastPageNum}`,
    });
    return embed;
  }

  private createEmbedFields() {
    const fields = this.data.map((reminder, index) => {
      const id = (this.pageNum - 1) * this.pageSize + index + 1;
      const name = `ID: ${id.toString().padStart(3, '0')}`;
      const value = `<t:${DateUtils.getUnixTime(reminder.parsedTime)}:f> | ${
        reminder.message
      }`;
      return {
        name,
        value,
        inline: false,
      } as EmbedField;
    });
    return fields;
  }
}
