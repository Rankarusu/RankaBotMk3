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
// eslint-disable-next-line node/no-unpublished-import
import Config from '../../config/config.json';
import { EventData } from '../models/event-data';

export class InteractionUtils {
  public static async deferReply(
    interaction: CommandInteraction | MessageComponentInteraction,
    hidden = false
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
    hidden = false
  ): Promise<Message> {
    try {
      const options: InteractionReplyOptions =
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
      const options: MessageEditOptions =
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

  public static sendError(data: EventData, message: string) {
    //we set event data and throw so the command handler can take over.
    data.description = message;
    throw new Error(message);
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

  public static isOnCooldown(
    interaction: CommandInteraction,
    command: Command
  ): boolean {
    if (command.cooldown) {
      const limited = command.cooldown.take(interaction.user.id);
      return limited;
    }
  }
}
