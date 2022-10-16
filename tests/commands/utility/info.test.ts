/* eslint-disable @typescript-eslint/dot-notation */
import { InfoCommand } from '../../../src/commands';
import { CommandTestHelper } from '../helper';

describe('Info', () => {
  const helper = new CommandTestHelper(new InfoCommand());
  helper.commandInstance['getKnownUsers'] = jest.fn().mockReturnValue(50);
  beforeEach(() => {
    helper.resetInput();
    jest.restoreAllMocks();
  });

  it('should not throw an error', async () => {
    await helper.executeWithoutError();
  });

  it('should call InteractionUtils.send', async () => {
    await helper.executeInstance();
    helper.expectSend();
  });
});
