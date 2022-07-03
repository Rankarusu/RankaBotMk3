import { Reminder } from '@prisma/client';
import { Message, SelectMenuInteraction } from 'discord.js';
import { SelectMenu, SelectMenuDeferType } from '.';
import { EventData } from '../models/event-data';
import { Db } from '../services';
import { RemindUtils } from '../utils';
import { EmbedUtils } from '../utils/embed-utils';
import { InteractionUtils } from '../utils/interaction-utils';

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

    const reminders: Reminder[] = await Db.reminder.findMany({
      where: { userId: interaction.user.id },
      orderBy: { parsedTime: 'asc' },
    });

    if (reminders.length === 0) {
      const embed = EmbedUtils.infoEmbed('No reminders set at the moment');
      InteractionUtils.editReply(interaction, embed, []);
      return;
    }

    const embed = RemindUtils.createReminderListEmbed(reminders);
    const rowData = RemindUtils.getRowData(reminders);
    const row = RemindUtils.createDeleteReminderActionRow(rowData);

    InteractionUtils.editReply(interaction, embed, [row]);
  }
}
