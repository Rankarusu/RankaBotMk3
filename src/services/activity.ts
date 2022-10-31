import { Client } from 'discord.js';
import * as cron from 'node-cron';
import { Logger, Scheduler } from '.';
import LogMessages from '../static/logs.json';

const activities = [
  'with the Discord API',
  'with Discord.js',
  'with lewds',
  'with socks',
  'Pokémon',
  'with tights',
  'with a trebuchet',
  'RealLife.exe',
  'around with deadly lasers',
  'the smallest violin in the world',
  'a bunch of monsters in one turn',
  'with RankaBot and RankaBot2',
  'with Jest',
  'with Axios',
  'with my own PokéDex',
];

export class ActivityScheduler extends Scheduler {
  client: Client;

  constructor(client: Client) {
    super();
    this.client = client;
  }

  private changeActivity() {
    const activity = activities[Math.floor(Math.random() * activities.length)];
    this.client.user.setActivity(activity);
  }

  public start() {
    const job = cron.schedule('0 * * * *', () => {
      this.changeActivity();
    });
    Logger.info(
      LogMessages.info.cronInfo.replaceAll(
        '{TEXT}',
        'Activity scheduler started'
      )
    );
    this.job = job;
  }
}
