import { RedditCommand } from '../../../src/commands';
import { DiscordMock } from '../../discordMock';

import axios from 'axios';
import { CacheType, ChatInputCommandInteraction } from 'discord.js';
import { EventData } from '../../../src/models/event-data';
import { InteractionUtils } from '../../../src/utils';

describe('Reddit', () => {
  const discordMock = new DiscordMock();
  let instance: RedditCommand;
  InteractionUtils.send = jest.fn();
  InteractionUtils.sendError = jest.fn();

  let commandInteraction: ChatInputCommandInteraction<CacheType>;

  beforeEach(() => {
    instance = new RedditCommand();
    jest.clearAllMocks();
    commandInteraction = discordMock.getMockCommandInteraction();
    Reflect.set(commandInteraction.options, 'data', undefined);
  });

  const validInputs = [
    [
      [
        { name: 'subreddit', type: 3, value: 'tifu' },
        { name: 'amount', type: 10, value: 2 },
      ],
      [
        { name: 'subreddit', type: 3, value: 'birdsarentreal' },
        { name: 'amount', type: 10, value: 20 },
        { name: 'listings', type: 3, value: 'random' },
      ],
    ],
  ];

  const invalidSubredditNames = [
    [
      [
        { name: 'subreddit', type: 3, value: 'thisNameIsALittleBitTooLong' },
        { name: 'amount', type: 10, value: 1 },
      ],
      [
        { name: 'subreddit', type: 3, value: '_underscore' },
        { name: 'amount', type: 10, value: 1 },
      ],
      [
        { name: 'subreddit', type: 3, value: '12' },
        { name: 'amount', type: 10, value: 1 },
      ],
      [
        { name: 'subreddit', type: 3, value: '12' },
        { name: 'amount', type: 10, value: 1 },
      ],
    ],
  ];

  const inexistantSubReddit = [
    { name: 'subreddit', type: 3, value: 'ich_iels' },
    { name: 'amount', type: 10, value: 1 },
  ];

  const twentyPosts = [
    { name: 'subreddit', type: 3, value: 'birdsarentreal' },
    { name: 'amount', type: 10, value: 20 },
    { name: 'listings', type: 3, value: 'random' },
  ];

  describe.each(invalidSubredditNames)('invalid subreddit names', (input) => {
    beforeEach(() => {
      Reflect.set(commandInteraction.options, 'data', input);
    });

    it('should send an error', async () => {
      await instance.execute(commandInteraction, new EventData());

      expect(InteractionUtils.sendError).toHaveBeenCalled();
    });

    it('should not call InteractionUtils.send', async () => {
      await instance.execute(commandInteraction, new EventData());

      expect(InteractionUtils.send).not.toHaveBeenCalled();
    });
  });

  describe.each(validInputs)('valid inputs', (input) => {
    beforeEach(() => {
      Reflect.set(commandInteraction.options, 'data', input);
    });

    it('should not send an error with proper input', async () => {
      await instance.execute(commandInteraction, new EventData());

      expect(InteractionUtils.sendError).not.toHaveBeenCalled();
    });

    it('should call InteractionUtils.send on proper input', async () => {
      await instance.execute(commandInteraction, new EventData());

      expect(InteractionUtils.send).toHaveBeenCalled();
    });
  });

  it('should throw an error when the subreddit was not found', async () => {
    Reflect.set(commandInteraction.options, 'data', inexistantSubReddit);
    await instance.execute(commandInteraction, new EventData());
    expect(InteractionUtils.sendError).toHaveBeenCalled();
  });

  it('should group messages and send them in bulk', async () => {
    Reflect.set(commandInteraction.options, 'data', twentyPosts);

    await instance.execute(commandInteraction, new EventData());
    expect(InteractionUtils.send).toHaveBeenCalledTimes(
      (twentyPosts[1].value as number) / 5
    );
  });

  it('should throw an error when axios throws', async () => {
    Reflect.set(commandInteraction.options, 'data', twentyPosts);

    const fakeGet = jest.spyOn(axios, 'get').mockImplementationOnce(() => {
      throw new Error();
    });
    await instance.execute(commandInteraction, new EventData());
    expect(InteractionUtils.sendError).toHaveBeenCalled();

    fakeGet.mockRestore();
  });
});
