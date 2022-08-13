import { Reminder, Sticker } from '@prisma/client';
import {
  ActionRowBuilder,
  APIEmbedField,
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
  ComponentType,
  EmbedBuilder,
  EmbedField,
  Message,
  MessageComponentInteraction,
  SelectMenuBuilder,
  SelectMenuOptionBuilder,
  User,
  UserResolvable,
} from 'discord.js';
import {
  DateUtils,
  DbUtils,
  EmbedUtils,
  InteractionUtils,
  MessageUtils,
} from '../utils';

export class PaginationEmbed {
  interaction: CommandInteraction | MessageComponentInteraction;

  author: UserResolvable;

  message: Message;

  pages: EmbedBuilder[];

  protected timeout?: number;

  protected limit?: number;

  protected index = 0;

  protected footerText = 'Page';

  paginationButtons? = new ActionRowBuilder<ButtonBuilder>().addComponents([
    new ButtonBuilder()
      .setStyle(ButtonStyle.Primary)
      .setCustomId('first')
      .setEmoji('⏮'),

    new ButtonBuilder()
      .setStyle(ButtonStyle.Primary)
      .setCustomId('previous')
      .setEmoji('◀'),

    new ButtonBuilder()
      .setStyle(ButtonStyle.Danger)
      .setCustomId('stop')
      .setEmoji('⏹'),

    new ButtonBuilder()
      .setStyle(ButtonStyle.Primary)
      .setCustomId('next')
      .setEmoji('▶'),

    new ButtonBuilder()
      .setStyle(ButtonStyle.Primary)
      .setCustomId('last')
      .setEmoji('⏭'),
  ]);

  constructor(
    interaction: CommandInteraction | MessageComponentInteraction,
    pages?: EmbedBuilder[] | EmbedBuilder,
    limit?: number,
    timeout?: number
  ) {
    this.interaction = interaction;
    this.limit = limit ? limit : 5;
    if (pages instanceof EmbedBuilder) {
      this.pages = this.paginateEmbed(pages, this.limit);
    } else {
      this.pages = pages;
    }
    this.author = interaction.user;
    this.timeout = timeout ? timeout : 60000;
  }

  public async start(): Promise<void> {
    this.addPageNumbers();
    this.message = await this.send();
    if (this.pages.length > 0) {
      //no need to initialize collector if there is only one page
      this.initializePaginationButtonCollector();
    }
  }

  protected addPageNumbers() {
    this.pages.map((page, pageIndex) => {
      if (page.data.footer && page.data.footer.text)
        return page.setFooter({
          text: `${page.data.footer.text} • ${this.footerText} ${
            pageIndex + 1
          }/${this.pages.length}`,
        });
      return page.setFooter({
        text: `${this.footerText} ${pageIndex + 1}/${this.pages.length}`,
      });
    });
  }

