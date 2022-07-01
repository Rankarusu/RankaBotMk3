import { MessageEmbed } from 'discord.js';
import { EventData } from '../models/event-data';
const Config = require('../../config/config.json');

export class EmbedUtils {
  public static errorEmbed(data: EventData) {
    let embed = new MessageEmbed()
      .setTitle('Error')
      .setColor(Config.colors.error)
      .setDescription(data.description)
      .setTimestamp();

    for (let key in data.fields) {
      embed.addField(key, data.fields[key], true);
    }
    return embed;
  }

  public static successEmbed(message: string, title?: string) {
    let embed = new MessageEmbed()
      .setColor(Config.colors.success)
      .setDescription(message)
      .setTimestamp();
    if (title) {
      embed.setTitle(title);
    }
    return embed;
  }

  public static infoEmbed(message: string, title?: string) {
    let embed = new MessageEmbed()
      .setColor(Config.colors.default)
      .setDescription(message)
      .setTimestamp();
    if (title) {
      embed.setTitle(title);
    }
    return embed;
  }
}
