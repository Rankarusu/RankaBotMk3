/* eslint-disable @typescript-eslint/dot-notation */
import { HugCommand } from '../../../src/commands';
import { DiscordMock } from '../../discordMock';
import { CommandTestHelper } from '../helper';

const discordMock = new DiscordMock();
const user = discordMock.getMockUser();
const member = discordMock.newMockGuildMember(12);
const input = [
  {
    name: 'user',
    type: 6,
    value: '12',
    user,
    member,
  },
];

describe('Hug', () => {
  const helper = new CommandTestHelper(new HugCommand());

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
