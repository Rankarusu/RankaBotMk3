import {
  APIApplicationCommandSubcommandOption,
  ApplicationCommandOptionType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import { CommandInteraction, PermissionString } from 'discord.js';
import { EventData } from '../../models/event-data';
import { EmbedUtils, InteractionUtils } from '../../utils';
import { capitalize, groupBy } from 'lodash';

import { bot } from '../..';
import { Command, CommandDeferType } from '..';
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
        // we can register the help command afterwards so we can fetch all other commands and put them as choices.
        // this is however not ideal, as we cannot have dynamic choices, nor more than 25 at a time.
        // choices: bot.getCommands().map((command) => {
        //   return {
        //     name: command.metadata.name,
        //     value: command.metadata.name,
        //   };
        // }),
      },
    ],
  };

  public helpText = 'Hey, no recursing!';

  public category: string =
    __dirname.split('/')[__dirname.split('/').length - 1];

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

      const prettyCommands = this.getPrettyCommandList(commands, interaction);
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
          prettyOptions = this.getPrettyOptions(cmdhelp);
          prettySubCommands = this.getPrettySubCommands(cmdhelp);
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

  private getPrettyCommandList(
    commands: Command[],
    interaction: CommandInteraction
  ) {
    const filteredCommands = commands.filter((command: Command) => {
      return (
        !command.developerOnly && InteractionUtils.canUse(command, interaction)
      );
    });

    const groupedCommands = groupBy(filteredCommands, 'category');
    const output: { [key: string]: string[] } = {};
    Object.keys(groupedCommands).forEach((key) => {
      output[capitalize(key)] = groupedCommands[key].map(
        (command) =>
          `\`${command.metadata.name}\` - ${command.metadata.description}`
      );
    });
    return output;
  }

  private getPrettyOptions(cmdhelp: Command) {
    const options = cmdhelp.metadata.options.filter(
      (option) =>
        option.type !== ApplicationCommandOptionType.Subcommand &&
        option.type !== ApplicationCommandOptionType.SubcommandGroup
    );
    const prettyOptions = options.map((option) => {
      return `\`${option.name}\` - ${option.description}`;
    });
    return prettyOptions;
  }

  private getPrettySubCommands(cmdhelp: Command) {
    const subCommands = cmdhelp.metadata.options.filter(
      (option) =>
        option.type === ApplicationCommandOptionType.Subcommand ||
        option.type === ApplicationCommandOptionType.SubcommandGroup
    );
    const prettySubCommands = subCommands.map(
      (subCommand: APIApplicationCommandSubcommandOption) => {
        let str = `\`${subCommand.name}\` - ${subCommand.description}`;
        //TODO: recurse to also handle subcommand group structures
        if (subCommand.options) {
          subCommand.options.forEach((option, idx) => {
            const char = idx === subCommand.options.length - 1 ? '└' : '├';
            str += `\n\u2005\u2005${char}─\`${option.name}\` - ${option.description}`;
          });
        }
        return str;
      }
    );
    return prettySubCommands;
  }
}