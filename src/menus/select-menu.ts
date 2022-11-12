import { Message, SelectMenuInteraction } from 'discord.js';

export interface SelectMenu {
  ids: string[];
  deferType: SelectMenuDeferType;
  requireGuild: boolean;
  requireEmbedAuthorTag: boolean;
  execute(intr: SelectMenuInteraction, msg: Message): Promise<void>;
}

export enum SelectMenuDeferType {
  REPLY = 'REPLY',
  UPDATE = 'UPDATE',
  NONE = 'NONE',
}
