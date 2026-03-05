import axios from 'axios';
import { apiurl } from './index';
import type { HelpArticleContent, HelpTocCategory, HelpSearchResult } from '../types';

const BASE = `${apiurl}/api/v1/help`;

let tocCache: HelpTocCategory[] | null = null;
const articleCache = new Map<string, HelpArticleContent>();

export const HelpService = {
  async fetchTableOfContents(): Promise<HelpTocCategory[]> {
    if (tocCache) return tocCache;
    const { data } = await axios.get<{ categories: HelpTocCategory[] }>(`${BASE}/toc`);
    tocCache = data.categories;
    return data.categories;
  },

  async fetchArticle(id: string): Promise<HelpArticleContent> {
    const cached = articleCache.get(id);
    if (cached) return cached;
    const { data } = await axios.get<{ article: HelpArticleContent }>(`${BASE}/${id}`);
    articleCache.set(id, data.article);
    return data.article;
  },

  async fetchArticles(filters?: { category?: string; tag?: string }): Promise<HelpArticleContent[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.set('category', filters.category);
    if (filters?.tag) params.set('tag', filters.tag);
    const query = params.toString();
    const { data } = await axios.get<{ articles: HelpArticleContent[] }>(`${BASE}${query ? `?${query}` : ''}`);
    return data.articles;
  },

  async searchArticles(query: string): Promise<HelpSearchResult[]> {
    const { data } = await axios.get<{ results: HelpSearchResult[] }>(`${BASE}/search`, {
      params: { q: query },
    });
    return data.results;
  },
};
