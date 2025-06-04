'use client';

import { useState, useEffect } from 'react';

interface SmartRiskSuggestionsProps {
  symbol: string;
  entryPrice: string;
  onSuggestionApply: (suggestion: { exitPrice: string; stopLoss: string; riskReward: number }) => void;
}

interface RiskSuggestion {
  name: string;
  riskReward: number;
  description: string;
  color: string;
  icon: React.ReactNode;
}

const riskSuggestions: RiskSuggestion[] = [
  {
    name: 'Conservative',
    riskReward: 1.5,
    description: 'Lower risk, steady gains',
    color: 'from-blue-500 to-indigo-500',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )
  },
  {
    name: 'Balanced',
    riskReward: 2.0,
    description: 'Optimal risk-reward balance',
    color: 'from-green-500 to-emerald-500',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
  },
  {
    name: 'Aggressive',
    riskReward: 3.0,
    description: 'Higher risk, higher reward',
    color: 'from-orange-500 to-red-500',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
  }
];

export default function SmartRiskSuggestions({ symbol, entryPrice, onSuggestionApply }: SmartRiskSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (symbol && entryPrice && parseFloat(entryPrice) > 0) {
      generateSuggestions();
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [symbol, entryPrice]);

  const generateSuggestions = () => {
    const entry = parseFloat(entryPrice);
    if (entry <= 0) return;

    // Get typical pip values based on instrument type
    let pipValue = 0.0001; // Default for forex
    let riskDistance = entry * 0.01; // 1% default risk

    if (symbol.includes('/')) {
      // Forex pairs
      if (symbol.includes('JPY')) {
        pipValue = 0.01;
        riskDistance = entry * 0.005; // 0.5% for JPY pairs
      } else {
        pipValue = 0.0001;
        riskDistance = entry * 0.008; // 0.8% for major pairs
      }
    } else if (symbol.includes('XAU') || symbol.includes('XAG')) {
      // Commodities
      pipValue = 0.1;
      riskDistance = entry * 0.015; // 1.5% for gold/silver
    } else {
      // Stocks/Crypto
      riskDistance = entry * 0.02; // 2% for stocks
    }

    const newSuggestions = riskSuggestions.map(suggestion => {
      const stopLoss = entry - riskDistance;
      const profitDistance = riskDistance * suggestion.riskReward;
      const exitPrice = entry + profitDistance;

      return {
        ...suggestion,
        entryPrice: entry,
        exitPrice: exitPrice,
        stopLoss: stopLoss,
        profitPips: Math.abs(exitPrice - entry) / pipValue,
        lossPips: Math.abs(entry - stopLoss) / pipValue,
        profitDistance: profitDistance,
        lossDistance: riskDistance
      };
    });

    setSuggestions(newSuggestions);
  };

  const applySuggestion = (suggestion: any) => {
    onSuggestionApply({
      exitPrice: suggestion.exitPrice.toFixed(5),
      stopLoss: suggestion.stopLoss.toFixed(5),
      riskReward: suggestion.riskReward
    });
  };

  if (!isVisible || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200/50 dark:border-purple-700/30">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
            {riskSuggestions[0].icon}
          </div>
          <div>
            <h3 className="text-lg font-bold text-purple-900 dark:text-purple-100">Smart Risk Suggestions</h3>
            <p className="text-sm text-purple-700 dark:text-purple-300">AI-powered risk-reward recommendations for {symbol}</p>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-200 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 bg-gradient-to-r ${suggestion.color} rounded-lg flex items-center justify-center text-lg`}>
                  {suggestion.icon}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">{suggestion.name}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{suggestion.description}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Take Profit:</span>
                <span className="font-bold text-green-600 dark:text-green-400">
                  {suggestion.exitPrice.toFixed(5)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Stop Loss:</span>
                <span className="font-bold text-red-600 dark:text-red-400">
                  {suggestion.stopLoss.toFixed(5)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">R:R Ratio:</span>
                <span className="font-bold text-purple-600 dark:text-purple-400">
                  1:{suggestion.riskReward}
                </span>
              </div>
              {suggestion.profitPips && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Profit Pips:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {suggestion.profitPips.toFixed(1)}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => applySuggestion(suggestion)}
              className={`w-full py-3 px-4 bg-gradient-to-r ${suggestion.color} text-white rounded-xl font-bold transition-all duration-200 hover:shadow-lg hover:scale-105 group-hover:shadow-lg`}
            >
              Apply Suggestion
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700/30">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="font-bold text-blue-800 dark:text-blue-200 mb-1">Smart Analysis</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              These suggestions are based on typical volatility patterns for {symbol}. 
              Always consider market conditions, support/resistance levels, and your personal risk tolerance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
