/* eslint-disable @typescript-eslint/dot-notation */
import { PingCommand } from '../../../src/commands';
import { InteractionUtils } from '../../../src/utils';
import { DiscordMock } from '../../discordMock';

describe('Ping', () => {
  const discordMock = new DiscordMock();
  let instance: PingCommand;
  const commandInteraction = discordMock.getMockCommandInteraction();
  InteractionUtils.send = jest.fn();

  beforeEach(() => {
    instance = new PingCommand();
  });

  it('should not throw an error', () => {
    expect(instance.execute(commandInteraction)).resolves.not.toThrowError();
  });

  it('should call InteractionUtils.send', async () => {
    await instance.execute(commandInteraction);
    expect(InteractionUtils.send).toHaveBeenCalled();
  });

  describe('calculateLatency', () => {
    const timestamp = 0;

    it('should not return NaN', () => {
      const time = instance['calculateLatency'](timestamp);
      expect(time).not.toBeNaN();
    });

    it('should return an integer', () => {
      const time = instance['calculateLatency'](timestamp);
      expect(Number.isInteger(time)).toEqual(true);
    });
  });

  describe('getApiLatency', () => {
    const latency = 120;

    it('should not return NaN', () => {
      const ping = instance['getApiLatency'](latency);
      expect(ping).not.toBeNaN();
    });

    it('should return an integer', () => {
      const ping = instance['getApiLatency'](latency);
      expect(Number.isInteger(ping)).toEqual(true);
    });
  });
});
