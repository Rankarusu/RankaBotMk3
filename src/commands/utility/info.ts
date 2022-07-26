import { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';
import {
  ChatInputCommandInteraction,
  EmbedField,
  PermissionsString,
} from 'discord.js';

// eslint-disable-next-line node/no-unpublished-import
import { EventData } from '../../models/event-data';
import { Command, CommandCategory, CommandDeferType } from '../command';
import os from 'os';
import { DateUtils, EmbedUtils, InteractionUtils } from '../../utils';

export class InfoCommand implements Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: 'info',
    description: 'display information about me',
    dm_permission: true,
  };

  // cooldown?: RateLimiter;
  public helpText = '/info';

  public category: CommandCategory = CommandCategory.UTILITY;

  public deferType: CommandDeferType = CommandDeferType.PUBLIC;

  public requireClientPerms: PermissionsString[] = ['SendMessages'];

  public async execute(
    interaction: ChatInputCommandInteraction,
    data: EventData
  ): Promise<void> {
    //TODO: time formatter function
    const stats: EmbedField[] = [
      {
        name: 'Version',
        value: `${process.env.npm_package_version}`,
        inline: false,
      },
      {
        name: 'Platform',
        value: `${process.platform}`,
        inline: true,
      },
      {
        name: 'CPU',
        value: `${os.cpus()[0].model}`,
        inline: true,
      },
      {
        name: 'RAM',
        value: `${Math.round(os.totalmem() / 1024 / 1024 / 1024)} GB`,
        inline: true,
      },
      {
        name: 'Uptime',
        value: `${DateUtils.prettyPrintTimestamp(interaction.client.uptime)}`,
        inline: true,
      },
      {
        name: 'Servers',
        value: `${interaction.client.guilds.cache.size}`,
        inline: true,
      },
      {
        name: 'Users',
        value: `${
          interaction.client.users.cache.filter((user) => !user.bot).size
        }`,
        inline: true,
      },
    ];

    const embed = EmbedUtils.infoEmbed(
      `Here is some general information about me.
      You can also [visit me on GitHub](https://github.com/Rankarusu/RankaBotMk3)`,
      'RankaBotMk3',
      stats
    );
    embed.setThumbnail(interaction.client.user.avatarURL());
    InteractionUtils.send(interaction, embed);
  }
}
