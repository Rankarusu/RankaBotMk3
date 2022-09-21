import {
  ApplicationCommandOptionType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import { ChatInputCommandInteraction, PermissionsString } from 'discord.js';

import { Sticker } from '@prisma/client';
import { EventData } from '../../models/event-data';
import { DbUtils, EmbedUtils, InteractionUtils } from '../../utils';
import { Command, CommandCategory, CommandDeferType } from '../command';
import { StickerListSelectEmbed } from '../../models/pagination-embed';

const allowedTypes = [
  'image/png',
  'image/jpg',
  'image/jpeg',
  'image/gif',
  'video/webm',
  'video/mp4',
];

export class StickerCommand extends Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: 'sticker',
    description: 'Save and post custom stickers on your server',
    dm_permission: false,
    options: [
      {
        name: 'post',
        type: ApplicationCommandOptionType.Subcommand,
        description: 'post a custom sticker',
        options: [
          {
            name: 'name',
            type: ApplicationCommandOptionType.String,
            description: 'the name of the sticker',
            required: true,
          },
        ],
      },
      {
        name: 'add',
        type: ApplicationCommandOptionType.Subcommand,
        description: 'add a custom sticker',
        options: [
          {
            name: 'name',
            type: ApplicationCommandOptionType.String,
            description: 'the name of the sticker',
            required: true,
          },
          {
            name: 'image',
            type: ApplicationCommandOptionType.Attachment,
            description: 'an image to use as sticker',
            required: true,
          },
        ],
      },
      {
        name: 'list',
        type: ApplicationCommandOptionType.Subcommand,
        description: 'list all stickers on the server and remove unwanted ones',
      },
    ],
  };

  // cooldown?: RateLimiter;
  public helpText = '/';

  public category: CommandCategory = CommandCategory.MISC;

  public deferType: CommandDeferType = CommandDeferType.PUBLIC;

  public requireClientPerms: PermissionsString[] = ['SendMessages'];

  public async execute(
    interaction: ChatInputCommandInteraction,
    data: EventData
  ): Promise<void> {
    const subCommand = interaction.options.getSubcommand();
    switch (subCommand) {
      case 'post':
        {
          const name = interaction.options.getString('name');

          const sticker = await DbUtils.getStickerByName(
            name,
            interaction.guildId
          );
          if (!sticker) {
            InteractionUtils.sendError(data, `Sticker ${name} not found`);
          }
          const creator = await interaction.guild.members.fetch(sticker.userId);
          const embed = await EmbedUtils.stickerEmbed(creator, sticker);
          InteractionUtils.send(interaction, embed);
        }
        break;
      case 'add':
        {
          const image = interaction.options.getAttachment('image');
          const name = interaction.options.getString('name');
          const stickerNames = await DbUtils.getStickersByGuildId(
            interaction.guildId
          );

          if (stickerNames.find((sticker) => sticker.stickerName === name)) {
            InteractionUtils.sendError(
              data,
              `A Sticker with name \`${name}\`already exists on this server.`
            );
          }

          if (!allowedTypes.includes(image.contentType)) {
            InteractionUtils.sendError(
              data,
              `The image you provided is not a valid media type.
            Please use one of the following types: ${allowedTypes.join(', ')}`
            );
          }

          const sticker: Sticker = {
            interactionId: interaction.id,
            userId: interaction.user.id,
            guildId: interaction.guild.id,
            stickerName: name,
            stickerUrl: image.proxyURL,
            invokeTime: interaction.createdAt,
          };

          try {
            await DbUtils.createSticker(sticker);
          } catch (error) {
            InteractionUtils.sendError(
              data,
              'Something went wrong while adding the sicker.'
            );
          }

          const embed = EmbedUtils.successEmbed(
            `Added sticker \`${name}\``,
            'Sticker'
          );
          embed.setImage(image.proxyURL);
          InteractionUtils.send(interaction, embed);
        }
        break;
      case 'list':
        {
          const paginatedEmbed = new StickerListSelectEmbed(interaction);
          await paginatedEmbed.start();
          //merge list and remove into one as we did with remind.
          //rewrite remind pagination embed to fit poll style. waaaaay cleaner
        }
        break;
    }
  }
}
