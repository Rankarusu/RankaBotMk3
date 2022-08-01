import {
  ActionRowBuilder,
  APIEmbedField,
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
  ComponentType,
  EmbedBuilder,
  Message,
  MessageComponentInteraction,
  SelectMenuBuilder,
  User,
  UserResolvable,
} from 'discord.js';
import { InteractionUtils } from '../utils';

export class PaginationEmbed {
  interaction: CommandInteraction | MessageComponentInteraction;

  author: UserResolvable;

  message: Message;

  pages: EmbedBuilder[];

  timeout?: number;

  limit?: number;

  paginationButtons?: ActionRowBuilder<ButtonBuilder>;

  private index = 0;

  private footerText = 'Page';

  constructor(
    interaction: CommandInteraction | MessageComponentInteraction,
    pages: EmbedBuilder[] | EmbedBuilder,
    limit?: number,
    timeout?: number
  ) {
    this.interaction = interaction;
    this.limit = limit ? limit : 50;
    if (pages instanceof EmbedBuilder) {
      this.pages = this.paginateEmbed(pages, this.limit);
    } else {
      this.pages = pages;
    }
    this.author = interaction.user;
    this.timeout = timeout ? timeout : 60000;

    this.pages.map((page, pageIndex) => {
      if (
        page.data.footer &&
        (page.data.footer.text || page.data.footer.icon_url)
      )
        return page;
      return page.setFooter({
        text: `${this.footerText} ${pageIndex + 1}/${this.pages.length}`,
      });
    });
    this.paginationButtons =
      new ActionRowBuilder<ButtonBuilder>().addComponents([
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
  }

  public async start(): Promise<void> {
    //we use the initial flag to determine if we create the first time or edit it.
    // we need to create a new object either time, so we have only one function as we only change editReply and send
    this.message = await this.send();

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
    fields.forEach((field) => {
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
      if (lines + curLines <= limit) {
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

  public async changePages(pages: EmbedBuilder | EmbedBuilder[]) {
    if (pages instanceof EmbedBuilder) {
      this.pages = this.paginateEmbed(pages, this.limit);
    } else {
      this.pages = pages;
    }
  }
}

abstract class PaginatedSelectEmbed extends PaginationEmbed {
  additionalRows: ActionRowBuilder<SelectMenuBuilder | ButtonBuilder>[] = [];

  public abstract createSelectMenu();
  abstract getRowData();
  abstract initializeCollector();
  public abstract start(): Promise<void>;
  public abstract update();

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
    //remove buttons if necessary

    const message = await InteractionUtils.editReply(
      this.interaction,
      this.pages[0],
      this.pages.length < 2
        ? this.additionalRows
        : [...this.additionalRows, this.paginationButtons]
    );

    return message;
  }

  public override async changePages(
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