  protected initializePaginationButtonCollector() {
    const interactionCollector = this.message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      max: this.pages.length * 5,
      time: this.timeout,
      filter: (x) => {
        return this.author && x.user.id === (this.author as User).id;
      },
    });

    interactionCollector.on('collect', async (interaction) => {
      const { customId } = interaction;
      let newPageIndex: number;
      switch (customId) {
        case 'first':
          newPageIndex = 0;
          break;
        case 'previous':
          newPageIndex = this.index - 1;
          break;
        case 'stop':
          newPageIndex = NaN;
          break;
        case 'next':
          newPageIndex = this.index + 1;
          break;
        case 'last':
          newPageIndex = this.pages.length - 1;
          break;
      }
      if (isNaN(newPageIndex)) {
        //empty out action rows on stop command
        interactionCollector.stop('Stopped by user');
        await InteractionUtils.update(interaction, undefined, []);
      } else {
        //keep page index in bounds
        newPageIndex = Math.min(
          Math.max(newPageIndex, 0),
          this.pages.length - 1
        );
        this.index = newPageIndex;

        await InteractionUtils.update(
          interaction,
          this.pages[this.index],
          undefined
        );
      }
    });
    interactionCollector.on('end', async () => {
      //empty out action rows after timeout
      await InteractionUtils.editReply(this.interaction, undefined, []);
    });
  }

  protected paginateEmbed(embed: EmbedBuilder, limit: number) {
    //splits embed fields into multiple pages with same header, footer, etc.

    const fields = embed.data.fields;

    const splitFields: APIEmbedField[][] = [[]];
    let idx = 0;
    fields.forEach((field, fieldIndex) => {
      //get amount of full lines in current index
      const curLines = (field.value.match(/\n/g) || '').length + 1;
      let lines = 0;
      if (splitFields[idx]) {
        lines =
          (
            splitFields[idx]
              .map((f) => f.value)
              .join('\n')
              .match(/\n/g) || ''
          ).length + 1;
      }
      //make sure to put the first group on the first page.
      if (lines + curLines <= limit || fieldIndex === 0) {
        splitFields[idx].push(field);
      } else {
        idx += 1;
        splitFields.push([]);
        splitFields[idx].push(field);
      }
    });

    const pages: EmbedBuilder[] = splitFields.map((fieldArr) => {
      //copy the initial embed but replace
      const embedJson = embed.toJSON();
      return new EmbedBuilder(embedJson).setFields(fieldArr);
    });

    return pages;
  }

  protected async send(): Promise<Message> {
    const message = await InteractionUtils.send(
      this.interaction,
      this.pages[0],
      //we don't need pagination on a single page.
      this.pages.length < 2 ? undefined : [this.paginationButtons]
    );

    return message;
  }

  public async editReply() {
    //remove buttons if necessary
    const message = await InteractionUtils.editReply(
      this.interaction,
      this.pages[0],
      this.pages.length < 2 ? undefined : [this.paginationButtons]
    );

    return message;
  }

  public changePages(pages: EmbedBuilder | EmbedBuilder[]) {
    if (pages instanceof EmbedBuilder) {
      this.pages = this.paginateEmbed(pages, this.limit);
    } else {
      this.pages = pages;
    }
  }
}

abstract class PaginatedSelectEmbed extends PaginationEmbed {
  additionalRows: ActionRowBuilder<SelectMenuBuilder | ButtonBuilder>[] = [];

  public abstract start(): Promise<void>;
  protected abstract update(): Promise<void>;
  protected abstract createAdditionalRows(
    data: Array<Reminder | Sticker>
  ): void;

  protected abstract initializeAdditionalCollectors(): void;

  protected override async send(): Promise<Message> {
    //override so we can add additional Rows
    const message = await InteractionUtils.send(
      this.interaction,
      this.pages[0],
      this.pages.length < 2
        ? this.additionalRows
        : [...this.additionalRows, this.paginationButtons]
    );

    return message;
  }

  public override async editReply() {
    //override so we can add additional Rows
    const message = await InteractionUtils.editReply(
      this.interaction,
      this.pages[0],
      this.pages.length < 2
        ? this.additionalRows
        : [...this.additionalRows, this.paginationButtons]
    );

    return message;
  }

  public override changePages(
    pages: EmbedBuilder | EmbedBuilder[],
    additionalRows?: ActionRowBuilder<ButtonBuilder | SelectMenuBuilder>[]
  ) {
    if (pages instanceof EmbedBuilder) {
      this.pages = this.paginateEmbed(pages, this.limit);
    } else {
      this.pages = pages;
    }
    this.additionalRows = additionalRows;
  }
}

export class ExtendedPaginationEmbed extends PaginationEmbed {
  additionalRows: ActionRowBuilder<SelectMenuBuilder | ButtonBuilder>[] = [];

  constructor(
    interaction: CommandInteraction | MessageComponentInteraction,
    pages?: EmbedBuilder[] | EmbedBuilder,
    additionalRows?: ActionRowBuilder<ButtonBuilder | SelectMenuBuilder>[],
    limit?: number,
    timeout?: number
  ) {
    super(interaction, pages, limit, timeout);
    this.additionalRows = additionalRows || [];
  }

  override async send(): Promise<Message> {
    //override so we can add additional Rows
    const message = await InteractionUtils.send(
      this.interaction,
      this.pages[0],
      this.pages.length < 2
        ? this.additionalRows
        : [...this.additionalRows, this.paginationButtons]
    );

    return message;
  }

