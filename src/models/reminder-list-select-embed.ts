import { Reminder } from '@prisma/client';
import {
  ActionRowBuilder,
  ComponentType,
  EmbedBuilder,
  EmbedField,
  SelectMenuBuilder,
  SelectMenuOptionBuilder,
  User,
} from 'discord.js';
import {
  DateUtils,
  DbUtils,
  EmbedUtils,
  InteractionUtils,
  MessageUtils,
} from '../utils';
import { PaginatedSelectEmbed } from './paginated-select-embed';
import { NoReminderWarning } from './warnings';

export class ReminderListSelectEmbed extends PaginatedSelectEmbed {
  protected limit = 10;

  public async start(): Promise<void> {
    const reminders = await DbUtils.getRemindersByUserId(
      this.interaction.user.id
    );

    if (reminders.length === 0) {
      // await InteractionUtils.sendWarning(this.interaction, noReminderWarning);
      // return;
      throw new NoReminderWarning();
    }

    this.createAdditionalRows(reminders);
    this.createEmbedPages(reminders);
    this.message = await this.send();

    if (this.pages.length > 0) {
      //no need to initialize collectors if there is only one page
      super.initializePaginationButtonCollector();
    }
    this.initializeAdditionalCollectors();
  }

  protected async update(): Promise<void> {
    const reminders = await DbUtils.getRemindersByUserId(
      this.interaction.user.id
    );

    if (reminders.length === 0) {
      const embed = EmbedUtils.warnEmbed(new NoReminderWarning());
      InteractionUtils.editReply(this.interaction, embed, []);
      return;
    }
    this.createAdditionalRows(reminders);
    this.createEmbedPages(reminders);

    await this.editReply();
  }

  protected createAdditionalRows(reminders: Reminder[]): void {
    const rowData = this.getRowData(reminders);
    const selectMenuRow =
      new ActionRowBuilder<SelectMenuBuilder>().addComponents(
        new SelectMenuBuilder()
          .setCustomId('delete-reminder')
          .setPlaceholder('Select one or more reminders to delete')
          .addOptions(rowData)
          .setMinValues(1)
          .setMaxValues(rowData.length)
      );
    this.additionalRows = [selectMenuRow];
  }

  private getRowData(reminders: Reminder[]): SelectMenuOptionBuilder[] {
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

  protected initializeAdditionalCollectors(): void {
    const interactionCollector = this.message.createMessageComponentCollector({
      componentType: ComponentType.SelectMenu,
      max: 5,
      filter: (x) => {
        return (
          this.interaction.user &&
          x.user.id === (this.interaction.user as User).id
        );
      },
    });

    interactionCollector.on('collect', async (intr) => {
      intr.deferUpdate();
      const { values } = intr;
      await DbUtils.deleteRemindersById(values);
      await this.update();
    });
    interactionCollector.on('end', async () => {
      //empty out action rows after timeout
      await MessageUtils.edit(this.message, undefined, []);
    });
  }

  private createEmbedPages(reminders: Reminder[]) {
    const fields = reminders.map((reminder, index) => {
      const name = `ID: ${(index + 1).toString().padStart(3, '0')}`;
      const value = `<t:${DateUtils.getUnixTime(reminder.parsedTime)}:f> | ${
        reminder.message
      }`;
      return {
        name,
        value,
        inline: false,
      } as EmbedField;
    });

    const pages: EmbedBuilder[] = [];
    const pagesAmount = Math.ceil(fields.length / this.limit);
    let currentPage = 1;
    for (let i = 0; i < fields.length; i += this.limit) {
      const chunk = fields.slice(i, i + this.limit);
      const embed = EmbedUtils.reminderListEmbed(
        'Here is a list of all your set reminders.',
        chunk
      ).setFooter({
        text: `${this.footerText} ${currentPage}/${pagesAmount}`,
      });
      pages.push(embed);
      currentPage++;
    }
    this.pages = pages;
  }
}
