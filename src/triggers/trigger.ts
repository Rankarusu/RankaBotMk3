import { Message } from 'discord.js';
import { EventData } from '../models';

export interface Trigger {
  requireGuild: boolean;
  conditionMet(msg: Message): boolean;
  execute(msg: Message, data?: EventData): Promise<void>;
}
