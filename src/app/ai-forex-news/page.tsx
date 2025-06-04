'use client';

import { useState, useEffect, useCallback } from 'react';

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

interface AnalysisData {
  totalEvents: number;
  highImpactEvents: number;
  topCurrencies: { currency: string; count: number }[];
  marketSentiment: 'bullish' | 'bearish' | 'neutral';
  riskLevel: 'low' | 'medium' | 'high';
  tradingOpportunities: {
    currency: string;
    type: 'buy' | 'sell';
    reason: string;
    confidence: 'high' | 'medium';
  }[];
  keyEvents: EconomicEvent[];
  summary: string;
}

export default function AIForexNewsPage() {
  const [economicEvents, setEconomicEvents] = useState<EconomicEvent[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'today' | 'yesterday' | 'tomorrow' | 'week'>('today');
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Fetch economic data from API
  const fetchEconomicData = useCallback(async (mode: 'today' | 'yesterday' | 'tomorrow' | 'week') => {
    try {
      setIsLoadingData(true);
      setError(null);

      console.log(`🔄 Fetching economic data for: ${mode}`);

      // Fetch from forex-factory API endpoint
      const response = await fetch(`/api/forex-factory?timeframe=${mode}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        const events = result.data;
        console.log(`✅ Successfully fetched ${events.length} economic events`);

        setEconomicEvents(events);

        // Generate analysis
        const analysisData: AnalysisData = {
          totalEvents: events.length,
          highImpactEvents: events.filter((e: EconomicEvent) => e.importance === 'high').length,
          topCurrencies: getTopCurrencies(events),
          marketSentiment: calculateMarketSentiment(events),
          riskLevel: calculateRiskLevel(events),
          tradingOpportunities: generateTradingOpportunities(events),
          keyEvents: events.filter((e: EconomicEvent) => e.importance === 'high').slice(0, 5),
          summary: generateSummary(events)
        };

        setAnalysis(analysisData);
        setLoading(false);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('❌ Error fetching economic data:', error);
      setError('Failed to fetch economic data. Please try again.');
      setLoading(false);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchEconomicData(viewMode);
  }, [fetchEconomicData, viewMode]);

  const handleViewModeChange = (newMode: 'today' | 'yesterday' | 'tomorrow' | 'week') => {
    if (newMode === viewMode) return; // Prevent unnecessary re-fetching
    setViewMode(newMode);
  };

  // Helper functions
  const getTopCurrencies = (events: EconomicEvent[]) => {
    const currencyCount: { [key: string]: number } = {};
    events.forEach(event => {
      currencyCount[event.currency] = (currencyCount[event.currency] || 0) + 1;
    });
    return Object.entries(currencyCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([currency, count]) => ({ currency, count }));
  };

  const calculateMarketSentiment = (events: EconomicEvent[]) => {
    const sentiments = events.map(e => e.impact);
    const positive = sentiments.filter(s => s === 'positive').length;
    const negative = sentiments.filter(s => s === 'negative').length;
    const total = positive + negative;
    
    if (total === 0) return 'neutral';
    
    const ratio = positive / total;
    if (ratio > 0.6) return 'bullish';
    if (ratio < 0.4) return 'bearish';
    return 'neutral';
  };

  const calculateRiskLevel = (events: EconomicEvent[]) => {
    const highImpactCount = events.filter(e => e.importance === 'high').length;
    if (highImpactCount >= 5) return 'high';
    if (highImpactCount >= 2) return 'medium';
    return 'low';
  };

  const generateTradingOpportunities = (events: EconomicEvent[]) => {
    return events
      .filter(e => e.importance === 'high' && e.impact !== 'neutral')
      .slice(0, 3)
      .map(event => ({
        currency: event.currency,
        type: event.impact === 'positive' ? 'buy' as const : 'sell' as const,
        reason: `${event.title} shows ${event.impact} impact`,
        confidence: event.importance === 'high' ? 'high' as const : 'medium' as const
      }));
  };

  const generateSummary = (events: EconomicEvent[]) => {
    const highImpactCount = events.filter(e => e.importance === 'high').length;
    const currencies = getTopCurrencies(events);
    const sentiment = calculateMarketSentiment(events);
    
    return `Today features ${events.length} economic events with ${highImpactCount} high-impact releases. ` +
           `Key focus on ${currencies[0]?.currency || 'major currencies'}. ` +
           `Market sentiment appears ${sentiment}. Traders should monitor volatility around major announcements.`;
  };

  if (loading && economicEvents.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-400/10 rounded-full filter blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            
            <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
              AI Forex News & Economic Calendar
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Real-time economic events, market analysis, and AI-powered insights to help you stay ahead of market movements.
            </p>
            
            {error && (
              <div className="mt-6 p-4 bg-red-100 border border-red-300 rounded-xl">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-700">{error}</p>
                  <button
                    onClick={() => fetchEconomicData(viewMode)}
                    disabled={isLoadingData}
                    className="ml-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {isLoadingData ? 'Retrying...' : 'Try Again'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* View Mode Selector */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {[
              { key: 'yesterday', label: 'Yesterday', icon: '⏮️' },
              { key: 'today', label: 'Today', icon: '📅' },
              { key: 'tomorrow', label: 'Tomorrow', icon: '⏭️' },
              { key: 'week', label: 'This Week', icon: '📊' }
            ].map((mode) => (
              <button
                key={mode.key}
                onClick={() => handleViewModeChange(mode.key as 'today' | 'yesterday' | 'tomorrow' | 'week')}
                disabled={isLoadingData}
                className={`group relative px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl border-2 
                  ${viewMode === mode.key
                    ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white border-transparent shadow-2xl scale-105' 
                    : 'bg-white/80 backdrop-blur-sm text-gray-700 border-white/40 hover:border-blue-300 hover:bg-white/90'
                  } ${isLoadingData ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
              >
                {isLoadingData && viewMode === mode.key && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  </div>
                )}
                <span className={isLoadingData && viewMode === mode.key ? 'opacity-0' : ''}>
                  <span className="text-lg mr-2">{mode.icon}</span>
                  {mode.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoadingData && (
          <div className="text-center py-12">
            <div className="inline-flex items-center px-8 py-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-4"></div>
              <span className="text-lg font-semibold text-gray-700">Loading economic data...</span>
            </div>
          </div>
        )}

        {/* Content */}
        {!isLoadingData && !error && economicEvents.length > 0 && (
          <div className="space-y-8">
            {/* Analysis Overview */}
            {analysis && (
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Market Analysis & Insights</h2>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-2xl p-6 border border-blue-200/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-700">Total Events</span>
                      <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold">{analysis.totalEvents}</span>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-blue-900">{analysis.totalEvents}</p>
                  </div>

                  <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-2xl p-6 border border-red-200/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-red-700">High Impact</span>
                      <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold">{analysis.highImpactEvents}</span>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-red-900">{analysis.highImpactEvents}</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-2xl p-6 border border-green-200/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-700">Sentiment</span>
                      <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                        <span className="text-white text-xl">
                          {analysis.marketSentiment === 'bullish' ? '📈' : 
                           analysis.marketSentiment === 'bearish' ? '📉' : '➡️'}
                        </span>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-green-900 capitalize">{analysis.marketSentiment}</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-2xl p-6 border border-purple-200/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-purple-700">Risk Level</span>
                      <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                        <span className="text-white text-xl">
                          {analysis.riskLevel === 'high' ? '🔴' : 
                           analysis.riskLevel === 'medium' ? '🟡' : '🟢'}
                        </span>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-purple-900 capitalize">{analysis.riskLevel}</p>
                  </div>
                </div>

                {/* Market Summary */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">📊 Market Summary</h3>
                  <p className="text-gray-700 leading-relaxed">{analysis.summary}</p>
                </div>

                {/* Trading Opportunities */}
                {analysis.tradingOpportunities.length > 0 && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">💡 Trading Opportunities</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {analysis.tradingOpportunities.map((opportunity, index) => (
                        <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-green-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-lg">{opportunity.currency}</span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              opportunity.type === 'buy' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {opportunity.type.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{opportunity.reason}</p>
                          <div className="flex items-center">
                            <span className="text-xs text-gray-500 mr-2">Confidence:</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              opportunity.confidence === 'high' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {opportunity.confidence}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Economic Events Table */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
              <div className="p-8 border-b border-gray-200">
                <h2 className="text-3xl font-bold text-gray-900">Economic Events Calendar</h2>
                <p className="text-gray-600 mt-2">Showing {economicEvents.length} events for {viewMode}</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Time</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Currency</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Event</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Impact</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actual</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Forecast</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Previous</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {economicEvents.map((event) => (
                      <tr key={event.id} className="hover:bg-blue-50/50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {event.time ? new Date(event.time).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          }) : 'TBD'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {event.currency}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                          <div className="font-medium">{event.title}</div>
                          <div className="text-gray-500 text-xs">{event.country}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            event.importance === 'high' 
                              ? 'bg-red-100 text-red-800' 
                              : event.importance === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {event.importance}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`font-medium ${
                            event.impact === 'positive' 
                              ? 'text-green-600' 
                              : event.impact === 'negative'
                              ? 'text-red-600'
                              : 'text-gray-600'
                          }`}>
                            {event.actual || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {event.forecast || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {event.previous || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoadingData && !error && economicEvents.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-12">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No Economic Events Found</h3>
              <p className="text-gray-600 mb-8">There are no economic events scheduled for {viewMode}.</p>
              <button
                onClick={() => fetchEconomicData(viewMode)}
                disabled={isLoadingData}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white rounded-2xl font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl disabled:opacity-50"
              >
                {isLoadingData ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Refreshing...
                  </div>
                ) : (
                  'Refresh Data'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
