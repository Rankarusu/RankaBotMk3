import { ColorResolvable, MessageEmbed } from 'discord.js';
// eslint-disable-next-line node/no-unpublished-import
import Config from '../../config/config.json';
import { EventData } from '../models/event-data';

export class EmbedUtils {
  public static errorEmbed(data: EventData) {
    const embed = new MessageEmbed()
      .setTitle('Error')
      .setColor(Config.colors.error as ColorResolvable)
      .setDescription(data.description)
      .setTimestamp();

    for (const key in data.fields) {
      embed.addField(key, data.fields[key], true);
    }
    return embed;
  }

  public static warnEmbed(data: EventData) {
    const embed = new MessageEmbed()
      .setTitle('Warning')
      .setColor(Config.colors.warning as ColorResolvable)
      .setDescription(data.description)
      .setTimestamp();

    for (const key in data.fields) {
      embed.addField(key, data.fields[key], true);
    }
    return embed;
  }

  public static successEmbed(message: string, title?: string) {
    const embed = new MessageEmbed()
      .setColor(Config.colors.success as ColorResolvable)
      .setDescription(message)
      .setTimestamp();
    if (title) {
      embed.setTitle(title);
    }
    return embed;
  }

  public static infoEmbed(message: string, title?: string) {
    const embed = new MessageEmbed()
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
    const embed = new MessageEmbed()
      .setTitle('Reminders')
      .setColor(Config.colors.default as ColorResolvable)
      .setDescription(message);
    // .setFooter({ text: 'Use the menu below to delete reminders' });
    if (list) {
      list.forEach((item) => {
        embed.addField(item.id, item.text, false);
      });
    }
    return embed;
  }

  public static helpEmbed(
    commands: { [key: string]: string[] },
    iconUrl: string
  ) {
    const embed = new MessageEmbed()
      .setTitle('Help')
      .setColor(Config.colors.default as ColorResolvable)
      .setDescription(
        `Welcome to the fully automated, paginated and generally very based RankaBotMk3 help dialog!
        (Seriously, I put a lot of effort into this. Please use it.)
        
        Below you can see all commands that are available to you.`
      )
      .setThumbnail(iconUrl)
      .setTimestamp()
      .setFooter({
        text: 'use /help <command> for further details on a specific command',
      });
    Object.keys(commands).forEach((key) => {
      embed.addField(key, commands[key].join('\n'));
    });
    return embed;
  }

  public static cmdHelpEmbed(
    cmd: string,
    iconUrl: string,
    desc: string,
    usage: string,
    options: string[],
    subcommands: string[]
  ) {
    const embed = new MessageEmbed()
      .setTitle(`Help for \`${cmd}\``)
      .setColor(Config.colors.default as ColorResolvable)
      .setDescription(desc)
      .addField('Usage', usage)
      .setThumbnail(iconUrl)
      .setTimestamp();
    if (options && options.length > 0) {
      embed.addField('Options', options.join('\n'));
    }
    if (subcommands && subcommands.length > 0) {
      embed.addField('Subcommands', subcommands.join('\n'));
    }
    return embed;
  }
}
