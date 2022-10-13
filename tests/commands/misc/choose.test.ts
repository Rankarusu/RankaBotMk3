import { ChooseCommand } from '../../../src/commands';
import { DiscordMock } from '../../discordMock';

import { EventData } from '../../../src/models/event-data';
import { InteractionUtils } from '../../../src/utils';
import { ChatInputCommandInteraction, CacheType } from 'discord.js';

describe('Choose', () => {
  const discordMock = new DiscordMock();
  let instance: ChooseCommand;
  InteractionUtils.sendError = jest.fn();
  InteractionUtils.sendWarning = jest.fn();

  let commandInteraction: ChatInputCommandInteraction<CacheType>;

  beforeEach(() => {
    instance = new ChooseCommand();
    jest.clearAllMocks();
    commandInteraction = discordMock.getMockCommandInteraction();
  });

  it('sends error on bad input', () => {
    Object.defineProperty(commandInteraction.options, 'data', {
      value: [{ name: 'options', type: 3, value: ',,,,' }],
      configurable: true,
    });

    instance.execute(commandInteraction, new EventData());

    expect(InteractionUtils.sendError).toHaveBeenCalled();
  });

  it('does not send an error with proper input', () => {
    Object.defineProperty(commandInteraction.options, 'data', {
      value: [{ name: 'options', type: 3, value: '1,2,3,4,5,6,7,8,9,10' }],
      configurable: true,
    });

    instance.execute(commandInteraction, new EventData());

    expect(InteractionUtils.sendError).not.toHaveBeenCalled();
  });

  it('issues a warning on too few options', () => {
    Object.defineProperty(commandInteraction.options, 'data', {
      value: [{ name: 'options', type: 3, value: '1' }],
      configurable: true,
    });

    instance.execute(commandInteraction, new EventData());

    expect(InteractionUtils.sendWarning).toHaveBeenCalled();
  });
});
