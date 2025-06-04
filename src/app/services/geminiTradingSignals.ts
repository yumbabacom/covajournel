// Gemini AI Trading Signals Service
// Generates AI-powered trading signals for economic events

// ✅ TRADING SIGNALS SERVICE
// Note: This is a demonstration service with simulated signals
// In production, this would connect to real market data APIs like Alpha Vantage, IEX Cloud, etc.

interface TradingSignal {
  symbol: string;
  direction: 'BUY' | 'SELL' | 'HOLD';
  strength: number; // 1-10
  price: number;
  confidence: number; // 0-100
  reasoning: string;
  timeframe: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  targetPrice?: number;
  stopLoss?: number;
  timestamp: string;
}

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
}

// ✅ DEMO TRADING SIGNALS GENERATOR
// Note: These are simulated signals for demonstration purposes
class DemoTradingSignalsAPI {
  private cache: Map<string, { signal: TradingSignal; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes cache

  constructor() {
    // Demo service - no real API key needed
    console.log('🎯 Demo Trading Signals API initialized');
  }

  // Generate AI trading signal for economic event
  async generateTradingSignal(event: EconomicEvent): Promise<TradingSignal> {
    const cacheKey = `${event.id}_${event.actual}_${event.forecast}`;
    const cached = this.cache.get(cacheKey);

    // Return cached signal if valid
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log('Using cached trading signal');
      return cached.signal;
    }

    try {
      // Generate mock signal (replacing Gemini API)
      const response = await this.generateMockSignal(event);
      const signal = this.parseTradingSignalResponse(response, event);

      // Cache the signal
      this.cache.set(cacheKey, {
        signal,
        timestamp: Date.now()
      });

      return signal;
    } catch (error) {
      console.error('Error generating mock trading signal:', error);
      return this.getFallbackSignal(event);
    }
  }

  // Generate comprehensive trading signal prompt
  private generateTradingSignalPrompt(event: EconomicEvent): string {
    const currentTime = new Date().toISOString();
    const eventTime = event.time.toISOString();
    const hasActual = event.actual && event.actual !== '';
    const hasForecast = event.forecast && event.forecast !== '';

    return `
    You are a professional forex trading analyst. Analyze this economic event and provide a detailed trading signal.

    **ECONOMIC EVENT DETAILS:**
    - Event: ${event.title}
    - Country: ${event.country}
    - Currency: ${event.currency}
    - Category: ${event.category}
    - Importance: ${event.importance}
    - Time: ${eventTime}
    - Current Time: ${currentTime}
    - Description: ${event.description}
    
    **DATA VALUES:**
    - Forecast: ${event.forecast || 'N/A'}
    - Previous: ${event.previous || 'N/A'}
    - Actual: ${event.actual || 'Not yet released'}
    - Impact: ${event.impact}

    **ANALYSIS REQUIREMENTS:**
    1. **Signal Direction**: Determine BUY, SELL, HOLD, or WATCH based on:
       ${hasActual ? '- Actual vs Forecast deviation' : '- Expected market reaction to forecast'}
       - Historical market response to this event
       - Current market sentiment
       - Technical analysis considerations

    2. **Signal Strength**: Rate 1-10 based on:
       - Event importance (${event.importance})
       - Data deviation magnitude
       - Market volatility potential
       - Timing and market conditions

    3. **Confidence Level**: Rate 1-100 based on:
       - Data reliability
       - Historical accuracy
       - Market predictability
       - External factors

    4. **Risk Assessment**: Classify as low/medium/high based on:
       - Volatility potential
       - Market uncertainty
       - Event unpredictability

    5. **Trading Strategy**: Provide specific strategy including:
       - Entry timing
       - Position sizing recommendations
       - Risk management approach
       - Market conditions to watch

    **AFFECTED CURRENCY PAIRS:**
    Identify 3-5 most affected pairs for ${event.currency} (e.g., ${event.currency}/USD, EUR/${event.currency}, etc.)

    **RESPONSE FORMAT (JSON only):**
    {
      "signal": "BUY|SELL|HOLD|WATCH",
      "strength": 1-10,
      "confidence": 1-100,
      "reasoning": "Detailed explanation of why this signal was chosen",
      "targetPrice": "Specific price target or percentage move",
      "stopLoss": "Risk management level",
      "timeframe": "How long to hold this position",
      "riskLevel": "low|medium|high",
      "affectedPairs": ["${event.currency}/USD", "EUR/${event.currency}", "GBP/${event.currency}"],
      "marketImpact": "Expected market reaction and volatility",
      "tradingStrategy": "Specific trading approach and execution plan",
      "entryPoints": ["Primary entry level", "Secondary entry level"],
      "exitStrategy": "When and how to exit the position"
    }

    **IMPORTANT:** 
    - Return ONLY valid JSON
    - Be specific with price targets and levels
    - Consider current market conditions
    - Provide actionable trading advice
    - Factor in risk management principles
    `;
  }

