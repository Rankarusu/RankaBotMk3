import { Reminder } from '@prisma/client';
import * as chrono from 'chrono-node';
import {
  ApplicationCommandOptionType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import {
  CommandInteraction,
  MessageActionRow,
  MessageSelectMenu,
  PermissionString,
} from 'discord.js';
import { EventData } from '../models/event-data';
import { Db } from '../services';
import { EmbedUtils, InteractionUtils } from '../utils';
import { Command, CommandDeferType } from './command';

export class RemindCommand implements Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: 'remind',
    description: 'Reminds you of something after a certain amount of time.',
    dm_permission: true,
    default_member_permissions: undefined,
    options: [
      {
        name: 'list',
        description: 'List and manage reminders',
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: 'set',
        description: 'Sets a reminder',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'time',
            type: ApplicationCommandOptionType.String,
            description: 'time you want to be notified',
            required: true,
          },
          {
            name: 'notification-text',
            type: ApplicationCommandOptionType.String,
            description: 'what you want to be notified of',
            required: false,
          },
        ],
      },
    ],
  };
  // cooldown?: RateLimiter;
  public helpText?: string = `The input can be any direct date (e.g. YYYY-MM-DD) or a human
  readable offset.

  Examples:
  - "next thursday at 3pm | do something funny"
  - "tomorrow | do dishes"
  - "in 3 days | do the thing"
  - "2d | unmute someone`;
  public deferType: CommandDeferType = CommandDeferType.HIDDEN;
  public requireClientPerms: PermissionString[] = [];

  public async execute(
    interaction: CommandInteraction,
    data: EventData
  ): Promise<void> {
    if (interaction.options.getSubcommand() === 'list') {
      //TODO: maybe put split subcommands in multiple files if possible
      const reminders: Reminder[] = await Db.reminder.findMany({
        where: { userId: interaction.user.id },
        orderBy: { parsedTime: 'asc' },
      });
      if (reminders.length === 0) {
        const message =
          'You have no reminders set at the moment. Use `/remind set` to set one.';
        data.description = message;
        throw new Error(message);
      }

      const reminderList = reminders.map((reminder, index) => {
        return {
          //TODO: make a util function for this
          time: reminder.parsedTime.toLocaleString(),
          id: `ID: ${(index + 1).toString().padStart(3, '0')}`,
          text: `<t:${Math.floor(reminder.parsedTime.getTime() / 1000)}:f> | ${
            reminder.message
          }`,
          message: reminder.message,
          interactionId: reminder.interactionId,
        };
      });

      const embed = EmbedUtils.reminderListEmbed(
        'Here is a list of all your set reminders.',
        reminderList
      );

      const rowData = reminderList.map((reminder) => {
        return {
          label: reminder.id,
          description: `${reminder.time} | ${reminder.message}`,
          value: reminder.interactionId,
        };
      });

      const row = new MessageActionRow().addComponents(
        new MessageSelectMenu()
          .setCustomId('reminder-id')
          .setPlaceholder('Select a reminder to delete')
          .addOptions(rowData)
          .setMinValues(1)
          .setMaxValues(rowData.length)
      );

      await InteractionUtils.send(interaction, embed);
      await InteractionUtils.send(
        interaction,
        'You can also delete set reminders with the following menu.',
        [row],
        true
      );
    } else if (interaction.options.getSubcommand() === 'set') {
      let time = interaction.options.getString('time');
      let parsedTime: Date;
      try {
        parsedTime = chrono.parseDate(
          time,
          { instant: new Date(), timezone: 'Europe/Berlin' },
          { forwardDate: true }
        );
        parsedTime.setSeconds(0);
        parsedTime.setMilliseconds(0);
      } catch (e) {
        const message = `Could not parse the time: ${time}`;
        data.description = message;
        throw new Error(message);
      }

      if (!parsedTime) {
        // parsed time is null if parse is unsuccessful
        const message = `Could not parse the time: ${time}`;
        data.description = message;
        throw new Error(message);
      }

      //check for too short of a notice
      const minutes = new Date().getMinutes() + 2;
      const in2minutes = new Date();
      in2minutes.setMinutes(minutes);
      if (parsedTime < in2minutes) {
        const message = 'Is your attention span really that small?';
        data.description = message;
        throw new Error(message);
      }

      //TODO: put errors in separate file
      const notificationMessage =
        interaction.options.getString('notification-text') || 'do something';

      // send error if someone abuses mentions
      if (notificationMessage.match(/<@(.*?)>/)) {
        const message = 'Termi was banned for that. Do you want to follow him?';
        data.description = message;
        throw new Error(message);
      }

      const unixTime = Math.floor(parsedTime.getTime() / 1000);
      const processingEmbed = EmbedUtils.infoEmbed(
        "I'm processing your request..."
      );
      const successEmbed = EmbedUtils.successEmbed(
        `Alright. I'm going to remind you to **${notificationMessage}** at <t:${unixTime}:f>`
      );

      const confirmation = await InteractionUtils.send(
        interaction,
        processingEmbed
      );
      //we cannot reply to interactions after 15 minutes, so we need to get a reference to the confirmation message

      const reminder: Reminder = {
        interactionId: interaction.id,
        messageId: confirmation.id,
        userId: interaction.user.id,
        guildId: interaction.guild ? interaction.guild.id : null,
        channelId: interaction.channel.id,
        message: notificationMessage,
        invokeTime: interaction.createdAt,
        parsedTime,
      };

      try {
        await Db.reminder.create({ data: reminder });
      } catch {
        confirmation.delete();
        const message = 'Could not create reminder';
        data.description = message;
        throw new Error(message);
      }
      InteractionUtils.editReply(interaction, successEmbed);
    }
  }
}
