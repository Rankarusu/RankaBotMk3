import { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';
// import { RateLimiter } from 'discord.js-rate-limiter';
import { CommandInteraction, PermissionString } from 'discord.js';
import { EventData } from '../models/event-data';

export interface Command {
  metadata: RESTPostAPIChatInputApplicationCommandsJSONBody;
  helpText?: string;
  hidden?: boolean;
  //TODO: admin only flag
  // cooldown?: RateLimiter;
  deferType: CommandDeferType;
  requireClientPerms: PermissionString[];
  execute(interaction: CommandInteraction, data: EventData): Promise<void>;
}
export enum CommandDeferType {
  PUBLIC = 'PUBLIC',
  HIDDEN = 'HIDDEN',
  NONE = 'NONE',
}
