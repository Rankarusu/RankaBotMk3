import {
  ApplicationCommandOptionType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import {
  ChatInputCommandInteraction,
  GuildMember,
  PermissionsString,
} from 'discord.js';

import Config from '../../public/config/config.json';
import { EventData } from '../../models/event-data';
import { EmbedUtils, InteractionUtils } from '../../utils';
import { Command, CommandCategory, CommandDeferType } from '../command';

export class KickCommand extends Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: 'kick',
    description: 'Kicks a user from the server',
    dm_permission: false,
    options: [
      {
        name: 'user',
        type: ApplicationCommandOptionType.User,
        description: 'the user to kick',
        required: true,
      },
      {
        name: 'reason',
        type: ApplicationCommandOptionType.String,
        description: 'why the user was kicked',
      },
    ],
  };

  // cooldown?: RateLimiter;
  public helpText = 'just /kick @User';

  public category: CommandCategory = CommandCategory.MODERATION;

  public deferType: CommandDeferType = CommandDeferType.PUBLIC;

  public requireClientPerms: PermissionsString[] = ['KickMembers'];

  public async execute(
    interaction: ChatInputCommandInteraction,
    data: EventData
  ): Promise<void> {
    const member = interaction.options.get('user').member as GuildMember;
    const reason = interaction.options.getString('reason');

    if (
      Config.developers.includes(member.user.id) ||
      Config.client.id === member.user.id
    ) {
      // don't kick the bot or the developer
      return InteractionUtils.sendError(data, 'You cannot kick this user.');
    }

    const embed = EmbedUtils.memberEmbed(
      member,
      `🦶 ${member.user} has been kicked from this server.`,
      reason
    );
    if (member.kickable) {
      member.kick(reason);
      InteractionUtils.send(interaction, embed);
    } else {
      InteractionUtils.sendError(
        data,
        "I cannot kick this user. Make sure my role is above the user's role."
      );
    }
  }
}
