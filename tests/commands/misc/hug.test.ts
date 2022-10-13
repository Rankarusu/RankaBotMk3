/* eslint-disable @typescript-eslint/dot-notation */
import { EmbedBuilder } from 'discord.js';
import { HugCommand } from '../../../src/commands';
import { InteractionUtils } from '../../../src/utils';
import { DiscordMock } from '../../discordMock';

const Config = require('../../../config/config.json');

describe('Hug', () => {
  const discordMock = new DiscordMock();
  const user = discordMock.getMockUser();
  const member = discordMock.newMockGuildMember(12);
  let instance: HugCommand;
  const commandInteraction = discordMock.getMockCommandInteraction();
  InteractionUtils.send = jest.fn();

  Object.defineProperty(commandInteraction.options, 'data', {
    value: [
      {
        name: 'user',
        type: 6,
        value: '12',
        user,
        member,
      },
    ],
    configurable: true,
  });

  beforeEach(() => {
    instance = new HugCommand();
  });

  it('should not throw an error', () => {
    // expect(instance.execute(commandInteraction)).resolves.not.toThrowError();
  });

  it('should call InteractionUtils.send', async () => {
    await instance.execute(commandInteraction);
    expect(InteractionUtils.send).toHaveBeenCalled();
  });

  describe('createHugEmbed', () => {
    it('should return an Embed', () => {
      const embed = instance['createHugEmbed'](member, member);
      expect(embed).toBeInstanceOf(EmbedBuilder);
    });
  });
});
