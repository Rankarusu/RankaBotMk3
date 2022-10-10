import {
  ApplicationCommandOptionType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import {
  ChatInputCommandInteraction,
  GuildMember,
  PermissionsString,
} from 'discord.js';
import { EventData } from '../../models/event-data';
import { hugs } from '../../static/hugs.json';
import { EmbedUtils, InteractionUtils } from '../../utils';
import { Command, CommandCategory, CommandDeferType } from '../command';

const Config = require('../../../config/config.json');

export class HugCommand extends Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: 'hug',
    description: 'display your affinity to a user by hugging them',
    dm_permission: false,
    options: [
      {
        name: 'user',
        type: ApplicationCommandOptionType.User,
        description: 'the user to hug',
        required: true,
      },
    ],
  };

  // cooldown?: RateLimiter;
  public usage = () => `${this.mention()} \`@User\``;

  public category: CommandCategory = CommandCategory.MISC;

  public deferType: CommandDeferType = CommandDeferType.PUBLIC;

  public requireClientPerms: PermissionsString[] = ['SendMessages'];

  public async execute(
    interaction: ChatInputCommandInteraction,
    data: EventData
  ): Promise<void> {
    const user = interaction.options.getMember('user');
    const embed = this.createHugEmbed(
      interaction.member as GuildMember,
      user as GuildMember
    );
    InteractionUtils.send(interaction, embed);
  }

  private createHugEmbed(hugger: GuildMember, hugged: GuildMember) {
    const message: string = this.getEmbedDescription(hugger, hugged);
    const gif = hugs[Math.floor(Math.random() * hugs.length)];
    const embed = EmbedUtils.memberEmbed(hugger, message).setImage(gif);

    return embed;
  }

  private getEmbedDescription(hugger: GuildMember, hugged: GuildMember) {
    let message: string;

    if (hugger.id === hugged.id) {
      message = `${hugger.displayName} hugged themselves! No shame in that!`;
    } else if (hugged.id === Config.client.id) {
      message = `${hugger.displayName} hugged me! I'm so happy!`;
    } else if (hugged.user.bot) {
      message = `${hugger.displayName} hugged ${hugged.displayName}! Bots need love too!`;
    } else {
      message = `${hugged.user}, you have been hugged by ${hugger.displayName}!`;
    }
    return message;
  }
}
