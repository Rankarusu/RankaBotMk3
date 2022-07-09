import { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { CommandInteraction, PermissionString } from 'discord.js';
import { EventData } from '../models/event-data';
import { InteractionUtils } from '../utils';
import { Command, CommandDeferType } from './command';

export class TestCommand implements Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: 'test',
    description: 'test',
    dm_permission: true,
    default_member_permissions: undefined,
    //   {
    //     name: 'test-option',
    //     type: ApplicationCommandOptionType.String,
    //     description: 'test-option-description',
    //     required: true,
    //     choices: [
    //       {
    //         name: 'test-option-choice-A',
    //         value: 'A',
    //       },
    //       {
    //         name: 'test-option-choice-B',
    //         value: 'B',
    //       },
    //     ],
    //   },
    //   {
    //     name: 'test-option2',
    //     type: ApplicationCommandOptionType.String,
    //     description: 'test-option-description',
    //     required: true,
    //     choices: [
    //       {
    //         name: 'test-option-choice-A',
    //         value: 'A',
    //       },
    //       {
    //         name: 'test-option-choice-B',
    //         value: 'B',
    //       },
    //     ],
    //   },
    // ],
  };

  // cooldown?: RateLimiter;
  public helpText?: string = 'usage: /ping';

  public deferType: CommandDeferType = CommandDeferType.HIDDEN;

  public requireClientPerms: PermissionString[] = ['ADMINISTRATOR'];

  public developerOnly?: boolean = true;

  public async execute(
    interaction: CommandInteraction,
    data: EventData
  ): Promise<void> {
    // await InteractionUtils.send(interaction, 'Test', true);
    data.description = 'Test failed';
    await this.sendError(interaction, data);
  }

  private async sendError(
    interaction: CommandInteraction,
    data: EventData
  ): Promise<void> {
    {
      console.log();
      await InteractionUtils.send(interaction, 'Thanks for testing!');
    }
  }
}
