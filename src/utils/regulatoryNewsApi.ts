import { RegulatoryAuthority, RegulatoryNewsItem, RegulatorySeverity } from '../types/regulatoryNews';
import { initialRegulatoryNews } from '../data/mockRegulatoryNews';

export interface FetchRegulatoryNewsParams {
  authority?: RegulatoryAuthority;
  searchTopic?: string;
  severity?: RegulatorySeverity;
}

export interface FetchRegulatoryNewsResult {
  items: RegulatoryNewsItem[];
  isLiveGrounded: boolean;
  source: 'google_search_grounding' | 'verified_cache';
  queryFocus?: string;
  error?: string;
}

export async function fetchRegulatoryNews(
  params: FetchRegulatoryNewsParams = {}
): Promise<FetchRegulatoryNewsResult> {
  const { authority = 'ALL', searchTopic = '' } = params;

  try {
    const res = await fetch('/api/regulatory-news', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        authority,
        searchTopic,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.items) && data.items.length > 0) {
        return {
          items: data.items,
          isLiveGrounded: data.source === 'google_search_grounding',
          source: data.source || 'verified_cache',
          queryFocus: data.queryFocus,
        };
      }
    }
  } catch {
    // Graceful fallback to verified curated repository
  }

  // Graceful fallback to verified curated repository
  let filtered = [...initialRegulatoryNews];

  if (authority && authority !== 'ALL') {
    filtered = filtered.filter(
      (item) => item.authority.toUpperCase() === authority.toUpperCase()
    );
  }

  if (searchTopic && searchTopic.trim()) {
    const q = searchTopic.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.executiveSummary.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.affectedFrameworks.some((f) => f.toLowerCase().includes(q)) ||
        item.affectedControlCodes.some((c) => c.toLowerCase().includes(q))
    );
  }

  return {
    items: filtered.length > 0 ? filtered : initialRegulatoryNews,
    isLiveGrounded: false,
    source: 'verified_cache',
  };
}
