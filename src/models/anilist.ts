export interface AniListAiringScheduleItem {
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

export interface AniListScheduleDay {
  day: number;
  airing: AniListAiringScheduleItem[];
}

export interface AniListSearchItem {
  idMal: number;
  title: {
    native: string;
    romaji: string;
    english: string;
  };
  type: MediaType;
  format: MediaFormat;
  description: string;
  siteUrl: string;
  genres: string[];
  season: MediaSeason;
  seasonYear: number;
  averageScore: number;
  meanScore: number;
  coverImage: {
    medium: string;
  };
  nextAiringEpisode?: {
    airingAt: number;
  };
}

export enum MediaType {
  ANIME = 'ANIME',
  MANGA = 'MANGA',
}

export enum MediaSeason {
  WINTER = 'WINTER',
  SPRING = 'SPRING',
  SUMMER = 'SUMMER',
  FALL = 'FALL',
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
