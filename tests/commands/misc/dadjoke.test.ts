/* eslint-disable @typescript-eslint/dot-notation */
import { DadJokeCommand } from '../../../src/commands';
import { APICommunicationError } from '../../../src/models/errors';
import { CommandTestHelper } from '../helper';

describe('DadJoke', () => {
  const helper = new CommandTestHelper(new DadJokeCommand());

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

  it('should send error if getJoke throws', async () => {
    helper.commandInstance['getJoke'] = jest.fn().mockImplementationOnce(() => {
      throw new Error();
    });
    await helper.executeWithError(new APICommunicationError());
  });
});
