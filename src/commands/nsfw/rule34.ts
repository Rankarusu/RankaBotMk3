import axios, { AxiosResponse } from 'axios';
import {
  ApplicationCommandOptionType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import { ChatInputCommandInteraction, PermissionsString } from 'discord.js';
import { EventData } from '../../models/event-data';
import { Rule34Post } from '../../models/rule34post';
import { EmbedUtils, InteractionUtils } from '../../utils';
import { Command, CommandCategory, CommandDeferType } from '../command';

const limit = 100;
const url = `https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&`;

export class Rule34Command extends Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: 'rule34',
    description: 'browse rule34',
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
      {
        name: 'tag-03',
        type: ApplicationCommandOptionType.String,
        description: 'a tag to search for',
        required: false,
      },
      {
        name: 'tag-04',
        type: ApplicationCommandOptionType.String,
        description: 'a tag to search for',
        required: false,
      },
      {
        name: 'tag-05',
        type: ApplicationCommandOptionType.String,
        description: 'a tag to search for',
        required: false,
      },
      {
        name: 'tag-06',
        type: ApplicationCommandOptionType.String,
        description: 'a tag to search for',
        required: false,
      },
      {
        name: 'tag-07',
        type: ApplicationCommandOptionType.String,
        description: 'a tag to search for',
        required: false,
      },
      {
        name: 'tag-08',
        type: ApplicationCommandOptionType.String,
        description: 'a tag to search for',
        required: false,
      },
      {
        name: 'tag-09',
        type: ApplicationCommandOptionType.String,
        description: 'a tag to search for',
        required: false,
      },
      {
        name: 'tag-10',
        type: ApplicationCommandOptionType.String,
        description: 'a tag to search for',
        required: false,
      },
    ],
  };

  // cooldown?: RateLimiter;
  public usage = () =>
    `${this.mention()} \`1girls\` \`gloves\` \`fate_(series)\``;

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

    const posts: Rule34Post[] = await this.getPost(tags, data);

    if (posts.length === 0) {
      InteractionUtils.sendWarning(
        interaction,
        data,
        'I could not find anything matching your taste you sick fuck.'
      );
      return;
    }

    const post = posts[Math.floor(Math.random() * posts.length)];

    const embed = EmbedUtils.infoEmbed(undefined, 'Rule34');
    embed
      .setFooter({ text: 'Powered by rule34.xxx' })
      .setURL(`https://rule34.xxx/index.php?page=post&s=view&id=${post.id}`)
      .setColor('#AAE5A4')
      .setImage(post.file_url);

    InteractionUtils.send(interaction, embed);
  }

  private async getPost(
    tags: string[],
    data: EventData
  ): Promise<Rule34Post[]> {
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
          json: 1,
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
