import { RedditCommand } from '../../../src/commands';

import axios from 'axios';
import { InteractionUtils } from '../../../src/utils';
import { CommandTestHelper } from '../helper';

describe('Reddit', () => {
  const helper = new CommandTestHelper(new RedditCommand());

  beforeEach(() => {
    helper.resetInput();
    jest.restoreAllMocks();
  });

  const validInputs = [
    [
      [
        { name: 'subreddit', type: 3, value: 'tifu' },
        { name: 'amount', type: 10, value: 2 },
      ],
      [
        { name: 'subreddit', type: 3, value: 'birdsarentreal' },
        { name: 'amount', type: 10, value: 20 },
        { name: 'listings', type: 3, value: 'random' },
      ],
    ],
  ];

  const invalidSubredditNames = [
    [
      [
        { name: 'subreddit', type: 3, value: 'thisNameIsALittleBitTooLong' },
        { name: 'amount', type: 10, value: 1 },
      ],
      [
        { name: 'subreddit', type: 3, value: '_underscore' },
        { name: 'amount', type: 10, value: 1 },
      ],
      [
        { name: 'subreddit', type: 3, value: '12' },
        { name: 'amount', type: 10, value: 1 },
      ],
      [
        { name: 'subreddit', type: 3, value: '12' },
        { name: 'amount', type: 10, value: 1 },
      ],
    ],
  ];

  const inexistantSubReddit = [
    { name: 'subreddit', type: 3, value: 'ich_iels' },
    { name: 'amount', type: 10, value: 1 },
  ];

  const varyingPostNumbers = [
    [
      [
        { name: 'subreddit', type: 3, value: 'birdsarentreal' },
        { name: 'amount', type: 10, value: 4 },
        { name: 'listings', type: 3, value: 'random' },
      ],
      [
        { name: 'subreddit', type: 3, value: 'birdsarentreal' },
        { name: 'amount', type: 10, value: 12 },
        { name: 'listings', type: 3, value: 'random' },
      ],
      [
        { name: 'subreddit', type: 3, value: 'birdsarentreal' },
        { name: 'amount', type: 10, value: 20 },
        { name: 'listings', type: 3, value: 'random' },
      ],
    ],
  ];

  describe.each(invalidSubredditNames)('invalid subreddit names', (input) => {
    beforeEach(() => {
      helper.setInput(input);
    });

    it('should send an error', async () => {
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

  it('should throw an error when the subreddit was not found', async () => {
    helper.setInput(inexistantSubReddit);
    await helper.executeWithError();
  });

  it.each(varyingPostNumbers)(
    'should group messages and send them in bulk',
    async (input) => {
      helper.setInput(input);
      await helper.executeInstance();
      expect(InteractionUtils.send).toHaveBeenCalledTimes(
        Math.ceil((input[1].value as number) / 5)
      );
    }
  );

  it('should throw an error when axios throws', async () => {
    helper.setInput(validInputs[0][0]);

    jest.spyOn(axios, 'get').mockImplementationOnce(() => {
      throw new Error();
    });
    await helper.executeWithError();
  });
});
