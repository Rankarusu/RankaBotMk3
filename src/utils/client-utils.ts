import { Client, Message, Snowflake, TextChannel } from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

const Config = require('../../config/config.json');
export class ClientUtils {
  static async getChannel(
    client: Client,
    channelId: string
  ): Promise<TextChannel> {
    const channel: TextChannel = (await client.channels.fetch(
      channelId
    )) as TextChannel;
    return channel;
  }

  public static async getMessage(
    client: Client,
    channelId: Snowflake,
    messageId: Snowflake
  ): Promise<Message> {
    const channel: TextChannel = await ClientUtils.getChannel(
      client,
      channelId
    );
    const message: Message = await channel.messages.fetch(messageId);
    return message;
  }

  public static APICallCommandRateLimiter() {
    return new RateLimiter(
      Config.cooldowns.apiCallCommands.amount,
      Config.cooldowns.apiCallCommands.interval * 1000
    );
  }

  public static DbCommandRateLimiter() {
    return new RateLimiter(
      Config.cooldowns.dbCommands.amount,
      Config.cooldowns.dbCommands.interval * 1000
    );
  }
}
