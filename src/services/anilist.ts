import axios from 'axios';
import * as cron from 'node-cron';
import { Logger, Scheduler } from '.';
import {
  AniListAiringScheduleItem,
  AniListScheduleDay,
  AniListSearchItem,
  MediaFormat,
  MediaType,
} from '../models';
import LogMessages from '../static/logs.json';

const url = 'https://graphql.anilist.co';

const scheduleQuery = `
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

const searchQuery = `
query ($search: String, $format: MediaFormat) {
  Page(page: 1, perPage: 1) {
    media(search: $search, format: $format) {
      idMal
      title {
        native
        romaji
        english
      }
      type
      format
      description
      genres
      season
      seasonYear
      averageScore
      meanScore
      siteUrl
      coverImage {
        medium
      }
      nextAiringEpisode {
        airingAt
      }
    }
  }
}
`;

class AniList extends Scheduler {
  //implementing a Singleton that automatically gets new data from AniList.

  private schedule: AniListScheduleDay[];

  private static _instance: AniList;

  private constructor() {
    // private constructor, so that it can only be instantiated once
    super();
  }

  public async start() {
    //get data once and then in intervals.
    // try {
    await this.updateSchedule(this.getTimestamps());
    // } catch (error) {
    //   // try again in 30 seconds
    //   setTimeout(() => {
    //     this.start();
    //   }, 30000);
    // }

    const job = cron.schedule('0 * * * *', async () => {
      const timestamps = this.getTimestamps();
      await this.updateSchedule(timestamps);
    });
    Logger.info(
      LogMessages.info.cronInfo.replaceAll(
        '{TEXT}',
        'Anilist scheduler started'
      )
    );
    this.job = job;
  }

  public static get Instance() {
    return this._instance || (this._instance = new this());
  }

  public async searchMedia(title: string): Promise<AniListSearchItem> {
    const data = await axios
      .post(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'axios',
        },
        query: searchQuery,
        variables: { search: title, format: MediaFormat.TV },
      })
      .then((res) => {
        return res.data.data.Page.media[0];
      });
    return data;
  }

  private getTimestamps(): { start: number; end: number }[] {
    const timestamps = [];
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

  private async getAiringPerDay(
    start: number,
    end: number
  ): Promise<AniListAiringScheduleItem[]> {
    const data = await axios
      .post(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'axios',
        },
        query: scheduleQuery,
        variables: { start, end },
      })
      .then((res) => {
        const entries = res.data.data.Page.airingSchedules.filter(
          (entry: AniListAiringScheduleItem) =>
            entry.media.countryOfOrigin !== 'CN' &&
            entry.media.type === MediaType.ANIME &&
            entry.media.format === MediaFormat.TV
        );
        return entries;
      });
    return data;
  }
  //TODO: make catch errors and retry

  private async updateSchedule(timestamps: { start: number; end: number }[]) {
    const entries = await Promise.all(
      timestamps.map(async (timestamp) => {
        const entry = await this.getAiringPerDay(
          timestamp.start,
          timestamp.end
        );
        const weekday = timestamp.end;
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
