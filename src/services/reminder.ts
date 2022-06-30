import { Client } from 'discord.js';
import * as cron from 'node-cron';
import { Logger } from '.';
import { ClientUtils, EmbedUtils } from '../utils';
import { MessageUtils } from '../utils/message-utils';
import { Db } from './db';
const LogMessages = require('../../logs/logs.json');

export class ReminderScheduler {
  client: Client;
  constructor(client: Client) {
    this.client = client;
  }
  // get all reminders from database
  // prepare reminders that are due in the next X minutes
  // check every 30 seconds if the reminder is due
  // fire everything
  // delete from db
  private async remind() {
    const reminders = await Db.reminder.findMany();
    const now = new Date();
    reminders.forEach(async (reminder) => {
      if (reminder.parsedTime < now) {
        //fetch message object
        const msg = await ClientUtils.getMessage(
          this.client,
          reminder.channelId,
          reminder.messageId
        );
        const embed = EmbedUtils.infoEmbed(reminder.message, 'Reminder');
        MessageUtils.reply(msg, embed);
        // TODO: handling of deleted messages.
        //TODO: more logging
      }
    });
  }

  public async start() {
    cron.schedule('30 * * * * *', () => {
      this.remind();
    });
    Logger.info(
      LogMessages.cronInfo.replaceAll('{TEXT}', 'Reminder scheduler started')
    );
  }
}
