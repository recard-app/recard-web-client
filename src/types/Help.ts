/**
 * Client-side Help Content Types
 *
 * Mirrors the server help types but tailored for frontend consumption.
 * The server HelpArticle includes `plainText` for search/agent use;
 * the client only needs the rendered markdown `content`.
 */

export interface HelpArticleMeta {
  id: string;
  title: string;
  category: string;
  categoryLabel: string;
  order: number;
  tags: string[];
  description?: string;
  defaultExpanded?: boolean;
}

export interface HelpArticleContent extends HelpArticleMeta {
  content: string;
}

export interface HelpTocCategory {
  category: string;
  label: string;
  articles: HelpTocArticle[];
}

export interface HelpTocArticle {
  id: string;
  title: string;
  order: number;
}

export interface HelpSearchResult {
  id: string;
  title: string;
  category: string;
  categoryLabel: string;
  description?: string;
  snippet: string;
}
