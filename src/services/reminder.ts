import { RESTJSONErrorCodes } from 'discord-api-types/v10';
import { Client, DiscordAPIError } from 'discord.js';
import * as cron from 'node-cron';
import { Scheduler } from '../models';
import LogMessages from '../static/logs.json';
import { ClientUtils, DbUtils, EmbedUtils, MessageUtils } from '../utils';
import { Logger } from './logger';

const IGNORED_ERRORS = [RESTJSONErrorCodes.MissingAccess];
export class ReminderScheduler extends Scheduler {
  client: Client;

  constructor(client: Client) {
    super();
    this.client = client;
  }

  // get all reminders from database
  // prepare reminders that are due in the next X minutes
  // check every 30 seconds if the reminder is due
  // fire everything
  // delete from db
  private async remind() {
    const reminders = await DbUtils.getAllReminders();
    const now = new Date();
    reminders.forEach(async (reminder) => {
      if (reminder.parsedTime < now) {
        const embed = EmbedUtils.infoEmbed(`${reminder.message}`, 'Reminder');

        //The messages are ephemeral and will most likely never be available, so we just send a message in the channel.
        const channel = await ClientUtils.getChannel(
          this.client,
          reminder.channelId
        );

        try {
          await MessageUtils.send(channel, {
            //mentions inside embeds do not provoke a ping, therefore we put the mention in the message itself.
            content: `<@${reminder.userId}>`,
            embeds: [embed],
          });
        } catch (error) {
          if (
            error instanceof DiscordAPIError &&
            IGNORED_ERRORS.includes(error.code as number)
          ) {
            return;
          } else {
            throw error;
          }
        }
        await DbUtils.deleteReminderById(reminder.interactionId);
      }
    });
  }

  public start() {
    // run every 20 seconds
    const job = cron.schedule('0,20,40 * * * * *', async () => {
      await this.remind();
    });
    Logger.info(
      LogMessages.info.cronInfo.replaceAll(
        '{TEXT}',
        'Reminder scheduler started'
      )
    );
    this.job = job;
  }
}
