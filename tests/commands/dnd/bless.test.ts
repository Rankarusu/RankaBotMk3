/* eslint-disable @typescript-eslint/dot-notation */
import { BlessCommand } from '../../../src/commands';
import { InteractionUtils } from '../../../src/utils';
import { CommandTestHelper } from '../helper';

describe('Bless', () => {
  const helper = new CommandTestHelper(new BlessCommand());
  jest.useFakeTimers();

  beforeEach(() => {
    // helper.resetInput();
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('should not throw an error', async () => {
    await helper.executeWithoutError();
  });

  it('should call InteractionUtils.send', async () => {
    await helper.executeInstance();
    helper.expectSend();
  });

  it('should call InteractionUtils.send 5 + 1 times', async () => {
    //initial message + 5 timed messages
    await helper.executeInstance();
    jest.runAllTimers();
    expect(InteractionUtils.send).toHaveBeenCalledTimes(6);
  });
});
