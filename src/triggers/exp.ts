import { Message } from 'discord.js';
import { Trigger } from '.';
import { DbUtils } from '../utils';

export class ExpTrigger implements Trigger {
  /* this could have been part of the message handler as well but putting it here
  makes it feel more "pluggable". I might add a feature to en/disable certain 
  commands and triggers on a server */

  requireGuild = true;

  conditionMet() {
    return true;
  }

  async execute(msg: Message) {
    const userId = msg.author.id;
    const guildId = msg.guildId;
    const exp = await DbUtils.getExpByUser(guildId, userId); //returns null on not found
    const now = new Date();
    let level = 0;

    let newXp = Math.floor(Math.random() * 10) + 10; //number between 10 and 20

    const newLock = new Date(now.getTime() + 60 * 1000);

    if (exp) {
      if (exp.xpLock > now) {
        return;
      }
      newXp += exp.xp;
      level = Math.floor((newXp / 42) ** 0.55);
    }
    await DbUtils.upsertExp(guildId, userId, newXp, level, newLock);
  }
}
