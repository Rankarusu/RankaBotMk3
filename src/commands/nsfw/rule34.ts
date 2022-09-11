import {
  ApplicationCommandOptionType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import { ChatInputCommandInteraction, PermissionsString } from 'discord.js';

import axios, { AxiosResponse } from 'axios';
import { EventData } from '../../models/event-data';
import { InteractionUtils } from '../../utils';
import { Command, CommandCategory, CommandDeferType } from '../command';
import { Rule34Post } from '../../models/rule34post';

export class Rule34Command implements Command {
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
    ],
  };

  // cooldown?: RateLimiter;
  public helpText = '/rule34 `1girls` `gloves`';

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
      .map((tag) => tag.value);
    const limit = 5;
    const url = `https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&&json=1&limit=${limit}&tags=${tags.join(
      ' '
    )}`;
    let response: AxiosResponse;
    try {
      response = await axios.get(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'axios',
        },
      });
    } catch (error) {
      InteractionUtils.sendError(
        data,
        'An error occurred while communicating with the API'
      );
    }
    const posts: Rule34Post[] = response.data;
    const urls = posts.map((post) => post.file_url);
    InteractionUtils.send(interaction, urls.join('\n'));
  }
}
