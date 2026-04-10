# Agent Framework Integration Guide

How to add CrawlAPI as a web scraping tool in popular agent frameworks.

## LangChain (Python)

```python
from langchain.tools import Tool
import requests

def scrape_url(url: str) -> str:
    response = requests.post(
        "https://crawlapi.net/v1/scrape",
        headers={"X-RapidAPI-Key": "YOUR_KEY"},
        json={"url": url, "formats": ["markdown"]}
    )
    return response.json()["data"]["markdown"]

web_tool = Tool(
    name="scrape_url",
    func=scrape_url,
    description="Scrape any URL and return clean markdown. Input must be a valid URL."
)
```

## LangChain (JavaScript)

```javascript
const { DynamicTool } = require('langchain/tools');
const CrawlAPI = require('crawlapi-js');

const client = new CrawlAPI({ apiKey: process.env.RAPIDAPI_KEY });

const webTool = new DynamicTool({
  name: 'scrape_url',
  description: 'Scrape any URL and return clean markdown. Input must be a valid URL.',
  func: async (url) => {
    const result = await client.scrape(url);
    return result.data.markdown;
  }
});
```

## CrewAI

```python
from crewai_tools import tool
import requests

@tool("Web Scraper")
def scrape_website(url: str) -> str:
    """Scrape a URL and return its content as clean markdown for LLM processing."""
    response = requests.post(
        "https://crawlapi.net/v1/scrape",
        headers={"X-RapidAPI-Key": "YOUR_KEY"},
        json={"url": url, "formats": ["markdown"]}
    )
    return response.json()["data"]["markdown"]
```

## OpenAI Function Calling

```python
import openai, requests

tools = [{
    "type": "function",
    "function": {
        "name": "scrape_url",
        "description": "Scrape a webpage and return its content as clean markdown",
        "parameters": {
            "type": "object",
            "properties": {
                "url": {"type": "string", "description": "The URL to scrape"}
            },
            "required": ["url"]
        }
    }
}]

def handle_tool_call(url: str) -> str:
    response = requests.post(
        "https://crawlapi.net/v1/scrape",
        headers={"X-RapidAPI-Key": "YOUR_KEY"},
        json={"url": url, "formats": ["markdown"]}
    )
    return response.json()["data"]["markdown"]
```

## AutoGen

```python
from autogen import AssistantAgent, UserProxyAgent
import requests

def scrape_url(url: str) -> str:
    response = requests.post(
        "https://crawlapi.net/v1/scrape",
        headers={"X-RapidAPI-Key": "YOUR_KEY"},
        json={"url": url, "formats": ["markdown"]}
    )
    return response.json()["data"]["markdown"]

assistant = AssistantAgent(
    name="assistant",
    llm_config={
        "functions": [{
            "name": "scrape_url",
            "description": "Scrape a URL and return clean markdown",
            "parameters": {
                "type": "object",
                "properties": {"url": {"type": "string"}},
                "required": ["url"]
            }
        }]
    }
)
```

## n8n / Flowise / Custom HTTP

All endpoints are standard JSON REST — works with any HTTP node:

```
POST https://crawlapi.net/v1/scrape
Headers:
  X-RapidAPI-Key: YOUR_KEY
  Content-Type: application/json

Body:
{
  "url": "https://example.com",
  "formats": ["markdown"]
}
```

## OpenAPI spec

Full spec for auto-generating tool definitions in any framework:  
→ [crawlapi.net/openapi.json](https://crawlapi.net/openapi.json)
