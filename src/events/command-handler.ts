import {
  AttachmentBuilder,
  ChatInputCommandInteraction,
  CommandInteraction,
  NewsChannel,
  TextChannel,
  ThreadChannel,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import LogMessages from '../../logs/logs.json';
import { Command, CommandDeferType } from '../commands';
import { EventData } from '../models/event-data';
import { Logger } from '../services';
import { EmbedUtils, InteractionUtils, StringUtils } from '../utils';
import { EventHandler } from './event-handler';
// eslint-disable-next-line node/no-unpublished-import
import Config from '../../config/config.json';

const pathToImages = './data/pictures/';
const nsfwimage = 'nsfw.png';

export class CommandHandler implements EventHandler {
  private rateLimiter = new RateLimiter(
    Config.cooldowns.commands.amount,
    Config.cooldowns.commands.interval * 1000
  );

  constructor(public commands: Command[]) {}

  public async process(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    if (
      interaction.user.id === interaction.client.user?.id ||
      interaction.user.bot
    ) {
      // do not talk to yourself or other bots!
      return;
    }

    const data = new EventData();

    // Check if user is rate limited
    const limited = this.rateLimiter.take(interaction.user.id);
    if (limited) {
      return;
    }

    Logger.info(
      interaction.channel instanceof TextChannel ||
        interaction.channel instanceof NewsChannel ||
        interaction.channel instanceof ThreadChannel
        ? LogMessages.info.commandGuild
            .replaceAll('{INTERACTION_ID}', interaction.id)
            .replaceAll('{COMMAND_NAME}', interaction.commandName)
            .replaceAll('{USER_TAG}', interaction.user.tag)
            .replaceAll('{USER_ID}', interaction.user.id)
            .replaceAll(
              '{ARGUMENTS}',
              StringUtils.prettifyCommandOptions(interaction.options.data)
            )
            .replaceAll('{CHANNEL_NAME}', interaction.channel.name)
            .replaceAll('{CHANNEL_ID}', interaction.channel.id)
            .replaceAll('{GUILD_NAME}', interaction.guild.name)
            .replaceAll('{GUILD_ID}', interaction.guild.id)
        : LogMessages.info.commandOther
            .replaceAll('{INTERACTION_ID}', interaction.id)
            .replaceAll('{COMMAND_NAME}', interaction.commandName)
            .replaceAll('{USER_TAG}', interaction.user.tag)
            .replaceAll('{USER_ID}', interaction.user.id)
    );
    // find the command that the user watch executed
    const command = this.commands.find(
      (cmd) => cmd.metadata.name === interaction.commandName
    );
    if (!command) {
      Logger.error(
        LogMessages.error.commandNotFound
          .replaceAll('{INTERACTION_ID}', interaction.id)
          .replaceAll('{COMMAND_NAME}', interaction.commandName)
      );
      return;
    }

    switch (command.deferType) {
      case CommandDeferType.PUBLIC: {
        await InteractionUtils.deferReply(interaction, false);
        break;
      }
      case CommandDeferType.HIDDEN: {
        //sends ephemeral message, only visible to invoker
        await InteractionUtils.deferReply(interaction, true);
        break;
      }
    }
    //return if defer is unsuccessful
    if (command.deferType !== CommandDeferType.NONE && !interaction.deferred) {
      return;
    }

    try {
      // check if user is eligible to use the command
      if (
        (command.developerOnly &&
          !InteractionUtils.isDeveloper(interaction.user)) ||
        !InteractionUtils.canUse(command, interaction)
      ) {
        data.description = "You don't have permission to use this command";
        const embed = EmbedUtils.warnEmbed(data);
        await InteractionUtils.send(interaction, embed);
        return;
      }
      //check if command is on cooldown
      if (InteractionUtils.isOnCooldown(interaction, command)) {
        data.description = 'Chill';
        const embed = EmbedUtils.warnEmbed(data);
        await InteractionUtils.send(interaction, embed);
        return;
      }

      if (!InteractionUtils.isTooLewdForChannel(interaction, command)) {
        data.description = 'lewd.';
        const embed = EmbedUtils.warnEmbed(data);
        const image = new AttachmentBuilder(`${pathToImages}${nsfwimage}`);
        embed.setImage(`attachment://${nsfwimage}`);
        await InteractionUtils.send(interaction, embed, undefined, [image]);
        return;
      }

      await command.execute(interaction, data);
    } catch (error) {
      Logger.error(
        interaction.channel instanceof TextChannel ||
          interaction.channel instanceof NewsChannel ||
          interaction.channel instanceof ThreadChannel
          ? LogMessages.error.commandGuild
              .replaceAll('{INTERACTION_ID}', interaction.id)
              .replaceAll('{COMMAND_NAME}', interaction.commandName)
              .replaceAll('{USER_TAG}', interaction.user.tag)
              .replaceAll('{USER_ID}', interaction.user.id)
              .replaceAll('{CHANNEL_NAME}', interaction.channel.name)
              .replaceAll('{CHANNEL_ID}', interaction.channel.id)
              .replaceAll('{GUILD_NAME}', interaction.guild.name)
              .replaceAll('{GUILD_ID}', interaction.guild.id)
          : LogMessages.error.commandOther
              .replaceAll('{INTERACTION_ID}', interaction.id)
              .replaceAll('{COMMAND_NAME}', interaction.commandName)
              .replaceAll('{USER_TAG}', interaction.user.tag)
              .replaceAll('{USER_ID}', interaction.user.id),
        error
      );
      if (!data.description) {
        data.description = 'An error occurred';
      }
      await this.sendError(interaction, data);
    }
  }

  private async sendError(
    interaction: CommandInteraction,
    data: EventData
  ): Promise<void> {
    {
      const embed = EmbedUtils.errorEmbed(data);
      await InteractionUtils.send(interaction, embed);
    }
  }
}
