import { Topic } from './types';

export interface WikiSection { title: string; text: string }
export interface WikiDoc { title: string; url: string; sections: WikiSection[] }
export interface Book { id: string; olKey: string; title: string; author: string; year?: number }
export interface Article { title: string; source: string; url: string; date: number }
export interface WorkInfo { description: string; subjects: string[] }

export interface Content {
  /** Which topic settings this was fetched for, so edits trigger a new fetch. */
  sig: string;
  fetchedAt: number;
  wiki: WikiDoc | null;
  quotes: string[];
  books: Book[];
  articles: Article[];
  /** Sources that could not be reached. */
  failed: string[];
}

export const SOURCE_COUNT = 4;

const HEADERS = {
  'User-Agent': 'PersonalHub/1.0 (personal reading app)',
  'Api-User-Agent': 'PersonalHub/1.0 (personal reading app)',
};

async function get(url: string, ms = 20000): Promise<Response> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(url, { headers: HEADERS, signal: ctl.signal });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r;
  } finally {
    clearTimeout(timer);
  }
}

export function sourcesFor(t: Topic) {
  return {
    wiki: t.src?.wiki ?? t.name,
    books: t.src?.books ?? t.name,
    news: t.src?.news ?? `"${t.name}"`,
    byAuthor: !!t.byAuthor,
  };
}

export const sigOf = (t: Topic) => {
  const s = sourcesFor(t);
  return [s.wiki, s.books, s.news, s.byAuthor ? 1 : 0].join('|');
};

/* ---------- Wikipedia and Wikiquote (MediaWiki API, full article text) ---------- */

const SKIP_SECTIONS = new Set([
  'see also', 'references', 'external links', 'further reading', 'notes', 'bibliography', 'sources',
  'footnotes', 'citations', 'works cited', 'explanatory notes',
]);

function splitSections(text: string): WikiSection[] {
  const out: WikiSection[] = [];
  let title = 'Overview';
  let buf: string[] = [];
  const flush = () => {
    const body = buf.join('\n').trim();
    if (body && !SKIP_SECTIONS.has(title.toLowerCase())) out.push({ title, text: body });
    buf = [];
  };
  for (const line of text.split('\n')) {
    const m = line.match(/^(={2,})\s*(.+?)\s*\1\s*$/);
    if (m) {
      flush();
      title = m[2];
    } else {
      buf.push(line);
    }
  }
  flush();
  return out;
}

async function wikiDoc(host: string, term: string): Promise<WikiDoc | null> {
  const found = await (
    await get(`https://${host}/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(term)}&srlimit=1&format=json&formatversion=2`)
  ).json();
  const title: string | undefined = found?.query?.search?.[0]?.title;
  if (!title) return null;

  const data = await (
    await get(
      `https://${host}/w/api.php?action=query&prop=extracts%7Cinfo&inprop=url&explaintext=1&redirects=1&titles=${encodeURIComponent(title)}&format=json&formatversion=2`,
    )
  ).json();
  const page = data?.query?.pages?.[0];
  const text: string = page?.extract ?? '';
  if (!text.trim()) return null;
  return {
    title: page.title ?? title,
    url: page.fullurl ?? `https://${host}/wiki/${encodeURIComponent(String(title).replace(/ /g, '_'))}`,
    sections: splitSections(text),
  };
}

// "Overview" is the page intro (a biography blurb), not a quote.
const SKIP_QUOTE_SECTIONS = new Set([...SKIP_SECTIONS, 'overview', 'about', 'disputed', 'misattributed', 'attributed', 'quotes about']);

// Wikiquote puts the source of each quote on its own line; those lines are not quotes.
const isCitation = (line: string) =>
  /ISBN|YouTube|translated as|\bp{1,2}\.\s?\d|\b(chapter|vol\.|volume)\b/i.test(line) ||
  (line.length < 220 && /\([^()]*\b\d{4}\)/.test(line.slice(-60))) ||
  /^(source|sourced|as quoted|quoted|cited|from|in|also in|translated|reported|see|as cited|attributed)\b/i.test(line) ||
  /\(\d{4}\)\.?\s*$/.test(line);

