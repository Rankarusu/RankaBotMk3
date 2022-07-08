import {
  CommandInteraction,
  GuildChannel,
  InteractionReplyOptions,
  Message,
  MessageActionRow,
  MessageComponentInteraction,
  MessageEditOptions,
  MessageEmbed,
  ThreadChannel,
  User,
} from 'discord.js';
import { Command } from '../commands';
import Config from '../../config/config.json';

export class InteractionUtils {
  public static async deferReply(
    interaction: CommandInteraction | MessageComponentInteraction,
    hidden: boolean = false
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
    components?: MessageActionRow[],
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
          components,
        })) as Message;
      } else {
        return (await interaction.reply({
          ...options,
          ephemeral: hidden,
          fetchReply: true,
          components,
        })) as Message;
      }
    } catch (error) {
      //TODO: filter out

      throw error;
    }
  }

  public static async deferUpdate(
    intr: MessageComponentInteraction
  ): Promise<void> {
    try {
      return await intr.deferUpdate();
    } catch (error) {
      throw error;
    }
  }

  public static async editReply(
    intr: CommandInteraction | MessageComponentInteraction,
    content: string | MessageEmbed,
    components?: MessageActionRow[]
  ): Promise<Message> {
    try {
      let options: MessageEditOptions =
        typeof content === 'string'
          ? { content }
          : content instanceof MessageEmbed
          ? { embeds: [content] }
          : content;
      options.components = components;
      return (await intr.editReply(options)) as Message;
    } catch (error) {
      throw error;
    }
  }

  public static canUse(
    command: Command,
    interaction: CommandInteraction
  ): boolean {
    return (
      (interaction.channel instanceof GuildChannel ||
        interaction.channel instanceof ThreadChannel) &&
      interaction.channel
        .permissionsFor(interaction.user)
        .has(command.requireClientPerms)
    );
  }

  public static isDeveloper(user: User): boolean {
    return Config.developers.includes(user.id);
  }
}
