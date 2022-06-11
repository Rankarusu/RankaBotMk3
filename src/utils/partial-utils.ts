import {
  Message,
  MessageReaction,
  PartialMessage,
  PartialMessageReaction,
  PartialUser,
  User,
} from 'discord.js';

/**
 * A helper class for working with partial objects. Partial objects are objects that do
 * not have all of their properties filled in. This class provides methods to convert them to full objects.
 * @export
 * @class PartialUtils
 */
export class PartialUtils {
  public static async fillUser(user: User | PartialUser): Promise<User> {
    if (user.partial) {
      try {
        return await user.fetch();
      } catch (error) {
        throw error;
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
        //we could ignore certain errors here
        throw error;
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
        //we could ignore certain errors here
        throw error;
      }
    }

    msgReaction.message = await this.fillMessage(msgReaction.message);
    if (!msgReaction.message) {
      return;
    }

    return msgReaction as MessageReaction;
  }
}
