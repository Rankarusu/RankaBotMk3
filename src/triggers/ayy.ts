import { Message } from 'discord.js';
import { Trigger } from '.';
import { EventData } from '../models/event-data';
import { MessageUtils } from '../utils';

export class AyyTrigger implements Trigger {
  requireGuild = true;

  conditionMet(msg: Message) {
    return msg.content.toLowerCase() === 'ayy';
  }

  async execute(msg: Message, data: EventData) {
    await MessageUtils.reply(msg, 'lmao');
  }
}
