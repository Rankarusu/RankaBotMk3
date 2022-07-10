import { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { CommandInteraction, PermissionString } from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import { EventData } from '../models/event-data';

export interface Command {
  metadata: RESTPostAPIChatInputApplicationCommandsJSONBody;
  helpText?: string;
  developerOnly?: boolean;
  cooldown?: RateLimiter;
  category: string;
  deferType: CommandDeferType;
  requireClientPerms: PermissionString[];
  execute(interaction: CommandInteraction, data: EventData): Promise<void>;
}
export enum CommandDeferType {
  PUBLIC = 'PUBLIC',
  HIDDEN = 'HIDDEN',
  NONE = 'NONE',
}
