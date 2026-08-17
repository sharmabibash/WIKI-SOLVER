import { filterValidWikiLinks, normalizeWikiTitle } from './extractLinks';

// Fast client cache
const clientCache = new Map();

/**
 * Fetch forward outgoing links from a single Wikipedia page
 */
export async function fetchOutgoingLinks(title) {
  const norm = normalizeWikiTitle(title);
  if (clientCache.has(`links:${norm}`)) {
    return clientCache.get(`links:${norm}`);
  }

  try {
    const res = await fetch(`/api/wiki?action=links&title=${encodeURIComponent(norm)}`);
    if (!res.ok) throw new Error(`Failed to fetch links for "${norm}"`);
    const data = await res.json();
    const clean = filterValidWikiLinks(data.links || [], norm);
    clientCache.set(`links:${norm}`, clean);
    return clean;
  } catch (err) {
    console.error('fetchOutgoingLinks error:', err);
    return [];
  }
}

/**
 * Fetch batch outgoing links for multiple Wikipedia pages simultaneously
 */
export async function fetchBatchOutgoingLinks(titles) {
  if (!Array.isArray(titles) || titles.length === 0) return {};

  const normalizedList = titles.map(normalizeWikiTitle);
  const result = {};
  const needed = [];

  for (const t of normalizedList) {
    if (clientCache.has(`links:${t}`)) {
      result[t] = clientCache.get(`links:${t}`);
    } else {
      needed.push(t);
    }
  }

  if (needed.length > 0) {
    try {
      const titlesParam = needed.map(encodeURIComponent).join('|');
      const res = await fetch(`/api/wiki?action=batch_links&titles=${titlesParam}`);
      if (res.ok) {
        const data = await res.json();
        const map = data.map || {};
        for (const [key, rawLinks] of Object.entries(map)) {
          const clean = filterValidWikiLinks(rawLinks, key);
          result[key] = clean;
          clientCache.set(`links:${key}`, clean);
        }
      }
    } catch (err) {
      console.error('fetchBatchOutgoingLinks error:', err);
    }
  }

  // Ensure all keys have at least an empty array
  for (const t of normalizedList) {
    if (!result[t]) result[t] = [];
  }

  return result;
}

/**
 * Fetch incoming backlinks to a single Wikipedia page
 */
export async function fetchIncomingBacklinks(title) {
  const norm = normalizeWikiTitle(title);
  if (clientCache.has(`backlinks:${norm}`)) {
    return clientCache.get(`backlinks:${norm}`);
  }

  try {
    const res = await fetch(`/api/wiki?action=backlinks&title=${encodeURIComponent(norm)}`);
    if (!res.ok) throw new Error(`Failed to fetch backlinks for "${norm}"`);
    const data = await res.json();
    const clean = filterValidWikiLinks(data.backlinks || [], norm);
    clientCache.set(`backlinks:${norm}`, clean);
    return clean;
  } catch (err) {
    console.error('fetchIncomingBacklinks error:', err);
    return [];
  }
}

/**
 * Fetch batch incoming backlinks for multiple Wikipedia pages concurrently
 */
export async function fetchBatchIncomingBacklinks(titles) {
  if (!Array.isArray(titles) || titles.length === 0) return {};

  const normalizedList = titles.map(normalizeWikiTitle);
  const result = {};
  const needed = [];

  for (const t of normalizedList) {
    if (clientCache.has(`backlinks:${t}`)) {
      result[t] = clientCache.get(`backlinks:${t}`);
    } else {
      needed.push(t);
    }
  }

  if (needed.length > 0) {
    try {
      const titlesParam = needed.map(encodeURIComponent).join('|');
      const res = await fetch(`/api/wiki?action=batch_backlinks&titles=${titlesParam}`);
      if (res.ok) {
        const data = await res.json();
        const map = data.map || {};
        for (const [key, rawBacklinks] of Object.entries(map)) {
          const clean = filterValidWikiLinks(rawBacklinks, key);
          result[key] = clean;
          clientCache.set(`backlinks:${key}`, clean);
        }
      }
    } catch (err) {
      console.error('fetchBatchIncomingBacklinks error:', err);
    }
  }

  for (const t of normalizedList) {
    if (!result[t]) result[t] = [];
  }

  return result;
}

/**
 * Fetch page summary card
 */
export async function fetchArticleSummary(title) {
  const norm = normalizeWikiTitle(title);
  try {
    const res = await fetch(`/api/wiki?action=summary&title=${encodeURIComponent(norm)}`);
    if (!res.ok) throw new Error(`Failed to fetch summary for "${norm}"`);
    return await res.json();
  } catch (err) {
    console.error('fetchArticleSummary error:', err);
    return {
      title: norm,
      extract: 'No summary available.',
      thumbnail: null,
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(norm)}`
    };
  }
}

/**
 * Search Wikipedia articles
 */
export async function searchWikiArticles(query) {
  if (!query || !query.trim()) return [];
  try {
    const res = await fetch(`/api/wiki?action=search&query=${encodeURIComponent(query.trim())}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.error('searchWikiArticles error:', err);
    return [];
  }
}

/**
 * Fetch random Wikipedia articles
 */
export async function fetchRandomArticles() {
  try {
    const res = await fetch(`/api/wiki?action=random`);
    if (!res.ok) return ['Albert Einstein', 'Quantum mechanics'];
    const data = await res.json();
    return data.randoms || ['Earth', 'Moon'];
  } catch (err) {
    return ['Computer science', 'Algorithm'];
  }
}
