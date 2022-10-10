import { AddUndefinedToPossiblyUndefinedPropertiesOfInterface } from 'discord-api-types/utils/internals';
import {
  APIApplicationCommandOption,
  ApplicationCommandOptionType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import {
  ChatInputCommandInteraction,
  CommandInteraction,
  PermissionsString,
} from 'discord.js';
import { AsciiTree } from 'oo-ascii-tree';
import { Command, CommandCategory, CommandDeferType } from '..';
import { bot } from '../..';
import { EventData } from '../../models/event-data';
import { PaginationEmbed } from '../../models/pagination-embed';
import {
  ArrayUtils,
  EmbedUtils,
  InteractionUtils,
  StringUtils,
} from '../../utils';

export class HelpCommand extends Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: 'help',
    description:
      'get and overview of all commands or further details of a specific one',
    dm_permission: true,
    default_member_permissions: undefined,
    options: [
      {
        name: 'command',
        type: ApplicationCommandOptionType.String,
        description: 'the command you need help with',
        required: false,
        autocomplete: true,
      },
    ],
  };

  public usage = () => `${this.mention()}
  ${this.mention()} \`dex\``;

  public note = 'Hey, no recursing!';

  public category: CommandCategory = CommandCategory.UTILITY;

  public deferType: CommandDeferType = CommandDeferType.HIDDEN;

  public requireClientPerms: PermissionsString[] = ['SendMessages'];

  public async execute(
    interaction: ChatInputCommandInteraction,
    data: EventData
  ): Promise<void> {
    const cmd = interaction.options.getString('command');
    const iconUrl = interaction.client.user.avatarURL();

    if (!cmd) {
      // all commands
      const commands = bot.getCommands();

      const prettyCommands = this.getPrettyCommandList(commands, interaction);
      const embed = EmbedUtils.helpEmbed(
        prettyCommands,
        iconUrl,
        this.mention()
      );
      await new PaginationEmbed(interaction, data, embed, 20).start();
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
        InteractionUtils.sendError(
          data,
          `Command \`${cmd.toLowerCase()}\` not found or you may not use it`
        );
        return;
      }

      const desc = cmdhelp.metadata.description;
      const usage = cmdhelp.usage;
      const note = cmdhelp.note;
      let prettySubCommands: string[];
      if (cmdhelp.metadata.options) {
        prettySubCommands = [this.getTree(cmdhelp)];
      }

      const embed = EmbedUtils.cmdHelpEmbed(
        cmdhelp.mention(),
        iconUrl,
        desc,
        usage(),
        note,
        prettySubCommands
      );

      InteractionUtils.send(interaction, embed);
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

    const groupedCommands = ArrayUtils.groupBy(filteredCommands, 'category');
    const output: { [key: string]: string[] } = {};
    Object.keys(groupedCommands).forEach((key) => {
      output[StringUtils.capitalize(key)] = groupedCommands[key].map(
        (command: Command) => {
          if (
            command.metadata.options?.find(
              (option) =>
                //slash command mentions only work with full subcommand or subcommand group. to keep the help dialogue more concise we do not put all subcommands here.
                option.type === ApplicationCommandOptionType.Subcommand ||
                option.type === ApplicationCommandOptionType.SubcommandGroup
            )
          ) {
            return `\`/${command.metadata.name}\` - ${command.metadata.description}`;
          }
          return `${command.mention()} - ${command.metadata.description}`;
        }
      );
    });
    return output;
  }

  private getTree(cmdhelp: Command) {
    const tree = new AsciiTree(`\`${cmdhelp.metadata.name}\``);
    cmdhelp.metadata.options.forEach((option) => {
      tree.add(this.getBranch(option));
    });
    return tree.toString();
  }

  private getBranch(
    option: AddUndefinedToPossiblyUndefinedPropertiesOfInterface<APIApplicationCommandOption>
  ): AsciiTree {
    if (
      !(
        option.type === ApplicationCommandOptionType.Subcommand ||
        option.type === ApplicationCommandOptionType.SubcommandGroup
      )
    ) {
      return new AsciiTree(`\`${option.name}\` - ${option.description}`);
    } else {
      const output = new AsciiTree(
        `\`${option.name}\` - ${option.description}`
      );
      if (option.options) {
        const children = option.options.map(
          (
            subOption: AddUndefinedToPossiblyUndefinedPropertiesOfInterface<APIApplicationCommandOption>
          ) => {
            return this.getBranch(subOption);
          }
        );
        children.forEach((child) => {
          output.add(child);
        });
      }
      return output;
    }
  }
}
