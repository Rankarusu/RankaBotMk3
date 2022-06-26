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
      .setTitle(title || 'Success!')
      .setColor(Config.colors.success)
      .setDescription(message)
      .setTimestamp();
    return embed;
  }
}
