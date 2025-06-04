import React, { useState, useEffect } from 'react';
import { FlagIcon } from './FlagIcon';
import GeminiTradingSignalsAPI from '../services/geminiTradingSignals';

interface TradingSignal {
  signal: 'BUY' | 'SELL' | 'HOLD' | 'WATCH';
  strength: number;
  confidence: number;
  reasoning: string;
  targetPrice?: string;
  stopLoss?: string;
  timeframe: string;
  riskLevel: 'low' | 'medium' | 'high';
  affectedPairs: string[];
  marketImpact: string;
  tradingStrategy: string;
  entryPoints: string[];
  exitStrategy: string;
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

interface TradingSignalModalProps {
  event: EconomicEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TradingSignalModal({ event, isOpen, onClose }: TradingSignalModalProps) {
  const [tradingSignal, setTradingSignal] = useState<TradingSignal | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch AI trading signal when modal opens
  useEffect(() => {
    if (isOpen && event && !tradingSignal) {
      fetchTradingSignal();
    }
  }, [isOpen, event]);

  const fetchTradingSignal = async () => {
    if (!event) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const geminiAPI = new GeminiTradingSignalsAPI();
      const signal = await geminiAPI.generateTradingSignal(event);
      setTradingSignal(signal);
    } catch (error) {
      console.error('Error fetching trading signal:', error);
      setError('Failed to generate trading signal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setTradingSignal(null);
    setError(null);
    onClose();
  };

  if (!isOpen || !event) return null;

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'BUY': return 'from-green-500 to-emerald-600';
      case 'SELL': return 'from-red-500 to-rose-600';
      case 'HOLD': return 'from-blue-500 to-indigo-600';
      case 'WATCH': return 'from-yellow-500 to-orange-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <FlagIcon currency={event.currency} size="lg" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{event.title}</h2>
                <p className="text-indigo-100">{event.country} • {event.currency}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors duration-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Event Details */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Event Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-gray-600 font-medium">Time:</span>
                <p className="text-gray-900 font-bold">{event.time.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Importance:</span>
                <span className={`ml-2 px-3 py-1 rounded-lg text-sm font-bold ${
                  event.importance === 'high' ? 'bg-red-100 text-red-800' :
                  event.importance === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {event.importance.toUpperCase()}
                </span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Category:</span>
                <p className="text-gray-900 font-bold capitalize">{event.category}</p>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-gray-600 font-medium">Forecast:</span>
                <p className="text-gray-900 font-bold">{event.forecast || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Previous:</span>
                <p className="text-gray-900 font-bold">{event.previous || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Actual:</span>
                <p className="text-gray-900 font-bold">{event.actual || 'Pending'}</p>
              </div>
            </div>
            
            <div className="mt-4">
              <span className="text-gray-600 font-medium">Description:</span>
              <p className="text-gray-700 mt-1">{event.description}</p>
            </div>
          </div>

          {/* AI Trading Signal */}
          {isLoading && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
              <div className="flex items-center justify-center space-x-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <div className="text-center">
                  <p className="text-blue-700 font-bold text-lg">Generating AI Trading Signal...</p>
                  <p className="text-blue-600 text-sm">Analyzing market impact and generating recommendations</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-6 border border-red-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-red-600 text-2xl">⚠️</span>
                  <div>
                    <p className="text-red-700 font-bold">Error Generating Signal</p>
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                </div>
                <button
                  onClick={fetchTradingSignal}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors duration-300"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {tradingSignal && (
            <div className="space-y-6">
              {/* Main Signal */}
              <div className={`bg-gradient-to-br ${getSignalColor(tradingSignal.signal)} rounded-2xl p-6 text-white`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl font-bold">🤖</span>
                    <div>
                      <h3 className="text-2xl font-bold">AI Trading Signal</h3>
                      <p className="text-white/80">Powered by Google Gemini AI</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black">{tradingSignal.signal}</div>
                    <div className="text-white/80">Strength: {tradingSignal.strength}/10</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <span className="text-white/80">Confidence:</span>
                    <div className="text-xl font-bold">{tradingSignal.confidence}%</div>
                  </div>
                  <div>
                    <span className="text-white/80">Timeframe:</span>
                    <div className="text-xl font-bold">{tradingSignal.timeframe}</div>
                  </div>
                  <div>
                    <span className="text-white/80">Risk Level:</span>
                    <span className={`ml-2 px-3 py-1 rounded-lg text-sm font-bold ${getRiskColor(tradingSignal.riskLevel)}`}>
                      {tradingSignal.riskLevel.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="bg-white/10 rounded-xl p-4">
                  <h4 className="font-bold mb-2">AI Reasoning:</h4>
                  <p className="text-white/90">{tradingSignal.reasoning}</p>
                </div>
              </div>

              {/* Trading Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Trading Strategy</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-600 font-medium">Target Price:</span>
                      <p className="text-gray-900 font-bold">{tradingSignal.targetPrice}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Stop Loss:</span>
                      <p className="text-gray-900 font-bold">{tradingSignal.stopLoss}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Strategy:</span>
                      <p className="text-gray-700">{tradingSignal.tradingStrategy}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Market Impact</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-600 font-medium">Expected Impact:</span>
                      <p className="text-gray-700">{tradingSignal.marketImpact}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Exit Strategy:</span>
                      <p className="text-gray-700">{tradingSignal.exitStrategy}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Affected Pairs */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Affected Currency Pairs</h4>
                <div className="flex flex-wrap gap-2">
                  {tradingSignal.affectedPairs.map((pair, index) => (
                    <span key={index} className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-lg font-bold">
                      {pair}
                    </span>
                  ))}
                </div>
              </div>

              {/* Entry Points */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Entry Points</h4>
                <div className="space-y-2">
                  {tradingSignal.entryPoints.map((point, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <span className="text-gray-700">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
            <div className="flex items-start space-x-3">
              <span className="text-yellow-600 text-xl">⚠️</span>
              <div>
                <h4 className="text-yellow-800 font-bold">Risk Disclaimer</h4>
                <p className="text-yellow-700 text-sm">
                  This AI-generated trading signal is for educational purposes only. Trading involves significant risk of loss. 
                  Always conduct your own research and consider your risk tolerance before making trading decisions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
