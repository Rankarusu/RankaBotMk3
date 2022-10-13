import { Message } from 'discord.js';
import { Trigger } from '.';
import { MessageUtils } from '../utils';

export class AyyTrigger implements Trigger {
  requireGuild = true;

  conditionMet(msg: Message) {
    const content = msg.content.toLowerCase();

    return content === 'ayy';
  }

  async execute(msg: Message) {
    await MessageUtils.reply(msg, 'lmao');
  }
}
