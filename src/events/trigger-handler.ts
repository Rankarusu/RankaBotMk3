import { Message } from 'discord.js';
import { EventData } from '../models/event-data';
import { Trigger } from '../triggers/trigger';
import { EventHandler } from './event-handler';

export class TriggerHandler implements EventHandler {
  //here could be a rate limiter

  constructor(private triggers: Trigger[]) {}

  public async process(msg: Message): Promise<void> {
    const triggers = this.triggers.filter((trigger) => {
      if (trigger.requireGuild && !msg.guild) {
        return false;
      }

      if (!trigger.conditionMet(msg)) {
        return false;
      }

      return true;
    });

    if (triggers.length === 0) {
      return;
    }

    const data = new EventData();

    triggers.forEach((trigger) => trigger.execute(msg, data));
  }
}
