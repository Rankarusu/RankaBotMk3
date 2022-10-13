export interface RedditListingWrapper {
  kind: string;
  data: RedditListing;
}

export interface RedditListing {
  after?: string;
  dist: number;
  before?: string;
  children: RedditPostWrapper[];
}

export interface RedditPostWrapper {
  kind: string;
  data: RedditPost;
}

export interface RedditPost {
  subreddit: string;
  title: string;
  name: string;
  selftext: string;
  permalink: string;
  url: string;
  post_hint: string;
  stickied: boolean;
  ups: number;
  downs: number;
  over_18: boolean;
  id: string;
  media?: {
    reddit_video?: {
      fallback_url: string;
    };
  };
}
