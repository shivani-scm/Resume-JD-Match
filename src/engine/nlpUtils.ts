/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Standard English stop words
export const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'could', 'did',
  'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has', 'have',
  'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if', 'in',
  'into', 'is', 'it', 'its', 'itself', 'just', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not',
  'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over',
  'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them',
  'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under', 'until',
  'up', 'very', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why',
  'with', 'would', 'you', 'your', 'yours', 'yourself', 'yourselves', 'will', 'also', 'can', 'including'
]);

/**
 * Clean text and tokenize into words.
 */
export function tokenize(text: string, removeStopWords = true): string[] {
  if (!text) return [];
  const normalized = text.toLowerCase().replace(/[^a-z0-9+#.\-_/ ]/g, ' ');
  const tokens = normalized
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1);

  if (removeStopWords) {
    return tokens.filter((t) => !STOP_WORDS.has(t));
  }
  return tokens;
}

/**
 * Basic algorithmic stemmer for English word endings (plural, ed, ing, ly, etc.).
 */
export function stemWord(word: string): string {
  const w = word.toLowerCase();
  if (w.length <= 3) return w;
  if (w.endsWith('ies')) return w.slice(0, -3) + 'y';
  if (w.endsWith('es') && !w.endsWith('ses') && !w.endsWith('zes')) return w.slice(0, -2);
  if (w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1);
  if (w.endsWith('ing')) return w.slice(0, -3);
  if (w.endsWith('ed')) return w.slice(0, -2);
  if (w.endsWith('ly')) return w.slice(0, -2);
  if (w.endsWith('tion')) return w.slice(0, -4) + 't';
  if (w.endsWith('ment')) return w.slice(0, -4);
  return w;
}

/**
 * Standard Levenshtein Distance.
 */
export function levenshteinDistance(s1: string, s2: string): number {
  const a = s1.toLowerCase();
  const b = s2.toLowerCase();
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Normalized Levenshtein similarity [0.0, 1.0].
 */
export function levenshteinSimilarity(s1: string, s2: string): number {
  if (!s1 && !s2) return 1.0;
  if (!s1 || !s2) return 0.0;
  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1.0;
  const dist = levenshteinDistance(s1, s2);
  return Math.max(0, 1.0 - dist / maxLen);
}

/**
 * Jaro-Winkler distance algorithm [0.0, 1.0].
 */
export function jaroWinklerSimilarity(s1: string, s2: string): number {
  const a = s1.toLowerCase();
  const b = s2.toLowerCase();

  if (a === b) return 1.0;
  if (a.length === 0 || b.length === 0) return 0.0;

  const matchDistance = Math.floor(Math.max(a.length, b.length) / 2) - 1;
  const aMatches = new Array(a.length).fill(false);
  const bMatches = new Array(b.length).fill(false);

  let matches = 0;
  for (let i = 0; i < a.length; i++) {
    const start = Math.max(0, i - matchDistance);
    const end = Math.min(i + matchDistance + 1, b.length);

    for (let j = start; j < end; j++) {
      if (bMatches[j]) continue;
      if (a[i] !== b[j]) continue;
      aMatches[i] = true;
      bMatches[j] = true;
      matches++;
      break;
    }
  }

  if (matches === 0) return 0.0;

  let transpositions = 0;
  let k = 0;
  for (let i = 0; i < a.length; i++) {
    if (!aMatches[i]) continue;
    while (!bMatches[k]) k++;
    if (a[i] !== b[k]) transpositions++;
    k++;
  }

  const jaro =
    (matches / a.length +
      matches / b.length +
      (matches - transpositions / 2) / matches) /
    3.0;

  // Winkler prefix scale (up to 4 matching chars)
  let prefix = 0;
  const maxPrefix = Math.min(4, Math.min(a.length, b.length));
  for (let i = 0; i < maxPrefix; i++) {
    if (a[i] === b[i]) prefix++;
    else break;
  }

  return Math.min(1.0, jaro + prefix * 0.1 * (1.0 - jaro));
}

/**
 * Calculate Jaccard similarity across two sets of tokens [0.0, 1.0].
 */
export function jaccardSimilarity(tokensA: string[], tokensB: string[]): number {
  const setA = new Set(tokensA.map(stemWord));
  const setB = new Set(tokensB.map(stemWord));

  if (setA.size === 0 && setB.size === 0) return 1.0;
  if (setA.size === 0 || setB.size === 0) return 0.0;

  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) intersection++;
  }

  const union = setA.size + setB.size - intersection;
  return union > 0 ? intersection / union : 0;
}

/**
 * TF-IDF Cosine Similarity for two short texts (e.g. responsibilities).
 */
export function tfIdfCosineSimilarity(docA: string, docB: string): number {
  const tokensA = tokenize(docA).map(stemWord);
  const tokensB = tokenize(docB).map(stemWord);

  if (tokensA.length === 0 || tokensB.length === 0) return 0;

  const allWords = Array.from(new Set([...tokensA, ...tokensB]));
  const freqA: Record<string, number> = {};
  const freqB: Record<string, number> = {};

  tokensA.forEach((w) => (freqA[w] = (freqA[w] || 0) + 1));
  tokensB.forEach((w) => (freqB[w] = (freqB[w] || 0) + 1));

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const w of allWords) {
    const valA = freqA[w] || 0;
    const valB = freqB[w] || 0;
    dotProduct += valA * valB;
    normA += valA * valA;
    normB += valB * valB;
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * BM25 relevance score between a query statement (e.g. JD responsibility) and a candidate sentence.
 */
export function calculateBM25Score(
  query: string,
  doc: string,
  corpusAvgDocLength = 15,
  k1 = 1.5,
  b = 0.75
): number {
  const queryTokens = tokenize(query).map(stemWord);
  const docTokens = tokenize(doc).map(stemWord);

  if (queryTokens.length === 0 || docTokens.length === 0) return 0;

  const docLength = docTokens.length;
  const docFreqs: Record<string, number> = {};
  docTokens.forEach((t) => (docFreqs[t] = (docFreqs[t] || 0) + 1));

  let score = 0;
  for (const q of queryTokens) {
    const tf = docFreqs[q] || 0;
    if (tf > 0) {
      // Simplified local IDF factor
      const idf = 1.2;
      const numerator = tf * (k1 + 1);
      const denominator = tf + k1 * (1 - b + b * (docLength / corpusAvgDocLength));
      score += idf * (numerator / denominator);
    }
  }

  // Normalize to 0-1 scale based on query length
  const maxPossible = queryTokens.length * 1.2 * (k1 + 1);
  return maxPossible > 0 ? Math.min(1.0, score / maxPossible) : 0;
}
