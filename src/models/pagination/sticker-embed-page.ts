import { Sticker } from '@prisma/client';
import {
  ActionRowBuilder,
  EmbedField,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from 'discord.js';
import { EmbedUtils } from '../../utils';
import { ExtendedEmbedPage } from './extended-embed-page';

export class StickerEmbedPage extends ExtendedEmbedPage {
  data: Sticker[];

  constructor(
    data: Sticker[],
    pageNum: number,
    lastPageNum: number,
    pageSize: number
  ) {
    super(undefined, pageNum, lastPageNum, pageSize, undefined);
    this.data = data;
    this.embed = this.createEmbed();
    this.additionalRows = this.createSelectMenuRow();
  }

  private createSelectMenuRow() {
    const options = this.createSelectMenuOptions();
    const selectMenuRow =
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('delete-sticker')
          .setPlaceholder('Select one or more stickers to delete')
          .addOptions(options)
          .setMinValues(1)
          .setMaxValues(options.length)
      );
    return [selectMenuRow];
  }

  private createSelectMenuOptions() {
    const options: StringSelectMenuOptionBuilder[] = this.data.map(
      (sticker, index) => {
        const id = (this.pageNum - 1) * this.pageSize + index + 1;
        return new StringSelectMenuOptionBuilder()
          .setLabel(`ID: ${id.toString().padStart(3, '0')}`)
          .setDescription(`${sticker.stickerName}`)
          .setValue(sticker.interactionId);
      }
    );
    return options;
  }

  private createEmbed() {
    const fields = this.createEmbedFields();
    const embed = EmbedUtils.listEmbed(
      'Here is a list of all stickers available on this server.',
      'Stickers',
      fields
    ).setFooter({
      text: `${this.footerText} ${this.pageNum}/${this.lastPageNum}`,
    });
    return embed;
  }

  private createEmbedFields() {
    const fields = this.data.map((sticker, index) => {
      const id = (this.pageNum - 1) * this.pageSize + index + 1;
      const name = `ID: ${id.toString().padStart(3, '0')}`;
      const value = `${sticker.stickerName}`;
      return {
        name,
        value,
        inline: false,
      } as EmbedField;
    });
    return fields;
  }
}
