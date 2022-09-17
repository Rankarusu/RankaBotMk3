import axios from 'axios';
import * as cron from 'node-cron';
import { Logger } from '.';
import { RedditListing, RedditPost, RedditPostData } from '../models/reddit';
import LogMessages from '../public/logs/logs.json';

const limit = 100;

interface GuildCounter {
  [key: string]: number;
}

class Lewds {
  //implementing a Singleton that automatically gets new data from a MultiReddit.

  private lewds: RedditPostData[];

  private url = 'https://www.reddit.com/user/rankarusu/m/lewdtrash.json';

  private next = '';

  public guildCounters: GuildCounter[];

  private static _instance: Lewds;

  private constructor() {
    // private constructor, so that it can only be instantiated once
  }

  public async start() {
    try {
      //get data once and then in intervals.
      const lewds = await this.fetchLewds(this.next);
      this.next = lewds.data.after;
      this.lewds.push(...this.getPosts(lewds));
    } catch (error) {
      //try again in 30 seconds
    }

    cron.schedule('* 0,15,30,45 * * *', async () => {
      if (this.lewds.length >= 10000) {
        this.lewds = [];
        this.next = '';
      }

      const lewds = await this.fetchLewds(this.next);
      this.next = lewds.data.after;
      this.lewds.push(...this.getPosts(lewds));
    });
    Logger.info(
      LogMessages.info.cronInfo.replaceAll('{TEXT}', 'Lewds scheduler started')
    );
  }

  public static get Instance() {
    return this._instance || (this._instance = new this());
  }

  private async fetchLewds(after?: string): Promise<RedditListing> {
    const data = await axios
      .get<RedditListing>(this.url, {
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

  private getPosts(listing: RedditListing): RedditPostData[] {
    const posts = listing.data.children.map((child: RedditPost) => {
      return {
        name: child.data.name,
        subreddit: child.data.subreddit,
        title: child.data.title,
        url: child.data.url,
        permalink: child.data.permalink,
      } as RedditPostData;
    });
    return posts;
  }

  public getLewdsFromStash(amount: number, guildId: string): RedditPostData[] {
    //get point in lewds array where guild left off or make them start from the beginning.
    let pos = this.guildCounters[guildId] ? this.guildCounters[guildId] : 0;

    const res: RedditPostData[] = [];

    const lastPos =
      pos + amount > this.lewds.length ? this.lewds.length : pos + amount;

    for (pos; pos < lastPos; pos++) {
      res.push(this.lewds[pos]);
    }

    this.guildCounters[guildId] = pos;

    return res;
  }
}

export const lewds = Lewds.Instance;
