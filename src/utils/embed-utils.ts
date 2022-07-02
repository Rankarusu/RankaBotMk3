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
}
