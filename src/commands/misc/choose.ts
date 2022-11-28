import {
  ApplicationCommandOptionType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import { ChatInputCommandInteraction, PermissionsString } from 'discord.js';
import { InvalidInputError, TooFewOptionsWarning } from '../../models';
import { EmbedUtils, InteractionUtils } from '../../utils';
import { Command, CommandCategory, CommandDeferType } from '../command';

export class ChooseCommand extends Command {
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
  public usage = () => `${this.mention()} \`spam, eggs\``;

  public note =
    'Click on the interaction link above the message to see all options.';

  public category: CommandCategory = CommandCategory.MISC;

  public deferType: CommandDeferType = CommandDeferType.NONE;

  public requireClientPerms: PermissionsString[] = ['SendMessages'];

  public async execute(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    const options = interaction.options.getString('options');
    let optionsArr: string[];
    try {
      optionsArr = options.split(',').map((s) => s.trim());
    } catch {
      throw new InvalidInputError();
    }

    if (optionsArr.includes('')) {
      throw new InvalidInputError();
    }

    if (optionsArr.length < 2) {
      throw new TooFewOptionsWarning();
    }

    const result = optionsArr[Math.floor(Math.random() * optionsArr.length)];
    const embed = EmbedUtils.infoEmbed(`🗳 ${result}`, 'Choose');
    await InteractionUtils.send(interaction, embed);
  }
}
