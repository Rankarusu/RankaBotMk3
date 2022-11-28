import { ExtendedEmbedPage } from './extended-embed-page';
import { ExtendedPaginationEmbed } from './extended-pagination-embed';

export abstract class SelfGeneratingPaginationEmbed extends ExtendedPaginationEmbed {
  public abstract start(): Promise<void>;
  protected abstract update(): Promise<void>;
  protected abstract initializeAdditionalCollectors(): void;
  protected abstract createEmbedPages(
    data: Array<unknown>
  ): Array<ExtendedEmbedPage>;
}
