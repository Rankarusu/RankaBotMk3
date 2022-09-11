import { Message } from 'discord.js';
import { Trigger } from '.';
import { EventData } from '../models/event-data';
import { MessageUtils } from '../utils';

export class NoUTrigger implements Trigger {
  requireGuild = true;

  conditionMet(msg: Message) {
    return msg.content.toLowerCase().includes('traps are gay');
  }

  async execute(msg: Message, data: EventData) {
    await MessageUtils.reply(msg, 'no *u*');
  }
}
