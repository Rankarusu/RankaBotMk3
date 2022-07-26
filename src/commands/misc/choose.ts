import {
  ApplicationCommandOptionType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import { ChatInputCommandInteraction, PermissionsString } from 'discord.js';

// eslint-disable-next-line node/no-unpublished-import
import { EventData } from '../../models/event-data';
import { EmbedUtils, InteractionUtils } from '../../utils';
import { Command, CommandCategory, CommandDeferType } from '../command';

export class ChooseCommand implements Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: 'choose',
    description: 'like eightball but less vague',
    dm_permission: true,
    options: [
      {
        name: 'options',
        type: ApplicationCommandOptionType.String,
        description: 'a comma-separated list of options',
        required: true,
      },
    ],
  };

  // cooldown?: RateLimiter;
  public helpText = '/choose spam, eggs';

  public category: CommandCategory = CommandCategory.MISC;

  public deferType: CommandDeferType = CommandDeferType.PUBLIC;

  public requireClientPerms: PermissionsString[] = ['SendMessages'];

  public async execute(
    interaction: ChatInputCommandInteraction,
    data: EventData
  ): Promise<void> {
    const options = interaction.options.getString('options');
    let optionsArr: string[];
    try {
      optionsArr = options.split(',').map((s) => s.trim());
    } catch {
      InteractionUtils.sendError(
        data,
        'Something went wrong while parsing your options, please try again'
      );
    }
    if (optionsArr.length < 2) {
      data.description = 'Tough decision you got there...';
      const embed = EmbedUtils.warnEmbed(data);
      InteractionUtils.send(interaction, embed);
      return;
    }

    const result = optionsArr[Math.floor(Math.random() * optionsArr.length)];
    const embed = EmbedUtils.infoEmbed(`🗳 ${result}`, 'Choose');
    InteractionUtils.send(interaction, embed);
  }
}
