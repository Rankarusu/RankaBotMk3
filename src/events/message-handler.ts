import { Message } from 'discord.js';
import { EventHandler, TriggerHandler } from '.';

export class MessageHandler implements EventHandler {
  constructor(private triggerHandler: TriggerHandler) {}

  public async process(msg: Message): Promise<void> {
    if (msg.system || msg.author.id === msg.client.user?.id || msg.author.bot) {
      // do not talk to yourself or other bots!
      return;
    }

    // Process triggers
    await this.triggerHandler.process(msg);
  }
}
