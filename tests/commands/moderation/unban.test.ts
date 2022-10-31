/* eslint-disable @typescript-eslint/dot-notation */
import { CommandInteractionOption } from 'discord.js';
import { UnbanCommand } from '../../../src/commands';
import { DiscordMock } from '../../discordMock';
import { CommandTestHelper } from '../helper';

const input: CommandInteractionOption[] = [
  { name: 'user-id', type: 3, value: '0' },
];

describe('Unban', () => {
  const discordMock = new DiscordMock();
  const helper = new CommandTestHelper(new UnbanCommand());
  jest
    .spyOn(UnbanCommand.prototype as any, 'getBannedUser')
    .mockImplementation(() => {
      return discordMock.newMockGuildMember();
    });

  beforeEach(() => {
    helper.resetInput();
    // jest.restoreAllMocks();
  });

  it('should throw an error if getBannedUser throws an error', async () => {
    helper.setInput(input);
    jest
      .spyOn(UnbanCommand.prototype as any, 'getBannedUser')
      .mockImplementationOnce(() => {
        throw new Error();
      });

    await helper.executeWithError();
  });

  it('should throw an error if GuildBanManager.remove throws an error', async () => {
    helper.setInput(input);
    jest
      .spyOn(helper.interaction.guild.bans, 'remove')
      .mockImplementationOnce(() => {
        throw new Error();
      });

    await helper.executeWithError();
  });

  it('should call InteractionUtils.send on valid input', async () => {
    helper.setInput(input);
    await helper.executeInstance();
    helper.expectSend();
  });

  it('should not throw an error on valid input', async () => {
    helper.setInput(input);
    await helper.executeWithoutError();
  });
});
