import axios from 'axios';
import { RedditListingWrapper, RedditPost } from '../models/reddit';

const validPostHints = ['link', 'image', 'hosted:video'];

export class RedditUtils {
  public static async fetchPosts(url: string, after?: string, limit = 100) {
    const data = await axios
      .get<RedditListingWrapper>(url, {
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
    limit = 100,
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
      if (posts.length >= limit) {
        // because we usually fetch more posts than we need to ignore stickies, we use this to make sure we get the amount of posts the user requested.
        break;
      }
    }
    return posts;
  }
}
