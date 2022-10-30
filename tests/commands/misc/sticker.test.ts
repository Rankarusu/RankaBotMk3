/* eslint-disable @typescript-eslint/dot-notation */
import { Sticker } from '@prisma/client';
import { Attachment, CommandInteractionOption } from 'discord.js';
import { StickerCommand } from '../../../src/commands';
import { StickerListSelectEmbed } from '../../../src/models';
import { DbUtils } from '../../../src/utils';
import { CommandTestHelper } from '../helper';
jest.mock('../../../src/models');

const validPostInput: CommandInteractionOption[] = [
  {
    name: 'post',
    type: 1,
    options: [{ name: 'name', type: 3, value: 'stickerName' }],
  },
];

const invalidPostInput: CommandInteractionOption[] = [
  {
    name: 'post',
    type: 1,
    options: [{ name: 'name', type: 3, value: 'not_a_sticker_name' }],
  },
];

const addInput: CommandInteractionOption[] = [
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
          name: '0.gif',
          id: '0',
          size: 256,
          url: 'https://cdn.discordapp.com/ephemeral-attachments/0/0/0.gif',
          proxyURL:
            'https://media.discordapp.net/ephemeral-attachments/0/0/0.gif',
          height: 100,
          width: 100,
          contentType: 'image/gif',
          description: null,
          ephemeral: true,
        } as Attachment,
      },
    ],
  },
];

const addInputInvalidType: CommandInteractionOption[] = [
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
          name: '0.gif',
          id: '0',
          size: 256,
          url: 'https://cdn.discordapp.com/ephemeral-attachments/0/0/0.gif',
          proxyURL:
            'https://media.discordapp.net/ephemeral-attachments/0/0/0.gif',
          height: 100,
          width: 100,
          contentType: 'image/bmp',
          description: null,
          ephemeral: true,
        } as Attachment,
      },
    ],
  },
];

const listInput: CommandInteractionOption[] = [
  { name: 'list', type: 1, options: [] },
];

const dbSticker: Sticker = {
  interactionId: '0',
  userId: '0',
  guildId: 'abc',
  stickerName: 'stickerName',
  stickerUrl: 'some.url',
  invokeTime: new Date(),
};

describe('Sticker', () => {
  const helper = new CommandTestHelper(new StickerCommand());

  beforeEach(() => {
    helper.resetInput();
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
      helper.setInput(invalidPostInput);

      await helper.executeWithError();
    });

    it('should not throw an error on valid input', async () => {
      helper.setInput(validPostInput);

      await helper.executeWithError();
    });

    it('should call InteractionUtils.send on valid input', async () => {
      helper.setInput(validPostInput);
      helper.commandInstance['createStickerEmbed'] = jest.fn();
      await helper.executeInstance();
      helper.expectSend();
    });
  });

  describe('sticker add', () => {
    beforeEach(async () => {
      await DbUtils.deleteStickersById(['0']); // deletemany does not throw an error if record does not exist
    });

    it('should throw an error if a sticker with that name already exists', async () => {
      helper.setInput(addInput);
      await DbUtils.createSticker(dbSticker);
      await helper.executeWithError();
    });

    it('should throw an error if the type is invalid', async () => {
      helper.setInput(addInputInvalidType);
      await helper.executeWithError();
    });

    it('should throw an error if the database raises an error', async () => {
      helper.setInput(addInput);
      jest.spyOn(DbUtils, 'createSticker').mockImplementationOnce(() => {
        throw new Error();
      });
      await helper.executeWithError();
    });

    it('should not throw an error on valid input', async () => {
      helper.setInput(addInput);
      await helper.executeWithoutError();
    });

    it('should call InteractionUtils.send on valid input', async () => {
      helper.setInput(addInput);
      await helper.executeInstance();
      helper.expectSend();
    });
  });

  describe('sticker list', () => {
    it('should call start', async () => {
      helper.setInput(listInput);
      await helper.executeInstance();
      expect(StickerListSelectEmbed.prototype.start).toHaveBeenCalled();
    });
  });
});
