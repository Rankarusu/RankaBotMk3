import {
  ApplicationCommandOptionType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import {
  ChatInputCommandInteraction,
  GuildMember,
  PermissionsString,
} from 'discord.js';
import { EventData } from '../../models/event-data';
import { EmbedUtils, InteractionUtils } from '../../utils';
import { Command, CommandCategory, CommandDeferType } from '../command';

const Config = require('../../../config/config.json');

export class BanCommand extends Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: 'ban',
    description: 'ban a user from the server',
    dm_permission: false,
    options: [
      {
        name: 'user',
        type: ApplicationCommandOptionType.User,
        description: 'the user to ban',
        required: true,
      },
      {
        name: 'reason',
        type: ApplicationCommandOptionType.String,
        description: 'why the user was banned',
        required: false,
      },
      {
        name: 'delete-message-days',
        type: ApplicationCommandOptionType.Number,
        description:
          'delete the messages of the last x days sent by the banned user.',
        required: false,
      },
    ],
  };

  // cooldown?: RateLimiter;
  public usage = () => `${this.mention()} \`@User\` \`being an idiot\` \`3\``;

  public category: CommandCategory = CommandCategory.MODERATION;

  public deferType: CommandDeferType = CommandDeferType.NONE;

  public requireClientPerms: PermissionsString[] = ['BanMembers'];

  public async execute(
    interaction: ChatInputCommandInteraction,
    data: EventData
  ): Promise<void> {
    const member = interaction.options.get('user').member as GuildMember;
    const reason = interaction.options.getString('reason');
    const deleteMessageDays = interaction.options.getNumber(
      'delete-message-days'
    );

    if (
      Config.developers.includes(member.user.id) ||
      Config.client.id === member.user.id
    ) {
      // don't kick the bot or the developer
      return InteractionUtils.sendError(data, 'You cannot ban this user.');
    }

    const embed = EmbedUtils.memberEmbed(
      member,
      `🔨 ${member.user} has been banned from this server.
      ${
        deleteMessageDays
          ? `Deleted ${deleteMessageDays} days of messages.`
          : ''
      }`,
      reason
    );
    if (member.bannable) {
      member.ban({ deleteMessageDays, reason });
      InteractionUtils.send(interaction, embed);
    } else {
      InteractionUtils.sendError(
        data,
        "I cannot ban this user. Make sure my role is above the user's role."
      );
    }
  }
}
