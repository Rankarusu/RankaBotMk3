import {
  ApplicationCommandOptionType,
  ButtonStyle,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import {
  ButtonBuilder,
  ChatInputCommandInteraction,
  PermissionsString,
} from 'discord.js';
import { Command, CommandCategory, CommandDeferType } from '..';
import { EventData } from '../../models/event-data';
import { PaginationEmbed } from '../../models/pagination-embed';
import { EmbedUtils, InteractionUtils } from '../../utils';

export class TestCommand extends Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: 'test',
    description: 'test',
    dm_permission: true,
    default_member_permissions: undefined,
    options: [
      {
        name: 'test-option',
        type: ApplicationCommandOptionType.String,
        description: 'test-option-description',
      },
    ],
  };

  // cooldown?: RateLimiter;
  public helpText?: string = 'usage: /ping';

  public category: CommandCategory = CommandCategory.DEVELOPMENT;

  public deferType: CommandDeferType = CommandDeferType.PUBLIC;

  public requireClientPerms: PermissionsString[] = ['SendMessages'];

  public developerOnly?: boolean = true;

  public nsfw?: boolean = true;

  public async execute(
    interaction: ChatInputCommandInteraction,
    data: EventData
  ): Promise<void> {
    console.log(this.id);
    InteractionUtils.send(interaction, `</${this.metadata.name}:${this.id}>`);
  }
}
