import {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  StringSelectMenuBuilder,
} from 'discord.js';
import { EmbedPage } from './embed-page';

export class ExtendedEmbedPage extends EmbedPage {
  additionalRows: ActionRowBuilder<StringSelectMenuBuilder | ButtonBuilder>[] =
    [];

  constructor(
    embed: EmbedBuilder,
    pageNum: number,
    lastPageNum: number,
    pageSize: number,
    actionRows: ActionRowBuilder<StringSelectMenuBuilder | ButtonBuilder>[]
  ) {
    super(embed, pageNum, lastPageNum, pageSize);
    this.additionalRows = actionRows;
  }
}
