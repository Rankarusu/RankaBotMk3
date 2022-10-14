/* eslint-disable @typescript-eslint/dot-notation */
import { HugCommand } from '../../../src/commands';
import { InteractionUtils } from '../../../src/utils';
import { DiscordMock } from '../../discordMock';

describe('Hug', () => {
  const discordMock = new DiscordMock();
  const user = discordMock.getMockUser();
  const member = discordMock.newMockGuildMember(12);
  let instance: HugCommand;
  const commandInteraction = discordMock.getMockCommandInteraction();
  InteractionUtils.send = jest.fn();

  Reflect.set(commandInteraction.options, 'data', [
    {
      name: 'user',
      type: 6,
      value: '12',
      user,
      member,
    },
  ]);

  beforeEach(() => {
    instance = new HugCommand();
  });

  it('should not throw an error', () => {
    expect(instance.execute(commandInteraction)).resolves.not.toThrowError();
  });

  it('should call InteractionUtils.send', async () => {
    await instance.execute(commandInteraction);
    expect(InteractionUtils.send).toHaveBeenCalled();
  });
});
