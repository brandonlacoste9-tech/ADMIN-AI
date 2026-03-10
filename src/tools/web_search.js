/**
 * Web search tool — performs a search using DuckDuckGo's public API.
 * Falls back to a helpful message if the request cannot complete.
 */

const definition = {
  type: 'function',
  function: {
    name: 'web_search',
    description:
      'Search the web for up-to-date information, news, or facts. Returns a summary and top results.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search query string.',
        },
      },
      required: ['query'],
    },
  },
};

const SEARCH_TIMEOUT_MS = 5000;

async function execute({ query } = {}) {
  if (!query) return { error: 'query is required.' };

  const encoded = encodeURIComponent(query);
  const url = `https://api.duckduckgo.com/?q=${encoded}&format=json&no_html=1&skip_disambig=1`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), SEARCH_TIMEOUT_MS);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (!response.ok) {
      return { error: `Search API returned HTTP ${response.status}.` };
    }

    const data = await response.json();

    const results = [];

    // Instant answer
    if (data.AbstractText) {
      results.push({
        title: data.Heading || query,
        snippet: data.AbstractText,
        url: data.AbstractURL || '',
        source: data.AbstractSource || '',
      });
    }

    // Related topics
    const topics = (data.RelatedTopics || []).slice(0, 4);
    for (const topic of topics) {
      if (topic.Text && topic.FirstURL) {
        results.push({
          title: topic.Text.substring(0, 80),
          snippet: topic.Text,
          url: topic.FirstURL,
          source: 'DuckDuckGo',
        });
      }
    }

    if (results.length === 0) {
      return {
        query,
        message: 'No instant results found. Try a more specific query.',
        results: [],
      };
    }

    return { query, results };
  } catch (err) {
    if (err.name === 'AbortError') {
      return { error: 'Search request timed out.' };
    }
    return { error: `Search failed: ${err.message}` };
  }
}

export default { definition, execute };
