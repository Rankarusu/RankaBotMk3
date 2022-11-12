import { ChooseCommand } from '../../../src/commands';
import { InvalidInputError, TooFewOptionsWarning } from '../../../src/models';

import { CommandTestHelper } from '../helper';

const validInputs = [
  [[{ name: 'options', type: 3, value: '1,2,3,4,5,6,7,8,9,10' }]],
];

//yes, there is one bracket more than needed, but as jest tries to map these in the each() function we need another layer, since our input is and array as well.
const invalidInputs = [
  [
    [{ name: 'options', type: 3, value: ',,,,' }],
    [{ name: 'options', type: 3, value: '' }],
  ],
];

const tooFewOptions = [{ name: 'options', type: 3, value: '1' }];

describe('Choose', () => {
  const helper = new CommandTestHelper(new ChooseCommand());

  beforeEach(() => {
    helper.resetInput();
    jest.restoreAllMocks();
  });

  describe.each(invalidInputs)('invalid inputs', (input) => {
    beforeEach(() => {
      helper.setInput(input);
    });

    it('should send an error on bad input', async () => {
      await helper.executeWithError(new InvalidInputError());
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

  it('should issue a warning on too few options', async () => {
    helper.setInput(tooFewOptions);
    await helper.executeWithError(new TooFewOptionsWarning());
  });
});
