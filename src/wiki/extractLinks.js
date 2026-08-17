/**
 * Cleans, normalizes and filters Wikipedia article titles
 */
export function normalizeWikiTitle(title) {
  if (!title) return '';
  return title.trim().replace(/_/g, ' ');
}

export function filterValidWikiLinks(links, currentTitle = '') {
  if (!Array.isArray(links)) return [];
  const normalizedCurrent = normalizeWikiTitle(currentTitle).toLowerCase();

  const ignoredPrefixes = [
    'Help:',
    'File:',
    'Template:',
    'Category:',
    'Wikipedia:',
    'Portal:',
    'Talk:',
    'Special:',
    'Draft:',
    'TimedText:',
    'Module:',
    'MediaWiki:'
  ];

  const unique = new Set();

  return links
    .map(normalizeWikiTitle)
    .filter(link => {
      if (!link || link.length === 0) return false;
      if (link.toLowerCase() === normalizedCurrent) return false;
      if (ignoredPrefixes.some(prefix => link.startsWith(prefix))) return false;
      if (link.startsWith('List of ') || link.startsWith('Index of ') || link.startsWith('Outline of ')) return false;
      if (unique.has(link.toLowerCase())) return false;
      unique.add(link.toLowerCase());
      return true;
    });
}
