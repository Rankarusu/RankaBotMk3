import tarotCards from '../../data/tarot.json';

export class Tarot {
  private deck = tarotCards.tarot_interpretations;

  public pathToImages = './data/tarot-cards/';

  public drawCard(reverseChance = 0.5) {
    const card = this.deck[Math.floor(Math.random() * this.deck.length)];
    const reverse = Math.random() < reverseChance;
    return { card, reverse };
  }
}

//get major
//get minor
//get suits
//getBySuit
//getByRank
