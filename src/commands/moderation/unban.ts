import {
  ApplicationCommandOptionType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import {
  ChatInputCommandInteraction,
  PermissionsString,
  User,
} from 'discord.js';

// eslint-disable-next-line node/no-unpublished-import
import { EventData } from '../../models/event-data';
import { EmbedUtils, InteractionUtils } from '../../utils';
import { Command, CommandCategory, CommandDeferType } from '../command';

export class UnbanCommand implements Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: 'unban',
    description: 'Unbans a user from the current server',
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
  public helpText = '/unban 446368889700905000';

  public category: CommandCategory = CommandCategory.MODERATION;

  public deferType: CommandDeferType = CommandDeferType.PUBLIC;

  public requireClientPerms: PermissionsString[] = ['BanMembers'];

  public async execute(
    interaction: ChatInputCommandInteraction,
    data: EventData
  ): Promise<void> {
    const memberId = interaction.options.getString('user-id');
    console.log(`memberId: ${memberId}`);

    let bannedUser: User;
    try {
      bannedUser = (await interaction.guild.members.fetch(memberId)).user;
    } catch (error) {
      InteractionUtils.sendError(data, 'There is no user banned with that id');
      return;
    }

    const reason = interaction.options.getString('reason');

    console.log(memberId, bannedUser);

    try {
      interaction.guild.bans.remove(bannedUser);
    } catch (error) {
      InteractionUtils.sendError(data, 'Failed to unban user');
      return;
    }

    const embed = EmbedUtils.memberEmbed(
      bannedUser,
      `${bannedUser}'s ban has been lifted.`,
      reason
    );

    InteractionUtils.send(interaction, embed);
  }
}
