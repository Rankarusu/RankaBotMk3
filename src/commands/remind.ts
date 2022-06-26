import { Reminder } from '@prisma/client';
import * as chrono from 'chrono-node';
import {
  ApplicationCommandOptionType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import { CommandInteraction, PermissionString } from 'discord.js';
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
  };
  // cooldown?: RateLimiter;
  public helpText?: string = `The input can be any direct date (e.g. YYYY-MM-DD) or a human
  readable offset.

  Examples:
  - "next thursday at 3pm | do something funny"
  - "tomorrow | do dishes"
  - "in 3 days | do the thing"
  - "2d | unmute someone`;
  public deferType: CommandDeferType = CommandDeferType.PUBLIC;
  public requireClientPerms: PermissionString[] = [];

  public async execute(
    interaction: CommandInteraction,
    data: EventData
  ): Promise<void> {
    let time = interaction.options.getString('time');
    let parsedTime: Date;
    try {
      parsedTime = chrono.parseDate(
        time,
        { instant: new Date(), timezone: 'Europe/Berlin' },
        { forwardDate: true }
      );
    } catch (e) {
      data.description = `Could not parse the time: ${time}`;
      throw new Error(`Could not parse the time: ${time}`);
    }

    if (!parsedTime) {
      // parsed time is null if parse is unsuccessful
      data.description = `Could not parse the time: ${time}`;
      throw new Error(`Could not parse the time: ${time}`);
    }

    //TODO: check for too short of a notice

    const notificationMessage =
      interaction.options.getString('notification-text') || 'do something';

    const reminder: Reminder = {
      messageId: interaction.id,
      userId: interaction.user.id,
      guildId: interaction.guild.id,
      channelId: interaction.channel.id,
      message: notificationMessage,
      invokeTime: interaction.createdAt,
      parsedTime,
    };
    try {
      await Db.reminder.create({ data: reminder });
    } catch {
      data.description = `Could not create reminder`;
      throw new Error(`Could not create reminder`);
    }

    const unixTime = Math.floor(parsedTime.getTime() / 1000);
    const embed = EmbedUtils.successEmbed(
      `Alright. I'm going to rent you to **${reminder.message}** at <t:${unixTime}:f>`
    );

    await InteractionUtils.send(interaction, embed);
  }
}
