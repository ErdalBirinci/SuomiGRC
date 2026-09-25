/**
 * Advanced Fuzzy Search Engine for suomiGRC
 * Supports:
 * - Subsequence alignment with boundary bonuses
 * - Typo tolerance via Damerau-Levenshtein edit distance
 * - Acronym & abbreviation matching (e.g., "mfa" -> "Multi-Factor Authentication")
 * - Multi-token matching in any order
 * - Character highlight index extraction
 */

export interface FuzzyMatchResult {
  score: number; // 0 to 100+
  matchedIndices: number[]; // Character indices in the target text that matched
  matchType: 'exact' | 'prefix' | 'acronym' | 'fuzzy' | 'typo' | 'none';
}

/**
 * Calculates Damerau-Levenshtein edit distance between two strings
 */
export function getEditDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const d: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1, // deletion
        d[i][j - 1] + 1, // insertion
        d[i - 1][j - 1] + cost // substitution
      );

      // Transposition check
      if (i > 1 && j > 1 && s1[i - 1] === s2[j - 2] && s1[i - 2] === s2[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }

  return d[m][n];
}

/**
 * Check if pattern matches target via acronym / initials (e.g. "mfa" -> "Multi-Factor Authentication")
 */
function matchAcronym(pattern: string, target: string): FuzzyMatchResult | null {
  const words = target.split(/[\s\-_/\\.:,]+/).filter(Boolean);
  if (words.length < 2) return null;

  const acronym = words.map((w) => w[0]).join('').toLowerCase();
  const lowerPattern = pattern.toLowerCase().replace(/[^a-z0-9]/g, '');

  if (!lowerPattern) return null;

  if (acronym.includes(lowerPattern) || lowerPattern.includes(acronym)) {
    // Find matching word start indices
    const indices: number[] = [];
    let searchPos = 0;
    for (let i = 0; i < words.length && i < lowerPattern.length; i++) {
      const char = lowerPattern[i];
      const wordIdx = target.toLowerCase().indexOf(words[i].toLowerCase(), searchPos);
      if (wordIdx !== -1 && target[wordIdx].toLowerCase() === char) {
        indices.push(wordIdx);
        searchPos = wordIdx + 1;
      }
    }

    return {
      score: 85 + (lowerPattern === acronym ? 15 : 5),
      matchedIndices: indices,
      matchType: 'acronym',
    };
  }

  return null;
}

/**
 * Fuzzy search a single pattern against a target string
 */
export function fuzzyMatch(pattern: string, target: string): FuzzyMatchResult {
  if (!pattern || !target) {
    return { score: 0, matchedIndices: [], matchType: 'none' };
  }

  const pLower = pattern.trim().toLowerCase();
  const tLower = target.toLowerCase();

  // 1. Exact Match
  if (pLower === tLower) {
    const indices = Array.from({ length: target.length }, (_, i) => i);
    return { score: 100, matchedIndices: indices, matchType: 'exact' };
  }

  // 2. Exact Substring Match
  const subIdx = tLower.indexOf(pLower);
  if (subIdx !== -1) {
    const indices: number[] = [];
    for (let i = 0; i < pLower.length; i++) {
      indices.push(subIdx + i);
    }
    const isWordStart = subIdx === 0 || /[\s\-_/.:]/.test(target[subIdx - 1]);
    const score = isWordStart ? (subIdx === 0 ? 95 : 90) : 80;
    return {
      score,
      matchedIndices: indices,
      matchType: subIdx === 0 ? 'prefix' : 'exact',
    };
  }

  // 3. Acronym Match (e.g. "mfa", "rbac", "tprm", "soc", "bcdr", "iam", "dlp", "ephi")
  const acronymResult = matchAcronym(pLower, target);
  if (acronymResult) {
    return acronymResult;
  }

  // 4. Subsequence alignment with sequential & word-boundary bonus
  let pIdx = 0;
  let score = 0;
  const matchedIndices: number[] = [];
  let consecutiveMatches = 0;
  let prevMatchIdx = -2;

  for (let tIdx = 0; tIdx < tLower.length && pIdx < pLower.length; tIdx++) {
    if (tLower[tIdx] === pLower[pIdx]) {
      matchedIndices.push(tIdx);

      // Base match points
      score += 10;

      // Word boundary bonus (start of string or preceded by space/delimiter/camelCase)
      const isBoundary =
        tIdx === 0 ||
        /[\s\-_/.:,]/.test(target[tIdx - 1]) ||
        (target[tIdx] >= 'A' && target[tIdx] <= 'Z' && target[tIdx - 1] >= 'a' && target[tIdx - 1] <= 'z');

      if (isBoundary) {
        score += 15;
      }

      // Consecutive character bonus
      if (tIdx === prevMatchIdx + 1) {
        consecutiveMatches++;
        score += consecutiveMatches * 8;
      } else {
        consecutiveMatches = 0;
      }

      prevMatchIdx = tIdx;
      pIdx++;
    }
  }

  // If full pattern was matched as a subsequence
  if (pIdx === pLower.length) {
    // Normalize score relative to target length to favor tighter matches
    const densityPenalty = Math.max(0, (target.length - pattern.length) * 0.5);
    const finalScore = Math.max(35, Math.min(88, score - densityPenalty));
    return {
      score: Math.round(finalScore),
      matchedIndices,
      matchType: 'fuzzy',
    };
  }

  // 5. Typo Tolerance via Edit Distance on Words
  const words = tLower.split(/[\s\-_/.:,]+/).filter(Boolean);
  let bestWordScore = 0;
  let typoIndices: number[] = [];

  for (const word of words) {
    // Only check edit distance for words with length close to pattern
    if (Math.abs(word.length - pLower.length) <= 2 && pLower.length >= 3) {
      const dist = getEditDistance(pLower, word);
      const maxAllowedDist = pLower.length <= 4 ? 1 : 2;

      if (dist <= maxAllowedDist) {
        const typoScore = Math.round(70 - dist * 18);
        if (typoScore > bestWordScore) {
          bestWordScore = typoScore;
          const wordStart = tLower.indexOf(word);
          if (wordStart !== -1) {
            typoIndices = Array.from({ length: word.length }, (_, i) => wordStart + i);
          }
        }
      }
    }
  }

  if (bestWordScore > 0) {
    return {
      score: bestWordScore,
      matchedIndices: typoIndices,
      matchType: 'typo',
    };
  }

  return { score: 0, matchedIndices: [], matchType: 'none' };
}

