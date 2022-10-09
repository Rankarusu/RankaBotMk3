import { BofhCommand } from '../../../src/commands';
import { DiscordMock } from '../../discordMock';

import { EventData } from '../../../src/models/event-data';

describe('Bofh', () => {
  const discordMock = new DiscordMock();
  let instance: BofhCommand;
  const commandInteraction = discordMock.getMockCommandInteraction();
  beforeEach(() => {
    instance = new BofhCommand();
  });

  it('should send an embed', () => {
    instance.execute(commandInteraction, new EventData());
    expect(commandInteraction.reply).toHaveBeenCalledWith(
      expect.objectContaining({
        embeds: [expect.anything()],
      })
    );
  });

  it('should not throw an error', () => {
    expect(
      instance.execute(commandInteraction, new EventData())
    ).resolves.not.toThrowError();
  });
});
