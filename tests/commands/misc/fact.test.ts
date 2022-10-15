/* eslint-disable @typescript-eslint/dot-notation */
import axios from 'axios';
import { FactCommand } from '../../../src/commands';
import { EventData } from '../../../src/models';
import { CommandTestHelper } from '../helper';

describe('Fact', () => {
  const helper = new CommandTestHelper(new FactCommand());

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

  describe('getFact', () => {
    it('should send error if axios throws', async () => {
      axios.get = jest.fn().mockImplementationOnce(() => {
        throw new Error();
      });
      await expect(
        helper.commandInstance['getFact'](new EventData())
      ).rejects.toThrowError();
    });
  });
});
