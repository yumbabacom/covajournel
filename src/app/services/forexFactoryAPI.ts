// Forex Factory API Service (Client-side)
// Fetches economic calendar data from our API route

interface EconomicEvent {
  id: string;
  title: string;
  country: string;
  currency: string;
  time: Date;
  importance: 'low' | 'medium' | 'high';
  forecast?: string;
  previous?: string;
  actual?: string;
  description: string;
  category: string;
  impact: 'positive' | 'negative' | 'neutral' | 'pending';
  source: string;
  unit?: string;
  frequency: string;
  volatility: 'low' | 'medium' | 'high';
  isLive?: boolean;
  timeUntil?: string;
}

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  importance: 'low' | 'medium' | 'high';
  currency: string;
  timestamp: Date;
  source: string;
  tags: string[];
}

interface CacheEntry {
  data: any;
  timestamp: number;
  expiresAt: number;
}

class ForexFactoryAPI {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache
  private dailyCallCount: number = 0;
  private lastResetDate: string = '';
  private readonly MAX_DAILY_CALLS = 100; // Reasonable limit for API calls

  constructor() {
    this.initializeDailyCounter();
  }

  private initializeDailyCounter() {
    const today = new Date().toDateString();
    if (this.lastResetDate !== today) {
      this.dailyCallCount = 0;
      this.lastResetDate = today;
    }
  }

  private canMakeAPICall(): boolean {
    this.initializeDailyCounter();
    return this.dailyCallCount < this.MAX_DAILY_CALLS;
  }

  private incrementCallCount() {
    this.dailyCallCount++;
    console.log(`Forex Factory API calls today: ${this.dailyCallCount}/${this.MAX_DAILY_CALLS}`);
  }

  private getCacheKey(timeframe: string): string {
    return `forex_factory_${timeframe}`;
  }

  private isValidCache(entry: CacheEntry): boolean {
    return Date.now() < entry.expiresAt;
  }

  // Fetch data from our API route
  private async fetchFromAPI(timeframe: string, clearCache: boolean = false): Promise<EconomicEvent[]> {
    const cacheKey = this.getCacheKey(timeframe);
    const cached = this.cache.get(cacheKey);

    // Return cached data if valid and not clearing cache
    if (!clearCache && cached && this.isValidCache(cached)) {
      console.log('Using cached Forex Factory data');
      return cached.data;
    }

    // Check API call limit
    if (!this.canMakeAPICall()) {
      console.warn('Daily API call limit reached, using cached data');
      return cached ? cached.data : this.getFallbackEvents();
    }

    try {
      console.log(`Fetching Forex Factory data for timeframe: ${timeframe}${clearCache ? ' (cache cleared)' : ''}`);

      const url = `/api/forex-factory?timeframe=${timeframe}${clearCache ? '&clearCache=true' : ''}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'API request failed');
      }

      // Transform the data to ensure Date objects
      const transformedData = result.data.map((event: any) => ({
        ...event,
        time: new Date(event.time)
      }));

      this.incrementCallCount();

      // Cache the response
      const cacheEntry: CacheEntry = {
        data: transformedData,
        timestamp: Date.now(),
        expiresAt: Date.now() + this.CACHE_DURATION
      };
      this.cache.set(cacheKey, cacheEntry);

      console.log(`Fetched ${transformedData.length} events from Forex Factory API`);
      return transformedData;

    } catch (error) {
      console.error('Forex Factory API request failed:', error);
      return cached ? cached.data : this.getFallbackEvents();
    }
  }



  // Generate economic calendar
  async generateEconomicCalendar(timeframe: string = 'all', clearCache: boolean = false): Promise<EconomicEvent[]> {
    try {
      if (clearCache) {
        this.clearCache();
        console.log('Cache cleared for fresh data fetch');
      }
      return await this.fetchFromAPI(timeframe, clearCache);
    } catch (error) {
      console.error('Error generating economic calendar:', error);
      return this.getFallbackEvents();
    }
  }



  // Generate mock news (since Forex Factory doesn't have news API)
  async generateForexNews(timeframe: string = 'today'): Promise<NewsArticle[]> {
    // Return mock news data since Forex Factory doesn't provide news API
    return this.getMockNews();
  }

  // Fallback events when scraping fails
  private getFallbackEvents(): EconomicEvent[] {
    const now = new Date();
    return [
      {
        id: 'fallback_1',
        title: 'Forex Factory Data Unavailable',
        country: 'Global',
        currency: 'USD',
        time: now,
        importance: 'low',
        description: 'Economic calendar data temporarily unavailable',
        category: 'other',
        impact: 'neutral',
        source: 'System',
        frequency: 'daily',
        volatility: 'low',
        timeUntil: 'N/A'
      }
    ];
  }

  // Mock news data
  private getMockNews(): NewsArticle[] {
    return [
      {
        id: 'mock_news_1',
        title: 'Economic Calendar Data from Forex Factory',
        summary: 'Real-time economic calendar data scraped from ForexFactory.com',
        content: 'Economic events and data are being fetched from Forex Factory.',
        category: 'market-update',
        importance: 'medium',
        currency: 'USD',
        timestamp: new Date(),
        source: 'Forex Factory',
        tags: ['Economic Calendar', 'Forex Factory', 'Market Data']
      }
    ];
  }

  // Get API usage statistics
  getAPIUsageStats() {
    return {
      dailyCallCount: this.dailyCallCount,
      maxDailyCalls: this.MAX_DAILY_CALLS,
      remainingCalls: this.MAX_DAILY_CALLS - this.dailyCallCount,
      cacheSize: this.cache.size,
      lastResetDate: this.lastResetDate
    };
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }
}

export default ForexFactoryAPI;
