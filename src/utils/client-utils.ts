import { Client, Message, Snowflake, TextChannel } from 'discord.js';

export class ClientUtils {
  public static async getMessage(
    client: Client,
    channelId: Snowflake,
    messageId: Snowflake
  ): Promise<Message> {
    try {
      const channel: TextChannel = (await client.channels.fetch(
        channelId
      )) as TextChannel;
      const message: Message = await channel.messages.fetch(messageId);
      return message;
    } catch (error) {
      //filtering maybe
      throw error;
    }
  }
}
