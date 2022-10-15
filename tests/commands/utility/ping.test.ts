/* eslint-disable @typescript-eslint/dot-notation */
import { PingCommand } from '../../../src/commands';
import { CommandTestHelper } from '../helper';

describe('Ping', () => {
  const helper = new CommandTestHelper(new PingCommand());

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
