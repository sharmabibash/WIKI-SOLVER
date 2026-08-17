import { NextResponse } from 'next/server';

// High-speed in-memory cache for Wikipedia graph queries
const memoryCache = new Map();
const CACHE_TTL_MS = 1000 * 60 * 60 * 4; // 4 hours

function getCached(key) {
  const item = memoryCache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return item.data;
}

function setCached(key, data) {
  if (memoryCache.size > 5000) {
    const keysToDelete = Array.from(memoryCache.keys()).slice(0, 1000);
    keysToDelete.forEach(k => memoryCache.delete(k));
  }
  memoryCache.set(key, {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS
  });
}

const WIKI_USER_AGENT = 'WikiSolverApp/2.0 (HighPerformance DSA Solver; wikisolver@example.com)';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'search';
    const title = searchParams.get('title') || '';
    const titles = searchParams.get('titles') || '';
    const query = searchParams.get('query') || '';

    const cacheKey = `${action}:${title}:${titles}:${query}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return NextResponse.json({ ...cached, _cached: true });
    }

    // 1. Search / Autocomplete
    if (action === 'search') {
      if (!query.trim()) {
        return NextResponse.json({ results: [] });
      }

      const url = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(
        query
      )}&limit=8&namespace=0&format=json`;

      const res = await fetch(url, {
        headers: { 'User-Agent': WIKI_USER_AGENT },
        next: { revalidate: 3600 }
      });
      const data = await res.json();
      
      const resTitles = data[1] || [];
      const descriptions = data[2] || [];
      const urls = data[3] || [];

      let results = resTitles.map((t, idx) => ({
        title: t,
        description: descriptions[idx] || '',
        url: urls[idx] || `https://en.wikipedia.org/wiki/${encodeURIComponent(t)}`
      }));

      if (results.length > 0) {
        try {
          const titlesParam = results.map(r => encodeURIComponent(r.title)).join('|');
          const thumbUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&pithumbsize=100&titles=${titlesParam}&format=json`;
          const thumbRes = await fetch(thumbUrl, { headers: { 'User-Agent': WIKI_USER_AGENT } });
          const thumbData = await thumbRes.json();
          
          if (thumbData?.query?.pages) {
            const pages = Object.values(thumbData.query.pages);
            results = results.map(item => {
              const matched = pages.find(p => p.title?.toLowerCase() === item.title.toLowerCase());
              return {
                ...item,
                thumbnail: matched?.thumbnail?.source || null
              };
            });
          }
        } catch (e) {
          // ignore
        }
      }

      const responsePayload = { results };
      setCached(cacheKey, responsePayload);
      return NextResponse.json(responsePayload);
    }

    // 2. High-Performance Batch Outgoing Links (Fetches up to 30 titles in 1 single HTTP request)
    if (action === 'batch_links' || action === 'links') {
      const titlesList = action === 'batch_links' && titles
        ? titles.split('|').map(t => t.trim()).filter(Boolean)
        : [title.trim()].filter(Boolean);

      if (titlesList.length === 0) {
        return NextResponse.json({ error: 'Titles required' }, { status: 400 });
      }

      // Check if all are already in cache
      const resultsMap = {};
      const uncachedTitles = [];

      for (const t of titlesList) {
        const singleCache = getCached(`links:${t}:::`);
        if (singleCache && singleCache.links) {
          resultsMap[t] = singleCache.links;
        } else {
          uncachedTitles.push(t);
        }
      }

      if (uncachedTitles.length > 0) {
        // Chunk into groups of 30 to stay within Wikipedia query length
        const chunkSize = 30;
        for (let i = 0; i < uncachedTitles.length; i += chunkSize) {
          const chunk = uncachedTitles.slice(i, i + chunkSize);
          const titlesParam = chunk.map(encodeURIComponent).join('|');

          const fetchUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=links&plnamespace=0&pllimit=500&titles=${titlesParam}&format=json`;
          const res = await fetch(fetchUrl, {
            headers: { 'User-Agent': WIKI_USER_AGENT },
            next: { revalidate: 3600 }
          });
          const data = await res.json();

          if (data?.query?.pages) {
            const pages = Object.values(data.query.pages);
            for (const page of pages) {
              const pageTitle = page.title;
              const linkTitles = (page.links || [])
                .filter(l => l.ns === 0 && !l.title.startsWith('List of ') && !l.title.startsWith('Index of '))
                .map(l => l.title);

              const uniqueLinks = Array.from(new Set(linkTitles));
              resultsMap[pageTitle] = uniqueLinks;
              setCached(`links:${pageTitle}:::`, { title: pageTitle, links: uniqueLinks, count: uniqueLinks.length });
            }
          }
        }
      }

      if (action === 'links') {
        const targetTitle = titlesList[0];
        const links = resultsMap[targetTitle] || [];
        const payload = { title: targetTitle, links, count: links.length };
        return NextResponse.json(payload);
      }

      const payload = { map: resultsMap };
      return NextResponse.json(payload);
    }

    // 3. High-Performance Concurrent Backlinks (Parallelized)
    if (action === 'batch_backlinks' || action === 'backlinks') {
      const titlesList = action === 'batch_backlinks' && titles
        ? titles.split('|').map(t => t.trim()).filter(Boolean)
        : [title.trim()].filter(Boolean);

      if (titlesList.length === 0) {
        return NextResponse.json({ error: 'Titles required' }, { status: 400 });
      }

      const resultsMap = {};
      const uncachedTitles = [];

      for (const t of titlesList) {
        const singleCache = getCached(`backlinks:${t}:::`);
        if (singleCache && singleCache.backlinks) {
          resultsMap[t] = singleCache.backlinks;
        } else {
          uncachedTitles.push(t);
        }
      }

      if (uncachedTitles.length > 0) {
        // Fetch up to 10 backlinks concurrently in parallel
        await Promise.all(
          uncachedTitles.map(async (t) => {
            try {
              const fetchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=backlinks&blnamespace=0&bllimit=500&bltitle=${encodeURIComponent(
                t
              )}&format=json`;
              const res = await fetch(fetchUrl, {
                headers: { 'User-Agent': WIKI_USER_AGENT },
                next: { revalidate: 3600 }
              });
              const data = await res.json();
              const backlinks = (data?.query?.backlinks || [])
                .filter(b => b.ns === 0 && !b.title.startsWith('List of ') && !b.title.startsWith('Index of '))
                .map(b => b.title);

              const uniqueBacklinks = Array.from(new Set(backlinks));
              resultsMap[t] = uniqueBacklinks;
              setCached(`backlinks:${t}:::`, { title: t, backlinks: uniqueBacklinks, count: uniqueBacklinks.length });
            } catch (err) {
              resultsMap[t] = [];
            }
          })
        );
      }

      if (action === 'backlinks') {
        const targetTitle = titlesList[0];
        const backlinks = resultsMap[targetTitle] || [];
        const payload = { title: targetTitle, backlinks, count: backlinks.length };
        return NextResponse.json(payload);
      }

      const payload = { map: resultsMap };
      return NextResponse.json(payload);
    }

    // 4. Page Summary & Thumbnail
    if (action === 'summary') {
      if (!title.trim()) {
        return NextResponse.json({ error: 'Title required' }, { status: 400 });
      }

      const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
      const res = await fetch(summaryUrl, {
        headers: { 'User-Agent': WIKI_USER_AGENT }
      });
      
      if (!res.ok) {
        return NextResponse.json({
          title,
          extract: 'Wikipedia page details unavailable.',
          thumbnail: null,
          url: `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`
        });
      }

      const data = await res.json();
      const responsePayload = {
        title: data.title || title,
        extract: data.extract || '',
        description: data.description || '',
        thumbnail: data.thumbnail?.source || null,
        url: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`
      };

      setCached(cacheKey, responsePayload);
      return NextResponse.json(responsePayload);
    }

    // 5. Random Articles
    if (action === 'random') {
      const url = `https://en.wikipedia.org/w/api.php?action=query&list=random&rnnamespace=0&rnlimit=2&format=json`;
      const res = await fetch(url, {
        headers: { 'User-Agent': WIKI_USER_AGENT }
      });
      const data = await res.json();
      const randoms = data?.query?.random?.map(r => r.title) || [];
      return NextResponse.json({ randoms });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Wiki API route error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
