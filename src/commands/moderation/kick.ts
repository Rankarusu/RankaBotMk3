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
import {
  InvalidKickTargetError,
  UnkickableUserError,
} from '../../models/errors';
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
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    const member = interaction.options.getMember('user') as GuildMember;
    const reason = interaction.options.getString('reason');

    if (
      Config.developers.includes(member.id) ||
      Config.client.id === member.id
    ) {
      // don't kick the bot or the developer
      throw new InvalidKickTargetError();
    }

    if (!member.kickable) {
      throw new UnkickableUserError();
    }

    const embed = this.createKickEmbed(member, reason);
    member.kick(reason);
    await InteractionUtils.send(interaction, embed);
  }

  private createKickEmbed(member: GuildMember, reason: string) {
    return EmbedUtils.memberEmbed(
      member,
      `🦶 ${member.user} has been kicked from this server.`,
      reason
    );
  }
}
