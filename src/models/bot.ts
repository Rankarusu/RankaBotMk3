import {
  Client,
  Constants,
  Interaction,
  Message,
  MessageReaction,
  PartialMessageReaction,
  PartialUser,
  User,
} from 'discord.js';
import { CommandHandler } from '../events/command-handler';
import { MessageHandler } from '../events/message-handler';
import { ReactionHandler } from '../events/reaction-handler';
import { PartialUtils } from '../utils/partial-utils';
import { CommandInteraction, ButtonInteraction } from 'discord.js';
//import handlers

export class Bot {
  private ready = false;

  constructor(
    private token: string,
    private client: Client,
    // private guildJoinHandler: GuildJoinHandler,
    // private guildLeaveHandler: GuildLeaveHandler,
    private messageHandler: MessageHandler,
    private commandHandler: CommandHandler,
    private reactionHandler: ReactionHandler
  ) {}

  public async start(): Promise<void> {
    this.registerListeners();
    await this.client.login(this.token);
  }

  private registerListeners(): void {
    this.client.on(Constants.Events.CLIENT_READY, () => {
      console.log('Bot is ready!');
      this.onReady();
    });
    this.client.on(Constants.Events.MESSAGE_CREATE, (msg: Message) =>
      this.onMessage(msg)
    );
    this.client.on(
      Constants.Events.INTERACTION_CREATE,
      (interaction: Interaction) => this.onInteraction(interaction)
    );
    //TODO: join and leave handlers
    this.client.on(
      Constants.Events.MESSAGE_REACTION_ADD,
      (
        msgReaction: MessageReaction | PartialMessageReaction,
        user: User | PartialUser
      ) => this.onReaction(msgReaction, user)
    );
  }
  private async login(token: string): Promise<void> {
    try {
      await this.client.login(token);
    } catch (error) {
      //TODO: actual logging
      console.error(error);
    }
  }

  private async onReady(): Promise<void> {
    let userTag = this.client.user?.tag;
    //TODO: actual logging
    console.log(`Logged in as ${userTag}`);
    this.ready = true;
  }

  private async onMessage(msg: Message): Promise<void> {
    if (!this.ready) {
      return;
    }
    //we use the partial utils to fill in the missing properties here
    msg = await PartialUtils.fillMessage(msg);
    if (!msg) {
      return;
    }

    try {
      await this.messageHandler.process(msg);
    } catch (error) {
      console.error(error);
      //TODO: actual logging
    }
  }

  private async onInteraction(interaction: Interaction): Promise<void> {
    if (!this.ready) {
      return;
    }

    if (interaction instanceof CommandInteraction) {
      try {
        await this.commandHandler.process(interaction);
      } catch (error) {
        console.error(error);
      }
      // else if(interaction instanceof ButtonInteraction){}
      //TODO: buttoninteraction later
    }
  }

  private async onReaction(
    msgReaction: MessageReaction | PartialMessageReaction,
    reactor: User | PartialUser
  ): Promise<void> {
    if (!this.ready) {
      return;
    }
    msgReaction = await PartialUtils.fillReaction(msgReaction);
    if (!msgReaction) {
      return;
    }
    reactor = await PartialUtils.fillUser(reactor);
    if (!reactor) {
      return;
    }
    try {
      await this.reactionHandler.process(
        msgReaction,
        msgReaction.message as Message,
        reactor
      );
    } catch (error) {
      console.error(error);
    }
  }
}
