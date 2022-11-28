import { CommandInteractionOption } from 'discord.js';
import { getCommandList } from '../../../src';
import { Command, HelpCommand } from '../../../src/commands';
import { CommandNotFoundError } from '../../../src/models';
import { PaginationEmbed } from '../../../src/models/pagination/pagination-embed';
import { InteractionUtils } from '../../../src/utils';
import { CommandTestHelper } from '../helper';

jest.mock('../../../src/services');

const invalidCommandInput = [
  {
    name: 'command',
    type: 3,
    value: 'not_a_command',
  },
];

// not the prettiest solution, but I have no clue how I would import this.
const commands: Command[] = getCommandList();

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
  const helpCommand = new HelpCommand();
  helpCommand.commands = commands;
  const helper = new CommandTestHelper(helpCommand);
  InteractionUtils.canUse = jest.fn(() => true);
  PaginationEmbed.prototype.start = jest.fn();

  beforeEach(() => {
    helper.resetInput();
    // jest.restoreAllMocks();
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
      await helper.executeWithError(new CommandNotFoundError('not_a_command'));
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
