import {
  ApplicationCommandOptionType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import {
  AttachmentBuilder,
  ChatInputCommandInteraction,
  GuildMember,
  PermissionsString,
} from 'discord.js';

// eslint-disable-next-line node/no-unpublished-import
import { EventData } from '../../models/event-data';
import { EmbedUtils, InteractionUtils } from '../../utils';
import { Command, CommandCategory, CommandDeferType } from '../command';
import fs from 'fs';

export class HugCommand implements Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: 'hug',
    description: 'Display your affinity to a user by hugging them',
    dm_permission: false,
    options: [
      {
        name: 'user',
        type: ApplicationCommandOptionType.User,
        description: 'The user to hug',
        required: true,
      },
    ],
  };

  // cooldown?: RateLimiter;
  public helpText = '/hug @user#0815';

  public category: CommandCategory = CommandCategory.MISC;

  public deferType: CommandDeferType = CommandDeferType.PUBLIC;

  public requireClientPerms: PermissionsString[] = ['SendMessages'];

  private pathToImages = './data/hugs/';

  public async execute(
    interaction: ChatInputCommandInteraction,
    data: EventData
  ): Promise<void> {
    const user = interaction.options.getMember('user');
    const { embed, file } = this.createHugEmbed(
      interaction.member as GuildMember,
      user as GuildMember
    );
    InteractionUtils.send(interaction, embed, undefined, [file]);
  }

  private getRandomHug() {
    const files = fs.readdirSync(this.pathToImages);
    const randomFile = files[Math.floor(Math.random() * files.length)];
    return randomFile;
  }

  private createHugEmbed(hugger: GuildMember, hugged: GuildMember) {
    const filename = this.getRandomHug();
    const file = new AttachmentBuilder(`${this.pathToImages}${filename}`);

    const embed = EmbedUtils.memberEmbed(
      hugger,
      `${hugged.user}, you have been hugged by ${hugger.displayName}!`
    );
    embed.setImage(`attachment://${filename}`);

    return { embed, file };
  }
}
