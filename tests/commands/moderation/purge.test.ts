/* eslint-disable @typescript-eslint/dot-notation */
import { CommandInteractionOption } from 'discord.js';
import { PurgeCommand } from '../../../src/commands';
import { CommandTestHelper } from '../helper';

const input: CommandInteractionOption[] = [
  { name: 'amount', type: 10, value: 20 },
];

describe('Purge', () => {
  const helper = new CommandTestHelper(new PurgeCommand());

  beforeEach(() => {
    helper.resetInput();
    jest.restoreAllMocks();
  });

  it('should throw an error if bulkDelete throws an error', async () => {
    helper.setInput(input);
    jest
      .spyOn(helper.interaction.channel, 'bulkDelete')
      .mockImplementationOnce(() => {
        throw new Error();
      });

    await helper.executeWithError();
  });

  it('should call InteractionUtils.send on valid input', async () => {
    helper.setInput(input);
    await helper.executeInstance();
    helper.expectSend();
  });

  it('should not throw an error on valid input', async () => {
    helper.setInput(input);
    await helper.executeWithoutError();
  });
});
