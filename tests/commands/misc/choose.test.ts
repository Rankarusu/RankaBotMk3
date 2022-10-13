import { ChooseCommand } from '../../../src/commands';
import { DiscordMock } from '../../discordMock';

import { CacheType, ChatInputCommandInteraction } from 'discord.js';
import { EventData } from '../../../src/models/event-data';
import { InteractionUtils } from '../../../src/utils';

describe('Choose', () => {
  const discordMock = new DiscordMock();
  let instance: ChooseCommand;
  InteractionUtils.send = jest.fn();
  InteractionUtils.sendError = jest.fn();
  InteractionUtils.sendWarning = jest.fn();

  let commandInteraction: ChatInputCommandInteraction<CacheType>;

  beforeEach(() => {
    instance = new ChooseCommand();
    jest.clearAllMocks();
    commandInteraction = discordMock.getMockCommandInteraction();
    Object.defineProperty(commandInteraction.options, 'data', {
      value: undefined,
      configurable: true,
    });
  });

  const validInputs = [
    {
      value: [{ name: 'options', type: 3, value: '1,2,3,4,5,6,7,8,9,10' }],
      configurable: true,
    },
  ];

  const invalidInputs = [
    {
      value: [{ name: 'options', type: 3, value: ',,,,' }],
      configurable: true,
    },
    {
      value: [{ name: 'options', type: 3, value: '' }],
      configurable: true,
    },
  ];

  const tooFewOptoions = {
    value: [{ name: 'options', type: 3, value: '1' }],
    configurable: true,
  };

  describe.each(invalidInputs)('invalid inputs', (input) => {
    beforeEach(() => {
      Object.defineProperty(commandInteraction.options, 'data', input);
    });

    it('should send an error on bad input', async () => {
      await instance.execute(commandInteraction, new EventData());

      expect(InteractionUtils.sendError).toHaveBeenCalled();
    });

    it('should not call InteractionUtils.send on bad input', async () => {
      await instance.execute(commandInteraction, new EventData());

      expect(InteractionUtils.send).not.toHaveBeenCalled();
    });
  });

  describe.each(validInputs)('valid inputs', (input) => {
    beforeEach(() => {
      Object.defineProperty(commandInteraction.options, 'data', input);
    });

    it('should not send an error with proper input', async () => {
      await instance.execute(commandInteraction, new EventData());

      expect(InteractionUtils.sendError).not.toHaveBeenCalled();
    });

    it('should call InteractionUtils.send on proper input', async () => {
      await instance.execute(commandInteraction, new EventData());

      expect(InteractionUtils.send).toHaveBeenCalled();
    });
  });

  it('should issue a warning on too few options', async () => {
    Object.defineProperty(commandInteraction.options, 'data', tooFewOptoions);

    await instance.execute(commandInteraction, new EventData());

    expect(InteractionUtils.sendWarning).toHaveBeenCalled();
  });
});
