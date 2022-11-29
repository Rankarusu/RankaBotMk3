import { RESTJSONErrorCodes } from 'discord-api-types/v10';
import {
  ActionRowBuilder,
  BaseMessageOptions,
  ButtonBuilder,
  DiscordAPIError,
  EmbedBuilder,
  EmojiResolvable,
  Message,
  MessageEditOptions,
  MessageReaction,
  MessageReplyOptions,
  StartThreadOptions,
  StringSelectMenuBuilder,
  TextBasedChannel,
  ThreadChannel,
  User,
} from 'discord.js';

const IGNORED_ERRORS = [RESTJSONErrorCodes.UnknownMessage];

export class MessageUtils {
  public static async send(
    target: User | TextBasedChannel,
    content: string | EmbedBuilder | Array<EmbedBuilder> | BaseMessageOptions
  ): Promise<Message> {
    try {
      const options: BaseMessageOptions = this.setContent(content);
      return await target.send(options);
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

  private static setContent(
    content:
      | string
      | EmbedBuilder
      | EmbedBuilder[]
      | MessageReplyOptions
      | MessageEditOptions
  ): BaseMessageOptions {
    if (typeof content === 'string') {
      return { content };
    } else if (content instanceof EmbedBuilder) {
      return { embeds: [content] };
    } else if (content instanceof Array<EmbedBuilder>) {
      return { embeds: content };
    } else {
      return content;
    }
  }

  public static async reply(
    msg: Message,
    content: string | EmbedBuilder | Array<EmbedBuilder> | MessageReplyOptions
  ): Promise<Message> {
    try {
      const options: MessageReplyOptions = this.setContent(content);
      return await msg.reply(options);
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

  public static async edit(
    msg: Message,
    content?: string | EmbedBuilder | Array<EmbedBuilder> | MessageEditOptions,
    components?: ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>[]
  ): Promise<Message> {
    try {
      const options: MessageEditOptions = this.setContent(content);

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

  public static async pin(msg: Message): Promise<Message> {
    try {
      return await msg.pin();
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

  public static async unpin(msg: Message): Promise<Message> {
    try {
      return await msg.unpin();
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

  public static async startThread(
    msg: Message,
    options: StartThreadOptions
  ): Promise<ThreadChannel> {
    try {
      return await msg.startThread(options);
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

  public static async delete(msg: Message): Promise<Message> {
    try {
      return await msg.delete();
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
}
