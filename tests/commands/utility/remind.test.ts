/* eslint-disable @typescript-eslint/dot-notation */
import { CommandInteractionOption } from 'discord.js';
import { RemindCommand } from '../../../src/commands';
import {
  PingInInputError,
  ReminderCreationError,
  ReminderIntervalTooShortError,
  ReminderLimitError,
  ReminderListSelectEmbed,
  TimeParseError,
} from '../../../src/models';
import { DbUtils } from '../../../src/utils';
import { CommandTestHelper } from '../helper';
jest.mock('../../../src/models');

const validSetInput: CommandInteractionOption[] = [
  {
    name: 'set',
    type: 1,
    options: [
      { name: 'time', type: 3, value: 'tomorrow' },
      { name: 'notification-text', type: 3, value: 'bleh' },
    ],
  },
];

const unparsableInput: CommandInteractionOption[] = [
  {
    name: 'set',
    type: 1,
    options: [
      { name: 'time', type: 3, value: 'asfsadfasd' },
      { name: 'notification-text', type: 3, value: 'bleh' },
    ],
  },
];

const tooSoonInput: CommandInteractionOption[] = [
  {
    name: 'set',
    type: 1,
    options: [
      { name: 'time', type: 3, value: 'in 1 minute' },
      { name: 'notification-text', type: 3, value: 'bleh' },
    ],
  },
];

const pingInput: CommandInteractionOption[] = [
  {
    name: 'set',
    type: 1,
    options: [
      { name: 'time', type: 3, value: 'tomorrow' },
      { name: 'notification-text', type: 3, value: 'pinging <@000>' },
    ],
  },
];

const listInput: CommandInteractionOption[] = [
  { name: 'list', type: 1, options: [] },
];

describe('Remind', () => {
  const helper = new CommandTestHelper(new RemindCommand());

  beforeEach(() => {
    helper.resetInput();
    jest.restoreAllMocks();
  });

  describe('reminder set', () => {
    beforeEach(async () => {
      await DbUtils.deleteRemindersById(['0']); // deletemany does not throw an error if record does not exist
    });
    afterAll(async () => {
      await DbUtils.deleteRemindersById(['0']); // deletemany does not throw an error if record does not exist
    });

    it('should throw an error if date was not parsable', async () => {
      helper.setInput(unparsableInput);
      await helper.executeWithError(new TimeParseError(''));
    });

    it('should throw an error if notice is too short', async () => {
      helper.setInput(tooSoonInput);
      await helper.executeWithError(new ReminderIntervalTooShortError());
    });

    it('should throw an error if user tries to ping someone', async () => {
      helper.setInput(pingInput);
      await helper.executeWithError(new PingInInputError());
    });

    it('should throw an error if the database raises an error', async () => {
      helper.setInput(validSetInput);
      jest.spyOn(DbUtils, 'createReminder').mockImplementationOnce(() => {
        throw new Error();
      });
      await helper.executeWithError(new ReminderCreationError());
    });

    it('should not throw an error on valid input', async () => {
      helper.setInput(validSetInput);
      await helper.executeWithoutError();
    });

    it('should throw an error if too many reminders are set', async () => {
      helper.setInput(validSetInput);
      jest
        .spyOn(DbUtils, 'getReminderCountByUserId')
        // eslint-disable-next-line require-await
        .mockImplementationOnce(async () => 100);
      await helper.executeWithError(new ReminderLimitError());
    });

    it('should call InteractionUtils.send on valid input', async () => {
      helper.setInput(validSetInput);
      await helper.executeInstance();
      helper.expectSend();
    });
  });

  describe('reminder list', () => {
    it('should call start', async () => {
      helper.setInput(listInput);
      await helper.executeInstance();
      expect(ReminderListSelectEmbed.prototype.start).toHaveBeenCalled();
    });
  });
});
