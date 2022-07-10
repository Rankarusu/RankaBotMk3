import { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { CommandInteraction, PermissionString } from 'discord.js';
import { EventData } from '../../models/event-data';
import { InteractionUtils } from '../../utils';
import { Command, CommandDeferType } from '../command';

export class PingCommand implements Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: 'ping',
    description: 'pings you back and shows you your latency',
    dm_permission: true,
  };

  // cooldown?: RateLimiter;
  public helpText = 'just /ping';

  public category: string =
    __dirname.split('/')[__dirname.split('/').length - 1];

  public deferType: CommandDeferType = CommandDeferType.PUBLIC;

  public requireClientPerms: PermissionString[] = ['SEND_MESSAGES'];

  public async execute(
    interaction: CommandInteraction,
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
