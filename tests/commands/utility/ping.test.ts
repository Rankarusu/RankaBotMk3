import { PingCommand } from '../../../src/commands';
import { DiscordMock } from '../../discordMock';

import { EventData } from '../../../src/models/event-data';

describe('Ping', () => {
  const discordMock = new DiscordMock();
  let instance: PingCommand;
  const commandInteraction = discordMock.getMockCommandInteraction();
  const pongLine = new RegExp(/🏓 Pong! \d+ ms/);
  const apiLatencyLine = new RegExp(/🏸 API Latency: \d+ ms/);
  beforeEach(() => {
    instance = new PingCommand();
  });

  it('should return a number as latency', () => {
    Object.defineProperty(commandInteraction.client.ws, 'ping', { value: 118 });
    Object.defineProperty(commandInteraction, 'createdTimestamp', {
      value: new Date(),
    });
    instance.execute(commandInteraction, new EventData());
    expect(commandInteraction.reply).toHaveBeenCalledWith({
      components: undefined,
      content:
        expect.stringMatching(pongLine) &&
        expect.stringMatching(apiLatencyLine),
      ephemeral: false,
      fetchReply: true,
      files: undefined,
    });
  });

  it('should not throw an error', () => {
    expect(
      instance.execute(commandInteraction, new EventData())
    ).resolves.not.toThrowError();
  });
});
