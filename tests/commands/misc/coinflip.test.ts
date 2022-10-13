import { CoinflipCommand } from '../../../src/commands';
import { DiscordMock } from '../../discordMock';

import { EventData } from '../../../src/models/event-data';
import { InteractionUtils } from '../../../src/utils';
import { ChatInputCommandInteraction, CacheType } from 'discord.js';

describe('Coinflip', () => {
  const discordMock = new DiscordMock();
  let instance: CoinflipCommand;
  InteractionUtils.sendError = jest.fn();
  InteractionUtils.sendWarning = jest.fn();

  let commandInteraction: ChatInputCommandInteraction<CacheType>;

  beforeEach(() => {
    instance = new CoinflipCommand();
    jest.clearAllMocks();
    commandInteraction = discordMock.getMockCommandInteraction();
  });
  it('should work', () => {
    instance.execute(commandInteraction, new EventData());

    const testObj = {
      // description: expect.any(String),
      title: 'Coin flip',
      // color: expect.any(Number),
      // timestamp: expect.any(String),
    };

    expect(commandInteraction.reply).toBeCalledWith({
      components: undefined,
      embeds: expect.arrayContaining([expect.objectContaining(testObj)]),
      ephemeral: false,
      fetchReply: true,
      files: undefined,
    });
  });
});
