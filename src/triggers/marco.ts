import { Message } from 'discord.js';
import { Trigger } from '.';
import { EventData } from '../models/event-data';
import { MessageUtils } from '../utils';

export class MarcoTrigger implements Trigger {
  requireGuild = true;

  conditionMet(msg: Message) {
    const content = msg.content.toLowerCase();

    return content === 'marco';
  }

  async execute(msg: Message, data: EventData) {
    await MessageUtils.reply(msg, 'Polo');
  }
}
