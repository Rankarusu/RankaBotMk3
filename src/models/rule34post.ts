export interface Rule34Post {
  preview_url: string;
  sample_url: string;
  file_url: string;
  directory: number;
  hash: string;
  height: number;
  id: number;
  image: string;
  change: number;
  owner: 'bot';
  parent_id: number;
  rating: string;
  sample: number;
  sample_height: number;
  sample_width: number;
  score: number;
  tags: string; //fucking string response.
  width: number;
}
