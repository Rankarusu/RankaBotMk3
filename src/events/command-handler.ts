import {
  ChatInputCommandInteraction,
  CommandInteraction,
  NewsChannel,
  TextChannel,
  ThreadChannel,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import { EventHandler } from '.';
import { Command, CommandDeferType } from '../commands';
import { EventData } from '../models';
import { Logger } from '../services';
import LogMessages from '../static/logs.json';
import { EmbedUtils, InteractionUtils, StringUtils } from '../utils';

const Config = require('../../config/config.json');

const nsfwimage = 'https://imgur.com/73eRGtC.png';

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
    const command = this.findCommand(interaction);
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
        InteractionUtils.sendWarning(
          interaction,
          data,
          "You don't have permission to use this command"
        );
        return;
      }
      //check if command is on cooldown
      if (InteractionUtils.isOnCooldown(interaction, command)) {
        InteractionUtils.sendWarning(interaction, data, 'Chill.');
        return;
      }

      if (!InteractionUtils.isTooLewdForChannel(interaction, command)) {
        InteractionUtils.sendWarning(interaction, data, 'lewd.', nsfwimage);
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

  private findCommand(interaction: ChatInputCommandInteraction) {
    return this.commands.find(
      (cmd) => cmd.metadata.name === interaction.commandName
    );
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
