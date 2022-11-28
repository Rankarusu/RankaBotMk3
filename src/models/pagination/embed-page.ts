import { EmbedBuilder } from 'discord.js';

export class EmbedPage {
  embed: EmbedBuilder;

  protected pageNum: number;

  protected lastPageNum: number;

  protected pageSize: number;

  protected footerText = 'Page';

  constructor(
    embed: EmbedBuilder,
    pageNum: number,
    lastPageNum: number,
    pageSize: number
  ) {
    this.embed = embed;
    this.pageNum = pageNum;
    this.lastPageNum = lastPageNum;
    this.pageSize = pageSize;

    if (embed) {
      const embedFooterText = this.embed.data.footer.text;
      let embedPageFooterText = `${this.footerText} ${this.pageNum}/${this.lastPageNum}`;

      if (embedFooterText) {
        embedPageFooterText += ` • ${embedFooterText}`;
      }
      this.embed.setFooter({
        text: embedPageFooterText,
      });
    }
  }
}
