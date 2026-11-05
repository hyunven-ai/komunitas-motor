/**
 * Fuzzy Search & Typo Detection Engine for Brotherhood Portal
 * Uses Levenshtein Distance & Damerau-Levenshtein transposition checks
 * to intelligently suggest corrections for biker & community queries.
 */

// Canonical community dictionary of keywords
export const COMMUNITY_KEYWORDS: string[] = [
  "Touring",
  "Touring Akbar",
  "Kopdar",
  "Kopdar Wajib",
  "Sunmori",
  "Rolling Thunder",
  "Pendaftaran",
  "Pendaftaran Anggota",
  "KTA Digital",
  "Kartu Anggota",
  "Anggota",
  "Pengurus",
  "Dewan Pengurus",
  "Ketua Umum",
  "Sekretariat",
  "Bendahara",
  "Iuran Wajib",
  "Laporan Kas",
  "Keuangan",
  "Donasi",
  "Merchandise",
  "Jaket Komunitas",
  "Rompi Bikers",
  "Stiker",
  "Galeri",
  "Foto Dokumentasi",
  "Sponsor",
  "Bengkel Rekanan",
  "Diskon Servis",
  "Forum Diskusi",
  "Safety Riding",
  "Konvoi",
  "Rute Ekspedisi",
  "Bromo",
  "Sabang",
  "Kilometer Nol",
  "Kilas Berita",
  "Pengumuman",
];

/**
 * Calculates Levenshtein distance between two strings (case-insensitive)
 */
export function calculateLevenshteinDistance(a: string, b: string): number {
  const s1 = a.trim().toLowerCase();
  const s2 = b.trim().toLowerCase();

  const m = s1.length;
  const n = s2.length;

  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1, // deletion
        dp[i][j - 1] + 1, // insertion
        dp[i - 1][j - 1] + cost // substitution
      );

      // Transposition (Damerau)
      if (
        i > 1 &&
        j > 1 &&
        s1[i - 1] === s2[j - 2] &&
        s1[i - 2] === s2[j - 1]
      ) {
        dp[i][j] = Math.min(dp[i][j], dp[i - 2][j - 2] + 1);
      }
    }
  }

  return dp[m][n];
}

export interface TypoSuggestionResult {
  hasTypo: boolean;
  originalQuery: string;
  suggestedQuery: string | null;
  suggestedKeywords: string[];
}

/**
 * Finds the closest matched community keyword for a user query
 */
export function findTypoCorrection(
  query: string,
  dictionary: string[] = COMMUNITY_KEYWORDS,
  thresholdRatio: number = 0.4
): TypoSuggestionResult {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) {
    return {
      hasTypo: false,
      originalQuery: query,
      suggestedQuery: null,
      suggestedKeywords: dictionary.slice(0, 4),
    };
  }

  // Exact match check
  const exactMatch = dictionary.find(
    (item) => item.toLowerCase() === cleanQuery
  );
  if (exactMatch) {
    return {
      hasTypo: false,
      originalQuery: query,
      suggestedQuery: null,
      suggestedKeywords: getRelatedKeywords(exactMatch, dictionary),
    };
  }

  // Substring match check
  const substringMatches = dictionary.filter((item) =>
    item.toLowerCase().includes(cleanQuery)
  );
  if (substringMatches.length > 0) {
    return {
      hasTypo: false,
      originalQuery: query,
      suggestedQuery: null,
      suggestedKeywords: substringMatches.slice(0, 4),
    };
  }

  // Find best Levenshtein match
  let bestMatch: string | null = null;
  let minDistance = Infinity;

  for (const item of dictionary) {
    const dist = calculateLevenshteinDistance(cleanQuery, item);
    // Allow threshold based on string length (at most ~40% characters differed)
    const maxAllowedDist = Math.max(2, Math.floor(item.length * thresholdRatio));

    if (dist <= maxAllowedDist && dist < minDistance) {
      minDistance = dist;
      bestMatch = item;
    }
  }

  return {
    hasTypo: Boolean(bestMatch),
    originalQuery: query,
    suggestedQuery: bestMatch,
    suggestedKeywords: bestMatch
      ? [bestMatch, ...getRelatedKeywords(bestMatch, dictionary).slice(0, 3)]
      : dictionary.slice(0, 4),
  };
}

function getRelatedKeywords(target: string, dictionary: string[]): string[] {
  const clean = target.toLowerCase();
  return dictionary
    .filter((w) => w.toLowerCase() !== clean)
    .sort((a, b) => calculateLevenshteinDistance(clean, a) - calculateLevenshteinDistance(clean, b))
    .slice(0, 4);
}

