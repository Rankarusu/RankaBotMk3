import axios from 'axios';
import { DanbooruPost, Rule34Post } from '../models';

export class RequestUtils {
  public static async getBooruPosts<T extends DanbooruPost | Rule34Post>(
    url: string,
    tags: string[],
    limit = 100
  ): Promise<T[]> {
    const response = await axios.get(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'axios',
      },
      params: {
        limit,
        tags: tags.join(' '),
      },
    });

    return response.data;
  }
}
