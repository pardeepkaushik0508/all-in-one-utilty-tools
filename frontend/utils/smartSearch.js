/**
 * Smart tool search — exact, partial, fuzzy, and synonym matching with relevance ranking.
 * Designed for 200+ tools with zero network latency (client-side only).
 */

const SYNONYMS = {
  image: ['photo', 'picture', 'pic', 'img', 'jpeg', 'jpg', 'png', 'webp'],
  photo: ['image', 'picture', 'pic'],
  picture: ['image', 'photo', 'pic'],
  pic: ['image', 'photo', 'picture'],
  img: ['image', 'photo'],
  compress: ['reduce', 'optimize', 'shrink', 'smaller', 'compression'],
  merge: ['combine', 'join', 'unite', 'append'],
  combine: ['merge', 'join'],
  convert: ['transform', 'change', 'format', 'converter'],
  transform: ['convert', 'change'],
  background: ['bg', 'backdrop'],
  bg: ['background', 'backdrop'],
  remove: ['remover', 'removal', 'erase', 'delete', 'strip'],
  remover: ['remove', 'removal'],
  transparent: ['alpha', 'cutout', 'png'],
  pdf: ['document', 'adobe'],
  document: ['pdf', 'file'],
  qr: ['qrcode', 'barcode', 'code'],
  qrcode: ['qr', 'barcode'],
  generator: ['gen', 'maker', 'create', 'build'],
  gen: ['generator', 'generate'],
  generate: ['generator', 'gen'],
  video: ['mp4', 'movie', 'clip'],
  audio: ['mp3', 'sound', 'music'],
  mp3: ['audio', 'sound'],
  password: ['pass', 'pwd', 'secret'],
  hash: ['checksum', 'sha', 'md5'],
  json: ['javascript', 'object', 'formatter'],
  xml: ['markup', 'formatter'],
  jwt: ['token', 'bearer'],
  uuid: ['guid', 'unique', 'id'],
  resize: ['scale', 'dimension', 'size'],
  crop: ['trim', 'cut'],
  watermark: ['stamp', 'overlay'],
  grammar: ['spell', 'writing', 'check'],
  paraphrase: ['rewrite', 'rephrase'],
  instagram: ['insta', 'ig', 'social'],
  youtube: ['yt', 'video'],
  calculator: ['calc', 'compute'],
  converter: ['convert', 'transformation'],
  encrypt: ['encryption', 'cipher', 'secure'],
  decrypt: ['decryption', 'decode'],
  encode: ['encoder', 'encoding'],
  decode: ['decoder', 'decoding'],
  minify: ['minifier', 'compress', 'shrink'],
  beautify: ['format', 'prettify', 'formatter'],
  format: ['formatter', 'beautify', 'pretty'],
  regex: ['regular', 'expression', 'pattern'],
  dns: ['domain', 'lookup', 'nameserver'],
  ssl: ['tls', 'certificate', 'https'],
  ocr: ['text', 'scan', 'extract'],
  meme: ['caption', 'funny'],
  caption: ['meme', 'text', 'social'],
  hashtag: ['tags', 'social'],
  emoji: ['emoticon', 'symbol'],
  lorem: ['ipsum', 'placeholder', 'dummy'],
  word: ['text', 'counter', 'count'],
  character: ['char', 'letter', 'count'],
  line: ['row', 'counter'],
  paragraph: ['para', 'block'],
  case: ['uppercase', 'lowercase', 'title'],
  duplicate: ['copy', 'repeat', 'dedupe'],
  whitespace: ['space', 'blank'],
  split: ['separate', 'divide', 'extract'],
  rotate: ['turn', 'orientation', 'angle'],
  flip: ['mirror', 'reverse'],
  blur: ['soften', 'fuzzy'],
  sharpen: ['sharp', 'clarity', 'enhance'],
  grayscale: ['grey', 'black', 'white', 'monochrome'],
  collage: ['grid', 'combine', 'merge'],
  thumbnail: ['thumb', 'preview', 'small'],
  passport: ['id', 'photo', 'visa'],
  sip: ['investment', 'mutual'],
  emi: ['loan', 'installment'],
  gst: ['tax', 'vat'],
  tip: ['gratuity', 'bill'],
  discount: ['sale', 'offer', 'percent'],
  roman: ['numeral', 'number'],
  binary: ['bit', 'base2'],
  decimal: ['hex', 'hexadecimal'],
  timezone: ['time', 'zone', 'utc'],
  stopwatch: ['timer', 'lap'],
  countdown: ['timer', 'alarm'],
  barcode: ['code', 'scan'],
  plagiarism: ['duplicate', 'copy'],
  ai: ['artificial', 'intelligence', 'gpt', 'gemini'],
  content: ['text', 'article', 'write'],
  developer: ['dev', 'code', 'programming'],
  security: ['secure', 'safe', 'protect'],
  utility: ['tool', 'helper', 'useful'],
  social: ['media', 'instagram', 'twitter', 'linkedin']
};

