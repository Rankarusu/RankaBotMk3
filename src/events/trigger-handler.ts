import { Message } from 'discord.js';
import { EventHandler } from './event-handler';
import { Trigger } from '../triggers/trigger';
import { EventData } from '../models/event-data';

export class TriggerHandler implements EventHandler {
  //here could be a rate limiter

  constructor(private triggers: Trigger[]) {}
  public async process(msg: Message): Promise<void> {
    let triggers = this.triggers.filter((trigger) => {
      if (trigger.requireGuild && !msg.guild) {
        return false;
      }

      if (!trigger.triggered(msg)) {
        return false;
      }

      return true;
    });

    if (triggers.length === 0) {
      return;
    }

    let data = new EventData();

    triggers.forEach((trigger) => trigger.execute(msg, data));
  }
}
