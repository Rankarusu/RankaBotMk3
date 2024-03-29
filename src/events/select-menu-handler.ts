import { Message, StringSelectMenuInteraction } from 'discord.js';
import { EventHandler } from '.';
import { SelectMenu, SelectMenuDeferType } from '../menus';
import { InteractionUtils } from '../utils';

export class SelectMenuHandler implements EventHandler {
  constructor(public menus: SelectMenu[]) {}

  public async process(
    intr: StringSelectMenuInteraction,
    msg: Message
  ): Promise<void> {
    // Don't respond to self, or other bots
    if (intr.user.id === intr.client.user?.id || intr.user.bot) {
      return;
    }

    // Try to find the menu the user wants
    const menu = this.findMenu(intr.customId);
    if (!menu) {
      return;
    }

    if (menu.requireGuild && !intr.guild) {
      return;
    }

    // Check if the embeds author equals the users tag
    // if (
    //   menu.requireEmbedAuthorTag &&
    //   msg.embeds[0]?.author?.name !== intr.user.tag
    // ) {
    //   return;
    // }

    // Defer interaction
    // NOTE: Anything after this point we should be responding to the interaction
    switch (menu.deferType) {
      case SelectMenuDeferType.REPLY: {
        await InteractionUtils.deferReply(intr);
        break;
      }
      case SelectMenuDeferType.UPDATE: {
        await InteractionUtils.deferUpdate(intr);
        break;
      }
    }

    // Return if defer was unsuccessful
    if (menu.deferType !== SelectMenuDeferType.NONE && !intr.deferred) {
      return;
    }

    // Execute the menu
    await menu.execute(intr, msg);
  }

  private findMenu(id: string): SelectMenu {
    return this.menus.find((menu) => menu.ids.includes(id));
  }
}
