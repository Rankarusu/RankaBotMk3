import { UwuifyCommand } from '../../../src/commands';
import { CommandTestHelper } from '../helper';

const input = [
  {
    name: 'text',
    type: 3,
    value:
      'Danchou Danchou! Because the boss of this GW is male I have no motivation to beat my meat and will have to withdraw from the competition. I hope I will not be harassed as I am a straight man and refuse to engage in meat beating activities focused towards another man. I believe we should have a sufficient quantity of female members in the crew who are highly motivated to flap their meat slabs towards this masculine GW boss. Alternatively, you may find that some of our male members are also attracted to the abs and pecs provided by this overly sexualised male Guild Wars boss!. In either case, I wish you all the best of luck as I drown in anime catgirl tiddies for the next week.',
  },
];

describe('Uwuify', () => {
  const helper = new CommandTestHelper(new UwuifyCommand());

  beforeEach(() => {
    helper.resetInput();
    jest.restoreAllMocks();
  });

  it('should not throw an error', async () => {
    helper.setInput(input);

    await helper.executeWithoutError();
  });

  it('should call InteractionUtils.send', async () => {
    helper.setInput(input);

    await helper.executeInstance();
    helper.expectSend();
  });
});
