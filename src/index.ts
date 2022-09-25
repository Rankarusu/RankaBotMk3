import { REST } from '@discordjs/rest';
import {
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  Routes,
} from 'discord-api-types/v10';
import { Client, GatewayIntentsString, Partials } from 'discord.js';
import {
  AnimeCommand,
  BanCommand,
  BofhCommand,
  ChooseCommand,
  CoinflipCommand,
  Command,
  DadJokeCommand,
  DanbooruCommand,
  DexCommand,
  EightballCommand,
  FactCommand,
  HelpCommand,
  HugCommand,
  InfoCommand,
  KickCommand,
  LewdsCommand,
  PingCommand,
  PollCommand,
  PurgeCommand,
  RedditCommand,
  RemindCommand,
  RollCommand,
  Rule34Command,
  StickerCommand,
  TarotCommand,
  TestCommand,
  TimeoutCommand,
  UnbanCommand,
  UntimeoutCommand,
  UwuifyCommand,
} from './commands';
import {
  AutoCompleteHandler,
  CommandHandler,
  MessageHandler,
  ReactionHandler,
  SelectMenuHandler,
  TriggerHandler,
} from './events';
import { SelectMenu } from './menus/select-menu';
import { Bot } from './models/bot';
import { Reaction } from './models/reaction';
import { ActivityScheduler, Db, Logger } from './services';
import { aniList } from './services/anilist';
import { lewds } from './services/lewds';
import { ReminderScheduler } from './services/reminder';
import LogMessages from './static/logs/logs.json';
import {
  AyyTrigger,
  BeckonTrigger,
  FTrigger,
  FubukinstrumentTrigger,
  KingCrimsonTrigger,
  MarcoTrigger,
  NoUTrigger,
  OwoTrigger,
  PotOfGreedTrigger,
  Trigger,
} from './triggers';

const Config = require('../config/config.json');

const rest = new REST().setToken(Config.client.token);

// for help command
export let bot: Bot;

async function start(): Promise<void> {
  const client = new Client({
    intents: Config.client.intents as GatewayIntentsString[],

    partials: Config.client.partials.map(
      (partial) => Partials[partial]
    ) as Partials[],
  });

  // Commands
  const commands: Command[] = [
    new PingCommand(),
    new TestCommand(),
    new RemindCommand(),
    new HelpCommand(),
    new KickCommand(),
    new BanCommand(),
    new UnbanCommand(),
    new PurgeCommand(),
    new TimeoutCommand(),
    new UntimeoutCommand(),
    new InfoCommand(),
    new CoinflipCommand(),
    new EightballCommand(),
    new ChooseCommand(),
    new TarotCommand(),
    new BofhCommand(),
    new HugCommand(),
    new DadJokeCommand(),
    new FactCommand(),
    new PollCommand(),
    new StickerCommand(),
    new AnimeCommand(),
    new DexCommand(),
    new Rule34Command(),
    new DanbooruCommand(),
    new LewdsCommand(),
    new RedditCommand(),
    new UwuifyCommand(),
    new RollCommand(),
  ].sort((a, b) => (a.metadata.name < b.metadata.name ? -1 : 1));

  // Reactions
  const reactions: Reaction[] = [];

  // Triggers
  const triggers: Trigger[] = [
    new AyyTrigger(),
    new BeckonTrigger(),
    new FTrigger(),
    new FubukinstrumentTrigger(),
    new KingCrimsonTrigger(),
    new MarcoTrigger(),
    new NoUTrigger(),
    new OwoTrigger(),
    new PotOfGreedTrigger(),
  ];

  // Select Menus
  const menus: SelectMenu[] = [];

  // Event Handlers
  const commandHandler = new CommandHandler(commands);
  const triggerHandler = new TriggerHandler(triggers);
  const messageHandler = new MessageHandler(triggerHandler);
  const reactionHandler = new ReactionHandler(reactions);
  const selectMenuHandler = new SelectMenuHandler(menus);
  const autoCompleteHandler = new AutoCompleteHandler();

  // Bot
  bot = new Bot(
    Config.client.token,
    client,
    messageHandler,
    commandHandler,
    reactionHandler,
    selectMenuHandler,
    autoCompleteHandler
  );

  // Register Commands
  let commandsJson: RESTPostAPIChatInputApplicationCommandsJSONBody[];
  try {
    commandsJson = commands.map((command) => command.metadata);

    Logger.info(
      LogMessages.info.commandActionCreating.replaceAll(
        '{COMMAND_LIST}',
        commands.map((command) => command.metadata.name).join(', ')
      )
    );

    // globally
    await rest.put(Routes.applicationCommands(Config.client.id), {
      body: commandsJson,
    });
  } catch (error) {
    Logger.error(LogMessages.error.commandActionCreating, error);
  }

  // Connect to Database
  try {
    await Db.$connect(); // technically not necessary, but will retrieve first call immediately
    Logger.info(LogMessages.info.databaseConnect);
  } catch (error) {
    Logger.error(LogMessages.error.databaseConnect, error);
    return;
  }

  // start schedulers
  const reminderScheduler = new ReminderScheduler(client);
  reminderScheduler.start();
  const activityScheduler = new ActivityScheduler(client);
  activityScheduler.start();
  const aniListScheduler = aniList;
  aniListScheduler.start();
  const lewdsScheduler = lewds;
  await lewdsScheduler.start();

  // Finally start the bot
  await bot.start();
}

process.on('unhandledRejection', (error) => {
  Logger.error(LogMessages.error.unhandledRejection, error);
});

start().catch((error) => Logger.error(LogMessages.error.unspecified, error));
