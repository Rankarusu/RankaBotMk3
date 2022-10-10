import axios, { AxiosResponse } from 'axios';
import { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { ChatInputCommandInteraction, PermissionsString } from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import { EventData } from '../../models/event-data';
import { ClientUtils, EmbedUtils, InteractionUtils } from '../../utils';
import { Command, CommandCategory, CommandDeferType } from '../command';

const url = 'https://icanhazdadjoke.com/';
export class DadJokeCommand extends Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: 'dadjoke',
    description: 'post a dad joke',
    dm_permission: true,
  };

  public usage = () => this.mention();

  public cooldown = ClientUtils.APICallCommandRateLimiter();

  public category: CommandCategory = CommandCategory.MISC;

  public deferType: CommandDeferType = CommandDeferType.PUBLIC;

  public requireClientPerms: PermissionsString[] = ['SendMessages'];

  public async execute(
    interaction: ChatInputCommandInteraction,
    data: EventData
  ): Promise<void> {
    const joke = await this.getJoke(data);
    const embed = this.createEmbed(joke);
    InteractionUtils.send(interaction, embed);
  }

  private createEmbed(joke: string) {
    const embed = EmbedUtils.infoEmbed(joke, 'Dad Joke');
    embed.setFooter({ text: 'Powered by icanhazdadjoke.com' });
    return embed;
  }

  private async getJoke(data: EventData): Promise<string> {
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
    const joke = response.data.joke;
    return joke;
  }
}
