import axios from 'axios';
import { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { ChatInputCommandInteraction, PermissionsString } from 'discord.js';
import { APICommunicationError } from '../../models';
import { ClientUtils, EmbedUtils, InteractionUtils } from '../../utils';
import { Command, CommandCategory, CommandDeferType } from '../command';

const url = 'https://www.thefact.space/random';

export class FactCommand extends Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: 'fact',
    description: 'post a random fact',
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
    let fact: string;
    try {
      fact = await this.getFact();
    } catch (error) {
      throw new APICommunicationError();
    }
    const embed = this.createFactEmbed(fact);
    InteractionUtils.send(interaction, embed);
  }

  private createFactEmbed(fact: string) {
    const embed = EmbedUtils.infoEmbed(fact, 'Random Fact');
    embed.setFooter({ text: 'Powered by www.thefact.space' });
    return embed;
  }

  private async getFact(): Promise<string> {
    const response = await axios.get(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'axios',
      },
    });

    const text = response.data.text;
    return text;
  }
}
