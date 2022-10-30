/* eslint-disable @typescript-eslint/dot-notation */
import { CommandInteractionOption, GuildMember } from 'discord.js';
import { KickCommand } from '../../../src/commands';
import { DiscordMock } from '../../discordMock';
import { CommandTestHelper } from '../helper';
jest.mock('../../../src/models');

function setMemberKickable(helper: CommandTestHelper, state: boolean) {
  const member = helper.interaction.options.getMember('user') as GuildMember;
  Reflect.set(member, 'kickable', state);
}

const discordMock = new DiscordMock();

const kickDevInput: CommandInteractionOption[] = [
  {
    name: 'user',
    type: 1,
    options: [
      {
        name: 'user',
        type: 6,
        value: '0',
        user: discordMock.getMockUser(),
        member: discordMock.getDevMember(),
      },
    ],
  },
];
const kickBotInput: CommandInteractionOption[] = [
  {
    name: 'user',
    type: 1,
    options: [
      {
        name: 'user',
        type: 6,
        value: '0',
        user: discordMock.getMockUser(),
        member: discordMock.getBotMember(),
      },
    ],
  },
];
const validInput: CommandInteractionOption[] = [
  {
    name: 'user',
    type: 1,
    options: [
      {
        name: 'user',
        type: 6,
        value: '0',
        user: discordMock.getMockUser(),
        member: discordMock.newMockGuildMember(),
      },
    ],
  },
  { name: 'reason', type: 3, value: 'being stupid' },
];

describe('Kick', () => {
  const helper = new CommandTestHelper(new KickCommand());

  beforeEach(() => {
    helper.resetInput();
    jest.restoreAllMocks();
  });

  it('should throw an error if you try to kick the bot', async () => {
    helper.setInput(kickBotInput);
    setMemberKickable(helper, true);

    await helper.executeWithError();
  });

  it('should throw an error if you try to kick a dev', async () => {
    helper.setInput(kickDevInput);
    setMemberKickable(helper, true);
    await helper.executeWithError();
  });

  it('should throw an error if member is not kickable', async () => {
    helper.setInput(validInput);
    setMemberKickable(helper, false);
    await helper.executeWithError();
  });

  it('should call InteractionUtils.send on valid input', async () => {
    helper.setInput(validInput);
    setMemberKickable(helper, true);
    await helper.executeInstance();
    helper.expectSend();
  });

  it('should not throw an error on valid input', async () => {
    helper.setInput(validInput);
    setMemberKickable(helper, true);
    await helper.executeWithoutError();
  });
});
