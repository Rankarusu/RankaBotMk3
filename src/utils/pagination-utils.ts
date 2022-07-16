import {
  CommandInteraction,
  EmbedField,
  Message,
  MessageActionRow,
  MessageComponentInteraction,
  MessageEmbed,
  User,
  UserResolvable,
} from 'discord.js';
import { InteractionUtils } from './interaction-utils';
import { MessageUtils } from './message-utils';

export class PaginationEmbed {
  interaction: CommandInteraction | MessageComponentInteraction;

  author: UserResolvable;

  message: Message;

  pages: MessageEmbed[];

  timeout?: number;

  limit?: number;

  actionRows?: MessageActionRow[];

  private index = 0;

  private footerText = 'Page';

  constructor(
    interaction: CommandInteraction | MessageComponentInteraction,
    pages: MessageEmbed[] | MessageEmbed,
    limit?: number,
    timeout?: number,
    actionRows?: MessageActionRow[]
  ) {
    this.interaction = interaction;
    this.limit = limit ? limit : 50;
    if (pages instanceof MessageEmbed) {
      this.pages = this.paginateEmbed(pages, this.limit);
    } else {
      this.pages = pages;
    }
    this.author = interaction.user;
    this.actionRows = actionRows;
    this.timeout = timeout ? timeout : 60000;

    this.pages.map((page, pageIndex) => {
      if (page.footer && (page.footer.text || page.footer.iconURL)) return page;
      return page.setFooter({
        text: `${this.footerText} ${pageIndex + 1}/${this.pages.length}`,
      });
    });
  }

  async start(initial = true): Promise<void> {
    //we use the initial flag to determine if we create the first time or edit it.
    // we need to create a new object either time, so we have only one function as we only change editReply and send
    const row = new MessageActionRow().addComponents([
      {
        type: 'BUTTON',
        style: 'PRIMARY',
        emoji: '⏮',
        customId: 'first',
      },
      {
        type: 'BUTTON',
        style: 'PRIMARY',
        emoji: '◀',
        customId: 'previous',
      },
      {
        type: 'BUTTON',
        style: 'DANGER',
        emoji: '⏹',
        customId: 'stop',
      },
      {
        type: 'BUTTON',
        style: 'PRIMARY',
        emoji: '▶',
        customId: 'next',
      },
      {
        type: 'BUTTON',
        style: 'PRIMARY',
        emoji: '⏭',
        customId: 'last',
      },
    ]);
    if (this.pages.length < 2) {
      //no need for pagination
      if (initial) {
        InteractionUtils.send(this.interaction, this.pages[0], this.actionRows);
      } else {
        InteractionUtils.editReply(
          this.interaction,
          this.pages[0],
          this.actionRows
        );
      }
      return;
    }
    if (initial) {
      this.message = await InteractionUtils.send(
        this.interaction,
        this.pages[0],
        [...this.actionRows, row]
      );
    } else {
      this.message = await InteractionUtils.editReply(
        this.interaction,
        this.pages[0],
        [...this.actionRows, row]
      );
    }

    const interactionCollector = this.message.createMessageComponentCollector({
      max: this.pages.length * 5,
      filter: (x) => {
        return this.author && x.user.id === (this.author as User).id;
      },
    });
    setTimeout(async () => {
      interactionCollector.stop('Timeout');
      await InteractionUtils.editReply(this.interaction, undefined, []);
    }, this.timeout);
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

        await InteractionUtils.update(
          interaction,
          this.pages[this.index],
          undefined
        );
      }
    });
    interactionCollector.on('end', async () => {
      //empty out action rows after timeout
      await MessageUtils.edit(this.message, undefined, []);
    });
  }

  public paginateEmbed(embed: MessageEmbed, limit: number) {
    //splits embed fields into multiple pages with same header, footer, etc.

    const fields = embed.fields;

    const splitFields: EmbedField[][] = [[]];
    let idx = 0;
    fields.forEach((field) => {
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
      if (lines + curLines <= limit) {
        splitFields[idx].push(field);
      } else {
        idx += 1;
        splitFields.push([]);
        splitFields[idx].push(field);
      }
    });

    const pages: MessageEmbed[] = splitFields.map((fieldArr) => {
      //copy the initial embed but replace
      const embedJson = embed.toJSON();
      return new MessageEmbed(embedJson).setFields(fieldArr);
    });

    return pages;
  }
}
