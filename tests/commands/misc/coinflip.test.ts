import { ChatInputCommandInteraction } from 'discord.js';
import { CoinflipCommand } from '../../../src/commands';
import { InteractionUtils } from '../../../src/utils';
import { DiscordMock } from '../../discordMock';

describe('Coinflip', () => {
  const discordMock = new DiscordMock();
  let instance: CoinflipCommand;
  InteractionUtils.send = jest.fn();
  InteractionUtils.sendError = jest.fn();
  InteractionUtils.sendWarning = jest.fn();

  let commandInteraction: ChatInputCommandInteraction;

  beforeEach(() => {
    instance = new CoinflipCommand();
    jest.clearAllMocks();
    commandInteraction = discordMock.getMockCommandInteraction();
  });

  it('should not throw an error', () => {
    expect(instance.execute(commandInteraction)).resolves.not.toThrowError();
  });

  it('should call InteractionUtils.send', async () => {
    await instance.execute(commandInteraction);
    expect(InteractionUtils.send).toHaveBeenCalled();
  });
});
