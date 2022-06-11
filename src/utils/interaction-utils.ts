import { Message } from 'discord.js';
import {
  CommandInteraction,
  DiscordAPIError,
  MessageComponentInteraction,
  InteractionReplyOptions,
  MessageEmbed,
} from 'discord.js';

export class InteractionUtils {
  public static async deferReply(
    interaction: CommandInteraction | MessageComponentInteraction,
    hidden: boolean
  ): Promise<void> {
    try {
      return await interaction.deferReply({
        ephemeral: hidden,
      });
    } catch (error) {
      //TODO: filter out
      console.error(error);
      throw error;
    }
  }

  public static async send(
    interaction: CommandInteraction | MessageComponentInteraction,
    content: string | MessageEmbed | InteractionReplyOptions,
    hidden: boolean = false
  ): Promise<Message> {
    try {
      let options: InteractionReplyOptions =
        typeof content === 'string'
          ? { content }
          : content instanceof MessageEmbed
          ? { embeds: [content] }
          : content;
      if (interaction.deferred || interaction.replied) {
        return (await interaction.followUp({
          ...options,
          ephemeral: hidden,
        })) as Message;
      } else {
        return (await interaction.reply({
          ...options,
          ephemeral: hidden,
          fetchReply: true,
        })) as Message;
      }
    } catch (error) {
      //TODO: filter out

      throw error;
    }
  }
}
