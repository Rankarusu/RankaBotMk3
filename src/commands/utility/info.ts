import { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';
import {
  ChatInputCommandInteraction,
  EmbedField,
  PermissionsString,
} from 'discord.js';
import os from 'os';
import { DateUtils, EmbedUtils, InteractionUtils } from '../../utils';
import { Command, CommandCategory, CommandDeferType } from '../command';

export class InfoCommand extends Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: 'info',
    description: 'display information about me',
    dm_permission: true,
  };

  // cooldown?: RateLimiter;
  public usage = () => this.mention();

  public category: CommandCategory = CommandCategory.UTILITY;

  public deferType: CommandDeferType = CommandDeferType.NONE;

  public requireClientPerms: PermissionsString[] = ['SendMessages'];

  public async execute(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    const stats: EmbedField[] = this.getStats(interaction);

    const embed = this.createInfoEmbed(stats);
    embed.setThumbnail(interaction.client.user.avatarURL());
    await InteractionUtils.send(interaction, embed);
  }

  private getStats(interaction: ChatInputCommandInteraction): EmbedField[] {
    return [
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
        value: `${this.getKnownUsers(interaction)}`,
        inline: true,
      },
    ];
  }

  private createInfoEmbed(stats: EmbedField[]) {
    return EmbedUtils.infoEmbed(
      `Here is some general information about me.
      You can also [visit me on GitHub](https://github.com/Rankarusu/RankaBotMk3)`,
      'RankaBotMk3',
      stats
    );
  }

  private getKnownUsers(interaction: ChatInputCommandInteraction) {
    return interaction.client.users.cache.filter((user) => !user.bot).size;
  }
}
