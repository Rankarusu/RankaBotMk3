import {
  ApplicationCommandOptionType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import { CommandInteraction, PermissionString } from 'discord.js';
import { Command, CommandDeferType } from '..';
import { EventData } from '../../models/event-data';
import { InteractionUtils } from '../../utils';

export class TestCommand implements Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: 'test',
    description: 'test',
    dm_permission: true,
    default_member_permissions: undefined,
    options: [
      {
        name: 'test-option',
        type: ApplicationCommandOptionType.SubcommandGroup,
        description: 'test-option-description',

        options: [
          {
            name: 'test-option1',
            type: ApplicationCommandOptionType.Subcommand,
            description: 'test-option-description1',

            options: [
              {
                name: 'test-option2',
                type: ApplicationCommandOptionType.String,
                description: 'test-option-description',
              },
              {
                name: 'test-option3',
                type: ApplicationCommandOptionType.String,
                description: 'test-option-description',
              },
            ],
          },
          {
            name: 'test-option10',
            type: ApplicationCommandOptionType.Subcommand,
            description: 'test-option-description1',

            options: [
              {
                name: 'test-option20',
                type: ApplicationCommandOptionType.String,
                description: 'test-option-description',
              },
              {
                name: 'test-option30',
                type: ApplicationCommandOptionType.String,
                description: 'test-option-description',
              },
            ],
          },
        ],
      },
    ],
  };

  // cooldown?: RateLimiter;
  public helpText?: string = 'usage: /ping';

  public category: string =
    __dirname.split('/')[__dirname.split('/').length - 1];

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
