export interface ScrapeOptions {
  formats?: ('markdown' | 'html' | 'text' | 'structured')[];
  waitFor?: number;
  timeout?: number;
}

export interface BatchOptions {
  formats?: ('markdown' | 'html' | 'text' | 'structured')[];
  timeout?: number;
}

export interface SearchOptions {
  num?: number;
  formats?: ('markdown' | 'html' | 'text' | 'structured')[];
  timeout?: number;
}

export interface PageMetadata {
  title?: string;
  description?: string;
  url?: string;
  statusCode?: number;
}

export interface ScrapeData {
  markdown?: string;
  html?: string;
  text?: string;
  structured?: Record<string, any>;
  metadata?: PageMetadata;
}

export interface ScrapeResponse {
  success: boolean;
  data: ScrapeData;
}

export interface BatchResult {
  url: string;
  success: boolean;
  data?: ScrapeData;
  error?: string;
}

export interface BatchResponse {
  success: boolean;
  data: BatchResult[];
}

export interface SearchResult {
  url: string;
  title?: string;
  snippet?: string;
  success: boolean;
  data?: ScrapeData;
  error?: string;
}

export interface SearchResponse {
  success: boolean;
  data: SearchResult[];
}

export interface CrawlAPIOptions {
  apiKey: string;
  baseUrl?: string;
}

export declare class CrawlAPI {
  constructor(options: CrawlAPIOptions);
  scrape(url: string, options?: ScrapeOptions): Promise<ScrapeResponse>;
  batch(urls: string[], options?: BatchOptions): Promise<BatchResponse>;
  search(query: string, options?: SearchOptions): Promise<SearchResponse>;
}

export default CrawlAPI;
