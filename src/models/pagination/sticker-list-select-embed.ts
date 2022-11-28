import { Sticker } from '@prisma/client';
import { ComponentType } from 'discord.js';
import {
  ArrayUtils,
  DbUtils,
  EmbedUtils,
  InteractionUtils,
  MessageUtils,
} from '../../utils';
import { NoStickerWarning } from '../warnings/no-sticker-warning';
import { SelfGeneratingPaginationEmbed } from './self-generating-pagination-embed';
import { StickerEmbedPage } from './sticker-embed-page';

export class StickerListSelectEmbed extends SelfGeneratingPaginationEmbed {
  pages: StickerEmbedPage[];

  protected limit = 10;

  public async start(): Promise<void> {
    const stickers = await DbUtils.getStickersByGuildId(
      this.interaction.guildId
    );

    if (stickers.length === 0) {
      throw new NoStickerWarning();
    }

    this.pages = this.createEmbedPages(stickers);
    this.message = await this.send();

    if (this.pages.length > 1) {
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
    this.pages = this.createEmbedPages(stickers);

    this.editReply();
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
      this.index = 0;
      await this.update();
    });

    interactionCollector.on('end', async () => {
      //empty out action rows after timeout
      await MessageUtils.edit(this.message, undefined, []);
    });
  }

  protected createEmbedPages(reminders: Sticker[]) {
    const partitionedReminders = ArrayUtils.partition(reminders, this.limit);
    const pages = partitionedReminders.map((chunk, index) => {
      return new StickerEmbedPage(
        chunk,
        index + 1,
        partitionedReminders.length,
        this.limit
      );
    });

    return pages;
  }
}
