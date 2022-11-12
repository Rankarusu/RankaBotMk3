import {
  ApplicationCommandOptionType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import {
  ChatInputCommandInteraction,
  Collection,
  Message,
  PartialMessage,
  PermissionsString,
} from 'discord.js';
import { MessageDeleteError } from '../../models/errors';
import { EmbedUtils, InteractionUtils } from '../../utils';
import { Command, CommandCategory, CommandDeferType } from '../command';

export class PurgeCommand extends Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: 'purge',
    description: 'delete the last x messages in the channel',
    dm_permission: false,
    options: [
      {
        name: 'amount',
        type: ApplicationCommandOptionType.Number,
        description: 'the amount of messages to delete',
        min_value: 1,
        max_value: 100,
        required: true,
      },
    ],
  };

  // cooldown?: RateLimiter;
  public usage = () => `${this.mention()} \`20\``;

  public note =
    'Due to bot limitations, this command can only delete 100 messages at a time. It can also not delete messages older than 2 weeks.';

  public category: CommandCategory = CommandCategory.MODERATION;

  public deferType: CommandDeferType = CommandDeferType.NONE;

  public requireClientPerms: PermissionsString[] = ['ManageMessages'];

  public async execute(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    const messagesAmount = interaction.options.getNumber('amount');

    let messages: Collection<string, Message<boolean> | PartialMessage>;

    try {
      messages = await interaction.channel.bulkDelete(messagesAmount, true);
    } catch (error) {
      throw new MessageDeleteError();
    }

    const embed = EmbedUtils.successEmbed(
      `Deleted **${messages.size}** messages successfully`
    );

    await InteractionUtils.send(interaction, embed);
  }
}
