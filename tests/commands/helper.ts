import {
  ChatInputCommandInteraction,
  CommandInteractionOption,
} from 'discord.js';
import { Command } from '../../src/commands';
import { InteractionUtils } from '../../src/utils';
import { DiscordMock } from '../discordMock';
export class CommandTestHelper {
  private discordMock: DiscordMock;

  interaction: ChatInputCommandInteraction;

  commandInstance: Command;

  constructor(instance: Command) {
    this.discordMock = new DiscordMock();
    this.interaction = this.discordMock.getMockCommandInteraction();
    this.commandInstance = instance;

    InteractionUtils.send = jest.fn();
  }

  public async executeInstance() {
    await this.commandInstance.execute(this.interaction);
  }

  public expectSend() {
    expect(InteractionUtils.send).toHaveBeenCalled();
  }

  public async executeWithError(error?: Error) {
    await expect(
      this.commandInstance.execute(this.interaction)
      //because JS is dumb, we have to check the error message instead of the object.
    ).rejects.toThrowError(error.message);
  }

  public async executeWithoutError() {
    await expect(
      this.commandInstance.execute(this.interaction)
    ).resolves.not.toThrowError();
  }

  public setInput(input: CommandInteractionOption[]) {
    Reflect.set(this.interaction.options, 'data', input);
  }

  public resetInput() {
    Reflect.set(this.interaction.options, 'data', undefined);
  }
}
