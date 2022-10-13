import { Message } from 'discord.js';
import { Trigger } from '.';
import { MessageUtils } from '../utils';

export class FubukinstrumentTrigger implements Trigger {
  requireGuild = true;

  conditionMet(msg: Message) {
    const content = msg.content.toLowerCase();
    return content.includes('fubuki') && content.includes('instrument');
  }

  async execute(msg: Message) {
    await MessageUtils.reply(msg, 'Yes, Fubuki is an instrument.');
  }
}
