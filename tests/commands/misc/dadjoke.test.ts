/* eslint-disable @typescript-eslint/dot-notation */
import axios from 'axios';
import { EmbedBuilder } from 'discord.js';
import { DadJokeCommand } from '../../../src/commands';
import { EventData } from '../../../src/models';
import { InteractionUtils } from '../../../src/utils';
import { DiscordMock } from '../../discordMock';

describe('DadJoke', () => {
  const discordMock = new DiscordMock();
  let instance: DadJokeCommand;
  const data = new EventData();
  const commandInteraction = discordMock.getMockCommandInteraction();
  InteractionUtils.send = jest.fn();
  InteractionUtils.sendError = jest.fn();

  beforeEach(() => {
    instance = new DadJokeCommand();
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

  describe('getJoke', () => {
    it('should return a string', async () => {
      const joke = await instance['getJoke'](data);
      //we cannot use instance of for literals such as strings.
      expect(typeof joke).toEqual('string');
    });

    it('should send error if axios throws', async () => {
      axios.get = jest.fn().mockImplementationOnce(() => {
        throw new Error();
      });
      await instance['getJoke'](data);
      expect(InteractionUtils.sendError).toHaveBeenCalled();
    });
  });

  describe('createDadJokeEmbed', () => {
    it('should return an Embed', () => {
      const embed = instance['createDadJokeEmbed']('funny joke');
      expect(embed).toBeInstanceOf(EmbedBuilder);
    });
  });
});
