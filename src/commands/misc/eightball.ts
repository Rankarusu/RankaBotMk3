import {
  ApplicationCommandOptionType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import { ChatInputCommandInteraction, PermissionsString } from 'discord.js';

import { EventData } from '../../models/event-data';
import { EmbedUtils, InteractionUtils } from '../../utils';
import { Command, CommandCategory, CommandDeferType } from '../command';

export class EightballCommand implements Command {
  public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
    name: 'eightball',
    description: 'helps you on hard decisions',
    dm_permission: true,
    options: [
      {
        name: 'question',
        type: ApplicationCommandOptionType.String,
        description: 'the question you want to ask the eightball',
        required: false,
      },
    ],
  };

  // cooldown?: RateLimiter;
  public helpText = '/eightball';

  public category: CommandCategory = CommandCategory.MISC;

  public deferType: CommandDeferType = CommandDeferType.PUBLIC;

  public requireClientPerms: PermissionsString[] = ['SendMessages'];

  private answers = [
    'It is certain.',
    'It is decidedly so.',
    'Without a doubt.',
    'Yes definitely.',
    'You may rely on it.',

    'As I see it, yes.',
    'Most likely.',
    'Outlook good.',
    'Yes.',
    'Signs point to yes.',

    'Reply hazy, try again.',
    'Ask again later.',
    'Better not tell you now.',
    'Cannot predict now.',
    'Concentrate and ask again.',

    "Don't count on it.",
    'My reply is no.',
    'My sources say no.',
    'Outlook not so good.',
    'Very doubtful.',
  ];

  public async execute(
    interaction: ChatInputCommandInteraction,
    data: EventData
  ): Promise<void> {
    const question = interaction.options.getString('question');
    const answer =
      this.answers[Math.floor(Math.random() * this.answers.length)];
    const embed = EmbedUtils.infoEmbed(
      `${question ? `**Q:** ${question}` : ''}
    🎱 ${answer}`,
      'Magic 8 Ball'
    );
    InteractionUtils.send(interaction, embed);
  }
}
