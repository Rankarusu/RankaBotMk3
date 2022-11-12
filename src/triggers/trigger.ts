import { Message } from 'discord.js';

export interface Trigger {
  requireGuild: boolean;
  conditionMet(msg: Message): boolean;
  execute(msg: Message): Promise<void>;
}
