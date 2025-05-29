'use client';

import { useState, useEffect } from 'react';

interface IntelligentDirectionSelectorProps {
  entryPrice: string;
  exitPrice: string;
  stopLoss: string;
  selectedDirection: 'LONG' | 'SHORT' | '';
  onDirectionChange: (direction: 'LONG' | 'SHORT') => void;
  onAutoDetect?: (detected: boolean) => void;
}

export default function IntelligentDirectionSelector({
  entryPrice,
  exitPrice,
  stopLoss,
  selectedDirection,
  onDirectionChange,
  onAutoDetect
}: IntelligentDirectionSelectorProps) {
  const [autoDetected, setAutoDetected] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [analysis, setAnalysis] = useState<string>('');

  useEffect(() => {
    if (entryPrice && exitPrice && stopLoss) {
      const entry = parseFloat(entryPrice);
      const exit = parseFloat(exitPrice);
      const stop = parseFloat(stopLoss);

      if (!isNaN(entry) && !isNaN(exit) && !isNaN(stop)) {
        analyzeDirection(entry, exit, stop);
      }
    }
  }, [entryPrice, exitPrice, stopLoss]);

  const analyzeDirection = (entry: number, exit: number, stop: number) => {
    let detectedDirection: 'LONG' | 'SHORT' | null = null;
    let confidenceLevel = 0;
    let analysisText = '';

    // Long trade analysis
    if (exit > entry && stop < entry) {
      detectedDirection = 'LONG';
      const profitDistance = exit - entry;
      const lossDistance = entry - stop;

      // Calculate confidence based on risk-reward ratio and price relationships
      const riskReward = profitDistance / lossDistance;
      confidenceLevel = Math.min(95, 60 + (riskReward * 10));

      analysisText = `Long position detected: Entry ${entry} → Target ${exit} (${((exit - entry) / entry * 100).toFixed(2)}% gain), Stop ${stop} (${((entry - stop) / entry * 100).toFixed(2)}% loss). R:R = 1:${riskReward.toFixed(2)}`;
    }
    // Short trade analysis
    else if (exit < entry && stop > entry) {
      detectedDirection = 'SHORT';
      const profitDistance = entry - exit;
      const lossDistance = stop - entry;

      // Calculate confidence based on risk-reward ratio and price relationships
      const riskReward = profitDistance / lossDistance;
      confidenceLevel = Math.min(95, 60 + (riskReward * 10));

      analysisText = `Short position detected: Entry ${entry} → Target ${exit} (${((entry - exit) / entry * 100).toFixed(2)}% gain), Stop ${stop} (${((stop - entry) / entry * 100).toFixed(2)}% loss). R:R = 1:${riskReward.toFixed(2)}`;
    }
    // Ambiguous or invalid setup
    else {
      analysisText = 'Unable to determine direction. Please check your price levels.';
      confidenceLevel = 0;
    }

    setConfidence(confidenceLevel);
    setAnalysis(analysisText);

    if (detectedDirection && confidenceLevel > 70) {
      setAutoDetected(true);
      onDirectionChange(detectedDirection);
      onAutoDetect?.(true);
    } else {
      setAutoDetected(false);
      onAutoDetect?.(false);
    }
  };

  const handleManualSelection = (direction: 'LONG' | 'SHORT') => {
    setAutoDetected(false);
    onDirectionChange(direction);
    onAutoDetect?.(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
          Trade Direction
        </label>
        {autoDetected && (
          <div className="flex items-center space-x-2 px-3 py-1 bg-emerald-100 rounded-full">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold text-emerald-700">Auto-Detected</span>
          </div>
        )}
      </div>

      {/* AI Analysis Panel */}
      {analysis && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <h3 className="text-lg font-bold text-blue-900">AI Trade Analysis</h3>
                {confidence > 0 && (
                  <div className="flex items-center space-x-2">
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-1000 ease-out ${
                          confidence >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                          confidence >= 60 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                          'bg-gradient-to-r from-red-500 to-rose-500'
                        }`}
                        style={{ width: `${confidence}%` }}
                      ></div>
                    </div>
                    <span className={`text-xs font-bold ${
                      confidence >= 80 ? 'text-green-600' :
                      confidence >= 60 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {confidence.toFixed(0)}%
                    </span>
                  </div>
                )}
              </div>
              <p className="text-sm text-blue-800 leading-relaxed">{analysis}</p>
            </div>
          </div>
        </div>
      )}

      {/* Direction Selection Buttons */}
      <div className="grid grid-cols-2 gap-4">
        {/* Long Button */}
        <button
          onClick={() => handleManualSelection('LONG')}
          className={`relative p-6 rounded-2xl border-2 transition-all duration-300 group overflow-hidden ${
            selectedDirection === 'LONG'
              ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg shadow-green-500/25'
              : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50'
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10 text-center">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              selectedDirection === 'LONG'
                ? 'bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg shadow-green-500/25'
                : 'bg-gradient-to-br from-gray-400 to-gray-500 group-hover:from-green-500 group-hover:to-emerald-500'
            }`}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            </div>
            <h3 className={`text-xl font-bold mb-2 ${
              selectedDirection === 'LONG'
                ? 'text-green-700'
                : 'text-gray-700 group-hover:text-green-600'
            }`}>
              LONG
            </h3>
            <p className={`text-sm ${
              selectedDirection === 'LONG'
                ? 'text-green-600'
                : 'text-gray-500 group-hover:text-green-500'
            }`}>
              Buy Low, Sell High
            </p>
            <div className="mt-3 flex items-center justify-center space-x-2 text-xs">
              <span className={selectedDirection === 'LONG' ? 'text-green-600' : 'text-gray-400'}>
                Entry → Target ↗
              </span>
            </div>
          </div>
          {selectedDirection === 'LONG' && (
            <div className="absolute top-2 right-2">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          )}
        </button>

        {/* Short Button */}
        <button
          onClick={() => handleManualSelection('SHORT')}
          className={`relative p-6 rounded-2xl border-2 transition-all duration-300 group overflow-hidden ${
            selectedDirection === 'SHORT'
              ? 'border-red-500 bg-gradient-to-br from-red-50 to-rose-50 shadow-lg shadow-red-500/25'
              : 'border-gray-200 bg-white hover:border-red-300 hover:bg-red-50'
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10 text-center">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              selectedDirection === 'SHORT'
                ? 'bg-gradient-to-br from-red-500 to-rose-500 shadow-lg shadow-red-500/25'
                : 'bg-gradient-to-br from-gray-400 to-gray-500 group-hover:from-red-500 group-hover:to-rose-500'
            }`}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
            </div>
            <h3 className={`text-xl font-bold mb-2 ${
              selectedDirection === 'SHORT'
                ? 'text-red-700'
                : 'text-gray-700 group-hover:text-red-600'
            }`}>
              SHORT
            </h3>
            <p className={`text-sm ${
              selectedDirection === 'SHORT'
                ? 'text-red-600'
                : 'text-gray-500 group-hover:text-red-500'
            }`}>
              Sell High, Buy Low
            </p>
            <div className="mt-3 flex items-center justify-center space-x-2 text-xs">
              <span className={selectedDirection === 'SHORT' ? 'text-red-600' : 'text-gray-400'}>
                Entry → Target ↘
              </span>
            </div>
          </div>
          {selectedDirection === 'SHORT' && (
            <div className="absolute top-2 right-2">
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          )}
        </button>
      </div>

      {/* Manual Override Notice */}
      {autoDetected && selectedDirection && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-sm text-yellow-800">
              Direction was auto-detected. Click a button above to manually override if needed.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
