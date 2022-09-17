import {
  ApplicationCommandOptionType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import { ChatInputCommandInteraction, PermissionsString } from 'discord.js';

import { EventData } from '../../models/event-data';
import { Command, CommandCategory, CommandDeferType } from '../command';

export class LewdsCommand implements Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: 'lewds',
    description:
      'a stream of carefully selected pieces of art for cultured people',
    dm_permission: false,
    options: [
      {
        name: 'amount',
        type: ApplicationCommandOptionType.Number,
        description: 'how many lewds to obtain',
        required: true,
        min_value: 1,
        max_value: 20,
      },
    ],
  };

  // cooldown?: RateLimiter;
  public helpText = '/lewds `5`';

  public category: CommandCategory = CommandCategory.NSFW;

  public deferType: CommandDeferType = CommandDeferType.PUBLIC;

  public requireClientPerms: PermissionsString[] = ['SendMessages'];

  public nsfw?: boolean = true;

  public async execute(
    interaction: ChatInputCommandInteraction,
    data: EventData
  ): Promise<void> {}
}
