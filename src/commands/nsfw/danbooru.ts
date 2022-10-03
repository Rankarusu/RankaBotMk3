import axios, { AxiosResponse } from 'axios';
import {
  ApplicationCommandOptionType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import { ChatInputCommandInteraction, PermissionsString } from 'discord.js';
import { EventData } from '../../models/event-data';
import { ClientUtils, EmbedUtils, InteractionUtils } from '../../utils';
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
    interaction: ChatInputCommandInteraction,
    data: EventData
  ): Promise<void> {
    const tags = interaction.options.data
      .filter((option) => option.name.match(/tag-\d\d/g))
      .map((tag) => tag.value) as string[];

    const posts: DanbooruPost[] = await this.getPost(tags, data);

    if (posts.length === 0) {
      InteractionUtils.sendWarning(
        interaction,
        data,
        'I could not find anything matching your taste you sick fuck.'
      );
      return;
    }

    const post = posts[Math.floor(Math.random() * posts.length)];

    const embed = EmbedUtils.infoEmbed(undefined, 'Danbooru');
    embed
      .setFooter({ text: 'Powered by danbooru.donmai.us' })
      .setURL(`https://danbooru.donmai.us/posts/${post.id}`)
      .setColor('#0075f8')
      .setImage(post.file_url);

    InteractionUtils.send(interaction, embed);
  }

  private async getPost(
    tags: string[],
    data: EventData
  ): Promise<DanbooruPost[]> {
    let response: AxiosResponse;
    try {
      response = await axios.get(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'axios',
        },
        params: {
          limit,
          tags: tags.join(' '),
        },
      });
    } catch (error) {
      InteractionUtils.sendError(
        data,
        'An error occurred while communicating with the API'
      );
    }
    return response.data;
  }
}
