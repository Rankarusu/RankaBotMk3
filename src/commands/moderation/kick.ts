import {
  ApplicationCommandOptionType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import {
  ChatInputCommandInteraction,
  GuildMember,
  PermissionsString,
} from 'discord.js';
import { Command, CommandCategory, CommandDeferType } from '..';
import { EventData } from '../../models';
import { EmbedUtils, InteractionUtils } from '../../utils';

const Config = require('../../../config/config.json');

export class KickCommand extends Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: 'kick',
    description: 'kick a user from the server',
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
  public usage = () => `${this.mention()} \`@User\` \`being an idiot\``;

  public category: CommandCategory = CommandCategory.MODERATION;

  public deferType: CommandDeferType = CommandDeferType.NONE;

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
      InteractionUtils.sendError(data, 'You cannot kick this user.');
    }

    const embed = this.createKickEmbed(member, reason);
    if (member.kickable) {
      member.kick(reason);
      await InteractionUtils.send(interaction, embed);
    } else {
      InteractionUtils.sendError(
        data,
        "I cannot kick this user. Make sure my role is above the user's role."
      );
    }
  }

  private createKickEmbed(member: GuildMember, reason: string) {
    return EmbedUtils.memberEmbed(
      member,
      `🦶 ${member.user} has been kicked from this server.`,
      reason
    );
  }
}