function quotesFrom(doc: WikiDoc): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of doc.sections) {
    if (SKIP_QUOTE_SECTIONS.has(s.title.toLowerCase())) continue;
    for (const raw of s.text.split('\n')) {
      const line = raw.trim();
      if (line.length < 40 || line.length > 400 || isCitation(line)) continue;
      if (seen.has(line)) continue;
      seen.add(line);
      out.push(line);
      if (out.length >= 40) return out;
    }
  }
  return out;
}

/* ---------- Open Library ---------- */

async function searchBooks(q: string, byAuthor: boolean): Promise<Book[]> {
  const param = byAuthor ? 'author' : 'q';
  const r = await (
    await get(`https://openlibrary.org/search.json?${param}=${encodeURIComponent(q)}&limit=60&fields=key,title,author_name,first_publish_year,edition_count`)
  ).json();
  const seen = new Set<string>();
  const list: (Book & { editions: number })[] = [];
  for (const d of r?.docs ?? []) {
    const key = String(d.key ?? '');
    const title = String(d.title ?? '').trim();
    if (!key.startsWith('/works/') || !title || seen.has(title.toLowerCase())) continue;
    seen.add(title.toLowerCase());
    const olKey = key.slice('/works/'.length);
    list.push({
      id: `ol-${olKey}`, olKey, title, author: d.author_name?.[0] ?? q, year: d.first_publish_year, editions: d.edition_count ?? 0,
    });
  }
  return list
    .sort((a, b) => b.editions - a.editions)
    .slice(0, 25)
    .map(({ editions, ...book }) => book);
}

export async function fetchWork(olKey: string): Promise<WorkInfo> {
  const w = await (await get(`https://openlibrary.org/works/${olKey}.json`)).json();
  const d = w?.description;
  const description = typeof d === 'string' ? d : String(d?.value ?? '');
  return {
    description: description.trim(),
    subjects: Array.isArray(w?.subjects) ? w.subjects.slice(0, 12).map(String) : [],
  };
}

/* ---------- News search (Google News RSS) ---------- */

const decode = (s: string) =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .trim();

const tag = (xml: string, name: string) => {
  const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`));
  return m ? decode(m[1]) : '';
};

async function searchNews(q: string): Promise<Article[]> {
  const xml = await (await get(`https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en&gl=US&ceid=US:en`)).text();
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
  return items
    .slice(0, 25)
    .map((it) => {
      const raw = tag(it, 'title');
      const source = tag(it, 'source');
      const title = source && raw.endsWith(` - ${source}`) ? raw.slice(0, -(source.length + 3)) : raw;
      return { title, source: source || 'News', url: tag(it, 'link'), date: Date.parse(tag(it, 'pubDate')) || 0 };
    })
    .filter((a) => a.title && a.url);
}

/* ---------- everything for one topic ---------- */

export async function fetchContent(topic: Topic): Promise<Content> {
  const s = sourcesFor(topic);
  const failed: string[] = [];
  const run = async <T,>(label: string, fn: () => Promise<T>, empty: T): Promise<T> => {
    try {
      return await fn();
    } catch {
      failed.push(label);
      return empty;
    }
  };
  const [wiki, quoteDoc, books, articles] = await Promise.all([
    run<WikiDoc | null>('Wikipedia', () => wikiDoc('en.wikipedia.org', s.wiki), null),
    run<WikiDoc | null>('Wikiquote', () => wikiDoc('en.wikiquote.org', s.wiki), null),
    run<Book[]>('Open Library', () => searchBooks(s.books, s.byAuthor), []),
    run<Article[]>('News', () => searchNews(s.news), []),
  ]);
  return {
    sig: sigOf(topic),
    fetchedAt: Date.now(),
    wiki,
    quotes: quoteDoc ? quotesFrom(quoteDoc) : [],
    books,
    articles,
    failed,
  };
}
