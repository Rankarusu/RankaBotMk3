import {
  ApplicationCommandOptionType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import {
  ChatInputCommandInteraction,
  PermissionsString,
  User,
} from 'discord.js';
import { EventData } from '../../models';
import { EmbedUtils, InteractionUtils } from '../../utils';
import { Command, CommandCategory, CommandDeferType } from '../command';

export class UnbanCommand extends Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: 'unban',
    description: 'unban a user from the server',
    dm_permission: false,
    options: [
      {
        name: 'user-id',
        type: ApplicationCommandOptionType.String,
        description: 'the id of the user to unban',
        required: true,
      },
      {
        name: 'reason',
        type: ApplicationCommandOptionType.String,
        description: 'why the user will be unbanned',
        required: false,
      },
    ],
  };

  // cooldown?: RateLimiter;
  public usage = () => `${this.mention()} \`446368889700905000\``;

  public category: CommandCategory = CommandCategory.MODERATION;

  public deferType: CommandDeferType = CommandDeferType.NONE;

  public requireClientPerms: PermissionsString[] = ['BanMembers'];

  public async execute(
    interaction: ChatInputCommandInteraction,
    data: EventData
  ): Promise<void> {
    const memberId = interaction.options.getString('user-id');
    const reason = interaction.options.getString('reason');

    let bannedUser: User;
    try {
      bannedUser = (await interaction.guild.members.fetch(memberId)).user;
    } catch (error) {
      InteractionUtils.sendError(data, 'There is no user banned with that id');
      return;
    }

    try {
      interaction.guild.bans.remove(bannedUser);
    } catch (error) {
      InteractionUtils.sendError(data, 'Failed to unban user');
      return;
    }

    const embed = this.createUnbanEmbed(bannedUser, reason);

    await InteractionUtils.send(interaction, embed);
  }

  private createUnbanEmbed(bannedUser: User, reason: string) {
    return EmbedUtils.memberEmbed(
      bannedUser,
      `${bannedUser}'s ban has been lifted.`,
      reason
    );
  }
}
