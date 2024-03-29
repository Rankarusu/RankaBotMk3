import { Message } from 'discord.js';
import { Trigger } from '.';
import { MessageUtils } from '../utils';

const link = 'https://www.youtube.com/watch?v=Jm2D7ohWos0';

export class KingCrimsonTrigger implements Trigger {
  requireGuild = true;

  conditionMet(msg: Message) {
    const content = msg.content.toLowerCase();
    return (
      content.includes('king crimson') &&
      (content.includes('what') || content.includes('how'))
    );
  }

  async execute(msg: Message) {
    await MessageUtils.reply(msg, link);
  }
}
