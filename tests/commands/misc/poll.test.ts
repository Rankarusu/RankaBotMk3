import { ChatInputCommandInteraction } from 'discord.js';
import { PollCommand } from '../../../src/commands';
import { Poll } from '../../../src/models';
import { InteractionUtils } from '../../../src/utils';
import { DiscordMock } from '../../discordMock';

describe('Poll', () => {
  const discordMock = new DiscordMock();
  let instance: PollCommand;
  InteractionUtils.send = jest.fn();
  InteractionUtils.sendError = jest.fn();
  InteractionUtils.sendWarning = jest.fn();

  const mockedStart = (Poll.prototype.start = jest.fn());

  let commandInteraction: ChatInputCommandInteraction;

  const validInput = [
    { name: 'question', type: 3, value: 'what' },
    { name: 'only-one-vote', type: 5, value: true },
    { name: 'time-limit', type: 10, value: 10 },
    { name: 'option-01', type: 3, value: '1' },
    { name: 'option-02', type: 3, value: '2' },
    { name: 'option-03', type: 3, value: '3' },
    { name: 'option-04', type: 3, value: '4' },
  ];

  beforeEach(() => {
    instance = new PollCommand();
    jest.clearAllMocks();
    commandInteraction = discordMock.getMockCommandInteraction();
    Reflect.set(commandInteraction.options, 'data', validInput);
  });

  it('should not throw an error', () => {
    expect(instance.execute(commandInteraction)).resolves.not.toThrowError();
  });

  it('should call Poll.start', async () => {
    await instance.execute(commandInteraction);
    expect(mockedStart).toHaveBeenCalled();
  });
});
