import {
  ApplicationCommandOptionType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import { ChatInputCommandInteraction, PermissionsString } from 'discord.js';
import { NoLewdsAvailableWarning } from '../../models/warnings';
import { lewds } from '../../services';
import {
  ArrayUtils,
  ClientUtils,
  EmbedUtils,
  InteractionUtils,
} from '../../utils';
import { Command, CommandCategory, CommandDeferType } from '../command';

export class LewdsCommand extends Command {
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

  public usage = () => `this.mention() \`5\``;

  public cooldown = ClientUtils.APICallCommandRateLimiter();

  public category: CommandCategory = CommandCategory.NSFW;

  public deferType: CommandDeferType = CommandDeferType.PUBLIC;

  public requireClientPerms: PermissionsString[] = ['SendMessages'];

  public nsfw?: boolean = true;

  // eslint-disable-next-line require-await
  public async execute(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    const amount = interaction.options.getNumber('amount');

    const posts = lewds.getLewdsFromStash(amount, interaction.guildId);

    if (posts.length === 0) {
      throw new NoLewdsAvailableWarning();
    }

    //even though embeds of videos do not work, we use our own embeds here just to circumvent the "over 18?"-embed.
    const embeds = posts.map((post) => {
      return EmbedUtils.lewdEmbed(post);
    });

    const partitionedEmbeds = ArrayUtils.partition(embeds, 5);

    partitionedEmbeds.forEach(async (chunk) => {
      await InteractionUtils.send(interaction, chunk);
    });
  }
}
