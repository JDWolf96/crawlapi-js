/**
 * CrawlAPI JavaScript SDK
 * Web scraping API for AI agents — URL in, clean markdown out.
 * https://crawlapi.net
 */

const BASE_URL = 'https://crawlapi.net';

class CrawlAPI {
  /**
   * @param {Object} options
   * @param {string} options.apiKey - Your RapidAPI key
   * @param {string} [options.baseUrl] - Override base URL (optional)
   */
  constructor({ apiKey, baseUrl } = {}) {
    if (!apiKey) throw new Error('CrawlAPI: apiKey is required');
    this.apiKey = apiKey;
    this.baseUrl = baseUrl || BASE_URL;
  }

  _headers() {
    return {
      'Content-Type': 'application/json',
      'X-RapidAPI-Key': this.apiKey,
    };
  }

  async _post(path, body) {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: this._headers(),
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data;
  }

  /**
   * Scrape a single URL.
   * @param {string} url - The URL to scrape
   * @param {Object} [options]
   * @param {string[]} [options.formats] - Output formats: 'markdown', 'html', 'text', 'structured'
   * @param {number} [options.waitFor] - Ms to wait after page load (for JS-heavy pages)
   * @param {number} [options.timeout] - Max ms to wait (default 30000, max 60000)
   * @returns {Promise<Object>} Scraped data
   */
  async scrape(url, { formats = ['markdown'], waitFor, timeout } = {}) {
    return this._post('/v1/scrape', { url, formats, waitFor, timeout });
  }

  /**
   * Scrape multiple URLs in parallel (max 10).
   * @param {string[]} urls - Array of URLs to scrape
   * @param {Object} [options]
   * @param {string[]} [options.formats]
   * @param {number} [options.timeout]
   * @returns {Promise<Object>} Batch results
   */
  async batch(urls, { formats = ['markdown'], timeout } = {}) {
    return this._post('/v1/batch', { urls, formats, timeout });
  }

  /**
   * Search the web and scrape top results.
   * @param {string} query - Search query
   * @param {Object} [options]
   * @param {number} [options.num] - Number of results (1-10, default 5)
   * @param {string[]} [options.formats]
   * @param {number} [options.timeout]
   * @returns {Promise<Object>} Search results with scraped content
   */
  async search(query, { num = 5, formats = ['markdown'], timeout } = {}) {
    return this._post('/v1/search', { query, num, formats, timeout });
  }
}

module.exports = CrawlAPI;
module.exports.CrawlAPI = CrawlAPI;
