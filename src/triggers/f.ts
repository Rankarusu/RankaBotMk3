import { Message } from 'discord.js';
import { Trigger } from '.';
import { EventData } from '../models/event-data';
import { MessageUtils } from '../utils';

export class FTrigger implements Trigger {
  requireGuild = true;

  conditionMet(msg: Message) {
    return msg.content.toLowerCase() === 'f';
  }

  async execute(msg: Message, data: EventData) {
    const channel = msg.channel;
    await MessageUtils.send(channel, 'F');
  }
}
