import { Sticker } from '@prisma/client';
import {
  ColorResolvable,
  EmbedBuilder,
  EmbedField,
  GuildMember,
  User,
} from 'discord.js';
// eslint-disable-next-line node/no-unpublished-import
import Config from '../../config/config.json';
import { EventData } from '../models/event-data';

export class EmbedUtils {
  public static errorEmbed(data: EventData) {
    const embed = new EmbedBuilder()
      .setTitle('Error')
      .setColor(Config.colors.error as ColorResolvable)
      .setDescription(data.description)
      .setTimestamp();

    if (data.fields) {
      embed.addFields(data.fields);
    }
    return embed;
  }

  public static warnEmbed(data: EventData) {
    const embed = new EmbedBuilder()
      .setTitle('Warning')
      .setColor(Config.colors.warning as ColorResolvable)
      .setDescription(data.description)
      .setTimestamp();

    if (data.fields) {
      embed.addFields(data.fields);
    }
    return embed;
  }

  public static successEmbed(message: string, title?: string) {
    const embed = new EmbedBuilder()
      .setColor(Config.colors.success as ColorResolvable)
      .setDescription(message)
      .setTimestamp();
    if (title) {
      embed.setTitle(title);
    }
    return embed;
  }

  public static infoEmbed(
    message?: string,
    title?: string,
    fields?: EmbedField[]
  ) {
    const embed = new EmbedBuilder()
      .setColor(Config.colors.default as ColorResolvable)
      .setTimestamp();
    if (message) {
      embed.setDescription(message);
    }
    if (title) {
      embed.setTitle(title);
    }
    if (fields) {
      embed.addFields(fields);
    }
    return embed;
  }

  public static memberEmbed(
    member: GuildMember | User,
    message: string,
    reason?: string,
    title?: string
  ) {
    const embed = new EmbedBuilder().setDescription(message).setTimestamp();
    if (member instanceof GuildMember) {
      embed.setColor(member.displayHexColor as ColorResolvable).setAuthor({
        name: member.user.tag,
        iconURL: member.displayAvatarURL(),
      });
    } else {
      embed.setAuthor({
        name: member.tag,
        iconURL: member.displayAvatarURL(),
      });
    }
    if (title) {
      embed.setTitle(title);
    }
    if (reason) {
      embed.addFields([{ name: 'Reason', value: reason }]);
    }
    return embed;
  }

  public static reminderListEmbed(message: string, list: EmbedField[]) {
    const embed = new EmbedBuilder()
      .setTitle('Reminders')
      .setColor(Config.colors.default as ColorResolvable)
      .setDescription(message);
    // .setFooter({ text: 'Use the menu below to delete reminders' });
    if (list) {
      embed.addFields(list);
    }
    return embed;
  }

  public static helpEmbed(
    commands: { [key: string]: string[] },
    iconUrl: string
  ) {
    const embed = new EmbedBuilder()
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
    const fields: EmbedField[] = Object.keys(commands).map((key) => {
      return { name: key, value: commands[key].join('\n'), inline: false };
    });
    embed.addFields(fields);
    return embed;
  }

  public static cmdHelpEmbed(
    cmd: string,
    iconUrl: string,
    desc: string,
    usage: string,
    // options: string[],
    subcommands: string[]
  ) {
    const embed = new EmbedBuilder()
      .setTitle(`Help for \`${cmd}\``)
      .setColor(Config.colors.default as ColorResolvable)
      .setDescription(desc)
      .addFields([{ name: 'Usage', value: usage }])
      .setThumbnail(iconUrl)
      .setTimestamp();
    // if (options && options.length > 0) {
    //   embed.addFields([{ name: 'Options', value: options.join('\n') }]);
    // }
    if (subcommands && subcommands.length > 0) {
      embed.addFields([
        { name: 'Subcommands & Options', value: subcommands.join('\n') },
      ]);
    }
    return embed;
  }

  public static async stickerEmbed(member: GuildMember, sticker: Sticker) {
    const time = sticker.invokeTime.toLocaleDateString();
    const embed = new EmbedBuilder()
      .setTitle(sticker.stickerName)
      .setColor(Config.colors.default as ColorResolvable)
      .setImage(sticker.stickerUrl)
      .setFooter({
        text: `added at ${time} ${member ? `by ${member.displayName}` : ''}`,
        iconURL: member ? member.displayAvatarURL() : '',
      })
      .setTimestamp();
    return embed;
  }
}
