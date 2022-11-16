import { Sticker } from '@prisma/client';
import {
  ColorResolvable,
  EmbedBuilder,
  EmbedField,
  GuildMember,
  User,
} from 'discord.js';
import { DanbooruPost, RedditPost, Rule34Post } from '../models';

const Config = require('../../config/config.json');
const blessImage = 'https://imgur.com/j6S4CLe.png';
const r34green = '#AAE5A4';
const danbooruBlue = '#0075f8';
const blessYellow = '#F9DC92';

export class EmbedUtils {
  public static errorEmbed(error?: Error) {
    const embed = new EmbedBuilder()
      .setTitle('Error')
      .setColor(Config.colors.error as ColorResolvable)
      .setDescription(error?.message || 'An error occurred')
      .setTimestamp();
    return embed;
  }

  public static warnEmbed(error?: Error, imageUrl?: string) {
    const embed = new EmbedBuilder()
      .setTitle('Warning')
      .setColor(Config.colors.warning as ColorResolvable)
      .setDescription(error?.message)
      .setTimestamp();
    if (imageUrl) {
      embed.setImage(imageUrl);
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
      embed
        .setColor(member.displayHexColor as ColorResolvable)
        .setAuthor({
          name: member.user.tag,
          iconURL: member.displayAvatarURL(),
        })
        .setFooter({
          text: `joined ${member.joinedAt.toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })}`,
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
    iconUrl: string,
    helpMention: string
  ) {
    const embed = new EmbedBuilder()
      .setTitle('Help')
      .setColor(Config.colors.default as ColorResolvable)
      .setDescription(
        `Welcome to the fully automated, paginated and generally very based RankaBotMk3 help dialog!
        (Seriously, I put a lot of effort into this. Please use it.)
        
        these </commands:0> are directly invocable by clicking on them.
        these \`/commands\` are only invokable via **subcommands**. 
        Use ${helpMention} \`command\` for more details.
        
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
    note?: string,
    subcommands?: string[]
  ) {
    const embed = new EmbedBuilder()
      .setTitle(`Help for ${cmd}`)
      .setColor(Config.colors.default as ColorResolvable)
      .setDescription(desc)
      .addFields([{ name: 'Usage', value: usage }])
      .setThumbnail(iconUrl)
      .setTimestamp();

    if (note) {
      embed.addFields([{ name: 'Note', value: note }]);
    }

    if (subcommands && subcommands.length > 0) {
      embed.addFields([
        { name: 'Subcommands & Options', value: subcommands.join('\n') },
      ]);
    }
    return embed;
  }

  public static stickerEmbed(member: GuildMember, sticker: Sticker) {
    const time = sticker.invokeTime.toLocaleDateString();
    const memberCredit = member ? `by ${member.displayName}` : '';
    const embed = new EmbedBuilder()
      .setTitle(sticker.stickerName)
      .setColor(Config.colors.default as ColorResolvable)
      .setImage(sticker.stickerUrl)
      .setFooter({
        text: `added ${memberCredit} at ${time}`,
        iconURL: member ? member.displayAvatarURL() : '',
      })
      .setTimestamp();
    return embed;
  }

  public static r34Embed(post: Rule34Post) {
    const embed = new EmbedBuilder()
      .setTitle('Rule34')
      .setFooter({ text: 'Powered by rule34.xxx' })
      .setURL(`https://rule34.xxx/index.php?page=post&s=view&id=${post.id}`)
      .setColor(r34green)
      .setImage(post.file_url)
      .setTimestamp();
    return embed;
  }

  public static danbooruEmbed(post: DanbooruPost) {
    const embed = new EmbedBuilder()
      .setTitle('Danbooru')
      .setFooter({ text: 'Powered by danbooru.donmai.us' })
      .setURL(`https://danbooru.donmai.us/posts/${post.id}`)
      .setColor(danbooruBlue)
      .setImage(post.file_url)
      .setTimestamp();
    return embed;
  }

  public static lewdEmbed(post: RedditPost) {
    const embed = this.infoEmbed()
      .setTitle(post.title)
      .setURL(`https://reddit.com${post.permalink}`)
      .setImage(post.url)
      .setFooter({ text: `Powered by reddit.com/r/${post.subreddit}` });
    return embed;
  }

  public static blessEmbed(number: number, limit: number) {
    const embed = new EmbedBuilder()
      .setColor(blessYellow)
      .setTitle(`Bless ${number}/${limit}`)
      .setDescription(
        "You have **Bless** up, don't forget to add a **D4** to your **Attack Rolls** and **Saving Throws**."
      )
      .setThumbnail(blessImage)
      .setTimestamp();
    return embed;
  }
}
