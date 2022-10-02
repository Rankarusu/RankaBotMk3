import {
  ApplicationCommandOptionType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import { ChatInputCommandInteraction, PermissionsString } from 'discord.js';
import { EventData } from '../../models/event-data';
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
  public helpText = `due to bot limitations, this command can only delete 100 messages at a time. It can also not delete messages older than 2 weeks.
  **Example:**
  /purge \`20\``;

  public category: CommandCategory = CommandCategory.MODERATION;

  public deferType: CommandDeferType = CommandDeferType.NONE;

  public requireClientPerms: PermissionsString[] = ['ManageMessages'];

  public async execute(
    interaction: ChatInputCommandInteraction,
    data: EventData
  ): Promise<void> {
    const messagesAmount = interaction.options.getNumber('amount');
    await interaction.channel
      .bulkDelete(messagesAmount, true)

      .then((messages) => {
        const embed = EmbedUtils.infoEmbed(
          `Deleted **${messages.size}** messages successfully`
        );
        InteractionUtils.send(interaction, embed);
      })
      .catch((error) =>
        InteractionUtils.sendError(data, 'There was an error deleting messages')
      );
  }
}
