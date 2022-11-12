/* eslint-disable @typescript-eslint/dot-notation */
import { Exp } from '@prisma/client';
import { CommandInteractionOption } from 'discord.js';
import { ExpCommand } from '../../../src/commands';
import {
  NotTrackedByExpWarning,
  NoUsersTrackedByExpWarning,
  PaginationEmbed,
} from '../../../src/models';
import { DbUtils } from '../../../src/utils';
import { DiscordMock } from '../../discordMock';
import { CommandTestHelper } from '../helper';
jest.mock('../../../src/models');

const discordMock = new DiscordMock();

const leaderboardInput = [{ name: 'leaderboard', type: 1, options: [] }];
const userInputSelf = [{ name: 'user', type: 1, options: [] }];
const userInput: CommandInteractionOption[] = [
  {
    name: 'user',
    type: 1,
    options: [
      {
        name: 'user',
        type: 6,
        value: '0',
        user: discordMock.getMockUser(),
        member: discordMock.newMockGuildMember(12),
      },
    ],
  },
];

const dbExp = {
  userId: '12',
  guildId: 'abc',
  level: 1,
  xp: 23,
  xpLock: new Date(),
} as Exp;

describe('Exp', () => {
  const helper = new CommandTestHelper(new ExpCommand());

  beforeAll(async () => {
    await DbUtils.upsertExp(
      dbExp.guildId,
      dbExp.userId,
      dbExp.level,
      dbExp.xp,
      dbExp.xpLock
    );
  });

  afterAll(async () => {
    await DbUtils.deleteExpById(dbExp.guildId, dbExp.userId);
  });

  beforeEach(() => {
    helper.resetInput();
    jest.restoreAllMocks();
  });

  describe('user', () => {
    beforeEach(() => {
      helper.resetInput();
      jest.restoreAllMocks();
    });

    it('should issue a warning if user is not yet tracked', async () => {
      helper.setInput(userInput);
      jest.spyOn(DbUtils, 'getExpByUser').mockResolvedValueOnce(null);

      await helper.executeWithError(new NotTrackedByExpWarning());
    });

    it('should not throw an error on valid input', async () => {
      helper.setInput(userInput);
      await helper.executeWithoutError();
    });

    it('should call InteractionUtils.send on no input', async () => {
      helper.setInput(userInputSelf);

      await helper.executeInstance();
      helper.expectSend();
    });

    it('should call InteractionUtils.send on valid input', async () => {
      helper.setInput(userInput);

      await helper.executeInstance();
      helper.expectSend();
    });
  });

  describe('leaderboard', () => {
    it('should call start', async () => {
      helper.setInput(leaderboardInput);
      helper.commandInstance['createLeaderboardFields'] = jest.fn();
      helper.commandInstance['createLeaderboardEmbed'] = jest.fn();
      await helper.executeInstance();
      expect(PaginationEmbed.prototype.start).toHaveBeenCalled();
    });

    it('should issue a warning if no users are found', async () => {
      helper.setInput(leaderboardInput);

      jest.spyOn(DbUtils, 'getExpByGuild').mockResolvedValueOnce([]);
      await helper.executeWithError(new NoUsersTrackedByExpWarning());
    });

    it('should not throw an error', async () => {
      helper.setInput(leaderboardInput);

      await helper.executeWithoutError();
    });
  });
});
