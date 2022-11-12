import {
  ApplicationCommandOptionType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import { ChatInputCommandInteraction, PermissionsString } from 'discord.js';
import { APICommunicationError, DanbooruPost } from '../../models';
import { WeirdTastesWarning } from '../../models/warnings';
import { ClientUtils, EmbedUtils, InteractionUtils } from '../../utils';
import { RequestUtils } from '../../utils/request-utils';
import { Command, CommandCategory, CommandDeferType } from '../command';

const limit = 100;
const url = 'https://danbooru.donmai.us/posts.json';

export class DanbooruCommand extends Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: 'danbooru',
    description: 'browse danbooru',
    dm_permission: false,
    options: [
      {
        name: 'tag-01',
        type: ApplicationCommandOptionType.String,
        description: 'a tag to search for',
        required: true,
      },
      {
        name: 'tag-02',
        type: ApplicationCommandOptionType.String,
        description: 'a tag to search for',
        required: false,
      },
    ],
  };

  public usage = () => `${this.mention()} \`armpits\` \`nude\``;

  public note = 'The danbooru API limits free requests to 2 tags per query.';

  public cooldown = ClientUtils.APICallCommandRateLimiter();

  public category: CommandCategory = CommandCategory.NSFW;

  public deferType: CommandDeferType = CommandDeferType.PUBLIC;

  public requireClientPerms: PermissionsString[] = ['SendMessages'];

  public nsfw?: boolean = true;

  public async execute(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    const tags = interaction.options.data
      .filter((option) => option.name.match(/tag-\d\d/g))
      .map((tag) => tag.value) as string[];

    let posts: DanbooruPost[];

    try {
      posts = await RequestUtils.getBooruPosts<DanbooruPost>(url, tags, limit);
    } catch (error) {
      throw new APICommunicationError();
    }

    if (posts.length === 0) {
      throw new WeirdTastesWarning();
    }

    const post = posts[Math.floor(Math.random() * posts.length)];

    const embed = EmbedUtils.danbooruEmbed(post);

    await InteractionUtils.send(interaction, embed);
  }
}
