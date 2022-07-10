import {
  Client,
  Constants,
  Interaction,
  Message,
  MessageReaction,
  PartialMessageReaction,
  PartialUser,
  User,
} from 'discord.js';
import {
  CommandHandler,
  MessageHandler,
  ReactionHandler,
  SelectMenuHandler,
} from '../events';
import { Logger } from '../services';
import { PartialUtils } from '../utils';

import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import LogMessages from '../../logs/logs.json';
import { Command } from '../commands';
// eslint-disable-next-line node/no-unpublished-import
import Config from '../../config/config.json';

export class Bot {
  private ready = false;

  constructor(
    private token: string,
    private client: Client,
    // private guildJoinHandler: GuildJoinHandler,
    // private guildLeaveHandler: GuildLeaveHandler,
    private messageHandler: MessageHandler,
    private commandHandler: CommandHandler,
    private reactionHandler: ReactionHandler,
    private selectMenuHandler: SelectMenuHandler
  ) {}

  public async start(): Promise<void> {
    this.registerListeners();
    await this.login(this.token);
  }

  private registerListeners(): void {
    this.client.on(Constants.Events.CLIENT_READY, () => {
      this.onReady();
    });
    this.client.on(Constants.Events.MESSAGE_CREATE, (msg: Message) =>
      this.onMessage(msg)
    );
    this.client.on(
      Constants.Events.INTERACTION_CREATE,
      (interaction: Interaction) => this.onInteraction(interaction)
    );
    //TODO: join and leave handlers
    this.client.on(
      Constants.Events.MESSAGE_REACTION_ADD,
      (
        msgReaction: MessageReaction | PartialMessageReaction,
        user: User | PartialUser
      ) => this.onReaction(msgReaction, user)
    );
  }

  private async login(token: string): Promise<void> {
    try {
      await this.client.login(token);
    } catch (error) {
      Logger.error(LogMessages.error.clientLogin, error);
      return;
    }
  }

  private async onReady(): Promise<void> {
    const userTag = this.client.user?.tag;
    Logger.info(LogMessages.info.clientLogin.replaceAll('{USER_TAG}', userTag));

    this.ready = true;
    Logger.info(LogMessages.info.clientReady.replaceAll('{USER_TAG}', userTag));
    await this.registerGuildCommands();
    this.client.user.setActivity('Hello, World!');
  }

  private async onMessage(msg: Message): Promise<void> {
    if (!this.ready) {
      return;
    }
    //we use the partial utils to fill in the missing properties here
    msg = await PartialUtils.fillMessage(msg);
    if (!msg) {
      return;
    }

    try {
      await this.messageHandler.process(msg);
    } catch (error) {
      Logger.error(LogMessages.error.message, error);
    }
  }

  private async onInteraction(interaction: Interaction): Promise<void> {
    if (!this.ready) {
      return;
    }

    if (interaction.isCommand()) {
      try {
        await this.commandHandler.process(interaction);
      } catch (error) {
        Logger.error(LogMessages.error.command, error);
      }
      // else if(interaction instanceof ButtonInteraction){}
      //TODO: buttonInteraction later
    } else if (interaction.isSelectMenu()) {
      try {
        await this.selectMenuHandler.process(
          interaction,
          interaction.message as Message
        );
      } catch (error) {
        Logger.error(LogMessages.error.selectMenu, error);
      }
    }
  }

  private async onReaction(
    msgReaction: MessageReaction | PartialMessageReaction,
    reactor: User | PartialUser
  ): Promise<void> {
    if (!this.ready) {
      return;
    }
    msgReaction = await PartialUtils.fillReaction(msgReaction);
    if (!msgReaction) {
      return;
    }
    reactor = await PartialUtils.fillUser(reactor);
    if (!reactor) {
      return;
    }
    try {
      await this.reactionHandler.process(
        msgReaction,
        msgReaction.message as Message,
        reactor
      );
    } catch (error) {
      Logger.error(LogMessages.error.reaction, error);
    }
  }

  public getCommands(): Command[] {
    return this.commandHandler.commands;
  }

  private async registerGuildCommands() {
    //TODO: find a better place to put this.
    const rest = new REST().setToken(Config.client.token);
    const commands = this.getCommands();
    const commandsJson = commands.map((command) => command.metadata);
    const guildIds = this.client.guilds.cache.map((guild) => guild.id);
    //per guild
    try {
      guildIds.forEach(async (guildId) => {
        await rest.put(
          Routes.applicationGuildCommands(Config.client.id, guildId),
          { body: commandsJson }
        );
      });
    } catch (error) {
      Logger.error(LogMessages.error.commandActionCreating, error);
    }
    Logger.info(
      LogMessages.info.commandActionCreating.replaceAll(
        '{COMMAND_LIST}',
        commands.map((command) => command.metadata.name).join('\n')
      )
    );
  }
}
