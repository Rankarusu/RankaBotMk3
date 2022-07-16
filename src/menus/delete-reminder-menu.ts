import { Reminder } from '@prisma/client';
import {
  CommandInteraction,
  Interaction,
  Message,
  MessageActionRow,
  SelectMenuInteraction,
} from 'discord.js';
import { SelectMenu, SelectMenuDeferType } from '.';
import { EventData } from '../models/event-data';
import { Db } from '../services';
import {
  DbUtils,
  EmbedUtils,
  InteractionUtils,
  PaginationEmbed,
  RemindUtils,
} from '../utils';

export class DeleteReminderSelectMenu implements SelectMenu {
  ids: string[] = ['delete-reminder'];

  deferType: SelectMenuDeferType = SelectMenuDeferType.UPDATE;

  requireGuild: false;

  requireEmbedAuthorTag: false;

  public async execute(
    interaction: SelectMenuInteraction,
    msg: Message,
    data: EventData
  ): Promise<void> {
    const toDelete = interaction.values;

    await Db.reminder.deleteMany({
      where: {
        interactionId: {
          in: toDelete,
        },
      },
    });

    const reminders: Reminder[] = await DbUtils.getRemindersByUserId(
      interaction.user.id
    );

    if (reminders.length === 0) {
      const embed = EmbedUtils.infoEmbed('No reminders set at the moment');
      InteractionUtils.editReply(interaction, embed, []);
      return;
    }

    const embed = RemindUtils.createReminderListEmbed(reminders); //paginate this
    const rowData = RemindUtils.getRowData(reminders);
    const row = RemindUtils.createDeleteReminderActionRow(rowData);
    await new PaginationEmbed(interaction, embed, 5, undefined, [row]).start();
    // InteractionUtils.editReply(interaction, embed, undefined);
  }
}
