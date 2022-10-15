/* eslint-disable @typescript-eslint/dot-notation */
import { BofhCommand } from '../../../src/commands';
import { CommandTestHelper } from '../helper';

describe('Bofh', () => {
  const helper = new CommandTestHelper(new BofhCommand());

  beforeEach(() => {
    helper.setInput(undefined);
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
