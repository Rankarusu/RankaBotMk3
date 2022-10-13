import { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { ChatInputCommandInteraction, PermissionsString } from 'discord.js';
import { InteractionUtils } from '../../utils';
import { Command, CommandCategory, CommandDeferType } from '../command';

export class PingCommand extends Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: 'ping',
    description: 'pong!',
    dm_permission: true,
  };

  // cooldown?: RateLimiter;
  public usage = () => this.mention();

  public category: CommandCategory = CommandCategory.UTILITY;

  public deferType: CommandDeferType = CommandDeferType.NONE;

  public requireClientPerms: PermissionsString[] = ['SendMessages'];

  public async execute(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    await InteractionUtils.send(
      interaction,
      `🏓 Pong! ${this.calculateLatency(
        interaction.createdTimestamp
      )} ms \n 🏸 API Latency: ${this.getApiLatency(
        interaction.client.ws.ping
      )} ms`
    );
  }

  private calculateLatency(createdTimestamp: number) {
    return Date.now() - createdTimestamp;
  }

  private getApiLatency(ping: number) {
    return Math.round(ping);
  }
}
