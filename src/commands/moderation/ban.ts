import {
  ApplicationCommandOptionType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import {
  ChatInputCommandInteraction,
  GuildMember,
  PermissionsString,
} from 'discord.js';
import { InvalidBanTargetError, UnbannableUserError } from '../../models';
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
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    const member = interaction.options.getMember('user') as GuildMember;
    const reason = interaction.options.getString('reason');
    const deleteMessageDays = interaction.options.getNumber(
      'delete-message-days'
    );

    if (
      Config.developers.includes(member.id) ||
      Config.client.id === member.id
    ) {
      // don't ban the bot or the developer
      throw new InvalidBanTargetError();
    }

    if (!member.bannable) {
      throw new UnbannableUserError();
    }

    const embed = this.createdBanEmbed(member, deleteMessageDays, reason);
    member.ban({ deleteMessageDays, reason });
    await InteractionUtils.send(interaction, embed);
  }

  private createdBanEmbed(
    member: GuildMember,
    deleteMessageDays: number,
    reason: string
  ) {
    return EmbedUtils.memberEmbed(
      member,
      `🔨 ${member.user} has been banned from this server.
      ${
        deleteMessageDays
          ? `Deleted ${deleteMessageDays} days of messages.`
          : ''
      }`,
      reason
    );
  }
}
