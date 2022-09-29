import { Message } from 'discord.js';
import { Trigger } from '.';
import { EventData } from '../models/event-data';
import { DbUtils } from '../utils';

export class ExpTrigger implements Trigger {
  requireGuild = true;

  conditionMet(msg: Message) {
    return true;
  }

  async execute(msg: Message, data: EventData) {
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
    console.log(exp);
    console.log(newXp);
    await DbUtils.upsertExp(guildId, userId, newXp, level, newLock);
    return;
  }
}
