import {
  ApplicationCommandOptionType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import {
  ChatInputCommandInteraction,
  GuildMember,
  PermissionsString,
} from 'discord.js';
import { NotTimedOutWarning } from '../../models/warnings';
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
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    const member = interaction.options.getMember('user') as GuildMember;

    if (!member.isCommunicationDisabled()) {
      throw new NotTimedOutWarning();
    }

    member.disableCommunicationUntil(null);

    const embed = this.createUntimeoutEmbed(member);
    await InteractionUtils.send(interaction, embed);
  }

  private createUntimeoutEmbed(
    member: GuildMember & {
      communicationDisabledUntilTimestamp: number;
      readonly communicationDisabledUntil: Date;
    }
  ) {
    return EmbedUtils.memberEmbed(
      member,
      `${member.user.tag}'s timeout has been lifted.`
    );
  }
}
