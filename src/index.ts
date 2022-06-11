import { Client } from 'discord.js';
import { REST } from '@discordjs/rest';
import { PingCommand } from './commands';
import { CommandHandler } from './events/command-handler';
import { MessageHandler } from './events/message-handler';
import { ReactionHandler } from './events/reaction-handler';
import { TriggerHandler } from './events/trigger-handler';
import { Bot } from './models/bot';
import { Reaction } from './models/reaction';
import { Trigger } from './triggers/trigger';
import { TestCommand } from './commands/test';
import { resolveTxt } from 'dns';
import {
  Routes,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import { Command } from './commands/command';

const Config = require('../config/config.json');
const rest = new REST().setToken(Config.client.token);

async function start(): Promise<void> {
  const client = new Client({
    intents: Config.client.intents,
    partials: Config.client.partials,
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
  console.log('starting to register commands');
  try {
    let commandsJson: RESTPostAPIChatInputApplicationCommandsJSONBody[] =
      commands.map((command) => command.metadata);

    await rest.put(Routes.applicationCommands(Config.client.id), {
      body: commandsJson,
    });
    console.log('finished registering commands');
  } catch (error) {
    console.error(error);
  }

  await bot.start();
}

start().catch((error) => console.error(error));
