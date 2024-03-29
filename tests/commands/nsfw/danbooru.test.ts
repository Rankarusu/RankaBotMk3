/* eslint-disable @typescript-eslint/dot-notation */
import { DanbooruCommand } from '../../../src/commands';
import { APICommunicationError, WeirdTastesWarning } from '../../../src/models';
import { RequestUtils } from '../../../src/utils/request-utils';
import { CommandTestHelper } from '../helper';

const validInput = [
  { name: 'tag-01', type: 3, value: 'nude' },
  { name: 'tag-02', type: 3, value: 'armpits' },
];

const invalidInput = [{ name: 'tag-01', type: 3, value: 'not_a_tag' }];

describe('Danbooru', () => {
  const helper = new CommandTestHelper(new DanbooruCommand());

  beforeEach(() => {
    helper.resetInput();
    jest.restoreAllMocks();
  });

  it('should throw an error if getBooruPosts throws', async () => {
    helper.setInput(validInput);
    jest.spyOn(RequestUtils, 'getBooruPosts').mockImplementationOnce(() => {
      throw new Error();
    });
    await helper.executeWithError(new APICommunicationError());
  });

  it('should issue a warning on invalid input', async () => {
    helper.setInput(invalidInput);

    await helper.executeWithError(new WeirdTastesWarning());
  });

  it('should not throw an error on valid input', async () => {
    helper.setInput(validInput);

    await helper.executeWithoutError();
  });

  it('should call InteractionUtils.send on valid input', async () => {
    helper.setInput(validInput);

    await helper.executeInstance();
    helper.expectSend();
  });
});
