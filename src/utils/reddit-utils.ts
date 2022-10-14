import axios from 'axios';
import { RedditListingWrapper, RedditPost } from '../models';

const validPostHints = ['link', 'image', 'hosted:video'];

export class RedditUtils {
  public static async fetchPosts(url: string, after?: string, limit = 100) {
    const data = await axios
      .get<RedditListingWrapper>(url, {
        maxRedirects: 0, //when reddit does not find a subreddit, it redirects us to a search page.
        headers: {
          Accept: 'application/json',
          'User-Agent': 'axios',
        },
        params: {
          limit: limit,
          count: limit,
          after: after,
        },
      })
      .then((res) => {
        return res.data;
      });

    return data;
  }

  public static getPostList(
    listing: RedditListingWrapper,
    filterByPostHints = false
  ) {
    const posts: RedditPost[] = [];

    for (const child of listing.data.children) {
      if (
        (filterByPostHints && validPostHints.includes(child.data.post_hint)) ||
        !filterByPostHints
      ) {
        posts.push({
          id: child.data.id,
          subreddit: child.data.subreddit,
          title: child.data.title,
          url: child.data.url,
          stickied: child.data.stickied,
          permalink: child.data.permalink,
        } as RedditPost);
      }
    }
    return posts;
  }
}
