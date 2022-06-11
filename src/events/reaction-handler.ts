import { EventHandler } from './event-handler';
import { MessageReaction, Message, User, MessageFlags } from 'discord.js';
import { Reaction } from '../models/reaction';
import { EventData } from '../models/event-data';
export class ReactionHandler implements EventHandler {
  constructor(private reactions: Reaction[]) {}

  public async process(
    msgReaction: MessageReaction,
    msg: Message,
    reactor: User
  ): Promise<void> {
    if (reactor.id === msgReaction.client.user?.id || reactor.bot) {
      return;
    }
    let reaction = this.findReaction(msgReaction.emoji.name);
    if (!reaction) {
      return;
    }

    if (reaction.requireGuild && msg.author.id !== msg.client.user?.id) {
      return;
    }

    if (reaction.requireSentByClient && msg.author.id !== msg.client.user?.id) {
      return;
    }
    if (
      reaction.requireEmbedAuthorTag &&
      msg.embeds[0]?.author?.name !== reactor.tag
    ) {
      return;
    }

    let data = new EventData();

    await reaction.execute(msgReaction, msg, reactor, data);
  }

  private findReaction(emoji: string): Reaction {
    return this.reactions.find((reaction) => reaction.emoji === emoji);
  }
}
