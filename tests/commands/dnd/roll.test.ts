import { RollCommand } from '../../../src/commands';

import { CommandTestHelper } from '../helper';

const validInputs = [
  [
    [{ name: 'dice', type: 3, value: '3d8 +5' }],
    [{ name: 'dice', type: 3, value: '100d100' }],
    [{ name: 'dice', type: 3, value: '20W12' }],
    [{ name: 'dice', type: 3, value: '10d8 -14 ' }],
    [{ name: 'dice', type: 3, value: '10d8- 14 + 4d6' }],
    [{ name: 'dice', type: 3, value: '10d8 -- 14 + 4d6' }],
  ],
];

//yes, there is one bracket more than needed, but as jest tries to map these in the each() function we need another layer, since our input is and array as well.
const invalidInputs = [
  [
    [{ name: 'dice', type: 3, value: '101d100' }],
    [{ name: 'dice', type: 3, value: '100d101' }],
    [{ name: 'dice', type: 3, value: '1w0' }],
    [{ name: 'dice', type: 3, value: 'not_a_die' }],
    [{ name: 'dice', type: 3, value: '13' }],
    [{ name: 'dice', type: 3, value: '1x5' }],
  ],
];

describe('Roll', () => {
  const helper = new CommandTestHelper(new RollCommand());

  beforeEach(() => {
    helper.resetInput();
    jest.restoreAllMocks();
  });

  describe.each(invalidInputs)('invalid inputs', (input) => {
    beforeEach(() => {
      helper.setInput(input);
    });

    it('should send an error on bad input', async () => {
      await helper.executeWithError();
    });
  });

  describe.each(validInputs)('valid inputs', (input) => {
    beforeEach(() => {
      helper.setInput(input);
    });

    it('should not send an error with proper input', async () => {
      await helper.executeWithoutError();
    });

    it('should call InteractionUtils.send on proper input', async () => {
      await helper.executeInstance();
      helper.expectSend();
    });
  });
});
