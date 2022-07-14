import {
  CommandInteraction,
  Message,
  MessageActionRow,
  MessageEmbed,
  User,
  UserResolvable,
} from 'discord.js';
import { InteractionUtils } from './interaction-utils';
import { MessageUtils } from './message-utils';

export class Pagination {
  emoji = ['⏮', '◀', '⏹', '▶', '⏭'];

  interaction: CommandInteraction;

  author: UserResolvable;

  message: Message;

  pages: MessageEmbed[];

  timeout?: number;

  private index = 0;

  private footerText = 'Page';

  constructor(
    interaction: CommandInteraction,
    pages: MessageEmbed[],
    timeout?: number
  ) {
    this.interaction = interaction;
    this.pages = pages;
    this.author = interaction.user;

    this.pages.map((page, pageIndex) => {
      if (page.footer && (page.footer.text || page.footer.iconURL)) return page;
      return page.setFooter({
        text: `${this.footerText} ${pageIndex + 1}/${this.pages.length}`,
      });
    });
  }

  async start(): Promise<void> {
    const row = new MessageActionRow().addComponents([
      {
        type: 'BUTTON',
        style: 'PRIMARY',
        label: '⏮',
        customId: 'first',
      },
      {
        type: 'BUTTON',
        style: 'PRIMARY',
        label: '◀',
        customId: 'previous',
      },
      {
        type: 'BUTTON',
        style: 'DANGER',
        label: '⏹',
        customId: 'stop',
      },
      {
        type: 'BUTTON',
        style: 'PRIMARY',
        label: '▶',
        customId: 'next',
      },
      {
        type: 'BUTTON',
        style: 'PRIMARY',
        label: '⏭',
        customId: 'last',
      },
    ]);
    if (this.pages.length < 2) {
      return;
    }
    this.message = await InteractionUtils.send(
      this.interaction,
      this.pages[0],
      [row]
    );
    const interactionCollector = this.message.createMessageComponentCollector({
      max: this.pages.length * 5,
      filter: (x) => {
        return this.author && x.user.id === (this.author as User).id;
      },
    });
    setTimeout(
      async () => {
        interactionCollector.stop('Timeout');
        await this?.message?.edit({
          components: [],
        });
      },
      this.timeout ? this.timeout : 60000
    );
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
}

// TODO: add a function to automatically split an embed by fields and by length.
