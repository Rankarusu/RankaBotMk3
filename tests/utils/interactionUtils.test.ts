import { CacheType, CommandInteraction } from 'discord.js';
import { PingCommand } from '../../src/commands';
import { InteractionUtils } from '../../src/utils';
import { DiscordMock } from '../discordMock';

describe('InteractionUtils', () => {
  let commandInteraction: CommandInteraction<CacheType>;
  beforeEach(() => {
    const discordMock = new DiscordMock();
    jest.clearAllMocks();
    commandInteraction = discordMock.getMockCommandInteraction();
  });

  describe('canUse', () => {
    it('should fetch DMChannel id interaction.channel === null', () => {
      Reflect.set(commandInteraction, 'channel', null);
      commandInteraction.user.createDM = jest.fn();

      InteractionUtils.canUse(new PingCommand(), commandInteraction);

      expect(commandInteraction.user.createDM).not.toHaveBeenCalled();
    });
  });
});
