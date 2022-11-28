import * as cron from 'node-cron';
import { RedditPost, Scheduler } from '../models';
import LogMessages from '../static/logs.json';
import { RedditUtils } from '../utils';
import { Logger } from './logger';

const url = 'https://www.reddit.com/user/rankarusu/m/lewdtrash.json';
const limit = 100;

class Lewds extends Scheduler {
  //implementing a Singleton that automatically gets new data from a MultiReddit.

  private lewds: RedditPost[] = [];

  private next = '';

  private guildCounters: Map<string, number> = new Map<string, number>();

  private static _instance: Lewds;

  private constructor() {
    // private constructor, so that it can only be instantiated once
    super();
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

    // run every 15 minutes
    const job = cron.schedule('0,15,30,45 * * * *', async () => {
      if (this.lewds.length >= 10000) {
        this.lewds = [];
        this.next = '';
      }

      const lewds = await RedditUtils.fetchPosts(this.next);
      this.next = lewds.data.after;
      this.lewds.push(...RedditUtils.getPostList(lewds));
    });
    this.job = job;

    Logger.info(
      LogMessages.info.cronInfo.replaceAll('{TEXT}', 'Lewds scheduler started')
    );
  }

  public static get Instance() {
    return this._instance || (this._instance = new this());
  }

  public getLewdsFromStash(amount: number, guildId: string): RedditPost[] {
    //get point in lewds array where guild left off or make them start from the beginning.
    let pos = this.guildCounters.has(guildId)
      ? this.guildCounters.get(guildId)
      : 0;

    const res: RedditPost[] = [];

    const lastPos =
      pos + amount > this.lewds.length ? this.lewds.length : pos + amount;

    for (pos; pos < lastPos; pos++) {
      res.push(this.lewds[pos]);
    }

    this.guildCounters.set(guildId, pos);
    return res;
  }
}

export const lewds = Lewds.Instance;
