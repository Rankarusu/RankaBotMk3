import {
  APIApplicationCommandSubcommandOption,
  ApplicationCommandOptionType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import { CommandInteraction, PermissionString } from 'discord.js';
import { EventData } from '../models/event-data';
import { EmbedUtils, InteractionUtils } from '../utils';
import { Command, CommandDeferType } from './command';

import { bot } from '..';
export class HelpCommand implements Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: 'help',
    description:
      'gives and overview of all commands or further details of a specific one',
    dm_permission: true,
    default_member_permissions: undefined,
    options: [
      {
        name: 'command',
        type: ApplicationCommandOptionType.String,
        description: 'the command you need help with',
        required: false,
      },
    ],
  };

  public helpText = 'Hey, no recursing!';

  public deferType: CommandDeferType = CommandDeferType.HIDDEN;

  public requireClientPerms: PermissionString[] = ['SEND_MESSAGES'];

  public async execute(
    interaction: CommandInteraction,
    data: EventData
  ): Promise<void> {
    const cmd = interaction.options.getString('command');
    const iconUrl = interaction.client.user.avatarURL();

    if (!cmd) {
      // all commands
      const commands = bot.getCommands();
      const prettyCommands = commands
        .filter((command: Command) => {
          return (
            !command.developerOnly &&
            InteractionUtils.canUse(command, interaction)
          );
        })
        .map((command: Command) => {
          return `\`${command.metadata.name}\` - ${command.metadata.description}`;
        })
        .join('\n');
      const embed = EmbedUtils.helpEmbed(prettyCommands, iconUrl);
      InteractionUtils.send(interaction, embed);
    } else {
      //specific command
      const cmdhelp = bot
        .getCommands()
        .filter((command: Command) => {
          return (
            !command.developerOnly &&
            InteractionUtils.canUse(command, interaction)
          );
        })
        .find((command) => command.metadata.name === cmd.toLowerCase());
      if (!cmdhelp) {
        const message = `Command \`${cmd.toLowerCase()}\` not found or you may not use it`;
        data.description = message;
        throw new Error(message);
      } else {
        const desc = cmdhelp.metadata.description;
        const usage = cmdhelp.helpText;
        let prettyOptions: string[];
        let prettySubCommands: string[];
        if (cmdhelp.metadata.options) {
          const subCommands = cmdhelp.metadata.options.filter(
            (option) =>
              option.type === ApplicationCommandOptionType.Subcommand ||
              option.type === ApplicationCommandOptionType.SubcommandGroup
          );

          const options = cmdhelp.metadata.options.filter(
            (option) =>
              option.type !== ApplicationCommandOptionType.Subcommand &&
              option.type !== ApplicationCommandOptionType.SubcommandGroup
          );

          prettyOptions = options.map((option) => {
            return `\`${option.name}\` - ${option.description}`;
          });
          prettySubCommands = subCommands.map(
            (subCommand: APIApplicationCommandSubcommandOption) => {
              let str = `\`${subCommand.name}\` - ${subCommand.description}`;
              //TODO: recurse
              if (subCommand.options) {
                subCommand.options.forEach((option, idx) => {
                  const char = idx === options.length ? '├' : '└';
                  str += `\n\u2005\u2005${char}─\`${option.name}\` - ${option.description}`;
                });
              }
              return str;
            }
          );
        }

        const embed = EmbedUtils.cmdHelpEmbed(
          cmdhelp.metadata.name,
          iconUrl,
          desc,
          usage,
          prettyOptions,
          prettySubCommands
        );
        InteractionUtils.send(interaction, embed);
      }
    }
  }
}
