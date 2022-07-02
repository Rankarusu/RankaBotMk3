import {
  CommandInteraction,
  NewsChannel,
  TextChannel,
  ThreadChannel,
} from 'discord.js';
import { Command, CommandDeferType } from '../commands';
import { EventData } from '../models/event-data';
import { Logger } from '../services';
import { EmbedUtils, InteractionUtils, StringUtils } from '../utils';
import { EventHandler } from './event-handler';

import LogMessages from '../../logs/logs.json';

export class CommandHandler implements EventHandler {
  constructor(public commands: Command[]) {}
  public async process(interaction: CommandInteraction): Promise<void> {
    if (
      interaction.user.id === interaction.client.user?.id ||
      interaction.user.bot
    ) {
      // do not talk to yourself or other bots!
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
    let command = this.commands.find(
      (command) => command.metadata.name === interaction.commandName
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

    let data = new EventData();

    try {
      //we can run checks here
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
      // await this.sendError(interaction, data);
    }

    //TODO: put send error function here
  }
  private async sendError(
    interaction: CommandInteraction,
    data: EventData
  ): Promise<void> {
    {
      // data.fields = {
      //   ERROR_CODE: interaction.id,
      //   GUILD_ID: interaction.guild.id,
      // };
      const embed = EmbedUtils.errorEmbed(data);
      await InteractionUtils.send(interaction, embed);
    }
  }
}
