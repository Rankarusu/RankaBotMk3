/* eslint-disable @typescript-eslint/dot-notation */
import { CommandInteractionOption, GuildMember } from 'discord.js';
import { BanCommand } from '../../../src/commands';
import {
  InvalidBanTargetError,
  UnbannableUserError,
} from '../../../src/models';
import { DiscordMock } from '../../discordMock';
import { CommandTestHelper } from '../helper';
jest.mock('../../../src/models');

function setMemberBannable(helper: CommandTestHelper, state: boolean) {
  const member = helper.interaction.options.getMember('user') as GuildMember;
  Reflect.set(member, 'bannable', state);
}

const discordMock = new DiscordMock();

const banDevInput: CommandInteractionOption[] = [
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
const banBotInput: CommandInteractionOption[] = [
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
  { name: 'delete-message-days', type: 10, value: 2 },
];

describe('Ban', () => {
  const helper = new CommandTestHelper(new BanCommand());

  beforeEach(() => {
    helper.resetInput();
    jest.restoreAllMocks();
  });

  it('should throw an error if you try to ban the bot', async () => {
    helper.setInput(banBotInput);
    setMemberBannable(helper, true);

    await helper.executeWithError(new InvalidBanTargetError());
  });

  it('should throw an error if you try to ban a dev', async () => {
    helper.setInput(banDevInput);
    setMemberBannable(helper, true);
    await helper.executeWithError(new InvalidBanTargetError());
  });

  it('should throw an error if member is not bannable', async () => {
    helper.setInput(validInput);
    setMemberBannable(helper, false);
    await helper.executeWithError(new UnbannableUserError());
  });

  it('should call InteractionUtils.send on valid input', async () => {
    helper.setInput(validInput);
    setMemberBannable(helper, true);
    await helper.executeInstance();
    helper.expectSend();
  });

  it('should not throw an error on valid input', async () => {
    helper.setInput(validInput);
    setMemberBannable(helper, true);
    await helper.executeWithoutError();
  });
});
