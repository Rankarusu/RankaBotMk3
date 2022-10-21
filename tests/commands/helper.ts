import {
  ChatInputCommandInteraction,
  CommandInteractionOption,
} from 'discord.js';
import { Command } from '../../src/commands';
import { EventData } from '../../src/models';
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
    InteractionUtils.sendWarning = jest.fn();
  }

  public async executeInstance() {
    await this.commandInstance.execute(this.interaction, new EventData());
  }

  public expectSend() {
    expect(InteractionUtils.send).toHaveBeenCalled();
  }

  public async executeWithError() {
    await expect(
      this.commandInstance.execute(this.interaction, new EventData())
    ).rejects.toThrowError();
  }

  public async executeWithoutError() {
    await expect(
      this.commandInstance.execute(this.interaction, new EventData())
    ).resolves.not.toThrowError();
  }

  public async executeWithWarning() {
    await this.commandInstance.execute(this.interaction, new EventData());

    expect(InteractionUtils.sendWarning).toHaveBeenCalled();
  }

  public async executeWithoutWarning() {
    await this.commandInstance.execute(this.interaction, new EventData());

    expect(InteractionUtils.sendWarning).not.toHaveBeenCalled();
  }

  public setInput(input: CommandInteractionOption[]) {
    Reflect.set(this.interaction.options, 'data', input);
  }

  public resetInput() {
    Reflect.set(this.interaction.options, 'data', undefined);
  }
}