  public override async editReply() {
    //override so we can add additional Rows
    const message = await InteractionUtils.editReply(
      this.interaction,
      this.pages[0],
      this.pages.length < 2
        ? this.additionalRows
        : [...this.additionalRows, this.paginationButtons]
    );

    return message;
  }

  public override changePages(
    pages: EmbedBuilder | EmbedBuilder[],
    additionalRows?: ActionRowBuilder<ButtonBuilder | SelectMenuBuilder>[]
  ) {
    if (pages instanceof EmbedBuilder) {
      this.pages = this.paginateEmbed(pages, this.limit);
    } else {
      this.pages = pages;
    }
    this.additionalRows = additionalRows;
  }
}

export class ReminderListSelectEmbed extends PaginatedSelectEmbed {
  private warnEmbed = EmbedUtils.warnEmbedNoFields(
    'You have no reminders set at the moment. Use `/remind set` to set one.'
  );

  protected limit = 10;

  public async start(): Promise<void> {
    const reminders = await DbUtils.getRemindersByUserId(
      this.interaction.user.id
    );

    if (reminders.length === 0) {
      await InteractionUtils.send(this.interaction, this.warnEmbed);
      return;
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
      await InteractionUtils.send(this.interaction, this.warnEmbed);
      return;
    }
    this.createAdditionalRows(reminders);
    this.createEmbedPages(reminders);

    this.editReply();
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

export class StickerListSelectEmbed extends PaginatedSelectEmbed {
  private warnEmbed = EmbedUtils.warnEmbedNoFields(
    'There are currently no stickers available on this server. Use `/sticker add` to add one.'
  );

  protected limit = 10;

  public async start(): Promise<void> {
    const stickers = await DbUtils.getStickersByGuildId(
      this.interaction.guildId
    );

    if (stickers.length === 0) {
      await InteractionUtils.send(this.interaction, this.warnEmbed);
      return;
    }

    this.createAdditionalRows(stickers);
    this.createEmbedPages(stickers);
    this.message = await this.send();

    if (this.pages.length > 0) {
      //no need to initialize collectors if there is only one page
      super.initializePaginationButtonCollector();
    }
    this.initializeAdditionalCollectors();
  }

  protected async update(): Promise<void> {
    const stickers = await DbUtils.getStickersByGuildId(
      this.interaction.guildId
    );

    if (stickers.length === 0) {
      await InteractionUtils.send(this.interaction, this.warnEmbed);
      return;
    }
    this.createAdditionalRows(stickers);
    this.createEmbedPages(stickers);

    this.editReply();
  }

  protected createAdditionalRows(stickers: Sticker[]): void {
    const rowData = this.getRowData(stickers);
    const selectMenuRow =
      new ActionRowBuilder<SelectMenuBuilder>().addComponents(
        new SelectMenuBuilder()
          .setCustomId('delete-sticker')
          .setPlaceholder('Select one or more stickers to delete')
          .addOptions(rowData)
          .setMinValues(1)
          .setMaxValues(rowData.length)
      );
    this.additionalRows = [selectMenuRow];
  }

  private getRowData(stickers: Sticker[]): SelectMenuOptionBuilder[] {
    const rowData: SelectMenuOptionBuilder[] = stickers.map(
      (sticker, index) => {
        return new SelectMenuOptionBuilder()
          .setLabel(`ID: ${(index + 1).toString().padStart(3, '0')}`)
          .setDescription(`${sticker.stickerName}`)
          .setValue(sticker.interactionId);
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
      await DbUtils.deleteStickersById(values);
      await this.update();
    });
    interactionCollector.on('end', async () => {
      //empty out action rows after timeout
      await MessageUtils.edit(this.message, undefined, []);
    });
  }

  private createEmbedPages(stickers: Sticker[]) {
    const fields = stickers.map((sticker, index) => {
      const name = `ID: ${(index + 1).toString().padStart(3, '0')}`;
      const value = sticker.stickerName;

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
        'Here is a list of all your set stickers.',
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
