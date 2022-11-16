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

const Config = require('../../config/config.json');

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
    components?: ActionRowBuilder<ButtonBuilder | SelectMenuBuilder>[],
    files?: AttachmentBuilder[],
    hidden = false
  ): Promise<Message> {
    try {
      const options: InteractionReplyOptions = this.setContent(
        content
      ) as InteractionReplyOptions;
      if (interaction.deferred || interaction.replied) {
        return await interaction.followUp({
          ...options,
          ephemeral: hidden,
          components,
          files,
        });
      } else {
        return await interaction.reply({
          ...options,
          ephemeral: hidden,
          fetchReply: true,
          components,
          files,
        });
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

  private static setContent(
    content:
      | string
      | EmbedBuilder
      | EmbedBuilder[]
      | InteractionReplyOptions
      | MessageEditOptions
      | InteractionUpdateOptions
  ) {
    if (typeof content === 'string') {
      return { content };
    } else if (content instanceof EmbedBuilder) {
      return { embeds: [content] };
    } else if (content instanceof Array<EmbedBuilder>) {
      return { embeds: content };
    } else {
      return content;
    }
  }

  public static async deferUpdate(
    intr: MessageComponentInteraction
  ): Promise<void> {
    await intr.deferUpdate();
  }

  public static async editReply(
    intr: CommandInteraction | MessageComponentInteraction,
    content: string | EmbedBuilder | Array<EmbedBuilder>,
    components?: ActionRowBuilder<ButtonBuilder | SelectMenuBuilder>[]
  ): Promise<Message> {
    try {
      const options: MessageEditOptions = this.setContent(
        content
      ) as MessageEditOptions;
      return await intr.editReply({ ...options, components });
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
    components?: ActionRowBuilder<ButtonBuilder | SelectMenuBuilder>[]
  ): Promise<Message> {
    try {
      const options: InteractionUpdateOptions = this.setContent(
        content
      ) as InteractionUpdateOptions;

      return await intr.update({
        ...options,
        components,
        fetchReply: true,
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
