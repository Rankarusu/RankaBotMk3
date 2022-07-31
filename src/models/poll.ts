import {
  ChatInputCommandInteraction,
  CommandInteractionOption,
  EmbedBuilder,
  EmbedField,
  Message,
} from 'discord.js';
import { EmbedUtils, InteractionUtils, MessageUtils } from '../utils';

export class PollOption {
  embedField: EmbedField;

  emoji: string;

  votes: number;
}

export class Poll {
  private numbers = [
    '1️⃣',
    '2️⃣',
    '3️⃣',
    '4️⃣',
    '5️⃣',
    '6️⃣',
    '7️⃣',
    '8️⃣',
    '9️⃣',
    '🔟',
  ];

  private question: string;

  private message: Message;

  private options: PollOption[] = [];

  private embed: EmbedBuilder;

  private timeLimit: number;

  private onlyOneVote: boolean;

  constructor(
    question: string,
    options: CommandInteractionOption[],
    timeLimit: number,
    onlyOneVote: boolean
  ) {
    this.question = question;
    this.timeLimit = timeLimit;
    this.onlyOneVote = onlyOneVote;
    this.createPollOptions(options);
    this.createPollEmbed();
  }

  public async start(interaction: ChatInputCommandInteraction) {
    this.message = await InteractionUtils.send(interaction, this.embed);
    this.options.forEach((option) => this.message.react(option.emoji));
    this.createVoteCollector();
  }

  private updateMessage() {
    MessageUtils.edit(this.message, this.embed);
  }

  private createPollEmbed() {
    this.embed = EmbedUtils.infoEmbed(
      undefined,
      this.question,
      this.options.map((option) => option.embedField)
    );
  }

  private createPollOptions(options: CommandInteractionOption[]) {
    this.options = options.map((option, index) => {
      return {
        embedField: {
          name: `${this.numbers[index]} - ${option.value}`,
          value: '\u200B',
          inline: true,
        },
        emoji: this.numbers[index],
        votes: 0,
      };
    });
  }

  private updatePollOptions() {
    const votesSum = this.options.reduce((acc, cur) => acc + cur.votes, 0);
    this.options.sort((a, b) => b.votes - a.votes);
    this.options.forEach((option) => {
      const percentage = (option.votes / votesSum) * 100;
      option.embedField.value = `${option.votes} ${
        option.votes === 1 ? 'vote' : 'votes'
      } (${percentage.toFixed(0)}%)`;
    });
  }

  private createVoteCollector() {
    const collector = this.message.createReactionCollector({
      time: this.timeLimit * 60 * 1000,
    });
    collector.on('collect', (reaction, user) => {
      //remove multiple votes
      if (this.onlyOneVote) {
        this.message.reactions.cache.forEach((element) => {
          if (
            element.users.cache.has(user.id) &&
            element.emoji.name !== reaction.emoji.name &&
            user.id !== reaction.client.user.id
          ) {
            element.users.remove(user);
          }
        });
      }
    });
    collector.on('end', () => {
      //remove all reactions
      const reactions = this.message.reactions.cache;
      reactions.forEach((element) => {
        this.options.find(
          (option) => option.emoji === element.emoji.name
        ).votes = element.users.cache.size - 1;
        //subtract the bot vote
      });
      this.message.reactions.removeAll();
      this.updatePollOptions();
      this.createPollEmbed();
      this.updateMessage();
    });
  }
}
