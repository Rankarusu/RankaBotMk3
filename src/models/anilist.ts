export interface AniListGQLItem {
  episode: number;
  airingAt: number;
  media: {
    title: {
      native?: string;
      romaji?: string;
      english?: string;
    };
    type: MediaType;
    countryOfOrigin: string;
    format: MediaFormat;
  };
}

export enum MediaType {
  ANIME = 'ANIME',
  MANGA = 'MANGA',
}

export enum MediaFormat {
  TV = 'TV',
  TV_SHORT = 'TV_SHORT',
  MOVIE = 'MOVIE',
  SPECIAL = 'SPECIAL',
  OVA = 'OVA',
  ONA = 'ONA',
  MUSIC = 'MUSIC',
  MANGA = 'MANGA',
  NOVEL = 'NOVEL',
  ONE_SHOT = 'ONE_SHOT',
}
