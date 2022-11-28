import { PollCommand } from '../../../src/commands';
import { Poll } from '../../../src/models';
import { CommandTestHelper } from '../helper';
jest.mock('../../../src/models/poll');

const input = [
  { name: 'question', type: 3, value: 'what' },
  { name: 'only-one-vote', type: 5, value: true },
  { name: 'time-limit', type: 10, value: 10 },
  { name: 'option-01', type: 3, value: '1' },
  { name: 'option-02', type: 3, value: '2' },
  { name: 'option-03', type: 3, value: '3' },
  { name: 'option-04', type: 3, value: '4' },
];

describe('Poll', () => {
  const helper = new CommandTestHelper(new PollCommand());

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

  it('should call Poll.start', async () => {
    const mockedStart = jest.spyOn(Poll.prototype, 'start');

    await helper.executeInstance();
    expect(mockedStart).toHaveBeenCalled();
  });
});
