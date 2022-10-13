import { Message } from 'discord.js';
import { Trigger } from '.';
import { MessageUtils } from '../utils';

export class BeckonTrigger implements Trigger {
  requireGuild = true;

  conditionMet(msg: Message) {
    const content = msg.content.toLowerCase();

    return content === 'o/';
  }

  async execute(msg: Message) {
    await MessageUtils.reply(msg, '\\o');
  }
}
