import {
  ApplicationCommandOptionType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import {
  ChatInputCommandInteraction,
  EmbedField,
  GuildMember,
  PermissionsString,
} from 'discord.js';
import { EventData } from '../../models/event-data';
import { PaginationEmbed } from '../../models/pagination-embed';
import {
  ClientUtils,
  DbUtils,
  EmbedUtils,
  InteractionUtils,
} from '../../utils';
import { Command, CommandCategory, CommandDeferType } from '../command';

export class ExpCommand extends Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: 'exp',
    description:
      'display your collected experience on this server or a leaderboard',
    dm_permission: false,
    options: [
      {
        name: 'user',
        description: 'display a users exp on this server',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'user',
            description: 'a user to get info about',
            type: ApplicationCommandOptionType.User,
            required: false,
          },
        ],
      },
      {
        name: 'leaderboard',
        description: 'display a leaderboard for this server',
        type: ApplicationCommandOptionType.Subcommand,
      },
    ],
  };

  // cooldown?: RateLimiter;
  public usage = () => `${this.mention()}
  ${this.mention()} \`@User\`
  ${this.mention('leaderboard')}`;

  public note =
    'EXP is acquired by sending messages. The amount gained is slightly randomized.';

  public cooldown = ClientUtils.DbCommandRateLimiter();

  public category: CommandCategory = CommandCategory.EXP;

  public deferType: CommandDeferType = CommandDeferType.PUBLIC;

  public requireClientPerms: PermissionsString[] = ['SendMessages'];

  public async execute(
    interaction: ChatInputCommandInteraction,
    data: EventData
  ): Promise<void> {
    const subCommand = interaction.options.getSubcommand();
    switch (subCommand) {
      case 'user': {
        const userId =
          interaction.options.getUser('user')?.id || interaction.user.id;

        const guildId = interaction.guildId;
        const joinedAt = (interaction.member as GuildMember).joinedAt;
        const user = await DbUtils.getExpByUser(guildId, userId);

        if (!user) {
          InteractionUtils.sendWarning(
            interaction,
            data,
            'This user is not tracked by the EXP-System yet.'
          );
          return;
        }

        const { xp, level } = user;

        const list = await DbUtils.getExpByGuild(guildId);
        const index = list.findIndex((item) => (item.userId = userId));
        const embed = EmbedUtils.memberEmbed(
          interaction.member as GuildMember,
          `**EXP:** ${xp}
          **LVL:** ${level}
          Rank ${index + 1} of ${list.length}`
        );
        await InteractionUtils.send(interaction, embed);
        break;
      }
      case 'leaderboard': {
        const guildId = interaction.guildId;
        const list = await DbUtils.getExpByGuild(guildId);

        if (list.length === 0) {
          InteractionUtils.sendWarning(
            interaction,
            data,
            'There are currently no users registered in the EXP-System. Try to send some messages.'
          );
          return;
        }
        const fields = list.map((item, index) => {
          const name =
            interaction.guild.members.cache.get(item.userId)?.displayName ||
            'User not found';
          return {
            name: `${index + 1}. ${name}`,
            value: `(EXP: ${item.xp} | LVL: ${item.level})`,
          } as EmbedField;
        });

        const embed = EmbedUtils.infoEmbed(
          undefined,
          'EXP-Leaderboard',
          fields
        ).setThumbnail(interaction.guild.iconURL());
        const paginatedEmbed = new PaginationEmbed(interaction, data, embed);
        await paginatedEmbed.start();
        break;
      }
    }
  }
}
