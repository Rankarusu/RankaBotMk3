import { Message, SelectMenuInteraction } from 'discord.js';
import { EventData } from '../models/event-data';

export interface SelectMenu {
  ids: string[];
  deferType: SelectMenuDeferType;
  requireGuild: boolean;
  requireEmbedAuthorTag: boolean;
  execute(
    intr: SelectMenuInteraction,
    msg: Message,
    data: EventData
  ): Promise<void>;
}

export enum SelectMenuDeferType {
  REPLY = 'REPLY',
  UPDATE = 'UPDATE',
  NONE = 'NONE',
}
