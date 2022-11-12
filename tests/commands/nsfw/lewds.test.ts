/* eslint-disable @typescript-eslint/dot-notation */
import { LewdsCommand } from '../../../src/commands';
import { NoLewdsAvailableWarning } from '../../../src/models';
import { lewds } from '../../../src/services';
import { InteractionUtils } from '../../../src/utils';
import { CommandTestHelper } from '../helper';

const input = [{ name: 'amount', type: 10, value: 10 }];

describe('Lewds', () => {
  const helper = new CommandTestHelper(new LewdsCommand());

  beforeAll(async () => {
    // we start and stop the service so we have data to work with
    await lewds.start();
    lewds.stop();
  });

  beforeEach(() => {
    helper.resetInput();
    jest.restoreAllMocks();
  });

  it('should issue a warning if no more lewds are available', async () => {
    helper.setInput(input);
    jest.spyOn(lewds, 'getLewdsFromStash').mockImplementationOnce(() => []);

    await helper.executeWithError(new NoLewdsAvailableWarning());
  });

  it('should not throw an error on valid input', async () => {
    helper.setInput(input);

    await helper.executeWithoutError();
  });

  it('should call InteractionUtils.send on valid input', async () => {
    helper.setInput(input);

    await helper.executeInstance();
    helper.expectSend();
  });

  it('should group messages and send them in chunks', async () => {
    helper.setInput(input);

    await helper.executeInstance();
    expect(InteractionUtils.send).toHaveBeenCalledTimes(
      Math.ceil((input[0].value as number) / 5)
    );
  });
});
