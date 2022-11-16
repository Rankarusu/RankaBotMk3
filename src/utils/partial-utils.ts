import {
  DiscordAPIError,
  Message,
  MessageReaction,
  PartialMessage,
  PartialMessageReaction,
  PartialUser,
  RESTJSONErrorCodes,
  User,
} from 'discord.js';

const IGNORED_ERRORS = [
  RESTJSONErrorCodes.UnknownMessage,
  RESTJSONErrorCodes.UnknownChannel,
  RESTJSONErrorCodes.UnknownGuild,
  RESTJSONErrorCodes.UnknownUser,
  RESTJSONErrorCodes.UnknownInteraction,
];

export class PartialUtils {
  public static async fillUser(user: User | PartialUser): Promise<User> {
    if (user.partial) {
      try {
        return await user.fetch();
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
    return user as User;
  }

  public static async fillMessage(
    msg: Message | PartialMessage
  ): Promise<Message> {
    if (msg.partial) {
      try {
        return await msg.fetch();
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
    return msg as Message;
  }

  public static async fillReaction(
    msgReaction: MessageReaction | PartialMessageReaction
  ): Promise<MessageReaction> {
    if (msgReaction.partial) {
      try {
        return await msgReaction.fetch();
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
    msgReaction.message = await this.fillMessage(msgReaction.message);
    if (!msgReaction.message) {
      return;
    }

    return msgReaction as MessageReaction;
  }
}
