import { REST } from '@discordjs/rest';
import { Client, IntentsString, PartialTypes } from 'discord.js';
import { Command, PingCommand, RemindCommand, TestCommand } from './commands';
import {
  CommandHandler,
  MessageHandler,
  ReactionHandler,
  SelectMenuHandler,
  TriggerHandler,
} from './events';
import { Bot } from './models/bot';
import { Reaction } from './models/reaction';
import { Trigger } from './triggers';

import {
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  Routes,
} from 'discord-api-types/v10';

import { Db, Logger } from './services';
import { ReminderScheduler } from './services/reminder';

import Config from '../config/config.json';
import LogMessages from '../logs/logs.json';
import { SelectMenu } from './menus/select-menu';
import { DeleteReminderSelectMenu } from './menus/delete-reminder-menu';
const rest = new REST().setToken(Config.client.token);

async function start(): Promise<void> {
  const client = new Client({
    intents: Config.client.intents as IntentsString[],
    partials: Config.client.partials as PartialTypes[],
  });

  //Commands
  let commands: Command[] = [
    new PingCommand(),
    new TestCommand(),
    new RemindCommand(),
  ].sort((a, b) => (a.metadata.name < b.metadata.name ? -1 : 1));

  //Reactions
  let reactions: Reaction[] = [];

  //Triggers
  let triggers: Trigger[] = [];

  //Select Menus
  let menus: SelectMenu[] = [new DeleteReminderSelectMenu()];

  //Event Handlers
  let commandHandler = new CommandHandler(commands);
  let triggerHandler = new TriggerHandler(triggers);
  let messageHandler = new MessageHandler(triggerHandler);
  let reactionHandler = new ReactionHandler(reactions);
  let selectMenuHandler = new SelectMenuHandler(menus);

  //Bot
  let bot = new Bot(
    Config.client.token,
    client,
    messageHandler,
    commandHandler,
    reactionHandler,
    selectMenuHandler
  );

  //Register Commands
  try {
    let commandsJson: RESTPostAPIChatInputApplicationCommandsJSONBody[] =
      commands.map((command) => command.metadata);

    Logger.info(
      LogMessages.info.commandActionCreating.replaceAll(
        '{COMMAND_LIST}',
        commands.map((command) => command.metadata.name).join('\n')
      )
    );

    await rest.put(Routes.applicationCommands(Config.client.id), {
      body: commandsJson,
    });
  } catch (error) {
    Logger.error(LogMessages.error.commandActionCreating, error);
  }

  //Connect to Database
  try {
    await Db.$connect(); //technically not necessary, but will retrieve first call immediately
    Logger.info(LogMessages.info.databaseConnect);
  } catch (error) {
    Logger.error(LogMessages.error.databaseConnect, error);
  }

  //start reminder scheduler
  const reminderScheduler = new ReminderScheduler(client);
  reminderScheduler.start();

  //Finally start the bot
  await bot.start();
}

process.on('unhandledRejection', (error) => {
  Logger.error(LogMessages.error.unhandledRejection, error);
});

start().catch((error) => Logger.error(LogMessages.error.unspecified, error));