  // Generate mock trading signal (replacing Gemini API)
  private async generateMockSignal(event: EconomicEvent): Promise<string> {
    // Generate mock trading signal based on event data
    const directions = ['bullish', 'bearish', 'neutral'];
    const direction = directions[Math.floor(Math.random() * directions.length)];

    const riskLevels = ['low', 'medium', 'high'];
    const riskLevel = event.importance === 'high' ? 'high' : riskLevels[Math.floor(Math.random() * riskLevels.length)];

    const timeframes = ['30 minutes', '1-2 hours', '2-4 hours', '4-8 hours'];
    const timeframe = timeframes[Math.floor(Math.random() * timeframes.length)];

    const mockSignal = {
      direction,
      confidence: Math.floor(Math.random() * 30) + 65, // 65-95
      reasoning: `Mock analysis of ${event.title} shows ${direction} sentiment for ${event.currency}. The ${event.importance}-impact event is expected to drive ${direction === 'neutral' ? 'mixed' : direction} momentum in ${event.currency} pairs.`,
      targetPrice: `${event.currency}/USD: ${(Math.random() * 0.1 + 1.0).toFixed(4)}`,
      stopLoss: `${event.currency}/USD: ${(Math.random() * 0.05 + 0.95).toFixed(4)}`,
      timeframe,
      riskLevel,
      affectedPairs: [`${event.currency}/USD`, `EUR/${event.currency}`, `GBP/${event.currency}`],
      marketImpact: `${event.importance} volatility expected with potential ${direction} bias`,
      category: event.category || 'Economic Data',
      impact: direction === 'bullish' ? 'positive' : direction === 'bearish' ? 'negative' : 'neutral'
    };

    return JSON.stringify(mockSignal, null, 2);
  }

  // Parse Gemini response into trading signal
  private parseTradingSignalResponse(response: string, event: EconomicEvent): TradingSignal {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate and return signal
      return {
        symbol: event.currency,
        direction: parsed.signal === 'BUY' ? 'BUY' : parsed.signal === 'SELL' ? 'SELL' : 'HOLD',
        strength: Math.min(Math.max(parsed.strength || 5, 1), 10),
        price: parseFloat(parsed.targetPrice?.replace(/[^\d.-]/g, '') || '0'),
        confidence: Math.min(Math.max(parsed.confidence || 50, 0), 100),
        reasoning: parsed.reasoning || 'AI analysis of economic event impact',
        timeframe: parsed.timeframe || '1-4 hours',
        riskLevel: parsed.riskLevel === 'low' ? 'LOW' : parsed.riskLevel === 'medium' ? 'MEDIUM' : 'HIGH',
        ...(parsed.targetPrice && { targetPrice: parseFloat(parsed.targetPrice.replace(/[^\d.-]/g, '')) }),
        ...(parsed.stopLoss && { stopLoss: parseFloat(parsed.stopLoss.replace(/[^\d.-]/g, '')) }),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      return this.getFallbackSignal(event);
    }
  }

  // Generate fallback signal when AI fails
  private getFallbackSignal(event: EconomicEvent): TradingSignal {
    const hasActual = event.actual && event.actual !== '';
    const signal = hasActual ? this.determineBasicSignal(event) : 'HOLD';
    
    return {
      symbol: event.currency,
      direction: signal === 'BUY' ? 'BUY' : signal === 'SELL' ? 'SELL' : 'HOLD',
      strength: event.importance === 'high' ? 7 : event.importance === 'medium' ? 5 : 3,
      price: 0,
      confidence: 60,
      reasoning: `Basic analysis: ${event.importance} impact ${event.category} event for ${event.currency}. ${hasActual ? 'Actual data available for analysis.' : 'Awaiting actual data release.'}`,
      timeframe: '1-2 hours',
      riskLevel: event.importance === 'high' ? 'HIGH' : 'MEDIUM',
      timestamp: new Date().toISOString()
    };
  }

  // Determine basic signal from event data
  private determineBasicSignal(event: EconomicEvent): 'BUY' | 'SELL' | 'HOLD' {
    if (!event.actual || !event.forecast) return 'HOLD';

    const actual = parseFloat(event.actual.replace(/[^\d.-]/g, ''));
    const forecast = parseFloat(event.forecast.replace(/[^\d.-]/g, ''));

    if (isNaN(actual) || isNaN(forecast)) return 'HOLD';

    // Basic logic: better than expected = BUY currency, worse = SELL
    if (actual > forecast) {
      return event.category === 'employment' || event.category === 'gdp' ? 'BUY' : 'SELL';
    } else if (actual < forecast) {
      return event.category === 'employment' || event.category === 'gdp' ? 'SELL' : 'BUY';
    }

    return 'HOLD';
  }

  // Get API usage statistics
  getAPIUsageStats() {
    return {
      cacheSize: this.cache.size,
      cacheDuration: this.CACHE_DURATION / 1000 / 60, // minutes
      apiType: 'Mock Data (No API Key Required)'
    };
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }
}

export default DemoTradingSignalsAPI;
