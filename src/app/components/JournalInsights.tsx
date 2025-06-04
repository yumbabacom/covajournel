'use client';

import { useState, useEffect } from 'react';

interface Trade {
  id: string;
  symbol: string;
  profitDollars: number;
  lossDollars: number;
  mood?: string;
  confidence?: number;
  createdAt: string;
}

interface JournalEntry {
  id: string;
  mood: string;
  confidence: number;
  tags: string[];
  createdAt: string;
}

interface InsightData {
  moodPerformance: { mood: string; avgPnL: number; count: number }[];
  confidenceCorrelation: { confidence: number; avgPnL: number; count: number }[];
  tagAnalysis: { tag: string; avgPnL: number; count: number }[];
  streakAnalysis: { type: string; count: number; avgMood: string }[];
  recommendations: string[];
}

interface JournalInsightsProps {
  trades: Trade[];
  entries: JournalEntry[];
}

export default function JournalInsights({ trades, entries }: JournalInsightsProps) {
  const [insights, setInsights] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateInsights();
  }, [trades, entries]);

  const generateInsights = () => {
    setLoading(true);
    
    // Analyze mood vs performance
    const moodPerformance = analyzeMoodPerformance();
    
    // Analyze confidence vs performance
    const confidenceCorrelation = analyzeConfidenceCorrelation();
    
    // Analyze tag performance
    const tagAnalysis = analyzeTagPerformance();
    
    // Analyze streaks
    const streakAnalysis = analyzeStreaks();
    
    // Generate recommendations
    const recommendations = generateRecommendations(moodPerformance, confidenceCorrelation, tagAnalysis);

    setInsights({
      moodPerformance,
      confidenceCorrelation,
      tagAnalysis,
      streakAnalysis,
      recommendations
    });
    
    setLoading(false);
  };

  const analyzeMoodPerformance = () => {
    const moodData: { [mood: string]: { pnl: number; count: number } } = {};
    
    entries.forEach(entry => {
      const entryDate = new Date(entry.createdAt).toDateString();
      const dayTrades = trades.filter(trade => 
        new Date(trade.createdAt).toDateString() === entryDate
      );
      
      const dayPnL = dayTrades.reduce((sum, trade) => 
        sum + (trade.profitDollars - trade.lossDollars), 0
      );
      
      if (!moodData[entry.mood]) {
        moodData[entry.mood] = { pnl: 0, count: 0 };
      }
      
      moodData[entry.mood].pnl += dayPnL;
      moodData[entry.mood].count += 1;
    });

    return Object.entries(moodData).map(([mood, data]) => ({
      mood,
      avgPnL: data.count > 0 ? data.pnl / data.count : 0,
      count: data.count
    })).sort((a, b) => b.avgPnL - a.avgPnL);
  };

  const analyzeConfidenceCorrelation = () => {
    const confidenceData: { [level: number]: { pnl: number; count: number } } = {};
    
    entries.forEach(entry => {
      const entryDate = new Date(entry.createdAt).toDateString();
      const dayTrades = trades.filter(trade => 
        new Date(trade.createdAt).toDateString() === entryDate
      );
      
      const dayPnL = dayTrades.reduce((sum, trade) => 
        sum + (trade.profitDollars - trade.lossDollars), 0
      );
      
      if (!confidenceData[entry.confidence]) {
        confidenceData[entry.confidence] = { pnl: 0, count: 0 };
      }
      
      confidenceData[entry.confidence].pnl += dayPnL;
      confidenceData[entry.confidence].count += 1;
    });

    return Object.entries(confidenceData).map(([confidence, data]) => ({
      confidence: parseInt(confidence),
      avgPnL: data.count > 0 ? data.pnl / data.count : 0,
      count: data.count
    })).sort((a, b) => a.confidence - b.confidence);
  };

  const analyzeTagPerformance = () => {
    const tagData: { [tag: string]: { pnl: number; count: number } } = {};
    
    entries.forEach(entry => {
      const entryDate = new Date(entry.createdAt).toDateString();
      const dayTrades = trades.filter(trade => 
        new Date(trade.createdAt).toDateString() === entryDate
      );
      
      const dayPnL = dayTrades.reduce((sum, trade) => 
        sum + (trade.profitDollars - trade.lossDollars), 0
      );
      
      entry.tags.forEach(tag => {
        if (!tagData[tag]) {
          tagData[tag] = { pnl: 0, count: 0 };
        }
        
        tagData[tag].pnl += dayPnL;
        tagData[tag].count += 1;
      });
    });

    return Object.entries(tagData).map(([tag, data]) => ({
      tag,
      avgPnL: data.count > 0 ? data.pnl / data.count : 0,
      count: data.count
    })).sort((a, b) => b.avgPnL - a.avgPnL);
  };

  const analyzeStreaks = () => {
    // Simplified streak analysis
    return [
      { type: 'Winning Streak', count: 3, avgMood: 'confident' },
      { type: 'Losing Streak', count: 2, avgMood: 'frustrated' }
    ];
  };

  const generateRecommendations = (moodPerf: any[], confidenceCorr: any[], tagAnalysis: any[]) => {
    const recommendations = [];

    // Mood-based recommendations
    const bestMood = moodPerf[0];
    if (bestMood && bestMood.avgPnL > 0) {
      recommendations.push(`Your best trading performance occurs when you're feeling ${bestMood.mood}. Try to identify what puts you in this mood state.`);
    }

    // Confidence-based recommendations
    const bestConfidence = confidenceCorr.reduce((best, current) => 
      current.avgPnL > best.avgPnL ? current : best, confidenceCorr[0]);
    
    if (bestConfidence) {
      recommendations.push(`Your optimal confidence level appears to be ${bestConfidence.confidence}/5. Monitor your confidence before trading.`);
    }

    // Tag-based recommendations
    const bestTag = tagAnalysis[0];
    if (bestTag && bestTag.avgPnL > 0) {
      recommendations.push(`The "${bestTag.tag}" strategy shows strong performance. Consider focusing more on this approach.`);
    }

    return recommendations;
  };

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'excited':
        return (
          <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'confident':
        return (
          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'calm':
        return (
          <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      case 'anxious':
        return (
          <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'frustrated':
        return (
          <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'disappointed':
        return (
          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Insights Available</h3>
        <p className="text-gray-600">Add more journal entries and trades to generate insights.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* AI Recommendations */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-6">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center mr-3">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900">AI-Powered Insights</h3>
        </div>
        <div className="space-y-3">
          {insights.recommendations.map((recommendation, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-xl border border-purple-100">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-700">{recommendation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Performance by Mood */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Performance by Mood</h3>
        <div className="space-y-4">
          {insights.moodPerformance.map((item, index) => (
            <div key={item.mood} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <span className="text-white">{getMoodIcon(item.mood)}</span>
                <div>
                  <p className="font-medium text-gray-900 capitalize">{item.mood}</p>
                  <p className="text-sm text-gray-600">{item.count} trading days</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold text-lg ${item.avgPnL >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  ${item.avgPnL.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">avg P&L</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confidence vs Performance */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Confidence vs Performance</h3>
        <div className="space-y-4">
          {insights.confidenceCorrelation.map((item) => (
            <div key={item.confidence} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`w-3 h-3 rounded-full ${
                        level <= item.confidence ? 'bg-emerald-500' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <div>
                  <p className="font-medium text-gray-900">Confidence Level {item.confidence}</p>
                  <p className="text-sm text-gray-600">{item.count} trading days</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold text-lg ${item.avgPnL >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  ${item.avgPnL.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">avg P&L</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Performing Tags */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Strategy Tag Performance</h3>
        <div className="space-y-3">
          {insights.tagAnalysis.slice(0, 5).map((item, index) => (
            <div key={item.tag} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  index === 0 ? 'bg-yellow-100' : index === 1 ? 'bg-gray-100' : 'bg-orange-100'
                }`}>
                  <span className="text-sm font-bold">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">#{item.tag}</p>
                  <p className="text-sm text-gray-600">{item.count} uses</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold text-lg ${item.avgPnL >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  ${item.avgPnL.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">avg P&L</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 