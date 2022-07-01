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

        const embed = EmbedUtils.infoEmbed(
          `<@${reminder.userId}>, ${reminder.message}`,
          'Reminder'
        );
        try {
          //send message as reply
          const msg = await ClientUtils.getMessage(
            this.client,
            reminder.channelId,
            reminder.messageId
          );
          await MessageUtils.reply(msg, embed);
        } catch (DiscordAPIError) {
          //in case message was deleted, just send message to channel
          const channel = await ClientUtils.getChannel(
            this.client,
            reminder.channelId
          );
          await MessageUtils.send(channel, embed);
        }

        // delete from db
        await Db.reminder.delete({ where: { messageId: reminder.messageId } });
        //TODO: more logging
      }
    });
  }

  public async start() {
    // run every 20 seconds
    cron.schedule('0,20,40 * * * * *', () => {
      this.remind();
    });
    Logger.info(
      LogMessages.info.cronInfo.replaceAll(
        '{TEXT}',
        'Reminder scheduler started'
      )
    );
  }
}
