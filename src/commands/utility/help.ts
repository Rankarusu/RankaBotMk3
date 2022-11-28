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
import { CommandNotFoundError, PaginationEmbed } from '../../models';
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

  public commands: Command[] = [];

  public async execute(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    const cmd = interaction.options.getString('command');
    const iconUrl = interaction.client.user.avatarURL();

    if (!cmd) {
      // all commands
      const commands = this.commands;
      const prettyCommands = this.getPrettyCommandList(commands, interaction);
      const embed = this.createCommandListEmbed(prettyCommands, iconUrl);

      await new PaginationEmbed(interaction, embed, 20).start();
    } else {
      //specific command
      const requestedCommand = this.findCommand(interaction, cmd);

      if (!requestedCommand) {
        throw new CommandNotFoundError(cmd);
      }

      const embed = this.createCommandHelpEmbed(requestedCommand, iconUrl);

      await InteractionUtils.send(interaction, embed);
    }
  }

  private createCommandHelpEmbed(requestedCommand: Command, iconUrl: string) {
    const desc = requestedCommand.metadata.description;
    const usage = requestedCommand.usage;
    const note = requestedCommand.note;
    let prettySubCommands: string[];
    if (requestedCommand.metadata.options) {
      prettySubCommands = [this.getTree(requestedCommand)];
    }

    const embed = EmbedUtils.cmdHelpEmbed(
      requestedCommand.mention(),
      iconUrl,
      desc,
      usage(),
      note,
      prettySubCommands
    );
    return embed;
  }

  private findCommand(interaction: CommandInteraction, cmd: string) {
    return this.commands
      .filter((command: Command) => {
        return (
          !command.developerOnly &&
          InteractionUtils.canUse(command, interaction)
        );
      })
      .find((command) => command.metadata.name === cmd.toLowerCase());
  }

  private createCommandListEmbed(
    prettyCommands: { [key: string]: string[] },
    iconUrl: string
  ) {
    return EmbedUtils.helpEmbed(prettyCommands, iconUrl, this.mention());
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

  private getTree(requestedCommand: Command) {
    const tree = new AsciiTree(`\`${requestedCommand.metadata.name}\``);
    requestedCommand.metadata.options.forEach((option) => {
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
