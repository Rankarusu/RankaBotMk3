import axios from 'axios';
import { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { ChatInputCommandInteraction, PermissionsString } from 'discord.js';
import { APICommunicationError } from '../../models';
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
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    let joke: string;
    try {
      joke = await this.getJoke();
    } catch (error) {
      throw new APICommunicationError();
    }
    const embed = this.createDadJokeEmbed(joke);
    await InteractionUtils.send(interaction, embed);
  }

  private createDadJokeEmbed(joke: string) {
    const embed = EmbedUtils.infoEmbed(joke, 'Dad Joke');
    embed.setFooter({ text: 'Powered by icanhazdadjoke.com' });
    return embed;
  }

  private async getJoke(): Promise<string> {
    const response = await axios.get(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'axios',
      },
    });

    const joke = response.data.joke;
    return joke;
  }
}
