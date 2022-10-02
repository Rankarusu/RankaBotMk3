import { Reminder } from '@prisma/client';
import * as chrono from 'chrono-node';
import {
  ApplicationCommandOptionType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import { ChatInputCommandInteraction, PermissionsString } from 'discord.js';
import { EventData } from '../../models/event-data';
import { ReminderListSelectEmbed } from '../../models/pagination-embed';
import { DateUtils, DbUtils, EmbedUtils, InteractionUtils } from '../../utils';
import { Command, CommandCategory, CommandDeferType } from '../command';

export class RemindCommand extends Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: 'remind',
    description: 'remind yourself of something after a certain amount of time.',
    dm_permission: true,
    default_member_permissions: undefined,
    options: [
      {
        name: 'list',
        description: 'list and manage reminders',
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: 'set',
        description: 'set a reminder',
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

  // public cooldown = new RateLimiter(1, 5000);

  public category: CommandCategory = CommandCategory.UTILITY;

  public helpText = `The input can be any direct date (e.g. YYYY-MM-DD) or a human
  readable offset.

  **Examples:**
  - /remind set \`next thursday at 3pm\` \`do something funny\`
  - /remind set \`tomorrow\`
  - /remind set \`in 3 days\` \`do the thing\`
  - /remind set \`5 mins\` \`get food\`
  - /remind list`;

  public deferType: CommandDeferType = CommandDeferType.HIDDEN;

  public requireClientPerms: PermissionsString[] = ['SendMessages'];

  public async execute(
    interaction: ChatInputCommandInteraction,
    data: EventData
  ): Promise<void> {
    const subCommand = interaction.options.getSubcommand();
    switch (subCommand) {
      case 'list': {
        const paginatedEmbed = new ReminderListSelectEmbed(interaction);
        await paginatedEmbed.start();
        break;
      }
      case 'set': {
        const time = interaction.options.getString('time');
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
          InteractionUtils.sendError(data, `Could not parse the time: ${time}`);
        }

        if (!parsedTime) {
          // parsed time is null if parse is unsuccessful
          InteractionUtils.sendError(data, `Could not parse the time: ${time}`);
        }

        //check for too short of a notice
        const in2minutes = new Date(new Date().getTime() + 2 * 60 * 1000);

        if (parsedTime < in2minutes) {
          InteractionUtils.sendError(
            data,
            'Is your attention span really that small?'
          );
        }

        const notificationMessage =
          interaction.options.getString('notification-text') || 'do something';

        // send error if someone abuses mentions
        if (notificationMessage.match(/<@(.*?)>/)) {
          InteractionUtils.sendError(
            data,
            'Termi was banned for that. Do you want to follow him?'
          );
        }

        const unixTime = DateUtils.getUnixTime(parsedTime);
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
        //TODO: handle upper limit for reminders per user

        try {
          await DbUtils.createReminder(reminder);
        } catch {
          confirmation.delete();
          InteractionUtils.sendError(data, 'Could not create reminder');
        }
        InteractionUtils.editReply(interaction, successEmbed);
        break;
      }
    }
  }
}
