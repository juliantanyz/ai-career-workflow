// @ts-check
/** @typedef {import('./_types.js').Provider} Provider */

// LinkedIn provider — uses the public guest jobs search API (no auth, no tokens).
// Parses HTML job cards returned by the guest search endpoint.
//
// portals.yml entry shape:
//   provider: linkedin
//   query: "Data Product Manager OR Senior Data Analyst"
//   location: "Singapore"          # optional, defaults to entry.location or "Singapore"
//   geo_id: "102454443"            # optional LinkedIn geoId (102454443 = Singapore)
//   days: 30                       # optional lookback window in days (default 30)

const BASE_URL = 'https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search';
const PAGE_SIZE = 25;
const MAX_PAGES = 3; // up to 75 results per query
const DEFAULT_DAYS = 30;

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml',
  'Accept-Language': 'en-US,en;q=0.9',
};

// Matches one job card — extracts id, url, title, company, location.
// Uses a single pass through the HTML block for each card.
const CARD_RE =
  /data-entity-urn="urn:li:jobPosting:(\d+)"[\s\S]*?base-card__full-link[^>]*href="([^"]+)"[\s\S]*?base-search-card__title[^>]*>\s*([^\n<]+)[\s\S]*?base-search-card__subtitle[\s\S]*?hidden-nested-link[^>]*>\s*([^\n<]+)[\s\S]*?job-search-card__location[^>]*>\s*([^\n<]+)/g;

function parseCards(html) {
  const jobs = [];
  let m;
  CARD_RE.lastIndex = 0;
  while ((m = CARD_RE.exec(html)) !== null) {
    const url = m[2].split('?')[0]; // strip tracking params
    jobs.push({
      id: m[1],
      url,
      title: m[3].trim(),
      company: m[4].trim(),
      location: m[5].trim(),
    });
  }
  return jobs;
}

async function fetchPage(query, location, geoId, daysFilter, start, ctx) {
  const params = new URLSearchParams({
    keywords: query,
    ...(location ? { location } : {}),
    ...(geoId ? { geoId } : {}),
    f_TPR: `r${daysFilter * 86400}`,
    start: String(start),
  });
  const url = `${BASE_URL}?${params}`;
  const res = await ctx.fetchText(url, { headers: HEADERS });
  return res;
}

/** @type {Provider} */
export default {
  id: 'linkedin',

  // No auto-detect — must be set explicitly via `provider: linkedin` in portals.yml.
  detect: () => null,

  async fetch(entry, ctx) {
    const query = entry.query;
    if (!query) throw new Error('linkedin: missing required field `query` in portals.yml entry');

    const location = entry.location ?? 'Singapore';
    const geoId = entry.geo_id ?? null;
    const days = Number(entry.days ?? DEFAULT_DAYS);
    const seenIds = new Set();
    const jobs = [];

    for (let page = 0; page < MAX_PAGES; page++) {
      const start = page * PAGE_SIZE;
      let html;
      try {
        html = await fetchPage(query, location, geoId, days, start, ctx);
      } catch (err) {
        // 429 rate-limit or network error — stop pagination gracefully
        if (err.message?.includes('429') || err.message?.includes('rate')) break;
        throw err;
      }
      if (!html || html.length < 100) break;

      const cards = parseCards(html);
      if (cards.length === 0) break; // no more results

      for (const c of cards) {
        if (seenIds.has(c.id)) continue;
        seenIds.add(c.id);
        jobs.push({
          title: c.title,
          url: c.url,
          company: c.company,
          location: c.location,
        });
      }

      // Stop early if we got fewer than a full page (end of results)
      if (cards.length < PAGE_SIZE) break;

      // Small delay to avoid triggering rate limits on multi-page fetches
      await new Promise(r => setTimeout(r, 500));
    }

    return jobs;
  },
};
