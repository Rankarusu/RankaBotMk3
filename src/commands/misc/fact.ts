import axios, { AxiosResponse } from 'axios';
import { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { ChatInputCommandInteraction, PermissionsString } from 'discord.js';

import { EventData } from '../../models/event-data';
import { EmbedUtils, InteractionUtils } from '../../utils';
import { Command, CommandCategory, CommandDeferType } from '../command';

export class FactCommand implements Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: 'fact',
    description: 'post a random fact',
    dm_permission: true,
  };

  // cooldown?: RateLimiter;
  public helpText = '/fact';

  public category: CommandCategory = CommandCategory.MISC;

  public deferType: CommandDeferType = CommandDeferType.PUBLIC;

  public requireClientPerms: PermissionsString[] = ['SendMessages'];

  public async execute(
    interaction: ChatInputCommandInteraction,
    data: EventData
  ): Promise<void> {
    const fact = await this.getFact(data);
    const embed = EmbedUtils.infoEmbed(fact, 'Random Fact');
    embed.setFooter({ text: 'Powered by www.thefact.space' });
    InteractionUtils.send(interaction, embed);
  }

  private async getFact(data: EventData): Promise<string> {
    let response: AxiosResponse;
    try {
      response = await axios.get('https://www.thefact.space/random', {
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
    const text = response.data.text;
    return text;
  }
}