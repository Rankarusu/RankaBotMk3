import { Message } from 'discord.js';
import { Trigger } from '.';
import { EventData } from '../models/event-data';
import { MessageUtils } from '../utils';

const owos = ['OwO', 'UwU', 'owo', 'uwu'];

export class OwoTrigger implements Trigger {
  requireGuild = true;

  conditionMet(msg: Message) {
    return (
      msg.content.toLowerCase().includes('trap') &&
      !msg.content.toLowerCase().includes('are gay')
    );
  }

  async execute(msg: Message, data: EventData) {
    const channel = msg.channel;
    const owo = owos[Math.floor(Math.random() * owos.length)];
    await MessageUtils.send(channel, owo);
  }
}
