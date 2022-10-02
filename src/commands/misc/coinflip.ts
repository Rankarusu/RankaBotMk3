import { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { ChatInputCommandInteraction, PermissionsString } from 'discord.js';
import { EventData } from '../../models/event-data';
import { EmbedUtils, InteractionUtils } from '../../utils';
import { Command, CommandCategory, CommandDeferType } from '../command';

export class CoinflipCommand extends Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: 'coinflip',
    description: 'flip a coin',
    dm_permission: true,
  };

  // cooldown?: RateLimiter;
  public helpText = '/coinflip';

  public category: CommandCategory = CommandCategory.MISC;

  public deferType: CommandDeferType = CommandDeferType.NONE;

  public requireClientPerms: PermissionsString[] = ['SendMessages'];

  public async execute(
    interaction: ChatInputCommandInteraction,
    data: EventData
  ): Promise<void> {
    const result = Math.random() >= 0.5 ? 'Heads' : 'Tails';
    const embed = EmbedUtils.infoEmbed(`🪙 ${result}`, 'Coin flip');
    InteractionUtils.send(interaction, embed);
  }
}
