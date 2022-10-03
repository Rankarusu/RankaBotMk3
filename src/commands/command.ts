import { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { ChatInputCommandInteraction, PermissionsString } from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import { EventData } from '../models/event-data';

export abstract class Command {
  id?: string;

  metadata: RESTPostAPIChatInputApplicationCommandsJSONBody;

  usage: () => string; //making a function out of this so we can evaluate the string literals at runtime, therefore getting access to the command ids for slash command mentinos.

  note?: string;

  developerOnly?: boolean;

  cooldown?: RateLimiter;

  nsfw?: boolean;

  category: CommandCategory;

  deferType: CommandDeferType;

  requireClientPerms: PermissionsString[];

  public mention(subcommand?: string, subcommandGroup?: string) {
    return `</${this.metadata.name}${
      subcommandGroup ? ` ${subcommandGroup}` : ''
    }${subcommand ? ` ${subcommand}` : ''}:${this.id}>`;
  }

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
