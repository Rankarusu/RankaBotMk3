/* eslint-disable @typescript-eslint/dot-notation */
import { BofhCommand } from '../../../src/commands';
import { InteractionUtils } from '../../../src/utils';
import { DiscordMock } from '../../discordMock';

describe('Bofh', () => {
  const discordMock = new DiscordMock();
  let instance: BofhCommand;
  const commandInteraction = discordMock.getMockCommandInteraction();
  InteractionUtils.send = jest.fn();

  beforeEach(() => {
    instance = new BofhCommand();
  });

  it('should not throw an error', () => {
    expect(instance.execute(commandInteraction)).resolves.not.toThrowError();
  });

  it('should call InteractionUtils.send', async () => {
    await instance.execute(commandInteraction);
    expect(InteractionUtils.send).toHaveBeenCalled();
  });

  describe('getExcuse', () => {
    it('should return a string', () => {
      const excuse = instance['getExcuse']();
      //we cannot use instance of for literals such as strings.
      expect(typeof excuse).toEqual('string');
    });
  });
});
