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
];

export class ActivityScheduler implements Scheduler {
  client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  private async changeActivity() {
    const activity = activities[Math.floor(Math.random() * activities.length)];
    this.client.user.setActivity(activity);
  }

  public async start() {
    cron.schedule('0 * * * *', () => {
      this.changeActivity();
    });
    Logger.info(
      LogMessages.info.cronInfo.replaceAll(
        '{TEXT}',
        'Activity scheduler started'
      )
    );
  }
}
