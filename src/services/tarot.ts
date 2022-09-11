import tarotCards from '../public/data/tarot.json';
import { TarotCard, TarotCardDraw } from '../models/tarot-card';
import path from 'path';

export class Tarot {
  private deck = tarotCards.tarot_interpretations;

  private majorArcana = this.deck.filter((c) => c.suit === 'major');

  private minorArcana = this.deck.filter((c) => c.suit !== 'major');

  public pathToImages = path.resolve(
    __dirname,
    '../public/images/tarot-cards/'
  );

  public drawCard(reverseChance = 0.5): TarotCardDraw {
    const card = this.deck[Math.floor(Math.random() * this.deck.length)];
    const reverse = Math.random() < reverseChance;
    return { card, reverse };
  }

  public getMajorArcana(num: number): TarotCard {
    const card = this.majorArcana.find((c) => c.rank === num);
    return card;
  }

  public getMinorArcana(suit: string, rank: number | string): TarotCard {
    const card = this.minorArcana.find(
      (c) => c.suit === suit && c.rank === rank
    );
    return card;
  }
}

//get suits
//getBySuit
//getByRank
