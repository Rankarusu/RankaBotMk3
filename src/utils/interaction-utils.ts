import {
  APIActionRowComponent,
  APIMessageActionRowComponent,
  RESTJSONErrorCodes,
} from 'discord-api-types/v10';
import {
  AttachmentBuilder,
  CommandInteraction,
  DiscordAPIError,
  EmbedBuilder,
  GuildChannel,
  InteractionReplyOptions,
  InteractionResponse,
  InteractionUpdateOptions,
  Message,
  MessageComponentInteraction,
  MessageEditOptions,
  ThreadChannel,
  User,
} from 'discord.js';
import { Command } from '../commands';
// eslint-disable-next-line node/no-unpublished-import
import Config from '../../config/config.json';
import { EventData } from '../models/event-data';

const IGNORED_ERRORS = [
  RESTJSONErrorCodes.UnknownMessage,
  RESTJSONErrorCodes.UnknownInteraction,
  RESTJSONErrorCodes.InteractionHasAlreadyBeenAcknowledged,
];

export class InteractionUtils {
  public static async deferReply(
    interaction: CommandInteraction | MessageComponentInteraction,
    hidden = false
  ): Promise<InteractionResponse> {
    try {
      return await interaction.deferReply({
        ephemeral: hidden,
      });
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

  public static async send(
    interaction: CommandInteraction | MessageComponentInteraction,
    content: string | EmbedBuilder | InteractionReplyOptions,
    components?: APIActionRowComponent<APIMessageActionRowComponent>[],
    files?: AttachmentBuilder[],
    hidden = false
  ): Promise<Message> {
    try {
      const options: InteractionReplyOptions =
        typeof content === 'string'
          ? { content }
          : content instanceof EmbedBuilder
          ? { embeds: [content] }
          : content;
      if (interaction.deferred || interaction.replied) {
        return (await interaction.followUp({
          ...options,
          ephemeral: hidden,
          components,
          files,
        })) as Message;
      } else {
        return (await interaction.reply({
          ...options,
          ephemeral: hidden,
          fetchReply: true,
          components,
          files,
        })) as Message;
      }
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

  public static async deferUpdate(
    intr: MessageComponentInteraction
  ): Promise<InteractionResponse> {
    try {
      return await intr.deferUpdate();
    } catch (error) {
      throw error;
    }
  }

  public static async editReply(
    intr: CommandInteraction | MessageComponentInteraction,
    content: string | EmbedBuilder,
    components?: APIActionRowComponent<APIMessageActionRowComponent>[]
  ): Promise<Message> {
    try {
      const options: MessageEditOptions =
        typeof content === 'string'
          ? { content }
          : content instanceof EmbedBuilder
          ? { embeds: [content] }
          : content;
      return (await intr.editReply({ ...options, components })) as Message;
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

  public static async update(
    intr: MessageComponentInteraction,
    content?: string | EmbedBuilder | InteractionUpdateOptions,
    components?: APIActionRowComponent<APIMessageActionRowComponent>[]
  ): Promise<Message> {
    try {
      const options: InteractionUpdateOptions =
        typeof content === 'string'
          ? { content }
          : content instanceof EmbedBuilder
          ? { embeds: [content] }
          : content;

      return (await intr.update({
        ...options,
        components,
        fetchReply: true,
      })) as Message;
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
