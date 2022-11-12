import { CommandInteractionOption, GuildMember } from 'discord.js';
import { TimeoutCommand } from '../../../src/commands';
import {
  AlreadyTimedOutWarning,
  TimeoutAPILimitWarning,
  TimeParseError,
} from '../../../src/models';
import { DiscordMock } from '../../discordMock';
import { CommandTestHelper } from '../helper';

const discordMock = new DiscordMock();

function setMemberTimeout(helper: CommandTestHelper, until: Date) {
  const member = helper.interaction.options.getMember('user') as GuildMember;
  Reflect.set(member, 'communicationDisabledUntil', until);
}

function setMemberCommunicationDisabled(
  helper: CommandTestHelper,
  state: boolean
) {
  const member = helper.interaction.options.getMember('user') as GuildMember;
  // Reflect.set(member, '', state);
  member.isCommunicationDisabled = jest.fn(() => state);
}

const invalidTimeInputs: CommandInteractionOption[][][] = [
  [
    [
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
          { name: 'until', type: 3, value: 'abcdefg' },
          { name: 'reason', type: 3, value: 'being an idiot' },
        ],
      },
    ],
    [
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
          { name: 'until', type: 3, value: '2 days ago' },
        ],
      },
    ],
  ],
];
const alreadyMutedInput: CommandInteractionOption[] = [
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
      { name: 'until', type: 3, value: 'in 1 week' },
      { name: 'reason', type: 3, value: 'being an idiot' },
    ],
  },
];
const DurationTooLongInput: CommandInteractionOption[] = [
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
      { name: 'until', type: 3, value: 'in 5 weeks' },
      { name: 'reason', type: 3, value: 'being an idiot' },
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
      { name: 'until', type: 3, value: 'in 2 weeks' },
      { name: 'reason', type: 3, value: 'being an idiot' },
    ],
  },
  { name: 'reason', type: 3, value: 'being stupid' },
];

describe('Timeout', () => {
  const helper = new CommandTestHelper(new TimeoutCommand());

  beforeEach(() => {
    helper.resetInput();
    jest.restoreAllMocks();
  });

  it.each(invalidTimeInputs)(
    'should throw an error on failed time parsing',
    async (input) => {
      helper.setInput(input);
      setMemberCommunicationDisabled(helper, false);
      await helper.executeWithError(new TimeParseError(''));
    }
  );

  it('should throw an error if timeout is longer than API-Limit', async () => {
    helper.setInput(DurationTooLongInput);
    setMemberCommunicationDisabled(helper, false);
    await helper.executeWithError(new TimeoutAPILimitWarning());
  });

  it('should issue a warning if user is already timed out', async () => {
    helper.setInput(alreadyMutedInput);
    const now = new Date();
    const in2weeks = new Date(now.setDate(now.getDate() + 2 * 7));
    setMemberTimeout(helper, in2weeks);
    setMemberCommunicationDisabled(helper, true);

    await helper.executeWithError(
      new AlreadyTimedOutWarning(
        helper.interaction.member as GuildMember,
        in2weeks
      )
    );

    setMemberTimeout(helper, null);
    setMemberCommunicationDisabled(helper, false);
  });

  it('should not throw an error on valid input', async () => {
    helper.setInput(validInput);
    setMemberCommunicationDisabled(helper, false);
    await helper.executeWithoutError();
  });

  it('should call InteractionUtils.send on valid input', async () => {
    helper.setInput(validInput);
    setMemberCommunicationDisabled(helper, false);
    await helper.executeInstance();
    helper.expectSend();
  });
});
