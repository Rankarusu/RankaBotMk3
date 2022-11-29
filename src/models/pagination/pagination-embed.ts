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
  User,
  UserResolvable,
} from 'discord.js';
import { InteractionUtils } from '../../utils';
import { EmbedPage } from './embed-page';

export class PaginationEmbed {
  interaction: CommandInteraction | MessageComponentInteraction;

  author: UserResolvable;

  message: Message;

  pages: EmbedPage[];

  protected timeout?: number;

  protected limit?: number;

  protected index = 0;

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
      this.pages = this.splitEmbedIntoPages(pages, this.limit);
    } else {
      this.pages = pages?.map(
        (embed, index) =>
          new EmbedPage(embed, index + 1, pages.length, this.limit)
      );
    }
    this.author = interaction.user;
    this.timeout = timeout ? timeout : 60000;
  }

  public async start(): Promise<void> {
    this.message = await this.send();
    if (this.pages.length > 0) {
      //no need to initialize collector if there is only one page
      this.initializePaginationButtonCollector();
    }
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

        await this.turnPage(interaction);
      }
    });
    interactionCollector.on('end', async () => {
      //ephemeral messages are deletable since djs v14.7
      await this.interaction.deleteReply();
    });
  }

  protected async turnPage(componentInteraction: MessageComponentInteraction) {
    await InteractionUtils.update(
      componentInteraction,
      this.pages[this.index].embed
    );
  }

  protected splitEmbedIntoPages(embed: EmbedBuilder, limit: number) {
    //splits embed fields into multiple pages with same header, footer, etc.

    const splitFields: APIEmbedField[][] = this.splitFieldsByLength(
      embed,
      limit
    );

    const pages: EmbedPage[] = splitFields.map((fieldArr, index) => {
      //copy the initial embed but replace
      const embedJson = embed.toJSON();
      const embedWithFields = new EmbedBuilder(embedJson).setFields(fieldArr);
      return new EmbedPage(
        embedWithFields,
        index + 1,
        splitFields.length,
        this.limit
      );
    });

    return pages;
  }

  private splitFieldsByLength(embed: EmbedBuilder, limit: number) {
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
    return splitFields;
  }

  protected async send(): Promise<Message> {
    const message = await InteractionUtils.send(
      this.interaction,
      this.pages[0].embed,
      //we don't need pagination on a single page.
      this.pages.length < 2 ? undefined : [this.paginationButtons]
    );

    return message;
  }

  public async editReply() {
    //remove buttons if necessary
    const message = await InteractionUtils.editReply(
      this.interaction,
      this.pages[0].embed,
      this.pages.length < 2 ? undefined : [this.paginationButtons]
    );

    return message;
  }
}
