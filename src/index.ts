import { REST } from '@discordjs/rest';
import {
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  Routes,
} from 'discord-api-types/v10';
import { Client, GatewayIntentsString, Partials } from 'discord.js';
import {
  Autocomplete,
  CommandAutocomplete,
  PokemonAutocomplete,
} from './autocompletes';
import {
  AnimeCommand,
  BanCommand,
  BlessCommand,
  BofhCommand,
  ChooseCommand,
  CoinflipCommand,
  Command,
  DadJokeCommand,
  DanbooruCommand,
  DexCommand,
  EightballCommand,
  ExpCommand,
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
import { SelectMenu } from './menus';
import { Bot, Reaction } from './models';
import {
  ActivityScheduler,
  aniList,
  Db,
  ExpScheduler,
  lewds,
  Logger,
  ReminderScheduler,
  Scheduler,
} from './services';
import LogMessages from './static/logs.json';
import {
  AyyTrigger,
  BeckonTrigger,
  ExpTrigger,
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
    new BlessCommand(),
    new ExpCommand(),
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
    new ExpTrigger(),
  ];

  // Select Menus
  const menus: SelectMenu[] = [];

  // Autocompletes
  const autocompletes: Autocomplete[] = [
    new CommandAutocomplete(),
    new PokemonAutocomplete(),
  ];

  // Event Handlers
  const commandHandler = new CommandHandler(commands);
  const triggerHandler = new TriggerHandler(triggers);
  const messageHandler = new MessageHandler(triggerHandler);
  const reactionHandler = new ReactionHandler(reactions);
  const selectMenuHandler = new SelectMenuHandler(menus);
  const autoCompleteHandler = new AutoCompleteHandler(autocompletes);

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

  // Start Schedulers
  const schedulers: Scheduler[] = [
    new ReminderScheduler(client),
    new ActivityScheduler(client),
    new ExpScheduler(client),
    aniList,
    lewds,
  ];

  schedulers.forEach((scheduler) => scheduler.start());

  // Finally start the bot
  await bot.start();
}

process.on('unhandledRejection', (error) => {
  Logger.error(LogMessages.error.unhandledRejection, error);
});

start().catch((error) => Logger.error(LogMessages.error.unspecified, error));
