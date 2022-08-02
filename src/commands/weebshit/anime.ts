import axios, { AxiosResponse } from 'axios';
import { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';
import {
  ChatInputCommandInteraction,
  EmbedField,
  PermissionsString,
} from 'discord.js';
import { first } from 'lodash';

import { EventData } from '../../models/event-data';
import { PaginationEmbed } from '../../models/pagination-embed';
import { aniList } from '../../services/anilist';
import { EmbedUtils, InteractionUtils } from '../../utils';
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
      const description = `**${day.day}**`;

      const fields: EmbedField[] = day.airing.map((anime) => {
        return {
          name: anime.media.title.romaji,
          value: `Episode ${anime.episode}: <t:${anime.airingAt}:t>`,
          inline: false,
        };
      });
      const embed = EmbedUtils.infoEmbed(
        description,
        `Anime airing on ${day.day}`,
        fields
      );
      embed.setFooter({ text: 'Powered by anilist.co' });
      return embed;
    });
    return pages;
  }
}
