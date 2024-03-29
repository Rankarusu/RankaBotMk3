import { Message } from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import { EventHandler } from '.';
import { Trigger } from '../triggers';

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

    const triggers = this.findTriggers(msg);

    if (triggers.length === 0) {
      return;
    }

    triggers.forEach((trigger) => trigger.execute(msg));
  }

  private findTriggers(msg: Message<boolean>) {
    return this.triggers.filter((trigger) => {
      if (trigger.requireGuild && !msg.guild) {
        return false;
      }

      if (!trigger.conditionMet(msg)) {
        return false;
      }

      return true;
    });
  }
}
