/* eslint-disable @typescript-eslint/dot-notation */
import { FactCommand } from '../../../src/commands';
import { APICommunicationError } from '../../../src/models';
import { CommandTestHelper } from '../helper';

describe('Fact', () => {
  const helper = new CommandTestHelper(new FactCommand());

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

  it('should send error if getFact throws', async () => {
    helper.commandInstance['getFact'] = jest.fn().mockImplementationOnce(() => {
      throw new Error();
    });
    await helper.executeWithError(new APICommunicationError());
  });
});
