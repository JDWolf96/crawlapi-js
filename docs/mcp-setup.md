# MCP Setup Guide — CrawlAPI

Add web scraping to Claude Desktop, Cursor, or Windsurf in 60 seconds.

## Prerequisites

- Node.js 18+
- A free RapidAPI key from [rapidapi.com/crawlapi/api/crawlapi](https://rapidapi.com/crawlapi/api/crawlapi)

## Install

```bash
git clone https://github.com/JDWolf96/crawlapi-js
cd crawlapi-js
npm install
```

## Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (Mac) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "crawlapi": {
      "command": "node",
      "args": ["/absolute/path/to/crawlapi-js/mcp-server.js"],
      "env": {
        "CRAWLAPI_KEY": "your_rapidapi_key"
      }
    }
  }
}
```

Restart Claude Desktop. You'll see three new tools:

| Tool | What it does |
|------|-------------|
| `scrape_url` | Fetch any page → clean markdown |
| `batch_scrape` | Scrape up to 10 URLs in parallel |
| `search_and_scrape` | Search web + scrape top results in one call |

## Cursor

Open Settings → MCP → Add server. Use the same config block above.

## Windsurf / Continue

Same config. Check your editor's MCP settings panel.

## Example prompts

Once installed, just ask Claude in plain English:

```
Scrape https://news.ycombinator.com and summarise the top 10 stories
```

```
Search for "LangChain vs LlamaIndex 2026" and give me a comparison
```

```
Batch scrape these competitor pages and compare their pricing:
- https://firecrawl.dev
- https://apify.com
- https://crawlbase.com
```

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CRAWLAPI_KEY` | Yes | Your RapidAPI key |
| `CRAWLAPI_BASE_URL` | No | Override API base URL (default: `https://crawlapi.net`) |

## Get an API key

Free tier: 50 calls/day, no credit card required.  
→ [rapidapi.com/crawlapi/api/crawlapi](https://rapidapi.com/crawlapi/api/crawlapi)
