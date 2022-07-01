import { Client, Message, Snowflake, TextChannel } from 'discord.js';

export class ClientUtils {
  static async getChannel(
    client: Client,
    channelId: string
  ): Promise<TextChannel> {
    try {
      const channel: TextChannel = (await client.channels.fetch(
        channelId
      )) as TextChannel;
      return channel;
    } catch (error) {
      throw error;
    }
  }

  public static async getMessage(
    client: Client,
    channelId: Snowflake,
    messageId: Snowflake
  ): Promise<Message> {
    try {
      const channel: TextChannel = await ClientUtils.getChannel(
        client,
        channelId
      );
      const message: Message = await channel.messages.fetch(messageId);
      return message;
    } catch (error) {
      //filtering maybe
      throw error;
    }
  }
}
