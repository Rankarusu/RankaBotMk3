import {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  SelectMenuBuilder,
} from 'discord.js';
import { EmbedPage } from './embed-page';

export class ExtendedEmbedPage extends EmbedPage {
  additionalRows: ActionRowBuilder<SelectMenuBuilder | ButtonBuilder>[] = [];

  constructor(
    embed: EmbedBuilder,
    pageNum: number,
    lastPageNum: number,
    pageSize: number,
    actionRows: ActionRowBuilder<SelectMenuBuilder | ButtonBuilder>[]
  ) {
    super(embed, pageNum, lastPageNum, pageSize);
    this.additionalRows = actionRows;
  }
}
