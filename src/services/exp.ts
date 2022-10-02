import { Client } from 'discord.js';
import * as cron from 'node-cron';
import { Logger } from '.';
import LogMessages from '../static/logs/logs.json';
import { DbUtils } from '../utils';

export class ReminderScheduler {
  client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  private cleanOrphanedUsers() {
    // we want to regularly delete users from the exp tracking that are no longer on the server.
    this.client.guilds.cache.each(async (guild) => {
      const members = await DbUtils.getExpByGuild(guild.id);
      const memberIds = members.map((member) => member.userId);

      const toRemove = [];
      guild.members.cache.each((member) => {
        if (!memberIds.includes(member.id)) {
          toRemove.push(member.id);
        }
      });
      await DbUtils.deleteExpById(guild.id, toRemove);
    });
  }

  public async start() {
    // run once a day at 00:00
    cron.schedule('0 0 * * *', () => {
      this.cleanOrphanedUsers();
    });
    Logger.info(
      LogMessages.info.cronInfo.replaceAll('{TEXT}', 'EXP scheduler started')
    );
  }
}
