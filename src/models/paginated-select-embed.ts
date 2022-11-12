import { Reminder, Sticker } from '@prisma/client';
import {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  Message,
  SelectMenuBuilder,
} from 'discord.js';
import { InteractionUtils } from '../utils';
import { PaginationEmbed } from './pagination-embed';

export abstract class PaginatedSelectEmbed extends PaginationEmbed {
  additionalRows: ActionRowBuilder<SelectMenuBuilder | ButtonBuilder>[] = [];

  public abstract start(): Promise<void>;
  protected abstract update(): Promise<void>;
  protected abstract createAdditionalRows(
    data: Array<Sticker | Reminder>
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
