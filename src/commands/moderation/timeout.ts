import {
  ApplicationCommandOptionType,
  RESTJSONErrorCodes,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import {
  ChatInputCommandInteraction,
  GuildMember,
  PermissionsString,
} from 'discord.js';
import {
  AlreadyTimedOutWarning,
  ParsedTimeInPastError,
  TimeoutAPILimitWarning,
  TimeParseError,
} from '../../models';
import { DateUtils, EmbedUtils, InteractionUtils } from '../../utils';
import { Command, CommandCategory, CommandDeferType } from '../command';

export class TimeoutCommand extends Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: 'timeout',
    description: 'disable text communication for a user',
    dm_permission: false,
    options: [
      {
        name: 'user',
        type: ApplicationCommandOptionType.User,
        description: 'the user to timeout',
        required: true,
      },
      {
        name: 'until',
        type: ApplicationCommandOptionType.String,
        description: 'the date and time when the timeout should be lifted',
        required: true,
      },
      {
        name: 'reason',
        type: ApplicationCommandOptionType.String,
        description: 'why the user was timed out',
        required: false,
      },
    ],
  };

  // cooldown?: RateLimiter;
  public usage = () =>
    `${this.mention()} \`@User\` \`2 hours\` \`for telling a mod his waifu was shit\``;

  public category: CommandCategory = CommandCategory.MODERATION;

  public deferType: CommandDeferType = CommandDeferType.NONE;

  public requireClientPerms: PermissionsString[] = ['ModerateMembers'];

  public async execute(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    const member = interaction.options.getMember('user') as GuildMember;
    const reason = interaction.options.getString('reason');
    const timeStr = interaction.options.getString('until');
    let parsedTime: Date;

    try {
      parsedTime = DateUtils.parseTime(timeStr);
    } catch (error) {
      throw new TimeParseError(timeStr);
    }

    if (parsedTime < interaction.createdAt) {
      throw new ParsedTimeInPastError(timeStr);
    }

    if (member.isCommunicationDisabled()) {
      const timedOutUntil = member.communicationDisabledUntil;
      if (timedOutUntil > parsedTime) {
        throw new AlreadyTimedOutWarning(member, timedOutUntil);
      }
    }

    try {
      await member.disableCommunicationUntil(parsedTime, reason);
    } catch (error) {
      if (error.code === RESTJSONErrorCodes.InvalidFormBodyOrContentType) {
        throw new TimeoutAPILimitWarning();
      }
    }
    const embed = this.createTimeoutEmbed(member, parsedTime);
    await InteractionUtils.send(interaction, embed);
  }

  private createTimeoutEmbed(
    member: GuildMember & {
      communicationDisabledUntilTimestamp: number;
      readonly communicationDisabledUntil: Date;
    },
    parsedTime: Date
  ) {
    return EmbedUtils.memberEmbed(
      member,
      `${member.user.tag} has been muted until <t:${DateUtils.getUnixTime(
        parsedTime
      )}:f>`
    );
  }
}
