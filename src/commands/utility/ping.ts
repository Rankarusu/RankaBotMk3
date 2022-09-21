import { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { ChatInputCommandInteraction, PermissionsString } from 'discord.js';
import { EventData } from '../../models/event-data';
import { InteractionUtils } from '../../utils';
import { Command, CommandCategory, CommandDeferType } from '../command';

export class PingCommand extends Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: 'ping',
    description: 'pings you back and shows you your latency',
    dm_permission: true,
  };

  // cooldown?: RateLimiter;
  public helpText = 'just /ping';

  public category: CommandCategory = CommandCategory.UTILITY;

  public deferType: CommandDeferType = CommandDeferType.PUBLIC;

  public requireClientPerms: PermissionsString[] = ['SendMessages'];

  public async execute(
    interaction: ChatInputCommandInteraction,
    data: EventData
  ): Promise<void> {
    await InteractionUtils.send(
      interaction,
      `🏓 Pong! ${
        Date.now() - interaction.createdTimestamp
      } ms \n 🏸 API Latency: ${Math.round(interaction.client.ws.ping)} ms`
    );
  }
}
