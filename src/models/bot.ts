import { REST } from '@discordjs/rest';
import { InteractionType, Routes } from 'discord-api-types/v10';
import {
  ChatInputCommandInteraction,
  Client,
  Events,
  Interaction,
  Message,
  MessageReaction,
  PartialMessage,
  PartialMessageReaction,
  PartialUser,
  User,
} from 'discord.js';
import { Command } from '../commands';
import {
  AutoCompleteHandler,
  CommandHandler,
  MessageHandler,
  ReactionHandler,
  SelectMenuHandler,
} from '../events';
import { Logger } from '../services';
import LogMessages from '../static/logs.json';
import { PartialUtils } from '../utils';

const Config = require('../../config/config.json');

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
    private selectMenuHandler: SelectMenuHandler,
    private autoCompleteHandler: AutoCompleteHandler
  ) {}

  public async start(): Promise<void> {
    this.registerListeners();
    await this.login(this.token);
  }

  private registerListeners(): void {
    this.client.on(Events.ClientReady, () => {
      this.onReady();
    });
    this.client.on(Events.MessageCreate, (msg: Message) => this.onMessage(msg));
    this.client.on(Events.InteractionCreate, (interaction: Interaction) =>
      this.onInteraction(interaction)
    );
    //TODO: join and leave handlers
    this.client.on(
      Events.MessageReactionAdd,
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
    this.registerGuildCommands();
    this.client.user.setActivity('Hello, World!');

    //put the application command ids into our command classes so we can mention them in the help command.
    const appCommands = await this.client.application.commands.fetch();
    appCommands.forEach((appCommand) => {
      this.commandHandler.commands.find(
        (command) => command.metadata.name === appCommand.name
      ).id = appCommand.id;
    });
  }

  private async onMessage(msg: Message | PartialMessage): Promise<void> {
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

    if (interaction.type === InteractionType.ApplicationCommand) {
      try {
        await this.commandHandler.process(
          interaction as ChatInputCommandInteraction
        );
      } catch (error) {
        Logger.error(LogMessages.error.command, error);
      }
      // else if(interaction instanceof ButtonInteraction){}
      //TODO: buttonInteraction later
    } else if (interaction.isStringSelectMenu()) {
      try {
        await this.selectMenuHandler.process(interaction, interaction.message);
      } catch (error) {
        Logger.error(LogMessages.error.selectMenu, error);
      }
    } else if (interaction.isAutocomplete()) {
      try {
        await this.autoCompleteHandler.process(interaction);
      } catch (error) {
        Logger.error(LogMessages.error.autoComplete, error);
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

  private registerGuildCommands() {
    //TODO: find a better place to put this.
    const rest = new REST().setToken(Config.client.token);
    rest.put(
      Routes.applicationGuildCommands(
        this.client.application.id,
        '243426641840177154'
      ),
      { body: [] }
    );
    const commands = this.getCommands();
    const commandsJson = commands.map((command) => command.metadata);

    const guildIds: string[] = Config.devServers;
    //if we register all commands globally and locally, we will see them twice on every server.
    //we just register them on the dev servers so we get feedback immediately.

    try {
      guildIds.forEach(async (guildId: string) => {
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
        commands.map((command) => command.metadata.name).join(', ')
      )
    );
  }
}
