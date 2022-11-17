import {
  ApplicationCommandOptionType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  EmbedField,
  PermissionsString,
} from 'discord.js';
import {
  AniListScheduleDay,
  AniListSearchItem,
  PaginationEmbed,
} from '../../models';
import { APICommunicationError } from '../../models/errors';
import { AnimeNotFoundWarning } from '../../models/warnings';
import { aniList } from '../../services';
import {
  ClientUtils,
  EmbedUtils,
  InteractionUtils,
  StringUtils,
} from '../../utils';
import { Command, CommandCategory, CommandDeferType } from '../command';

export class AnimeCommand extends Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: 'anime',
    description: 'get information about anime',
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
            description: 'a title to search for',
            required: true,
          },
        ],
      },
      {
        name: 'schedule',
        type: ApplicationCommandOptionType.Subcommand,
        description: 'get the schedule of all airing anime this week',
      },
    ],
  };

  // cooldown?: RateLimiter;
  public usage = () => `${this.mention('schedule')}
  ${this.mention('search')} \`attack on titan\``;

  public cooldown = ClientUtils.APICallCommandRateLimiter();

  public category: CommandCategory = CommandCategory.WEEBSHIT;

  public deferType: CommandDeferType = CommandDeferType.PUBLIC;

  public requireClientPerms: PermissionsString[] = ['SendMessages'];

  public async execute(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    const subCommand = interaction.options.getSubcommand();
    switch (subCommand) {
      case 'search': {
        const title = interaction.options.getString('title');
        let media: AniListSearchItem;
        try {
          media = await aniList.searchMedia(title);
        } catch (error) {
          throw new APICommunicationError();
        }
        if (!media) {
          throw new AnimeNotFoundWarning(title);
        }

        const embed = this.createAniListSearchEmbed(media);

        await InteractionUtils.send(interaction, embed);
        break;
      }
      case 'schedule': {
        const schedule = aniList.getSchedule();

        let pages: EmbedBuilder[];
        try {
          pages = this.createPages(schedule);
        } catch (error) {
          throw new APICommunicationError();
        }

        const paginatedEmbed = new PaginationEmbed(interaction, pages, 20);
        await paginatedEmbed.start();
      }
    }
  }

  private createAniListSearchEmbed(media: AniListSearchItem) {
    const fields: EmbedField[] = [
      {
        name: 'Genres',
        value: media.genres.join('\n'),
        inline: true,
      },
      {
        name: 'Released',
        value: `${StringUtils.toTitleCase(media.season)} ${media.seasonYear}`,
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
    return embed;
  }

  private createPages(schedule: AniListScheduleDay[]) {
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
