/* eslint-disable @typescript-eslint/dot-notation */
import { AnimeCommand } from '../../../src/commands';
import { PaginationEmbed } from '../../../src/models';
import { APICommunicationError } from '../../../src/models/errors';
import { AnimeNotFoundWarning } from '../../../src/models/warnings';

import { aniList } from '../../../src/services/anilist';
import { CommandTestHelper } from '../helper';
jest.mock('../../../src/models');
jest.mock('../../../src/services/anilist.ts');

const scheduleInput = [{ name: 'schedule', type: 1, options: [] }];
const validSearchInput = [
  {
    name: 'search',
    type: 1,
    options: [{ name: 'title', type: 3, value: 'overlord' }],
  },
];
const invalidSearchInput = [
  {
    name: 'search',
    type: 1,
    options: [{ name: 'title', type: 3, value: 'not_an_actual_anime' }],
  },
];

describe.skip('Anime', () => {
  const helper = new CommandTestHelper(new AnimeCommand());

  beforeAll(async () => {
    await aniList.start();
    aniList.stop();
  });

  beforeEach(() => {
    helper.resetInput();
    jest.restoreAllMocks();
  });

  describe('search', () => {
    it('should issue a warning if no anime was found', async () => {
      helper.setInput(invalidSearchInput);

      await helper.executeWithError(
        new AnimeNotFoundWarning('not_an_actual_anime')
      );
    });

    it('should not issue a warning on valid input', async () => {
      helper.setInput(validSearchInput);

      await helper.executeWithoutError();
    });

    it('should throw an error if api-call fails', async () => {
      helper.setInput(validSearchInput);

      jest.spyOn(aniList, 'searchMedia').mockImplementationOnce(() => {
        throw new Error();
      });

      await helper.executeWithError(new APICommunicationError());
    });

    it('should not throw an error on valid input', async () => {
      helper.setInput(validSearchInput);

      await helper.executeWithoutError();
    });

    it('should call InteractionUtils.send on valid input', async () => {
      helper.setInput(validSearchInput);

      await helper.executeInstance();
      helper.expectSend();
    });
  });

  describe('schedule', () => {
    it('should call paginationEmbed.start', async () => {
      helper.setInput(scheduleInput);

      await helper.executeInstance();
      expect(PaginationEmbed.prototype.start).toHaveBeenCalled();
    });

    it('should not throw an error', async () => {
      helper.setInput(scheduleInput);

      await helper.executeWithoutError();
    });
  });
});
