import {
  ApplicationCommandOptionType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import {
  CommandInteraction,
  MessageButton,
  PermissionString,
} from 'discord.js';
import { Command, CommandCategory, CommandDeferType } from '..';
import { EventData } from '../../models/event-data';
import { EmbedUtils, PaginationEmbed } from '../../utils';

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

  public category: CommandCategory = CommandCategory.DEVELOPMENT;

  public deferType: CommandDeferType = CommandDeferType.HIDDEN;

  public requireClientPerms: PermissionString[] = ['ADMINISTRATOR'];

  public developerOnly?: boolean = true;

  public async execute(
    interaction: CommandInteraction,
    data: EventData
  ): Promise<void> {
    const embed1 = EmbedUtils.infoEmbed('test-body 1', 'test-title 1');
    const embed2 = EmbedUtils.infoEmbed('test-body 2', 'test-title 2');
    const embed3 = EmbedUtils.infoEmbed('test-body 3', 'test-title 3');
    const embed4 = EmbedUtils.infoEmbed('test-body 4', 'test-title 4');
    const embed5 = EmbedUtils.infoEmbed('test-body 5', 'test-title 5');
    const btn1 = new MessageButton()
      .setCustomId('test-btn-1')
      .setLabel('◀')
      .setStyle('PRIMARY');
    const btn2 = new MessageButton()
      .setCustomId('test-btn-2')
      .setLabel('▶')
      .setStyle('PRIMARY');

    const pages = [embed1, embed2, embed3, embed4, embed5];

    await new PaginationEmbed(interaction, pages).start();
  }
}
