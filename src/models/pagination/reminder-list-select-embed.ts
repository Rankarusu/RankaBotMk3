import { Reminder } from '@prisma/client';
import { ComponentType } from 'discord.js';
import {
  ArrayUtils,
  DbUtils,
  EmbedUtils,
  InteractionUtils,
  MessageUtils,
} from '../../utils';
import { NoReminderWarning } from '../warnings/no-reminder-warning';
import { ReminderEmbedPage } from './reminder-embed-page';
import { SelfGeneratingPaginationEmbed } from './self-generating-pagination-embed';

export class ReminderListSelectEmbed extends SelfGeneratingPaginationEmbed {
  pages: ReminderEmbedPage[];

  protected limit = 10;

  public async start(): Promise<void> {
    const reminders = await DbUtils.getRemindersByUserId(
      this.interaction.user.id
    );

    if (reminders.length === 0) {
      throw new NoReminderWarning();
    }

    this.pages = this.createEmbedPages(reminders);
    this.message = await this.send();

    if (this.pages.length > 1) {
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
    this.pages = this.createEmbedPages(reminders);

    await this.editReply();
  }

  protected initializeAdditionalCollectors(): void {
    const interactionCollector = this.message.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      max: 5,
      filter: (x) => {
        return this.interaction.user && x.user.id === this.interaction.user.id;
      },
    });

    interactionCollector.on('collect', async (intr) => {
      intr.deferUpdate();
      const { values } = intr;
      await DbUtils.deleteRemindersById(values);
      this.index = 0;
      await this.update();
    });

    interactionCollector.on('end', async () => {
      //empty out action rows after timeout
      await MessageUtils.edit(this.message, undefined, []);
    });
  }

  protected createEmbedPages(reminders: Reminder[]): ReminderEmbedPage[] {
    const partitionedReminders = ArrayUtils.partition(reminders, this.limit);
    const pages = partitionedReminders.map((chunk, index) => {
      return new ReminderEmbedPage(
        chunk,
        index + 1,
        partitionedReminders.length,
        this.limit
      );
    });

    return pages;
  }
}
