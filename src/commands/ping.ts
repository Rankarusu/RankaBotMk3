import { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { CommandInteraction, PermissionString } from 'discord.js';
import { EventData } from '../models/event-data';
import { InteractionUtils } from '../utils';
import { Command, CommandDeferType } from './command';

export class PingCommand implements Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: 'ping',
    description: 'pings you back and shows you your latency',
    dm_permission: true,
    default_member_permissions: undefined,
  };
  // cooldown?: RateLimiter;
  public helpText?: string = 'usage: /ping';
  public deferType: CommandDeferType = CommandDeferType.PUBLIC;
  public requireClientPerms: PermissionString[] = [];
  public async execute(
    interaction: CommandInteraction,
    data: EventData
  ): Promise<void> {
    await InteractionUtils.send(interaction, 'Pong!', true);
  }
}
