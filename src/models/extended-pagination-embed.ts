import {
  ActionRowBuilder,
  ButtonBuilder,
  CommandInteraction,
  EmbedBuilder,
  Message,
  MessageComponentInteraction,
  SelectMenuBuilder,
} from 'discord.js';
import { InteractionUtils } from '../utils';
import { PaginationEmbed } from './pagination-embed';

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
