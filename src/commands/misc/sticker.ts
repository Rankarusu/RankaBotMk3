import { Sticker } from '@prisma/client';
import {
  ApplicationCommandOptionType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import {
  Attachment,
  ChatInputCommandInteraction,
  PermissionsString,
} from 'discord.js';
import { StickerListSelectEmbed } from '../../models';
import {
  InvalidMediaTypeError,
  StickerAddError,
  StickerAlreadyExistsError,
  StickerNotFoundError,
} from '../../models/errors';
import {
  ClientUtils,
  DbUtils,
  EmbedUtils,
  InteractionUtils,
} from '../../utils';
import { Command, CommandCategory, CommandDeferType } from '../command';

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
    description: 'save and post custom stickers on your server',
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

  public usage = () => `${this.mention('add')} \`seiba\` \`<uploaded file>\`
  ${this.mention('list')}
  ${this.mention('post')} \`seiba\``;

  public cooldown = ClientUtils.DbCommandRateLimiter();

  public category: CommandCategory = CommandCategory.MISC;

  public deferType: CommandDeferType = CommandDeferType.PUBLIC;

  public requireClientPerms: PermissionsString[] = ['SendMessages'];

  public async execute(
    interaction: ChatInputCommandInteraction
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
            throw new StickerNotFoundError(name);
          }
          const embed = await this.createStickerEmbed(interaction, sticker);
          await InteractionUtils.send(interaction, embed);
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
            throw new StickerAlreadyExistsError(name);
          }

          if (!allowedTypes.includes(image.contentType)) {
            throw new InvalidMediaTypeError(allowedTypes.join(', '));
          }

          const sticker: Sticker = {
            interactionId: interaction.id,
            userId: interaction.user.id,
            guildId: interaction.guildId,
            stickerName: name,
            stickerUrl: image.proxyURL,
            invokeTime: interaction.createdAt,
          };

          try {
            await DbUtils.createSticker(sticker);
          } catch (error) {
            throw new StickerAddError();
          }

          const embed = this.createStickerAddSuccessEmbed(name, image);
          await InteractionUtils.send(interaction, embed);
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

  private async createStickerEmbed(
    interaction: ChatInputCommandInteraction,
    sticker: Sticker
  ) {
    const creator = await interaction.guild.members.fetch(sticker.userId);
    const embed = EmbedUtils.stickerEmbed(creator, sticker);
    return embed;
  }

  private createStickerAddSuccessEmbed(name: string, image: Attachment) {
    const embed = EmbedUtils.successEmbed(
      `Added sticker \`${name}\``,
      'Sticker'
    );
    embed.setImage(image.proxyURL);
    return embed;
  }
}
