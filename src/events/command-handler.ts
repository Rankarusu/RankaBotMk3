import { EventHandler } from './event-handler';
import { CommandInteraction } from 'discord.js';
import { Command, CommandDeferType } from '../commands/command';
import { InteractionUtils } from '../utils/interaction-utils';
import { EventData } from '../models/event-data';

enum bleh {
  PUBLIC = 'PUBLIC',
  HIDDEN = 'HIDDEN',
  NONE = 'NONE',
}

export class CommandHandler implements EventHandler {
  constructor(public commands: Command[]) {}
  public async process(interaction: CommandInteraction): Promise<void> {
    if (
      interaction.user.id === interaction.client.user?.id ||
      interaction.user.bot
    ) {
      // do not talk to yourself or other bots!
      return;
    }

    // find the command that the user watch executed
    let command = this.commands.find(
      (command) => command.metadata.name === interaction.commandName
    );
    if (!command) {
      console.error('Command not found');
      //TODO: actual logging
      return;
    }

    switch (command.deferType) {
      case CommandDeferType.PUBLIC: {
        await InteractionUtils.deferReply(interaction, false);
        break;
      }
      case CommandDeferType.HIDDEN: {
        //sends ephemeral message, only visible to invoker
        await InteractionUtils.deferReply(interaction, true);
        break;
      }
    }
    //return if defer is unsuccessful
    if (command.deferType !== CommandDeferType.NONE && !interaction.deferred) {
      return;
    }

    let data = new EventData();

    try {
      //we can run checks here
      await command.execute(interaction, data);
    } catch (error) {
      console.error(error);
    }
  }
}
