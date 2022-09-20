import axios from 'axios';
import {
  ApplicationCommandOptionType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionsString,
} from 'discord.js';

import { EventData } from '../../models/event-data';
import { RedditListing, RedditPost, RedditPostData } from '../../models/reddit';
import { EmbedUtils, InteractionUtils, StringUtils } from '../../utils';
import { Command, CommandCategory, CommandDeferType } from '../command';

const subredditPattern = new RegExp(/[a-zA-Z0-9]{1}\w{0,20}/i);
const baseUrl = 'https://www.reddit.com';
const stickyLimit = 2;

export class RedditCommand implements Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: 'reddit',
    description: 'browse for posts of a specific subreddit',
    dm_permission: false,
    options: [
      {
        name: 'subreddit',
        type: ApplicationCommandOptionType.String,
        description: 'name of the subreddit',
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

  // cooldown?: RateLimiter;
  public helpText = '/reddit `linux` `5`';

  public category: CommandCategory = CommandCategory.MISC;

  public deferType: CommandDeferType = CommandDeferType.PUBLIC;

  public requireClientPerms: PermissionsString[] = ['SendMessages'];

  public nsfw?: boolean = true;

  //TODO: put a rate limiter here.

  public async execute(
    interaction: ChatInputCommandInteraction,
    data: EventData
  ): Promise<void> {
    const subreddit = interaction.options.getString('subreddit');
    const listing = interaction.options.getString('listing') || 'hot';
    const amount = interaction.options.getNumber('amount') || 1;
    if (!subredditPattern.test(subreddit)) {
      InteractionUtils.sendError(data, 'That is not a valid subreddit name.');
      return;
    }

    const posts = this.getPosts(
      await this.fetchPosts(subreddit, listing, amount + stickyLimit) // reddit has a sticky post limit of 2. we generally do not want to send those.
    );

    const embeds: EmbedBuilder[] = [];

    posts.forEach((post) => {
      if (!post.stickied && embeds.length < amount) {
        const embed = EmbedUtils.infoEmbed(undefined, post.title)
          .setColor('#FF4500') //reddit orange
          .setURL(`https://reddit.com${post.permalink}`)
          .setImage(post.url)
          .setFooter({ text: `Powered by reddit.com/r/${post.subreddit}` });
        if (post.selftext !== '') {
          embed.setDescription(StringUtils.truncate(post.selftext, 1000));
        }
        embeds.push(embed);
      }
    });

    //TODO: check why external vid does not work

    // we partition the array into chunks of 5 to send less messages. discord limits embeds/message to 5
    const chunks = [];
    for (let i = 0; i < embeds.length; i += 5) {
      const chunk = embeds.slice(i, i + 5);
      chunks.push(chunk);
    }

    chunks.forEach(async (chunk) => {
      await InteractionUtils.send(interaction, chunk);
    });
  }

  private async fetchPosts(
    subreddit: string,
    listing: string,
    amount: number
  ): Promise<RedditListing> {
    let data;
    try {
      data = await axios
        .get<RedditListing>(`${baseUrl}/r/${subreddit}/${listing}.json`, {
          headers: {
            Accept: 'application/json',
            'User-Agent': 'axios',
          },
          params: {
            limit: amount,
          },
        })
        .then((res) => {
          return res.data;
        });
    } catch (error) {
      InteractionUtils.sendError(
        data,
        'An error occurred while communicating with the API'
      );
      return;
    }
    return data;
  }

  private getPosts(listing: RedditListing): RedditPostData[] {
    const posts = listing.data.children.map((child: RedditPost) => {
      return {
        name: child.data.name,
        subreddit: child.data.subreddit,
        title: child.data.title,
        selftext: child.data.selftext,
        permalink: child.data.permalink,
        url: child.data.url,
        stickied: child.data.stickied,
      } as RedditPostData;
    });
    return posts;
  }
}
