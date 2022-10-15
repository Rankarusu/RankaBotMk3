/* eslint-disable @typescript-eslint/dot-notation */
import { Sticker } from '@prisma/client';
import { StickerCommand } from '../../../src/commands';
import { EventData, StickerListSelectEmbed } from '../../../src/models';
import { DbUtils, InteractionUtils } from '../../../src/utils';
import { DiscordMock } from '../../discordMock';
jest.mock('../../../src/models');

const validPostInput = [
  {
    name: 'post',
    type: 1,
    options: [{ name: 'name', type: 3, value: 'stickerName' }],
  },
];

const invalidPostInput = [
  {
    name: 'post',
    type: 1,
    options: [{ name: 'name', type: 3, value: 'not_a_sticker_name' }],
  },
];

const addInput = [
  {
    name: 'add',
    type: 1,
    options: [
      { name: 'name', type: 3, value: 'stickerName' },
      {
        name: 'image',
        type: 11,
        value: '0',
        attachment: {
          attachment:
            'https://cdn.discordapp.com/ephemeral-attachments/0/0/0.gif',
          name: '1430737471383.gif',
          id: '1030784728187539537',
          size: 95504,
          url: 'https://cdn.discordapp.com/ephemeral-attachments/0/0/0.gif',
          proxyURL:
            'https://media.discordapp.net/ephemeral-attachments/0/0/0.gif',
          height: 132,
          width: 100,
          contentType: 'image/gif',
          description: null,
          ephemeral: true,
        },
      },
    ],
  },
];

const addInputInvalidType = [
  {
    name: 'add',
    type: 1,
    options: [
      { name: 'name', type: 3, value: 'stickerName' },
      {
        name: 'image',
        type: 11,
        value: '0',
        attachment: {
          attachment:
            'https://cdn.discordapp.com/ephemeral-attachments/0/0/0.gif',
          name: '1430737471383.gif',
          id: '1030784728187539537',
          size: 95504,
          url: 'https://cdn.discordapp.com/ephemeral-attachments/0/0/0.gif',
          proxyURL:
            'https://media.discordapp.net/ephemeral-attachments/0/0/0.gif',
          height: 132,
          width: 100,
          contentType: 'image/bmp',
          description: null,
          ephemeral: true,
        },
      },
    ],
  },
];

const listInput = [{ name: 'list', type: 1, options: [] }];

const dbSticker: Sticker = {
  interactionId: '0',
  userId: '0',
  guildId: 'abc',
  stickerName: 'stickerName',
  stickerUrl: 'some.url',
  invokeTime: new Date(),
};

describe('Sticker', () => {
  const discordMock = new DiscordMock();
  let instance: StickerCommand;
  let data: EventData;
  const commandInteraction = discordMock.getMockCommandInteraction();
  commandInteraction.guildId = 'abc';
  InteractionUtils.send = jest.fn();
  // InteractionUtils.sendError = jest.fn();

  beforeEach(() => {
    instance = new StickerCommand();
    data = new EventData();
    jest.restoreAllMocks();
  });

  beforeAll(async () => {
    await DbUtils.deleteStickersById(['0']);
  });

  afterAll(async () => {
    await DbUtils.deleteStickersById(['0']);
  });

  describe('sticker post', () => {
    beforeAll(async () => {
      await DbUtils.createSticker(dbSticker);
    });

    afterAll(async () => {
      await DbUtils.deleteStickersById(['0']);
    });

    it('should throw an error if sticker was not found', async () => {
      Reflect.set(commandInteraction.options, 'data', invalidPostInput);

      await expect(
        instance.execute(commandInteraction, data)
      ).rejects.toThrowError();
    });

    it('should not throw an error on valid input', async () => {
      Reflect.set(commandInteraction.options, 'data', validPostInput);

      await expect(
        instance.execute(commandInteraction, data)
      ).rejects.toThrowError();
    });

    it('should call InteractionUtils.send on valid input', async () => {
      Reflect.set(commandInteraction.options, 'data', validPostInput);
      instance['createStickerEmbed'] = jest.fn();
      await instance.execute(commandInteraction, data);
      expect(InteractionUtils.send).toHaveBeenCalled();
    });
  });

  describe('sticker add', () => {
    beforeEach(async () => {
      Reflect.set(commandInteraction.options, 'data', undefined);
      await DbUtils.deleteStickersById(['0']); // deletemany does not throw an error if record does not exist
    });

    it('should throw an error if a sticker with that name already exists', async () => {
      Reflect.set(commandInteraction.options, 'data', addInput);
      await DbUtils.createSticker(dbSticker);
      await expect(
        instance.execute(commandInteraction, data)
      ).rejects.toThrowError();
    });

    it('should throw an error if the type is invalid', async () => {
      Reflect.set(commandInteraction.options, 'data', addInputInvalidType);
      await expect(
        instance.execute(commandInteraction, data)
      ).rejects.toThrowError();
    });

    it('should throw an error if the database raises an error', async () => {
      Reflect.set(commandInteraction.options, 'data', addInput);
      jest.spyOn(DbUtils, 'createSticker').mockImplementationOnce(() => {
        throw new Error();
      });
      await expect(
        instance.execute(commandInteraction, data)
      ).rejects.toThrowError();
    });

    it('should not throw an error on valid input', async () => {
      Reflect.set(commandInteraction.options, 'data', addInput);
      await expect(
        instance.execute(commandInteraction, data)
      ).resolves.not.toThrowError();
    });

    it('should call InteractionUtils.send on valid input', async () => {
      Reflect.set(commandInteraction.options, 'data', addInput);
      await instance.execute(commandInteraction, data);
      expect(InteractionUtils.send).toHaveBeenCalled();
    });
  });

  describe('sticker list', () => {
    it('should call start', async () => {
      Reflect.set(commandInteraction.options, 'data', listInput);
      await instance.execute(commandInteraction, data);
      expect(StickerListSelectEmbed.prototype.start).toHaveBeenCalled();
    });
  });
});
