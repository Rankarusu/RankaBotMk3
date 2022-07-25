import {
  ApplicationCommandOptionType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import {
  ChatInputCommandInteraction,
  GuildMember,
  PermissionsString,
} from 'discord.js';

// eslint-disable-next-line node/no-unpublished-import
import { EventData } from '../../models/event-data';
import { EmbedUtils, InteractionUtils } from '../../utils';
import { Command, CommandCategory, CommandDeferType } from '../command';

export class UntimeoutCommand implements Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: 'untimeout',
    description: 'enables text communication for a user again',
    dm_permission: false,
    options: [
      {
        name: 'user',
        type: ApplicationCommandOptionType.User,
        description: 'the user whose timeout should be lifted',
        required: true,
      },
    ],
  };

  // cooldown?: RateLimiter;
  public helpText = '/untimeout @User';

  public category: CommandCategory = CommandCategory.MODERATION;

  public deferType: CommandDeferType = CommandDeferType.PUBLIC;

  public requireClientPerms: PermissionsString[] = ['ModerateMembers'];

  public async execute(
    interaction: ChatInputCommandInteraction,
    data: EventData
  ): Promise<void> {
    const member = interaction.options.get('user').member as GuildMember;

    if (!member.isCommunicationDisabled()) {
      data.description = 'This user is not timed out.';
      const embed = EmbedUtils.warnEmbed(data);
      InteractionUtils.send(interaction, embed);
      return;
    }

    member.disableCommunicationUntil(null);
    const embed = EmbedUtils.memberEmbed(
      member,
      `${member.user.tag}'s timeout has been lifted.`
    );
    await InteractionUtils.send(interaction, embed);
  }
}
