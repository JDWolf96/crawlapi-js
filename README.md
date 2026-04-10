# crawlapi-js

Official JavaScript/TypeScript SDK for [CrawlAPI](https://crawlapi.net) — web scraping API built for AI agents.

Pass a URL, get back clean markdown your LLM can actually read.

## Install

```bash
npm install crawlapi-js
```

## Quick Start

```javascript
const CrawlAPI = require('crawlapi-js');

const client = new CrawlAPI({ apiKey: 'YOUR_RAPIDAPI_KEY' });

// Scrape a URL → clean markdown
const result = await client.scrape('https://example.com');
console.log(result.data.markdown);

// Scrape multiple URLs in parallel
const batch = await client.batch([
  'https://example.com',
  'https://example.org'
]);

// Search + scrape top results in one call
const search = await client.search('LangChain web scraping 2025', { num: 5 });
```

## Get an API Key

Available on [RapidAPI](https://rapidapi.com/crawlapi/api/crawlapi). Free tier: 50 calls/day, no credit card.

## API

### `client.scrape(url, options?)`

Scrape a single URL with full JavaScript rendering.

```javascript
const result = await client.scrape('https://example.com', {
  formats: ['markdown'],   // 'markdown' | 'html' | 'text' | 'structured'
  waitFor: 1000,           // ms to wait after page load (JS-heavy pages)
  timeout: 30000           // max ms (default 30s, max 60s)
});

console.log(result.data.markdown);
console.log(result.data.metadata.title);
```

### `client.batch(urls, options?)`

Scrape up to 10 URLs in parallel. Failed URLs return an error field rather than failing the whole request.

```javascript
const result = await client.batch([
  'https://example.com',
  'https://example.org',
  'https://example.net'
]);

result.data.forEach(item => {
  if (item.success) console.log(item.data.markdown);
  else console.error(item.url, item.error);
});
```

### `client.search(query, options?)`

Search the web and automatically scrape the top N results.

```javascript
const result = await client.search('best pizza in New York', {
  num: 5,                  // 1-10 results (default 5)
  formats: ['markdown']
});

result.data.forEach(item => {
  console.log(item.title, item.url);
  if (item.success) console.log(item.data.markdown);
});
```

## Agent Framework Examples

### LangChain

```javascript
const { Tool } = require('langchain/tools');
const CrawlAPI = require('crawlapi-js');

const client = new CrawlAPI({ apiKey: process.env.RAPIDAPI_KEY });

const webTool = new Tool({
  name: 'WebScraper',
  description: 'Scrape any URL and return clean markdown content. Input should be a URL.',
  func: async (url) => {
    const result = await client.scrape(url);
    return result.data.markdown;
  }
});
```

### OpenAI Function Calling

```javascript
const CrawlAPI = require('crawlapi-js');
const client = new CrawlAPI({ apiKey: process.env.RAPIDAPI_KEY });

// Tool definition
const tools = [{
  type: 'function',
  function: {
    name: 'scrape_url',
    description: 'Scrape a webpage and return its content as clean markdown',
    parameters: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'The URL to scrape' }
      },
      required: ['url']
    }
  }
}];

// Handle tool call
async function handleToolCall(url) {
  const result = await client.scrape(url);
  return result.data.markdown;
}
```

### n8n / Flowise / Custom HTTP

All endpoints accept standard JSON POST requests:

```
POST https://crawlapi.net/v1/scrape
X-RapidAPI-Key: YOUR_KEY
Content-Type: application/json

{ "url": "https://example.com", "formats": ["markdown"] }
```

Full OpenAPI spec: [crawlapi.net/openapi.json](https://crawlapi.net/openapi.json)

## TypeScript

Full TypeScript types included:

```typescript
import { CrawlAPI, ScrapeResponse } from 'crawlapi-js';

const client = new CrawlAPI({ apiKey: process.env.RAPIDAPI_KEY! });
const result: ScrapeResponse = await client.scrape('https://example.com');
```

## MCP Server (Claude Desktop, Cursor, Windsurf)

CrawlAPI ships with a built-in [MCP server](https://modelcontextprotocol.io) — plug it directly into any MCP-compatible AI client.

### Setup

**1. Clone or download `mcp-server.js`** from this repo.

**2. Add to your Claude Desktop config** (`~/Library/Application Support/Claude/claude_desktop_config.json` on Mac):

```json
{
  "mcpServers": {
    "crawlapi": {
      "command": "node",
      "args": ["/path/to/crawlapi-js/mcp-server.js"],
      "env": {
        "CRAWLAPI_KEY": "your_rapidapi_key"
      }
    }
  }
}
```

**3. Restart Claude Desktop.** You'll see three new tools:
- `scrape_url` — scrape any page to markdown
- `batch_scrape` — scrape up to 10 URLs in parallel
- `search_and_scrape` — search + scrape top results in one shot

### Cursor / Windsurf / Continue

Same config, different location. Check your editor's MCP docs. The `mcp-server.js` file works with any stdio-transport MCP client.

### What the agent sees

> "Use `scrape_url` to fetch web pages as clean markdown. Use `search_and_scrape` to research topics from the live web. Both support JavaScript-rendered pages."

Get your API key at [RapidAPI](https://rapidapi.com/crawlapi/api/crawlapi) — free tier included.

## AI Agent Discovery

CrawlAPI publishes all standard discovery files:

| File | URL |
|------|-----|
| `llms.txt` | [crawlapi.net/llms.txt](https://crawlapi.net/llms.txt) |
| OpenAPI spec | [crawlapi.net/openapi.json](https://crawlapi.net/openapi.json) |
| AI Plugin manifest | [crawlapi.net/.well-known/ai-plugin.json](https://crawlapi.net/.well-known/ai-plugin.json) |
| MCP manifest | [crawlapi.net/.well-known/mcp.json](https://crawlapi.net/.well-known/mcp.json) |
| APIs.json | [crawlapi.net/apis.json](https://crawlapi.net/apis.json) |

## Links

- 🌐 [crawlapi.net](https://crawlapi.net)
- 📦 [RapidAPI listing](https://rapidapi.com/crawlapi/api/crawlapi)
- 📄 [OpenAPI spec](https://crawlapi.net/openapi.json)
- 🤖 [llms.txt](https://crawlapi.net/llms.txt)
- 🔌 [MCP server](./mcp-server.js)
