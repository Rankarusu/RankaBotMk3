import { Message } from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import { EventData } from '../models/event-data';
import { Trigger } from '../triggers/trigger';
import { EventHandler } from './event-handler';

const Config = require('../../config/config.json');

export class TriggerHandler implements EventHandler {
  private rateLimiter = new RateLimiter(
    Config.cooldowns.commands.amount,
    Config.cooldowns.commands.interval * 1000
  );

  constructor(private triggers: Trigger[]) {}

  public process(msg: Message): Promise<void> {
    // Check if user is rate limited
    const limited = this.rateLimiter.take(msg.author.id);
    if (limited) {
      return;
    }

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
