import * as cron from 'node-cron';
import { Logger } from '.';
import { RedditPostData } from '../models/reddit';
import LogMessages from '../public/logs/logs.json';
import { RedditUtils } from '../utils';

interface GuildCounter {
  [key: string]: number;
}
const url = 'https://www.reddit.com/user/rankarusu/m/lewdtrash.json';
const limit = 100;

class Lewds {
  //implementing a Singleton that automatically gets new data from a MultiReddit.

  private lewds: RedditPostData[] = [];

  private next = '';

  private guildCounters: GuildCounter[] = [];

  private static _instance: Lewds;

  private constructor() {
    // private constructor, so that it can only be instantiated once
  }

  public async start() {
    try {
      //get data once and then in intervals.
      const lewds = await RedditUtils.fetchPosts(url, this.next, limit);
      this.next = lewds.data.after;
      this.lewds.push(...RedditUtils.getPostList(lewds, true));
    } catch (error) {
      //try again in 30 seconds
    }

    cron.schedule('0,15,30,45 * * * *', async () => {
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

  public getLewdsFromStash(amount: number, guildId: string): RedditPostData[] {
    //get point in lewds array where guild left off or make them start from the beginning.
    let pos = guildId in this.guildCounters ? this.guildCounters[guildId] : 0;

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
