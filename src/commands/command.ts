import { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { ChatInputCommandInteraction, PermissionsString } from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import { EventData } from '../models/event-data';

export interface Command {
  metadata: RESTPostAPIChatInputApplicationCommandsJSONBody;
  helpText?: string;
  developerOnly?: boolean;
  cooldown?: RateLimiter;
  nsfw?: boolean;
  category: CommandCategory;
  deferType: CommandDeferType;
  requireClientPerms: PermissionsString[];
  execute(
    interaction: ChatInputCommandInteraction,
    data: EventData
  ): Promise<void>;
}
export enum CommandDeferType {
  PUBLIC = 'PUBLIC',
  HIDDEN = 'HIDDEN',
  NONE = 'NONE',
}
export enum CommandCategory {
  UTILITY = 'Utility',
  DEVELOPMENT = 'Development',
  MODERATION = 'Moderation',
  MISC = 'Misc',
  WEEBSHIT = 'Weebshit',
  POKEMON = 'Pokémon',
  NSFW = 'NSFW',
}
