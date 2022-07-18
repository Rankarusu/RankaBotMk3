import { RESTJSONErrorCodes } from 'discord-api-types/v10';
import {
  ActionRowBuilder,
  DiscordAPIError,
  EmbedBuilder,
  EmojiResolvable,
  Message,
  MessageEditOptions,
  MessageOptions,
  MessageReaction,
  StartThreadOptions,
  TextBasedChannel,
  ThreadChannel,
  User,
} from 'discord.js';

const IGNORED_ERRORS = [RESTJSONErrorCodes.UnknownMessage];
//TODO: find out how to handle components without typescript complaining

export class MessageUtils {
  public static async send(
    target: User | TextBasedChannel,
    content: string | EmbedBuilder | MessageOptions
  ): Promise<Message> {
    try {
      const options: MessageOptions =
        typeof content === 'string'
          ? { content }
          : content instanceof EmbedBuilder
          ? { embeds: [content] }
          : content;
      return await target.send(options);
    } catch (error) {
      throw error;
    }
  }

  public static async reply(
    msg: Message,
    content: string | EmbedBuilder | MessageOptions
  ): Promise<Message> {
    try {
      const options: MessageOptions =
        typeof content === 'string'
          ? { content }
          : content instanceof EmbedBuilder
          ? { embeds: [content] }
          : content;
      return await msg.reply(options);
    } catch (error) {
      throw error;
    }
  }

  public static async edit(
    msg: Message,
    content?: string | EmbedBuilder | MessageEditOptions,
    components?: ActionRowBuilder[]
  ): Promise<Message> {
    try {
      const options: MessageEditOptions =
        typeof content === 'string'
          ? { content }
          : content instanceof EmbedBuilder
          ? { embeds: [content] }
          : content;
      return await msg.edit({ ...options, components });
    } catch (error) {
      if (
        error instanceof DiscordAPIError &&
        IGNORED_ERRORS.includes(error.code as number)
      ) {
        return;
      } else {
        throw error;
      }
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
