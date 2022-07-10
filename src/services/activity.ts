import { Client } from 'discord.js';
import * as cron from 'node-cron';
import { Logger } from '.';
import LogMessages from '../../logs/logs.json';

export class ActivityScheduler {
  client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  private activities = [
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

  private async changeActivity() {
    const activity =
      this.activities[Math.floor(Math.random() * this.activities.length)];
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
