import { CoinflipCommand } from '../../../src/commands';
import { CommandTestHelper } from '../helper';

describe('Coinflip', () => {
  const helper = new CommandTestHelper(new CoinflipCommand());

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
