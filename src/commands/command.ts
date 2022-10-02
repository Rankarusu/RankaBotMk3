import { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { ChatInputCommandInteraction, PermissionsString } from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import { EventData } from '../models/event-data';

export abstract class Command {
  id?: string;

  metadata: RESTPostAPIChatInputApplicationCommandsJSONBody;

  usage: string;

  note?: string;

  developerOnly?: boolean;

  cooldown?: RateLimiter;

  nsfw?: boolean;

  category: CommandCategory;

  deferType: CommandDeferType;

  requireClientPerms: PermissionsString[];

  abstract execute(
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
  DND = 'DND',
  EXP = 'EXP',
}
