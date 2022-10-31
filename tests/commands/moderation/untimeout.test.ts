import { CommandInteractionOption, GuildMember } from 'discord.js';
import { UntimeoutCommand } from '../../../src/commands';
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
  member.isCommunicationDisabled = jest.fn(() => state);
}

const input: CommandInteractionOption[] = [
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
];

describe('Untimeout', () => {
  const helper = new CommandTestHelper(new UntimeoutCommand());

  beforeEach(() => {
    helper.resetInput();
    jest.restoreAllMocks();
  });

  it('should issue a warning if user is not muted', async () => {
    helper.setInput(input);
    setMemberCommunicationDisabled(helper, false);

    await helper.executeWithWarning();

    setMemberCommunicationDisabled(helper, true);
  });

  it('should not issue a warning on valid input', async () => {
    helper.setInput(input);
    setMemberCommunicationDisabled(helper, true);

    await helper.executeWithoutWarning();
  });

  it('should not throw an error on valid input', async () => {
    helper.setInput(input);
    setMemberCommunicationDisabled(helper, true);

    await helper.executeWithoutError();
  });

  it('should call InteractionUtils.send on valid input', async () => {
    helper.setInput(input);
    setMemberCommunicationDisabled(helper, true);

    await helper.executeInstance();
    helper.expectSend();
  });
});
