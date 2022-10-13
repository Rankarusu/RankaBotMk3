/* eslint-disable @typescript-eslint/dot-notation */
import { EmbedBuilder } from 'discord.js';
import { EightballCommand } from '../../../src/commands';
import { InteractionUtils } from '../../../src/utils';
import { DiscordMock } from '../../discordMock';

describe('Eightball', () => {
  const discordMock = new DiscordMock();
  let instance: EightballCommand;
  const commandInteraction = discordMock.getMockCommandInteraction();
  Object.defineProperty(commandInteraction.options, 'data', {
    value: [{ name: 'options', type: 3, value: 'What' }],
    configurable: true,
  });

  InteractionUtils.send = jest.fn();
  InteractionUtils.sendError = jest.fn();

  beforeEach(() => {
    instance = new EightballCommand();
  });

  it('should not throw an error', () => {
    expect(instance.execute(commandInteraction)).resolves.not.toThrowError();
  });

  it('should call InteractionUtils.send', async () => {
    await instance.execute(commandInteraction);
    expect(InteractionUtils.send).toHaveBeenCalled();
  });

  describe('create8ballEmbed', () => {
    it('should return an Embed', () => {
      const embed = instance['create8ballEmbed'](
        'What is the meaning of life?',
        '42'
      );
      expect(embed).toBeInstanceOf(EmbedBuilder);
    });
  });
});
