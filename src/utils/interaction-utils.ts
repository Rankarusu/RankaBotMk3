import { RESTJSONErrorCodes } from 'discord-api-types/v10';
import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
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
  SelectMenuBuilder,
  ThreadChannel,
  User,
} from 'discord.js';
import { Command } from '../commands';
// eslint-disable-next-line node/no-unpublished-import
const Config = require('../public/config/config.json');
import { EventData } from '../models/event-data';
import { EmbedUtils } from './embed-utils';

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
    content:
      | string
      | EmbedBuilder
      | Array<EmbedBuilder>
      | InteractionReplyOptions,
    // components?: APIActionRowComponent<APIMessageActionRowComponent>[],
    components?: ActionRowBuilder<ButtonBuilder | SelectMenuBuilder>[],
    files?: AttachmentBuilder[],
    hidden = false
  ): Promise<Message> {
    try {
      const options: InteractionReplyOptions =
        typeof content === 'string'
          ? { content }
          : content instanceof EmbedBuilder
          ? { embeds: [content] }
          : content instanceof Array<EmbedBuilder>
          ? { embeds: content }
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
    content: string | EmbedBuilder | Array<EmbedBuilder>,
    // components?: APIActionRowComponent<APIMessageActionRowComponent>[]
    components?: ActionRowBuilder<ButtonBuilder | SelectMenuBuilder>[]
  ): Promise<Message> {
    try {
      const options: MessageEditOptions =
        typeof content === 'string'
          ? { content }
          : content instanceof EmbedBuilder
          ? { embeds: [content] }
          : content instanceof Array<EmbedBuilder>
          ? { embeds: content }
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
    content?:
      | string
      | EmbedBuilder
      | Array<EmbedBuilder>
      | InteractionUpdateOptions,
    // components?: APIActionRowComponent<APIMessageActionRowComponent>[]
    components?: ActionRowBuilder<ButtonBuilder | SelectMenuBuilder>[]
  ): Promise<Message> {
    try {
      const options: InteractionUpdateOptions =
        typeof content === 'string'
          ? { content }
          : content instanceof EmbedBuilder
          ? { embeds: [content] }
          : content instanceof Array<EmbedBuilder>
          ? { embeds: content }
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

  public static sendWarning(
    interaction: CommandInteraction,
    data: EventData,
    message: string
  ) {
    data.description = message;
    const embed = EmbedUtils.warnEmbed(data);
    InteractionUtils.send(interaction, embed);
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

  public static isTooLewdForChannel(
    interaction: CommandInteraction,
    command: Command
  ): boolean {
    if (interaction.channel instanceof GuildChannel) {
      return (interaction.channel.nsfw && command.nsfw) || !command.nsfw;
    }
    return true;
  }
}
