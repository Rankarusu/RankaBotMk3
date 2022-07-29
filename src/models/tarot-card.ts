export interface TarotCard {
  fortune_telling: string[];
  keywords: string[];
  meanings: {
    light: string[];
    shadow: string[];
  };
  name: string;
  rank: string | number;
  suit: string;
  img: string;
  imgReverse: string;
}

export interface TarotCardDraw {
  card: TarotCard;
  reverse: boolean;
}
