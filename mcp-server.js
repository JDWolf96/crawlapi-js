#!/usr/bin/env node
/**
 * CrawlAPI MCP Server
 * Exposes CrawlAPI tools to any MCP-compatible client:
 *   Claude Desktop, Cursor, Windsurf, Continue, etc.
 *
 * Setup:
 *   1. npm install (in this directory)
 *   2. Add to claude_desktop_config.json:
 *
 *   {
 *     "mcpServers": {
 *       "crawlapi": {
 *         "command": "node",
 *         "args": ["/path/to/crawlapi/mcp-server.js"],
 *         "env": { "CRAWLAPI_KEY": "your_rapidapi_key" }
 *       }
 *     }
 *   }
 *
 * Environment:
 *   CRAWLAPI_KEY     — Your RapidAPI key (required)
 *   CRAWLAPI_BASE_URL — Override API base (default: https://crawlapi.net)
 */

'use strict';

const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { z } = require('zod');

const API_BASE = process.env.CRAWLAPI_BASE_URL || 'https://crawlapi.net';
const API_KEY = process.env.CRAWLAPI_KEY || process.env.RAPIDAPI_KEY || '';

if (!API_KEY) {
  process.stderr.write('Warning: No CRAWLAPI_KEY set. API calls will fail with 401.\n');
}

const API_HEADERS = {
  'Content-Type': 'application/json',
  'X-RapidAPI-Key': API_KEY,
};

async function callAPI(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: API_HEADERS,
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
  return json;
}

const server = new McpServer({
  name: 'crawlapi',
  version: '1.0.0',
});

// ─── scrape_url ──────────────────────────────────────────────────────────────

server.tool(
  'scrape_url',
  'Scrape a single URL and return its content as clean markdown, HTML, plain text, or structured JSON. Uses a headless browser for full JavaScript rendering. Ideal for feeding web content into LLM prompts or RAG pipelines.',
  {
    url: z.string().url().describe('The URL to scrape'),
    formats: z
      .array(z.enum(['markdown', 'html', 'text', 'structured']))
      .default(['markdown'])
      .describe('Output formats. Use markdown for LLM context, structured for data extraction.'),
    waitFor: z
      .number().int().min(0).max(10000).optional()
      .describe('Milliseconds to wait after page load (use for JS-heavy pages)'),
    timeout: z
      .number().int().min(1000).max(60000).default(30000)
      .describe('Max page load time in ms (default 30000, max 60000)'),
  },
  async ({ url, formats, waitFor, timeout }) => {
    const result = await callAPI('/v1/scrape', { url, formats, waitFor, timeout });
    const d = result.data;
    const parts = [];
    if (d.metadata) {
      parts.push(`**Title:** ${d.metadata.title || 'N/A'}  \n**URL:** ${d.metadata.url || url}  \n**Status:** ${d.metadata.statusCode || 'N/A'}`);
    }
    if (d.markdown) parts.push(d.markdown);
    else if (d.text) parts.push(d.text);
    if (d.html) parts.push(`\`\`\`html\n${d.html}\n\`\`\``);
    if (d.structured) parts.push(`\`\`\`json\n${JSON.stringify(d.structured, null, 2)}\n\`\`\``);
    return {
      content: [{ type: 'text', text: parts.join('\n\n') || 'No content returned.' }],
    };
  }
);

// ─── batch_scrape ─────────────────────────────────────────────────────────────

server.tool(
  'batch_scrape',
  'Scrape up to 10 URLs in parallel and return their content. Failed URLs are included with an error field rather than failing the whole request. Results are returned in the same order as the input.',
  {
    urls: z
      .array(z.string().url()).min(1).max(10)
      .describe('Array of URLs to scrape (max 10)'),
    formats: z
      .array(z.enum(['markdown', 'html', 'text', 'structured']))
      .default(['markdown'])
      .describe('Output formats for all URLs'),
    timeout: z
      .number().int().min(1000).max(60000).default(30000)
      .describe('Max wait time per URL in ms'),
  },
  async ({ urls, formats, timeout }) => {
    const result = await callAPI('/v1/batch', { urls, formats, timeout });
    const lines = result.data.map((item, i) => {
      if (!item.success) return `### ${i + 1}. ❌ ${item.url}\nError: ${item.error}`;
      const content = item.data?.markdown || item.data?.text || '(no content)';
      const preview = content.length > 400 ? content.slice(0, 400) + '…' : content;
      return `### ${i + 1}. ✅ ${item.url}\n\n${preview}`;
    });
    return {
      content: [{ type: 'text', text: lines.join('\n\n---\n\n') }],
    };
  }
);

// ─── search_and_scrape ────────────────────────────────────────────────────────

server.tool(
  'search_and_scrape',
  'Search the web and return scraped full-page content for the top N results in a single API call. Combines web search with JavaScript-rendered scraping. Ideal for autonomous research agents that need real-time web information.',
  {
    query: z.string().describe('Web search query'),
    num: z
      .number().int().min(1).max(10).default(5)
      .describe('Number of search results to scrape (default 5, max 10)'),
    formats: z
      .array(z.enum(['markdown', 'html', 'text', 'structured']))
      .default(['markdown'])
      .describe('Output format for scraped pages'),
    timeout: z
      .number().int().min(1000).max(60000).default(30000)
      .describe('Max wait time per page in ms'),
  },
  async ({ query, num, formats, timeout }) => {
    const result = await callAPI('/v1/search', { query, num, formats, timeout });
    const lines = result.data.map((item, i) => {
      const title = item.title || item.url;
      const header = `### ${i + 1}. ${title}\n${item.url}`;
      if (!item.success) return `${header}\n❌ ${item.error}`;
      const content = item.data?.markdown || item.data?.text || '(no content)';
      const preview = content.length > 500 ? content.slice(0, 500) + '…' : content;
      return `${header}\n\n${preview}`;
    });
    return {
      content: [{ type: 'text', text: `# Search: "${query}"\n\n${lines.join('\n\n---\n\n')}` }],
    };
  }
);

// ─── Start ────────────────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write('CrawlAPI MCP server ready (stdio transport)\n');
}

main().catch((err) => {
  process.stderr.write(`Fatal: ${err.message}\n`);
  process.exit(1);
});
