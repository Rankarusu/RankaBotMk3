/* eslint-disable @typescript-eslint/dot-notation */
import { EightballCommand } from '../../../src/commands';
import { CommandTestHelper } from '../helper';

const input = [{ name: 'options', type: 3, value: 'What' }];

describe('Eightball', () => {
  const helper = new CommandTestHelper(new EightballCommand());

  beforeEach(() => {
    // helper.resetInput();
    jest.restoreAllMocks();
  });

  beforeAll(() => {
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
