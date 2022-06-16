import { REST } from '@discordjs/rest';
import { Client, IntentsString, PartialTypes } from 'discord.js';
import { Command, PingCommand, TestCommand } from './commands';
import {
  CommandHandler,
  MessageHandler,
  ReactionHandler,
  TriggerHandler,
} from './events';
import { Bot } from './models/bot';
import { Reaction } from './models/reaction';
import { Trigger } from './triggers';

import {
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  Routes,
} from 'discord-api-types/v10';

import { Logger } from './services';

const Config = require('../config/config.json');
const LogMessages = require('../config/logs.json');
const rest = new REST().setToken(Config.client.token);

async function start(): Promise<void> {
  const client = new Client({
    intents: Config.client.intents as IntentsString[],
    partials: Config.client.partials as PartialTypes[],
  });

  //Commands
  let commands: Command[] = [new PingCommand(), new TestCommand()].sort(
    (a, b) => (a.metadata.name < b.metadata.name ? -1 : 1)
  );

  //Reactions
  let reactions: Reaction[] = [];

  //Triggers
  let triggers: Trigger[] = [];

  //Event Handlers
  let commandHandler = new CommandHandler(commands);
  let triggerHandler = new TriggerHandler(triggers);
  let messageHandler = new MessageHandler(triggerHandler);
  let reactionHandler = new ReactionHandler(reactions);

  //Bot
  let bot = new Bot(
    Config.client.token,
    client,
    messageHandler,
    commandHandler,
    reactionHandler
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

  await bot.start();
}

start().catch((error) => Logger.error(LogMessages.error.unspecified, error));
