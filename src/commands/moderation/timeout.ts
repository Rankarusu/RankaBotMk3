import * as chrono from 'chrono-node';
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
import { EventData } from '../../models/event-data';
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
    interaction: ChatInputCommandInteraction,
    data: EventData
  ): Promise<void> {
    const member = interaction.options.get('user').member as GuildMember;
    const reason = interaction.options.getString('reason');
    const time = interaction.options.getString('until');
    let parsedTime: Date;

    try {
      parsedTime = chrono.parseDate(
        time,
        { instant: new Date(), timezone: 'Europe/Berlin' },
        { forwardDate: true }
      );
    } catch (e) {
      InteractionUtils.sendError(data, `Could not parse the time: ${time}`);
    }

    if (!parsedTime) {
      // parsed time is null if parse is unsuccessful
      InteractionUtils.sendError(data, `Could not parse the time: ${time}`);
    }

    if (member.isCommunicationDisabled()) {
      const timeout = member.communicationDisabledUntil;
      if (timeout > parsedTime) {
        InteractionUtils.sendWarning(
          interaction,
          data,
          `${member.user.tag} is already muted until <t:${DateUtils.getUnixTime(
            timeout
          )}:f>`
        );
        return;
      }
    }
    try {
      await member.disableCommunicationUntil(parsedTime, reason);
    } catch (error) {
      if (error.code === RESTJSONErrorCodes.InvalidFormBodyOrContentType) {
        InteractionUtils.sendError(
          data,
          'The Discord API limits timeouts to 4 weeks'
        );
      }
    }
    const embed = EmbedUtils.memberEmbed(
      member,
      `${member.user.tag} has been muted until <t:${DateUtils.getUnixTime(
        parsedTime
      )}:f>`
    );
    await InteractionUtils.send(interaction, embed);
  }
}