function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 1);
}

function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const matrix = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i += 1) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[a.length][b.length];
}

function expandQueryTokens(queryTokens) {
  const expanded = new Set(queryTokens);
  queryTokens.forEach((token) => {
    expanded.add(token);
    (SYNONYMS[token] || []).forEach((syn) => expanded.add(syn));
    Object.entries(SYNONYMS).forEach(([key, values]) => {
      if (values.includes(token)) expanded.add(key);
    });
  });
  return [...expanded];
}

function tokenAlternatives(token, expandedTokens) {
  const alternatives = new Set([token]);
  (SYNONYMS[token] || []).forEach((syn) => alternatives.add(syn));
  expandedTokens.forEach((exp) => {
    if (SYNONYMS[token]?.includes(exp) || SYNONYMS[exp]?.includes(token)) {
      alternatives.add(exp);
    }
  });
  return [...alternatives];
}

function bestFuzzyDistance(token, candidates) {
  let best = Infinity;
  candidates.forEach((candidate) => {
    if (candidate.includes(token) || token.includes(candidate)) {
      best = Math.min(best, 0);
      return;
    }
    const dist = levenshtein(token, candidate);
    const threshold = token.length <= 4 ? 1 : token.length <= 7 ? 2 : 3;
    if (dist <= threshold) best = Math.min(best, dist);
  });
  return best;
}

function bestFuzzyDistanceWithSynonyms(token, candidates, expandedTokens) {
  let best = Infinity;
  tokenAlternatives(token, expandedTokens).forEach((alt) => {
    best = Math.min(best, bestFuzzyDistance(alt, candidates));
  });
  return best;
}

function tokenMatchesHaystack(token, haystack, nameTokens, slugTokens, expandedTokens) {
  if (haystack.includes(token)) return true;

  const hasSynonymHit = tokenAlternatives(token, expandedTokens).some(
    (alt) => alt !== token && haystack.includes(alt)
  );
  if (hasSynonymHit) return true;

  const threshold = token.length <= 4 ? 1 : token.length <= 7 ? 2 : 3;
  const bestDist = Math.min(
    bestFuzzyDistanceWithSynonyms(token, nameTokens, expandedTokens),
    bestFuzzyDistanceWithSynonyms(token, slugTokens, expandedTokens)
  );
  return bestDist <= threshold;
}

function nameCoverageBonus(queryTokens, nameTokens, expandedTokens) {
  let matchedNameTokens = 0;
  nameTokens.forEach((nameToken) => {
    const hit = queryTokens.some((queryToken) => {
      if (queryToken === nameToken) return true;
      return tokenAlternatives(queryToken, expandedTokens).includes(nameToken);
    });
    if (hit) matchedNameTokens += 1;
  });

  const unmatchedNameTokens = Math.max(0, nameTokens.length - matchedNameTokens);
  return matchedNameTokens * 30 - unmatchedNameTokens * 20;
}

function buildToolSearchText(tool) {
  return [
    tool.name,
    tool.description,
    tool.slug.replace(/-/g, ' '),
    tool.category
  ]
    .join(' ')
    .toLowerCase();
}

