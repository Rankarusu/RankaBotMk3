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

export class UntimeoutCommand extends Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: 'untimeout',
    description: 'enable text communication for a user again',
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
  public usage = () => `${this.mention()} \`@User\``;

  public category: CommandCategory = CommandCategory.MODERATION;

  public deferType: CommandDeferType = CommandDeferType.NONE;

  public requireClientPerms: PermissionsString[] = ['ModerateMembers'];

  public async execute(
    interaction: ChatInputCommandInteraction,
    data: EventData
  ): Promise<void> {
    const member = interaction.options.get('user').member as GuildMember;

    if (!member.isCommunicationDisabled()) {
      InteractionUtils.sendWarning(
        interaction,
        data,
        'This user is not timed out.'
      );
    }

    member.disableCommunicationUntil(null);
    const embed = EmbedUtils.memberEmbed(
      member,
      `${member.user.tag}'s timeout has been lifted.`
    );
    await InteractionUtils.send(interaction, embed);
  }
}
