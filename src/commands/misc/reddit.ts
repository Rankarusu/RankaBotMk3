import {
  ApplicationCommandOptionType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import { ChatInputCommandInteraction, PermissionsString } from 'discord.js';
import {
  APICommunicationError,
  InvalidSubredditError,
  PrivateSubredditError,
  RedditListingWrapper,
  RedditPost,
} from '../../models';
import {
  ArrayUtils,
  ClientUtils,
  InteractionUtils,
  RedditUtils,
} from '../../utils';
import { Command, CommandCategory, CommandDeferType } from '../command';

const subredditPattern = new RegExp(/^[a-zA-Z0-9]\w{2,20}$/);
/* 3 to 21 upper or lowercase Latin characters, digits, or underscores 
(but the first character can't be an underscore). 
No spaces.
Note: \w matches underscore in js.
*/
const baseUrl = 'https://www.reddit.com';
const stickyLimit = 2;

export class RedditCommand extends Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: 'reddit',
    description: 'browse for posts of a specific subreddit',
    dm_permission: false,
    options: [
      {
        name: 'subreddit',
        type: ApplicationCommandOptionType.String,
        description: 'the name of the subreddit',
        required: true,
      },
      {
        name: 'amount',
        type: ApplicationCommandOptionType.Number,
        description: 'how many posts to obtain',
        required: true,
        min_value: 1,
        max_value: 20,
      },
      {
        name: 'listings',
        type: ApplicationCommandOptionType.String,
        description: 'what kind of listing to get',
        required: false,
        choices: [
          {
            name: 'hot',
            value: 'hot',
          },
          {
            name: 'new',
            value: 'new',
          },
          {
            name: 'rising',
            value: 'rising',
          },
          {
            name: 'controversial',
            value: 'controversial',
          },
          {
            name: 'top',
            value: 'top',
          },
          {
            name: 'random',
            value: 'random',
          },
        ],
      },
    ],
  };

  public usage = () => `${this.mention()} \`unixporn\` \`5\` \`top\``;

  public cooldown = ClientUtils.APICallCommandRateLimiter();

  public category: CommandCategory = CommandCategory.MISC;

  public deferType: CommandDeferType = CommandDeferType.PUBLIC;

  public requireClientPerms: PermissionsString[] = ['SendMessages'];

  public nsfw?: boolean = true;

  public async execute(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    const subreddit = interaction.options.getString('subreddit');
    const listing = interaction.options.getString('listing') || 'hot';
    const amount = interaction.options.getNumber('amount') || 1;
    if (!subredditPattern.test(subreddit)) {
      throw new InvalidSubredditError();
    }

    const url = `${baseUrl}/r/${subreddit}/${listing}.json`;
    let response: RedditListingWrapper;
    try {
      response = await RedditUtils.fetchPosts(url, null, amount + stickyLimit); // reddit has a sticky post limit of 2. we generally do not want to send those.
    } catch (error) {
      if (error.response?.status === 403) {
        throw new PrivateSubredditError();
      }
      throw new APICommunicationError();
    }

    const posts = RedditUtils.getPostList(response);
    const partitionedLinks = this.splitPosts(posts, amount, 5);

    for (const chunk of partitionedLinks) {
      await InteractionUtils.send(interaction, chunk.join('\n'));
    }
  }

  private splitPosts(posts: RedditPost[], amount: number, chunkSize: number) {
    const links: string[] = [];
    posts.forEach((post) => {
      //using id for shorter links
      if (!post.stickied && links.length < amount) {
        links.push(`${baseUrl}/r/${post.subreddit}/comments/${post.id}`);
      }
    });

    const partitionedLinks = ArrayUtils.partition(links, chunkSize);
    return partitionedLinks;
  }
}
