import { REST } from '@discordjs/rest';
import { Client, IntentsString, PartialTypes } from 'discord.js';
import {
  Command,
  HelpCommand,
  PingCommand,
  RemindCommand,
  TestCommand,
} from './commands';
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

import { ActivityScheduler, Db, Logger } from './services';
import { ReminderScheduler } from './services/reminder';

// eslint-disable-next-line node/no-unpublished-import
import Config from '../config/config.json';
import LogMessages from '../logs/logs.json';
import { DeleteReminderSelectMenu } from './menus/delete-reminder-menu';
import { SelectMenu } from './menus/select-menu';
const rest = new REST().setToken(Config.client.token);

//for help command
export let bot: Bot;

async function start(): Promise<void> {
  const client = new Client({
    intents: Config.client.intents as IntentsString[],
    partials: Config.client.partials as PartialTypes[],
  });

  //Commands
  const commands: Command[] = [
    new PingCommand(),
    new TestCommand(),
    new RemindCommand(),
    new HelpCommand(),
  ].sort((a, b) => (a.metadata.name < b.metadata.name ? -1 : 1));

  //Reactions
  const reactions: Reaction[] = [];

  //Triggers
  const triggers: Trigger[] = [];

  //Select Menus
  const menus: SelectMenu[] = [new DeleteReminderSelectMenu()];

  //Event Handlers
  const commandHandler = new CommandHandler(commands);
  const triggerHandler = new TriggerHandler(triggers);
  const messageHandler = new MessageHandler(triggerHandler);
  const reactionHandler = new ReactionHandler(reactions);
  const selectMenuHandler = new SelectMenuHandler(menus);

  //Bot
  bot = new Bot(
    Config.client.token,
    client,
    messageHandler,
    commandHandler,
    reactionHandler,
    selectMenuHandler
  );

  //register help command so it can get all other commands from the handler
  //Idea is postponed until we can have dynamic choices or more than 25 at a time.
  // bot.registerHelpCommand();

  //Register Commands
  let commandsJson: RESTPostAPIChatInputApplicationCommandsJSONBody[];
  try {
    commandsJson = commands.map((command) => command.metadata);

    Logger.info(
      LogMessages.info.commandActionCreating.replaceAll(
        '{COMMAND_LIST}',
        commands.map((command) => command.metadata.name).join('\n')
      )
    );

    //globally
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

  //start schedulers
  const reminderScheduler = new ReminderScheduler(client);
  reminderScheduler.start();
  const activityScheduler = new ActivityScheduler(client);
  activityScheduler.start();

  //Finally start the bot
  await bot.start();
}

process.on('unhandledRejection', (error) => {
  Logger.error(LogMessages.error.unhandledRejection, error);
});

start().catch((error) => Logger.error(LogMessages.error.unspecified, error));
