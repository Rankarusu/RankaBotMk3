/* eslint-disable @typescript-eslint/dot-notation */
import axios from 'axios';
import { EmbedBuilder } from 'discord.js';
import { FactCommand } from '../../../src/commands';
import { EventData } from '../../../src/models';
import { InteractionUtils } from '../../../src/utils';
import { DiscordMock } from '../../discordMock';

describe('Fact', () => {
  const discordMock = new DiscordMock();
  let instance: FactCommand;
  const data = new EventData();
  const commandInteraction = discordMock.getMockCommandInteraction();
  InteractionUtils.send = jest.fn();
  InteractionUtils.sendError = jest.fn();

  beforeEach(() => {
    instance = new FactCommand();
  });

  it('should not throw an error', () => {
    expect(
      instance.execute(commandInteraction, data)
    ).resolves.not.toThrowError();
  });

  it('should call InteractionUtils.send', async () => {
    await instance.execute(commandInteraction, data);
    expect(InteractionUtils.send).toHaveBeenCalled();
  });

  describe('getFact', () => {
    it('should return a string', async () => {
      const fact = await instance['getFact'](data);
      //we cannot use instance of for literals such as strings.
      expect(typeof fact).toEqual('string');
    });

    it('should send error if axios throws', async () => {
      axios.get = jest.fn().mockImplementationOnce(() => {
        throw new Error();
      });
      await instance['getFact'](data);
      expect(InteractionUtils.sendError).toHaveBeenCalled();
    });
  });

  describe('createFactEmbed', () => {
    it('should return an Embed', () => {
      const embed = instance['createFactEmbed']('fun fact');
      expect(embed).toBeInstanceOf(EmbedBuilder);
    });
  });
});
