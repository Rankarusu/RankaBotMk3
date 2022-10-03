import axios from 'axios';
import { RedditListing, RedditPostData } from '../models/reddit';

const validPostHints = ['link', 'image', 'hosted:video'];

export class RedditUtils {
  public static async fetchPosts(url: string, after?: string, limit = 100) {
    const data = await axios
      .get<RedditListing>(url, {
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

  public static getPostList(listing: RedditListing, filterByPostHints = false) {
    const posts: RedditPostData[] = [];

    listing.data.children.forEach((child) => {
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
        } as RedditPostData);
      }
    });
    return posts;
  }
}
