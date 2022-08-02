import { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';
import {
  ChatInputCommandInteraction,
  EmbedField,
  PermissionsString,
} from 'discord.js';

import { EventData } from '../../models/event-data';
import { PaginationEmbed } from '../../models/pagination-embed';
import { aniList } from '../../services/anilist';
import { EmbedUtils } from '../../utils';
import { Command, CommandCategory, CommandDeferType } from '../command';

export class AnimeCommand implements Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: 'anime',
    description: 'get a schedule of all airing anime in Japan',
    dm_permission: true,
  };

  // cooldown?: RateLimiter;
  public helpText = '/anime';

  public category: CommandCategory = CommandCategory.WEEBSHIT;

  public deferType: CommandDeferType = CommandDeferType.PUBLIC;

  public requireClientPerms: PermissionsString[] = ['SendMessages'];

  public async execute(
    interaction: ChatInputCommandInteraction,
    data: EventData
  ): Promise<void> {
    const pages = this.createPages();

    const paginatedEmbed = new PaginationEmbed(interaction, pages, 20);
    paginatedEmbed.start();
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
