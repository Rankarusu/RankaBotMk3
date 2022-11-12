import { CommandInteractionOption } from 'discord.js';
import { bot } from '../../../src';
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
  TimeoutCommand,
  UnbanCommand,
  UntimeoutCommand,
  UwuifyCommand,
} from '../../../src/commands';
import { CommandNotFoundError, PaginationEmbed } from '../../../src/models';
import { InteractionUtils } from '../../../src/utils';
import { CommandTestHelper } from '../helper';

jest.mock('../../../src/models/');
jest.mock('../../../src/services/anilist.ts');

const invalidCommandInput = [
  {
    name: 'command',
    type: 3,
    value: 'not_a_command',
  },
];

// not the prettiest solution, but I have no clue how I would import this.
const commands: Command[] = [
  new PingCommand(),
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

const commandInputs = commands.map((command) => [
  [
    {
      name: 'command',
      type: 3,
      value: command.metadata.name,
    },
  ] as CommandInteractionOption[],
]);

describe('Help', () => {
  const helper = new CommandTestHelper(new HelpCommand());
  InteractionUtils.canUse = jest.fn(() => true);
  bot.getCommands = jest.fn(() => commands);

  beforeEach(() => {
    helper.resetInput();
    jest.restoreAllMocks();
  });

  describe('all', () => {
    it('should not throw an error', async () => {
      helper.setInput([]);
      await helper.executeWithoutError();
    });

    it('should call start', async () => {
      helper.setInput([]);
      await helper.executeInstance();

      expect(PaginationEmbed.prototype.start).toHaveBeenCalled();
    });
  });

  describe('specific command', () => {
    it('should throw error if command is not found.', async () => {
      helper.setInput(invalidCommandInput);
      await helper.executeWithError(new CommandNotFoundError(''));
    });
  });

  describe.each(commandInputs)('%j', (input) => {
    beforeEach(() => {
      helper.setInput(input);
    });

    it('should not throw an error', async () => {
      await helper.executeWithoutError();
    });

    it('should call InteractionUtils.send', async () => {
      await helper.executeInstance();
      helper.expectSend();
    });
  });
});