function scoreTool(tool, rawQuery) {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return { score: 0, matchType: 'none' };

  const name = tool.name.toLowerCase();
  const slug = tool.slug.replace(/-/g, ' ');
  const haystack = buildToolSearchText(tool);
  const queryTokens = tokenize(query);
  const expandedTokens = expandQueryTokens(queryTokens);
  const nameTokens = tokenize(name);
  const slugTokens = tokenize(slug);

  if (name === query || slug === query || tool.slug === query.replace(/\s+/g, '-')) {
    return { score: 1000, matchType: 'exact' };
  }

  if (name.includes(query) || slug.includes(query) || tool.slug.includes(query.replace(/\s+/g, '-'))) {
    return { score: 920, matchType: 'partial' };
  }

  if (haystack.includes(query)) {
    return { score: 880, matchType: 'partial' };
  }

  const allTokensMatch =
    queryTokens.length > 0 &&
    queryTokens.every((token) => tokenMatchesHaystack(token, haystack, nameTokens, slugTokens, expandedTokens));
  if (allTokensMatch) {
    const synonymHits = queryTokens.filter((token) => {
      const syns = SYNONYMS[token] || [];
      return syns.some((syn) => haystack.includes(syn));
    }).length;
    const coverage = nameCoverageBonus(queryTokens, nameTokens, expandedTokens);
    return {
      score: 800 + synonymHits * 10 + coverage,
      matchType: synonymHits > 0 ? 'synonym' : 'partial'
    };
  }

  let fuzzyScore = 0;
  queryTokens.forEach((token) => {
    const bestDist = Math.min(
      bestFuzzyDistanceWithSynonyms(token, nameTokens, expandedTokens),
      bestFuzzyDistanceWithSynonyms(token, slugTokens, expandedTokens)
    );
    if (bestDist === 0) fuzzyScore += 120;
    else if (bestDist === 1) fuzzyScore += 90;
    else if (bestDist === 2) fuzzyScore += 60;
    else if (bestDist === 3) fuzzyScore += 35;
  });

  if (fuzzyScore >= queryTokens.length * 55) {
    const coverage = nameCoverageBonus(queryTokens, nameTokens, expandedTokens);
    return { score: 500 + fuzzyScore + coverage, matchType: 'fuzzy' };
  }

  const expandedHits = expandedTokens.filter((token) => haystack.includes(token)).length;
  if (expandedHits >= Math.max(1, queryTokens.length)) {
    return { score: 400 + expandedHits * 15, matchType: 'synonym' };
  }

  return { score: 0, matchType: 'none' };
}

export function searchTools(tools, query) {
  const trimmed = query?.trim() || '';
  if (!trimmed) {
    return { results: tools, suggestions: [], didYouMean: null };
  }

  const ranked = tools
    .map((tool) => ({ tool, ...scoreTool(tool, trimmed) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.tool.name.localeCompare(b.tool.name));

  const results = ranked.map((entry) => entry.tool);
  const fuzzyMatches = ranked.filter((entry) => entry.matchType === 'fuzzy').map((entry) => entry.tool.name);
  const suggestions = [...new Set(fuzzyMatches)].slice(0, 4);
  const didYouMean = suggestions[0] && !results.some((t) => t.name.toLowerCase() === trimmed.toLowerCase())
    ? suggestions[0]
    : ranked[0]?.tool?.name !== trimmed ? ranked[0]?.tool?.name : null;

  return { results, suggestions, didYouMean };
}

export function highlightSearchText(text, query) {
  const trimmed = query?.trim();
  if (!trimmed || !text) return [{ text, match: false }];

  const lowerText = text.toLowerCase();
  const lowerQuery = trimmed.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);

  if (index === -1) {
    const tokens = tokenize(trimmed).sort((a, b) => b.length - a.length);
    for (const token of tokens) {
      const tokenIndex = lowerText.indexOf(token);
      if (tokenIndex !== -1) {
        return [
          { text: text.slice(0, tokenIndex), match: false },
          { text: text.slice(tokenIndex, tokenIndex + token.length), match: true },
          { text: text.slice(tokenIndex + token.length), match: false }
        ].filter((part) => part.text);
      }
      const synonymHit = (SYNONYMS[token] || []).find((syn) => lowerText.includes(syn));
      if (synonymHit) {
        const synIndex = lowerText.indexOf(synonymHit);
        return [
          { text: text.slice(0, synIndex), match: false },
          { text: text.slice(synIndex, synIndex + synonymHit.length), match: true },
          { text: text.slice(synIndex + synonymHit.length), match: false }
        ].filter((part) => part.text);
      }
    }
    return [{ text, match: false }];
  }

  return [
    { text: text.slice(0, index), match: false },
    { text: text.slice(index, index + trimmed.length), match: true },
    { text: text.slice(index + trimmed.length), match: false }
  ].filter((part) => part.text);
}
