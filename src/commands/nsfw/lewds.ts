import {
  ApplicationCommandOptionType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import { ChatInputCommandInteraction, PermissionsString } from 'discord.js';

import { EventData } from '../../models/event-data';
import { lewds } from '../../services/lewds';
import { EmbedUtils, InteractionUtils } from '../../utils';
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

  //TODO: put a rate limiter here.

  public async execute(
    interaction: ChatInputCommandInteraction,
    data: EventData
  ): Promise<void> {
    const amount = interaction.options.getNumber('amount');

    const posts = lewds.getLewdsFromStash(amount, interaction.guildId);
    if (posts.length === 0) {
      InteractionUtils.sendWarning(
        interaction,
        data,
        'There are currently no more lewds available, please try again in a few minutes.'
      );
    }
    posts.forEach(async (post) => {
      const embed = EmbedUtils.infoEmbed(undefined, post.title)
        .setURL(`https://reddit.com${post.permalink}`)
        .setImage(post.url)
        .setFooter({ text: `Powered by reddit.com/r/${post.subreddit}` });
      await InteractionUtils.send(interaction, embed);
    });
  }
}