export interface SearchableEntity {
  id: string;
  category: 'control' | 'risk' | 'vendor' | 'policy' | 'test';
  title: string;
  codeOrSubtitle?: string;
  description?: string;
  statusBadge?: string;
  statusColor?: string;
  secondaryMeta?: string;
  tags?: string[];
  originalItem: any;
}

export interface ScoredSearchResult {
  entity: SearchableEntity;
  totalScore: number;
  titleHighlights: number[];
  codeHighlights: number[];
  matchType: FuzzyMatchResult['matchType'];
  matchedField: 'title' | 'code' | 'description' | 'meta' | 'tags';
}

/**
 * Executes a multi-token fuzzy search across an array of searchable entities
 */
export function searchEntitiesFuzzy(
  query: string,
  entities: SearchableEntity[],
  categoryFilter: string = 'all'
): ScoredSearchResult[] {
  const trimmed = query.trim();

  // Filter by category if requested
  const pool = categoryFilter === 'all'
    ? entities
    : entities.filter((e) => e.category === categoryFilter);

  if (!trimmed) {
    // Return top default prioritized items if no query
    return pool.slice(0, 15).map((entity) => ({
      entity,
      totalScore: 100,
      titleHighlights: [],
      codeHighlights: [],
      matchType: 'exact',
      matchedField: 'title',
    }));
  }

  const tokens = trimmed.split(/\s+/).filter(Boolean);
  const results: ScoredSearchResult[] = [];

  for (const entity of pool) {
    let entityScore = 0;
    let titleHighlights: number[] = [];
    let codeHighlights: number[] = [];
    let bestMatchType: FuzzyMatchResult['matchType'] = 'none';
    let primaryField: 'title' | 'code' | 'description' | 'meta' | 'tags' = 'title';

    let allTokensMatched = true;

    for (const token of tokens) {
      // 1. Check Code / Identifier (High weight: x1.4)
      const codeRes = fuzzyMatch(token, entity.codeOrSubtitle || '');

      // 2. Check Title / Name (High weight: x1.2)
      const titleRes = fuzzyMatch(token, entity.title);

      // 3. Check Description (Standard weight: x0.8)
      const descRes = fuzzyMatch(token, entity.description || '');

      // 4. Check Secondary Meta / Owner / Mappings (Weight: x0.7)
      const metaRes = fuzzyMatch(token, entity.secondaryMeta || '');

      // 5. Check Tags if present
      let tagScore = 0;
      if (entity.tags && entity.tags.length > 0) {
        for (const tag of entity.tags) {
          const tRes = fuzzyMatch(token, tag);
          if (tRes.score > tagScore) tagScore = tRes.score;
        }
      }

      const weightedCode = codeRes.score * 1.4;
      const weightedTitle = titleRes.score * 1.2;
      const weightedDesc = descRes.score * 0.8;
      const weightedMeta = metaRes.score * 0.7;
      const weightedTag = tagScore * 0.9;

      const maxTokenScore = Math.max(weightedCode, weightedTitle, weightedDesc, weightedMeta, weightedTag);

      if (maxTokenScore < 20) {
        allTokensMatched = false;
        break;
      }

      entityScore += maxTokenScore;

      // Track highlights
      if (codeRes.score > 25) {
        codeHighlights = Array.from(new Set([...codeHighlights, ...codeRes.matchedIndices]));
      }
      if (titleRes.score > 25) {
        titleHighlights = Array.from(new Set([...titleHighlights, ...titleRes.matchedIndices]));
      }

      // Track best match type & matched field
      if (weightedCode >= weightedTitle && weightedCode >= weightedDesc) {
        primaryField = 'code';
        if (codeRes.matchType !== 'none') bestMatchType = codeRes.matchType;
      } else if (weightedTitle >= weightedDesc) {
        primaryField = 'title';
        if (titleRes.matchType !== 'none') bestMatchType = titleRes.matchType;
      } else {
        primaryField = 'description';
        if (descRes.matchType !== 'none') bestMatchType = descRes.matchType;
      }
    }

    if (allTokensMatched && entityScore > 0) {
      // Priority boost for critical/failing status
      if (
        entity.statusBadge?.toLowerCase().includes('fail') ||
        entity.statusBadge?.toLowerCase().includes('action required') ||
        entity.statusBadge?.toLowerCase().includes('critical')
      ) {
        entityScore += 10;
      }

      results.push({
        entity,
        totalScore: Math.round(entityScore),
        titleHighlights: titleHighlights.sort((a, b) => a - b),
        codeHighlights: codeHighlights.sort((a, b) => a - b),
        matchType: bestMatchType,
        matchedField: primaryField,
      });
    }
  }

  // Sort by score descending
  return results.sort((a, b) => b.totalScore - a.totalScore);
}
