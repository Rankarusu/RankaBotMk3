import {
  ApplicationCommandOptionType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import {
  ChatInputCommandInteraction,
  PermissionsString,
  User,
} from 'discord.js';
import { UnbanError, UserNotBannedError } from '../../models/errors';
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
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    const memberId = interaction.options.getString('user-id');
    const reason = interaction.options.getString('reason');

    let bannedUser: User;
    try {
      bannedUser = await this.getBannedUser(interaction, memberId);
    } catch (error) {
      throw new UserNotBannedError();
    }

    try {
      interaction.guild.bans.remove(bannedUser);
    } catch (error) {
      throw new UnbanError();
    }

    const embed = this.createUnbanEmbed(bannedUser, reason);

    await InteractionUtils.send(interaction, embed);
  }

  private async getBannedUser(
    interaction: ChatInputCommandInteraction,
    memberId: string
  ) {
    const member = await interaction.guild.members.fetch(memberId);
    const user = member.user;
    if (!user) {
      throw new Error('User not found.');
    }
    return user;
  }

  private createUnbanEmbed(bannedUser: User, reason: string) {
    return EmbedUtils.memberEmbed(
      bannedUser,
      `${bannedUser}'s ban has been lifted.`,
      reason
    );
  }
}
