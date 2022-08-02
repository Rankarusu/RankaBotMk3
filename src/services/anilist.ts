import axios from 'axios';
import * as cron from 'node-cron';
import { Logger } from '.';
import LogMessages from '../../logs/logs.json';
import { AniListGQLItem, MediaType } from '../models/anilist';
import { DateUtils } from '../utils';

class AniList {
  //implementing a Singleton that automatically gets new data from AniList.
  private schedule: { day: string; airing: AniListGQLItem[] }[];

  private static _instance: AniList;

  private constructor() {
    //get data once and then in intervals.
    this.updateSchedule(this.getTimestamps());

    cron.schedule('0 * * * *', async () => {
      const timestamps = this.getTimestamps();
      await this.updateSchedule(timestamps);
    });
    Logger.info(
      LogMessages.info.cronInfo.replaceAll(
        '{TEXT}',
        'Anilist scheduler started'
      )
    );
  }

  public static get Instance() {
    return this._instance || (this._instance = new this());
  }

  private query = `
  query ($start: Int, $end: Int) {
    Page(page: 1, perPage: 50) {
      airingSchedules(
        airingAt_greater: $start
        airingAt_lesser: $end
        sort: TIME
      ) {
        episode
        airingAt
        media {
          title {
            native
            romaji
            english
          }
          type
          countryOfOrigin
          format
        }
      }
    }
  }
  `;

  private getTimestamps() {
    const timestamps = [];
    // timestamps.push(time / 1000);
    let end: number;
    for (let i = 0; i < 7; i++) {
      if (i === 0) {
        end = new Date().setHours(0, 0, 0, 0) / 1000;
      }
      const start = end;
      end = start + 24 * 60 * 60;

      timestamps.push({ start, end: end - 1 });
    }
    return timestamps;
  }

  private async getAiringPerDay(start: number, end: number) {
    const data = await axios
      .post('https://graphql.anilist.co', {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'axios',
        },
        query: this.query,
        variables: { start, end },
      })
      .then((res) => {
        // console.log(res.data.data.Page.airingSchedules);
        const entries = res.data.data.Page.airingSchedules.filter(
          (entry: AniListGQLItem) =>
            entry.media.countryOfOrigin !== 'CN' &&
            entry.media.type === MediaType.ANIME
        );
        return entries;
      });
    return data;
  }

  private async updateSchedule(timestamps: { start: number; end: number }[]) {
    const entries = await Promise.all(
      timestamps.map(async (timestamp) => {
        const entry = await this.getAiringPerDay(
          timestamp.start,
          timestamp.end
        );
        const weekday = DateUtils.getWeekdayFromNumber(
          new Date(timestamp.end * 1000).getUTCDay()
        );
        return {
          day: weekday,
          airing: entry,
        };
      })
    );
    this.schedule = entries;
  }

  public getSchedule() {
    return this.schedule;
  }
}
export const aniList = AniList.Instance;
