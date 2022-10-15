/* eslint-disable @typescript-eslint/dot-notation */
import axios from 'axios';
import { DadJokeCommand } from '../../../src/commands';
import { EventData } from '../../../src/models';
import { CommandTestHelper } from '../helper';

describe('DadJoke', () => {
  const helper = new CommandTestHelper(new DadJokeCommand());

  beforeEach(() => {
    helper.resetInput();
    jest.restoreAllMocks();
  });

  it('should not throw an error', async () => {
    await helper.executeWithoutError();
  });

  it('should call InteractionUtils.send', async () => {
    await helper.executeInstance();
    helper.expectSend();
  });

  describe('getJoke', () => {
    it('should send error if axios throws', async () => {
      axios.get = jest.fn().mockImplementationOnce(() => {
        throw new Error();
      });
      await expect(
        helper.commandInstance['getJoke'](new EventData())
      ).rejects.toThrowError();
    });
  });
});
