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
    Reflect.set(commandInteraction.options, 'data', undefined);
  });

  const validInputs = [
    [[{ name: 'options', type: 3, value: '1,2,3,4,5,6,7,8,9,10' }]],
  ];

  //yes, there is one bracket more than needed, but as jest tries to map these in the each() function we need another layer, since our input is and array as well.
  const invalidInputs = [
    [
      [{ name: 'options', type: 3, value: ',,,,' }],
      [{ name: 'options', type: 3, value: '' }],
    ],
  ];

  const tooFewOptoions = [{ name: 'options', type: 3, value: '1' }];

  describe.each(invalidInputs)('invalid inputs', (input) => {
    beforeEach(() => {
      Reflect.set(commandInteraction.options, 'data', input);
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
      Reflect.set(commandInteraction.options, 'data', input);
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
    Reflect.set(commandInteraction.options, 'data', tooFewOptoions);

    await instance.execute(commandInteraction, new EventData());

    expect(InteractionUtils.sendWarning).toHaveBeenCalled();
  });
});
