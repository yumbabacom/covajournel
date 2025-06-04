'use client';

import React, { useState, useEffect } from 'react';
import { FlagIcon } from './FlagIcon';

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

interface AIAnalysis {
  summary: string;
  marketImpact: string;
  tradingSignal: 'BUY' | 'SELL' | 'NEUTRAL';
  confidence: number;
  reasoning: string[];
  targetPrice?: string;
  stopLoss?: string;
  timeframe: string;
  riskLevel: 'low' | 'medium' | 'high';
  affectedPairs: string[];
}

interface TradingSignal {
  signal: 'BUY' | 'SELL' | 'NEUTRAL';
  strength: number; // 1-10
  confidence: number; // 1-100%
  reasoning: string[];
  targetPrice?: string;
  stopLoss?: string;
  timeframe: string;
}

interface NewsDetailModalProps {
  event: EconomicEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function NewsDetailModal({ event, isOpen, onClose }: NewsDetailModalProps) {
  if (!isOpen || !event) return null;

  // Fallback trading signal generation (backup for AI)
  const generateTradingSignal = (event: EconomicEvent): TradingSignal => {
    let signal: 'BUY' | 'SELL' | 'NEUTRAL' = 'NEUTRAL';
    let strength = 5;
    let confidence = 50;
    const reasoning: string[] = [];

    // Analyze actual vs forecast
    if (event.actual && event.forecast) {
      const actual = parseFloat(event.actual.replace(/[^\d.-]/g, ''));
      const forecast = parseFloat(event.forecast.replace(/[^\d.-]/g, ''));

      if (!isNaN(actual) && !isNaN(forecast)) {
        const deviation = ((actual - forecast) / forecast) * 100;

        // Determine signal based on event type and deviation
        if (event.category === 'employment' || event.category === 'gdp') {
          if (deviation > 2) {
            signal = 'BUY';
            strength = Math.min(10, 6 + Math.floor(Math.abs(deviation) / 2));
            reasoning.push(`${event.title} beat forecast by ${deviation.toFixed(1)}% - Bullish for ${event.currency}`);
          } else if (deviation < -2) {
            signal = 'SELL';
            strength = Math.min(10, 6 + Math.floor(Math.abs(deviation) / 2));
            reasoning.push(`${event.title} missed forecast by ${Math.abs(deviation).toFixed(1)}% - Bearish for ${event.currency}`);
          }
        } else if (event.category === 'inflation') {
          if (deviation > 1) {
            signal = 'SELL';
            strength = Math.min(10, 6 + Math.floor(Math.abs(deviation) / 2));
            reasoning.push(`Higher than expected inflation - Potential rate hikes - Bearish for ${event.currency}`);
          } else if (deviation < -1) {
            signal = 'BUY';
            strength = Math.min(10, 6 + Math.floor(Math.abs(deviation) / 2));
            reasoning.push(`Lower than expected inflation - Dovish monetary policy - Bullish for ${event.currency}`);
          }
        }

        confidence = Math.min(95, 60 + Math.floor(Math.abs(deviation) * 5));
      }
    }

    // Adjust based on importance
    if (event.importance === 'high') {
      strength = Math.min(10, strength + 2);
      confidence = Math.min(95, confidence + 15);
      reasoning.push(`High impact event - Increased market volatility expected`);
    } else if (event.importance === 'low') {
      strength = Math.max(1, strength - 1);
      confidence = Math.max(20, confidence - 10);
    }

    // Adjust based on volatility
    if (event.volatility === 'high') {
      reasoning.push(`High volatility indicator - Consider risk management`);
    }

    // Add time-based reasoning
    if (event.isLive) {
      reasoning.push(`Live event - Immediate market impact expected`);
      confidence = Math.min(95, confidence + 10);
    }

    // Default reasoning if no specific signal
    if (reasoning.length === 0) {
      reasoning.push(`Insufficient data for strong directional bias`);
      reasoning.push(`Monitor for market reaction and follow-up data`);
    }

    return {
      signal,
      strength,
      confidence,
      reasoning,
      targetPrice: signal !== 'NEUTRAL' ? `${signal === 'BUY' ? '+' : '-'}0.5-1.0%` : undefined,
      stopLoss: signal !== 'NEUTRAL' ? `${signal === 'BUY' ? '-' : '+'}0.3%` : undefined,
      timeframe: event.frequency === 'daily' ? '1-4 hours' : '1-3 days'
    };
  };

  // Generate trading signal based on event data
  const tradingSignal = generateTradingSignal(event);

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'BUY': return 'from-green-500 to-emerald-600';
      case 'SELL': return 'from-red-500 to-red-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getStrengthBars = (strength: number) => {
    return Array.from({ length: 10 }, (_, i) => (
      <div
        key={i}
        className={`h-2 w-4 rounded-sm ${
          i < strength
            ? tradingSignal.signal === 'BUY'
              ? 'bg-green-500'
              : tradingSignal.signal === 'SELL'
                ? 'bg-red-500'
                : 'bg-gray-500'
            : 'bg-gray-200'
        }`}
      />
    ));
  };

