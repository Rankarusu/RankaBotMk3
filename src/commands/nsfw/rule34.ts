import {
  ApplicationCommandOptionType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import { ChatInputCommandInteraction, PermissionsString } from 'discord.js';
import {
  APICommunicationError,
  Rule34Post,
  WeirdTastesWarning,
} from '../../models';
import { ClientUtils, EmbedUtils, InteractionUtils } from '../../utils';
import { RequestUtils } from '../../utils/request-utils';
import { Command, CommandCategory, CommandDeferType } from '../command';

const limit = 100;
const url = `https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&`;

export class Rule34Command extends Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: 'rule34',
    description: 'browse rule34',
    dm_permission: false,
    options: [
      {
        name: 'tag-01',
        type: ApplicationCommandOptionType.String,
        description: 'a tag to search for',
        required: true,
      },
      {
        name: 'tag-02',
        type: ApplicationCommandOptionType.String,
        description: 'a tag to search for',
        required: false,
      },
      {
        name: 'tag-03',
        type: ApplicationCommandOptionType.String,
        description: 'a tag to search for',
        required: false,
      },
      {
        name: 'tag-04',
        type: ApplicationCommandOptionType.String,
        description: 'a tag to search for',
        required: false,
      },
      {
        name: 'tag-05',
        type: ApplicationCommandOptionType.String,
        description: 'a tag to search for',
        required: false,
      },
      {
        name: 'tag-06',
        type: ApplicationCommandOptionType.String,
        description: 'a tag to search for',
        required: false,
      },
      {
        name: 'tag-07',
        type: ApplicationCommandOptionType.String,
        description: 'a tag to search for',
        required: false,
      },
      {
        name: 'tag-08',
        type: ApplicationCommandOptionType.String,
        description: 'a tag to search for',
        required: false,
      },
      {
        name: 'tag-09',
        type: ApplicationCommandOptionType.String,
        description: 'a tag to search for',
        required: false,
      },
      {
        name: 'tag-10',
        type: ApplicationCommandOptionType.String,
        description: 'a tag to search for',
        required: false,
      },
    ],
  };

  public usage = () =>
    `${this.mention()} \`1girls\` \`gloves\` \`fate_(series)\``;

  public cooldown = ClientUtils.APICallCommandRateLimiter();

  public category: CommandCategory = CommandCategory.NSFW;

  public deferType: CommandDeferType = CommandDeferType.PUBLIC;

  public requireClientPerms: PermissionsString[] = ['SendMessages'];

  public nsfw?: boolean = true;

  public async execute(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    const tags = interaction.options.data
      .filter((option) => option.name.match(/tag-\d\d/g))
      .map((tag) => tag.value) as string[];

    let posts: Rule34Post[];

    try {
      posts = await RequestUtils.getBooruPosts<Rule34Post>(url, tags, limit);
    } catch (error) {
      throw new APICommunicationError();
    }

    if (posts.length === 0) {
      //R34 API still sends a string on no results
      throw new WeirdTastesWarning();
    }

    const post = posts[Math.floor(Math.random() * posts.length)];

    const embed = EmbedUtils.r34Embed(post);

    await InteractionUtils.send(interaction, embed);
  }
}
