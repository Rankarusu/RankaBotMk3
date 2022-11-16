import { Sticker } from '@prisma/client';
import {
  ActionRowBuilder,
  ComponentType,
  EmbedBuilder,
  EmbedField,
  SelectMenuBuilder,
  SelectMenuOptionBuilder,
} from 'discord.js';
import { DbUtils, EmbedUtils, InteractionUtils, MessageUtils } from '../utils';
import { PaginatedSelectEmbed } from './paginated-select-embed';
import { NoStickerWarning } from './warnings';

export class StickerListSelectEmbed extends PaginatedSelectEmbed {
  protected limit = 10;

  public async start(): Promise<void> {
    const stickers = await DbUtils.getStickersByGuildId(
      this.interaction.guildId
    );

    if (stickers.length === 0) {
      throw new NoStickerWarning();
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
      const embed = EmbedUtils.warnEmbed(new NoStickerWarning());
      InteractionUtils.editReply(this.interaction, embed, []);
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
      componentType: ComponentType.StringSelect,
      max: 5,
      filter: (x) => {
        return this.interaction.user && x.user.id === this.interaction.user.id;
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
