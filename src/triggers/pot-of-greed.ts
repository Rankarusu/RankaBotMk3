import { Message } from 'discord.js';
import { Trigger } from '.';
import { MessageUtils } from '../utils';

const link = 'https://www.youtube.com/watch?v=55rM2_XvcT4';

export class PotOfGreedTrigger implements Trigger {
  requireGuild = true;

  conditionMet(msg: Message) {
    const content = msg.content.toLowerCase();
    return (
      content.includes('pot of greed') &&
      (content.includes('what') || content.includes('how'))
    );
  }

  async execute(msg: Message) {
    await MessageUtils.reply(msg, link);
  }
}
