import {
  ApplicationCommandOptionType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import {
  ChatInputCommandInteraction,
  EmbedField,
  PermissionsString,
} from 'discord.js';
import { AniListSearchItem } from '../../models/anilist';

import { EventData } from '../../models/event-data';
import { PaginationEmbed } from '../../models/pagination-embed';
import { aniList } from '../../services/anilist';
import { EmbedUtils, InteractionUtils, StringUtils } from '../../utils';
import { Command, CommandCategory, CommandDeferType } from '../command';

export class AnimeCommand extends Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: 'anime',
    description: 'Get information about anime',
    dm_permission: true,
    options: [
      {
        name: 'search',
        type: ApplicationCommandOptionType.Subcommand,
        description: 'search for an anime',
        options: [
          {
            name: 'title',
            type: ApplicationCommandOptionType.String,
            description: 'the title of the anime to search for',
            required: true,
          },
        ],
      },
      {
        name: 'schedule',
        type: ApplicationCommandOptionType.Subcommand,
        description: 'get the schedule of all airing anime in Japan this week',
      },
    ],
  };

  // cooldown?: RateLimiter;
  public helpText = `/anime schedule
  /anime search \`attack on titan\``;

  public category: CommandCategory = CommandCategory.WEEBSHIT;

  public deferType: CommandDeferType = CommandDeferType.PUBLIC;

  public requireClientPerms: PermissionsString[] = ['SendMessages'];

  public async execute(
    interaction: ChatInputCommandInteraction,
    data: EventData
  ): Promise<void> {
    const subCommand = interaction.options.getSubcommand();
    switch (subCommand) {
      case 'search': {
        const title = interaction.options.getString('title');
        let media: AniListSearchItem;
        try {
          media = await aniList.searchMedia(title);
        } catch (error) {
          InteractionUtils.sendError(
            data,
            'An Error occurred while talking to the API'
          );
        }
        if (!media) {
          InteractionUtils.sendError(
            data,
            'An Error occurred while talking to the API'
          );
        }

        const fields: EmbedField[] = [
          {
            name: 'Genres',
            value: media.genres.join('\n'),
            inline: true,
          },
          {
            name: 'Released',
            value: `${StringUtils.toTitleCase(media.season)} ${
              media.seasonYear
            }`,
            inline: true,
          },
          {
            name: 'Rating',
            value: `Average: ${media.averageScore}%
            Mean: ${media.meanScore}%`,
            inline: true,
          },
          {
            name: 'View Details',
            value: `[AniList](${media.siteUrl}) | [MAL](https://myanimelist.net/anime/${media.idMal})`,
            inline: false,
          },
        ];
        if (media.nextAiringEpisode) {
          fields.push({
            name: 'Next airing',
            value: `<t:${media.nextAiringEpisode.airingAt}>`,
            inline: true,
          });
        }
        const embed = EmbedUtils.infoEmbed(
          //string html tags
          media.description.replaceAll(/<\/*\w+\/*>/g, ''),
          media.title.romaji,
          fields
        );
        embed
          .setThumbnail(media.coverImage.medium)
          .setURL(media.siteUrl)
          .setFooter({ text: 'Powered by anilist.co' });

        InteractionUtils.send(interaction, embed);
        break;
      }
      case 'schedule': {
        const pages = this.createPages();

        const paginatedEmbed = new PaginationEmbed(interaction, pages, 20);
        paginatedEmbed.start();
      }
    }
  }

  private createPages() {
    const schedule = aniList.getSchedule();
    const pages = schedule.map((day) => {
      let fields: EmbedField[] = day.airing.map((anime) => {
        return {
          name: anime.media.title.romaji,
          value: `Episode ${anime.episode}: <t:${anime.airingAt}:t>`,
          inline: false,
        };
      });
      if (fields.length > 25) {
        fields = fields.slice(0, 25);
        //the api limits to 25 fields per embed, so we just cut them
      }
      const date = new Date(day.day * 1000);
      const embed = EmbedUtils.infoEmbed(
        undefined,
        `Anime airing on ${date.toDateString()}`,
        fields
      );
      embed.setFooter({ text: 'Powered by anilist.co' });
      return embed;
    });
    return pages;
  }
}
