export interface RedditPost {
  kind: string;
  data: RedditPostData;
}

export interface RedditPostData {
  subreddit: string;
  title: string;
  name: string;
  selftext: string;
  permalink: string;
  url: string;
  post_hint: string;
  stickied: boolean;
}

export interface RedditListing {
  kind: string;
  data: RedditListingData;
}

export interface RedditListingData {
  after?: string;
  dist: number;
  before?: string;
  children: RedditPost[];
}
