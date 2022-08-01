import { Reminder } from '@prisma/client';
import * as chrono from 'chrono-node';
import {
  ApplicationCommandOptionType,
  ComponentType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  CommandInteraction,
  EmbedBuilder,
  PermissionsString,
  SelectMenuBuilder,
  User,
} from 'discord.js';
import { EventData } from '../../models/event-data';
import { PaginationEmbed } from '../../models/pagination-embed';
import {
  DateUtils,
  DbUtils,
  EmbedUtils,
  InteractionUtils,
  MessageUtils,
  RemindUtils,
} from '../../utils';

import { Command, CommandCategory, CommandDeferType } from '../command';

export class RemindCommand implements Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: 'remind',
    description: 'reminds you of something after a certain amount of time.',
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
        const paginationEmbed = await this.createPaginationEmbed(
          interaction,
          data
        );
        await paginationEmbed.start();

        const msg = paginationEmbed.message;
        const interactionCollector = msg.createMessageComponentCollector({
          componentType: ComponentType.SelectMenu,
          max: 5,
          filter: (x) => {
            return (
              interaction.user && x.user.id === (interaction.user as User).id
            );
          },
        });

        interactionCollector.on('collect', async (intr) => {
          intr.deferUpdate();
          const { values } = intr;
          await DbUtils.deleteRemindersById(values);
          await this.updatePaginationEmbed(interaction, data, paginationEmbed);
        });
        interactionCollector.on('end', async () => {
          //empty out action rows after timeout
          await MessageUtils.edit(msg, undefined, []);
        });
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
        const minutes = new Date().getMinutes() + 2;
        const in2minutes = new Date();
        in2minutes.setMinutes(minutes);
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

  private async createPaginationEmbed(
    interaction: CommandInteraction,
    data: EventData
  ) {
    const reminders = await DbUtils.getRemindersByUserId(interaction.user.id);
    let embed: EmbedBuilder | EmbedBuilder[];
    const rows: ActionRowBuilder<SelectMenuBuilder>[] = [];
    if (reminders.length === 0) {
      const message =
        'You have no reminders set at the moment. Use `/remind set` to set one.';
      data.description = message;
      embed = EmbedUtils.warnEmbed(data);
      InteractionUtils.send(interaction, embed, []);
    } else {
      embed = RemindUtils.createReminderListEmbed(reminders);
      rows.push(RemindUtils.createDeleteReminderActionRow(reminders));
    }
    const paginationEmbed = new PaginationEmbed(
      interaction,
      embed,
      5,
      undefined,
      rows
    );

    return paginationEmbed;
  }

  private async updatePaginationEmbed(
    interaction: CommandInteraction,
    data: EventData,
    paginationEmbed: PaginationEmbed
  ) {
    const reminders = await DbUtils.getRemindersByUserId(interaction.user.id);
    if (reminders.length === 0) {
      const message =
        'You have no reminders set at the moment. Use `/remind set` to set one.';
      data.description = message;
      const embed = EmbedUtils.warnEmbed(data);
      InteractionUtils.editReply(interaction, embed, []);
    } else {
      const selectMenu = RemindUtils.createDeleteReminderActionRow(reminders);
      paginationEmbed.changePages(
        RemindUtils.createReminderListEmbed(reminders),
        [selectMenu]
      );
      paginationEmbed.editReply();
    }
  }
}
