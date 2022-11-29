import {
  ActionRowBuilder,
  ButtonBuilder,
  CommandInteraction,
  EmbedBuilder,
  Message,
  MessageComponentInteraction,
  StringSelectMenuBuilder,
} from 'discord.js';
import { InteractionUtils } from '../../utils';
import { ExtendedEmbedPage } from './extended-embed-page';
import { PaginationEmbed } from './pagination-embed';

export class ExtendedPaginationEmbed extends PaginationEmbed {
  pages: ExtendedEmbedPage[];

  constructor(
    interaction: CommandInteraction | MessageComponentInteraction,
    pages: EmbedBuilder[] | EmbedBuilder,
    additionalRows?: ActionRowBuilder<
      ButtonBuilder | StringSelectMenuBuilder
    >[],
    limit?: number,
    timeout?: number
  ) {
    super(interaction, pages, limit, timeout);
    if (additionalRows) {
      this.pages.forEach((page) => {
        page.additionalRows = additionalRows;
      });
    }
  }

  protected override async send(): Promise<Message> {
    //override so we can add additional Rows
    const page = this.pages[0];
    const message = await InteractionUtils.send(
      this.interaction,
      page.embed,
      this.pages.length < 2
        ? [...page.additionalRows]
        : [...page.additionalRows, this.paginationButtons]
    );

    return message;
  }

  protected override async turnPage(
    componentInteraction: MessageComponentInteraction
  ) {
    await InteractionUtils.update(
      componentInteraction,
      this.pages[this.index].embed,
      [...this.pages[this.index].additionalRows, this.paginationButtons]
    );
  }

  public override async editReply() {
    //override so we can add additional Rows
    const page = this.pages[0];

    const message = await InteractionUtils.editReply(
      this.interaction,
      page.embed,
      this.pages.length < 2
        ? [...page.additionalRows]
        : [...page.additionalRows, this.paginationButtons]
    );

    return message;
  }
}