  const getCurrencyFlag = (currency: string) => {
    const currencyToCountry: { [key: string]: string } = {
      'USD': 'us', 'EUR': 'eu', 'GBP': 'gb', 'JPY': 'jp',
      'CHF': 'ch', 'CAD': 'ca', 'AUD': 'au', 'NZD': 'nz'
    };
    return currencyToCountry[currency] || 'us';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 rounded-t-3xl p-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex items-start space-x-4">
            <FlagIcon countryCode={getCurrencyFlag(event.currency)} className="w-12 h-8 mt-2" />
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <span className={`px-4 py-2 rounded-full text-sm font-bold text-white bg-gradient-to-r ${
                  event.importance === 'high' ? 'from-red-500 to-red-600' :
                  event.importance === 'medium' ? 'from-yellow-500 to-yellow-600' : 'from-green-500 to-green-600'
                }`}>
                  {event.importance.toUpperCase()} IMPACT
                </span>
                <span className="text-blue-200 font-bold">{event.currency}</span>
                {event.isLive && (
                  <span className="flex items-center space-x-1 bg-red-500 px-3 py-1 rounded-full text-white text-sm font-bold">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span>LIVE</span>
                  </span>
                )}
              </div>
              <h2 className="text-3xl font-black text-white mb-2">{event.title}</h2>
              <p className="text-blue-200 text-lg">{event.description}</p>
              <div className="flex items-center space-x-4 mt-4 text-sm text-blue-200">
                <span>📅 {event.time.toLocaleDateString()}</span>
                <span>🕒 {event.time.toLocaleTimeString()}</span>
                <span>📊 {event.source}</span>
                <span>🔄 {event.frequency}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Economic Data */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">📊</span>
                  Economic Data
                </h3>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-black text-green-600">
                      {event.actual || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Actual</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-blue-600">
                      {event.forecast || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Forecast</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-gray-600">
                      {event.previous || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Previous</div>
                  </div>
                </div>

                {event.unit && (
                  <div className="mt-4 text-center text-sm text-gray-500">
                    Unit: {event.unit}
                  </div>
                )}
              </div>

              {/* Event Statistics */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">📈</span>
                  Event Statistics
                </h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Category:</span>
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-lg text-sm font-bold">
                      {event.category.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Volatility:</span>
                    <div className="flex items-center space-x-2">
                      {Array.from({ length: 3 }, (_, i) => (
                        <div
                          key={i}
                          className={`w-3 h-3 rounded-full ${
                            i < (event.volatility === 'high' ? 3 : event.volatility === 'medium' ? 2 : 1)
                              ? 'bg-red-500' : 'bg-gray-200'
                          }`}
                        />
                      ))}
                      <span className="text-sm font-bold text-gray-700 ml-2">
                        {event.volatility.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Frequency:</span>
                    <span className="text-gray-900 font-bold">{event.frequency}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Time Until:</span>
                    <span className="text-gray-900 font-bold">{event.timeUntil || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trading Signal Analysis */}
            <div className="space-y-6">

              <div className={`bg-gradient-to-br ${getSignalColor(tradingSignal.signal)} rounded-2xl p-6 text-white`}>
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <span className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-sm font-bold mr-3">🎯</span>
                  Trading Signal
                  <span className="ml-2 bg-white/20 px-2 py-1 rounded-lg text-xs font-bold">
                    FOREX FACTORY DATA
                  </span>
                </h3>

                <div className="text-center mb-6">
                  <div className="text-4xl font-black mb-2">{tradingSignal.signal}</div>
                  <div className="text-lg opacity-90">
                    Confidence: {tradingSignal.confidence}%
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium opacity-90">Signal Strength</span>
                      <span className="text-sm font-bold">{tradingSignal.strength}/10</span>
                    </div>
                    <div className="flex space-x-1">
                      {getStrengthBars(tradingSignal.strength)}
                    </div>
                  </div>

                  {tradingSignal.targetPrice && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium opacity-90">Target:</span>
                      <span className="font-bold">{tradingSignal.targetPrice}</span>
                    </div>
                  )}

                  {tradingSignal.stopLoss && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium opacity-90">Stop Loss:</span>
                      <span className="font-bold">{tradingSignal.stopLoss}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium opacity-90">Timeframe:</span>
                    <span className="font-bold">{tradingSignal.timeframe}</span>
                  </div>
                </div>
              </div>

              {/* Analysis Reasoning */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">🧠</span>
                  Analysis
                </h3>

                <div className="space-y-3">
                  {tradingSignal.reasoning.map((reason, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-gray-700 leading-relaxed">{reason}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-yellow-600">⚠️</span>
                    <span className="font-bold text-yellow-800">Risk Disclaimer</span>
                  </div>
                  <p className="text-yellow-700 text-sm">
                    This analysis is for educational purposes only. Always conduct your own research and consider your risk tolerance before making trading decisions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
