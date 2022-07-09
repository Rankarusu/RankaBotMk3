import {
  EmojiResolvable,
  Message,
  MessageEditOptions,
  MessageEmbed,
  MessageOptions,
  MessageReaction,
  StartThreadOptions,
  TextBasedChannel,
  ThreadChannel,
  User,
} from 'discord.js';

export class MessageUtils {
  public static async send(
    target: User | TextBasedChannel,
    content: string | MessageEmbed | MessageOptions
  ): Promise<Message> {
    try {
      const options: MessageOptions =
        typeof content === 'string'
          ? { content }
          : content instanceof MessageEmbed
          ? { embeds: [content] }
          : content;
      return await target.send(options);
    } catch (error) {
      throw error;
    }
  }

  public static async reply(
    msg: Message,
    content: string | MessageEmbed | MessageOptions
  ): Promise<Message> {
    try {
      const options: MessageOptions =
        typeof content === 'string'
          ? { content }
          : content instanceof MessageEmbed
          ? { embeds: [content] }
          : content;
      return await msg.reply(options);
    } catch (error) {
      throw error;
    }
  }

  public static async edit(
    msg: Message,
    content: string | MessageEmbed | MessageEditOptions
  ): Promise<Message> {
    try {
      const options: MessageEditOptions =
        typeof content === 'string'
          ? { content }
          : content instanceof MessageEmbed
          ? { embeds: [content] }
          : content;
      return await msg.edit(options);
    } catch (error) {
      throw error;
    }
  }

  public static async react(
    msg: Message,
    emoji: EmojiResolvable
  ): Promise<MessageReaction> {
    try {
      return await msg.react(emoji);
    } catch (error) {
      throw error;
    }
  }

  public static async pin(msg: Message): Promise<Message> {
    try {
      return await msg.pin();
    } catch (error) {
      throw error;
    }
  }

  public static async unpin(msg: Message): Promise<Message> {
    try {
      return await msg.unpin();
    } catch (error) {
      throw error;
    }
  }

  public static async startThread(
    msg: Message,
    options: StartThreadOptions
  ): Promise<ThreadChannel> {
    try {
      return await msg.startThread(options);
    } catch (error) {
      throw error;
    }
  }

  public static async delete(msg: Message): Promise<Message> {
    try {
      return await msg.delete();
    } catch (error) {
      throw error;
    }
  }
}
