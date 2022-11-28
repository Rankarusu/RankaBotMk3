import { Reminder } from '@prisma/client';
import {
  ApplicationCommandOptionType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import { ChatInputCommandInteraction, PermissionsString } from 'discord.js';
import {
  PingInInputError,
  ReminderCreationError,
  ReminderIntervalTooShortError,
  ReminderLimitError,
  ReminderListSelectEmbed,
  TimeParseError,
} from '../../models';
import {
  ClientUtils,
  DateUtils,
  DbUtils,
  EmbedUtils,
  InteractionUtils,
} from '../../utils';
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
            required: true,
          },
        ],
      },
    ],
  };

  public usage = () => `${this.mention(
    'set'
  )} \`next thursday at 3pm\` \`do something funny\`
    ${this.mention('set')} \`tomorrow\`
    ${this.mention('set')} \`in 3 days\` \`do the thing\`
    ${this.mention('set')} \`5 mins\` \`get food\`
    ${this.mention('list')}`;

  public cooldown = ClientUtils.DbCommandRateLimiter();

  public category: CommandCategory = CommandCategory.UTILITY;

  public deferType: CommandDeferType = CommandDeferType.HIDDEN;

  public requireClientPerms: PermissionsString[] = ['SendMessages'];

  public async execute(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    const subCommand = interaction.options.getSubcommand();
    switch (subCommand) {
      case 'list': {
        const paginatedEmbed = new ReminderListSelectEmbed(
          interaction,
          undefined
        );
        await paginatedEmbed.start();
        break;
      }
      case 'set': {
        const time = interaction.options.getString('time');
        let parsedTime: Date;
        try {
          parsedTime = DateUtils.parseTime(time);
        } catch (error) {
          throw new TimeParseError(time);
        }

        //check for too short of a notice
        const in2minutes = new Date(new Date().getTime() + 2 * 60 * 1000);

        if (parsedTime < in2minutes) {
          throw new ReminderIntervalTooShortError();
        }

        const notificationMessage =
          interaction.options.getString('notification-text') || 'do something';

        // send error if someone abuses mentions
        if (notificationMessage.match(/<@(.*?)>/)) {
          throw new PingInInputError();
        }

        const unixTime = DateUtils.getUnixTime(parsedTime);

        const successEmbed = EmbedUtils.successEmbed(
          `Alright. I'm going to remind you to **${notificationMessage}** at <t:${unixTime}:f>`,
          'Reminder added'
        );

        const reminder: Reminder = {
          interactionId: interaction.id,
          userId: interaction.user.id,
          guildId: interaction.guild ? interaction.guild.id : null,
          channelId: interaction.channelId,
          message: notificationMessage,
          invokeTime: interaction.createdAt,
          parsedTime,
        };

        const reminderCount = await DbUtils.getReminderCountByUserId(
          // limit per user and not per server
          interaction.user.id
        );

        if (reminderCount >= 100) {
          throw new ReminderLimitError();
        }

        try {
          await DbUtils.createReminder(reminder);
        } catch {
          throw new ReminderCreationError();
        }
        await InteractionUtils.send(interaction, successEmbed);
        break;
      }
    }
  }
}
