import { ColorResolvable, MessageEmbed } from 'discord.js';
import Config from '../../config/config.json';
import { EventData } from '../models/event-data';

export class EmbedUtils {
  public static errorEmbed(data: EventData) {
    let embed = new MessageEmbed()
      .setTitle('Error')
      .setColor(Config.colors.error as ColorResolvable)
      .setDescription(data.description)
      .setTimestamp();

    for (let key in data.fields) {
      embed.addField(key, data.fields[key], true);
    }
    return embed;
  }

  public static successEmbed(message: string, title?: string) {
    let embed = new MessageEmbed()
      .setColor(Config.colors.success as ColorResolvable)
      .setDescription(message)
      .setTimestamp();
    if (title) {
      embed.setTitle(title);
    }
    return embed;
  }

  public static infoEmbed(message: string, title?: string) {
    let embed = new MessageEmbed()
      .setColor(Config.colors.default as ColorResolvable)
      .setDescription(message)
      .setTimestamp();
    if (title) {
      embed.setTitle(title);
    }
    return embed;
  }

  public static reminderListEmbed(
    message: string,
    list: { id: string; text: string }[]
  ) {
    let embed = new MessageEmbed()
      .setTitle('Reminders')
      .setColor(Config.colors.default as ColorResolvable)
      .setDescription(message)
      .setFooter({ text: 'Use the menu below to delete reminders' });
    if (list) {
      list.forEach((item) => {
        embed.addField(item.id, item.text, false);
      });
    }
    return embed;
  }
}
