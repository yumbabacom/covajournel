'use client';

import React from 'react';
import { FlagIcon } from './FlagIcon';

interface HighImpactEvent {
  id: string;
  title: string;
  currency: string;
  time: string;
  impact: 'high' | 'medium' | 'low';
  status: 'upcoming' | 'live' | 'released';
}

interface CurrencyStrength {
  currency: string;
  strength: number; // -100 to 100
  change: number; // percentage change
}

export default function MarketImpactWidget() {
  // Mock high-impact events for today
  const highImpactEvents: HighImpactEvent[] = [
    {
      id: '1',
      title: 'Federal Reserve Interest Rate Decision',
      currency: 'USD',
      time: '14:00',
      impact: 'high',
      status: 'upcoming'
    },
    {
      id: '2',
      title: 'ECB Monetary Policy Statement',
      currency: 'EUR',
      time: '12:45',
      impact: 'high',
      status: 'live'
    },
    {
      id: '3',
      title: 'UK Employment Data',
      currency: 'GBP',
      time: '08:30',
      impact: 'high',
      status: 'released'
    }
  ];

  // Mock currency strength data
  const currencyStrengths: CurrencyStrength[] = [
    { currency: 'USD', strength: 75, change: 2.3 },
    { currency: 'EUR', strength: 45, change: -1.2 },
    { currency: 'GBP', strength: 60, change: 1.8 },
    { currency: 'JPY', strength: 30, change: -0.8 },
    { currency: 'CHF', strength: 55, change: 0.5 },
    { currency: 'CAD', strength: 40, change: -0.3 }
  ];

  const getCurrencyFlag = (currency: string) => {
    const currencyMap: { [key: string]: string } = {
      'USD': 'US', 'EUR': 'EU', 'GBP': 'GB', 'JPY': 'JP',
      'CHF': 'CH', 'CAD': 'CA', 'AUD': 'AU', 'NZD': 'NZ'
    };
    return currencyMap[currency] || 'US';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'released':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStrengthColor = (strength: number) => {
    if (strength >= 70) return 'bg-green-500';
    if (strength >= 50) return 'bg-yellow-500';
    if (strength >= 30) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const marketSentiment = 'Cautiously Optimistic'; // Mock sentiment
  const volatilityLevel = 'Medium'; // Mock volatility

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* High-Impact Events */}
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-pink-50">
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            High-Impact Events
          </h3>
          <p className="text-sm text-gray-600 mt-1">Today's market movers</p>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {highImpactEvents.map((event) => (
              <div key={event.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <FlagIcon
                  countryCode={getCurrencyFlag(event.currency)}
                  className="w-6 h-4 rounded shadow-sm flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{event.title}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs font-medium text-gray-600">{event.time}</span>
                    <span className={`px-2 py-1 rounded text-xs font-bold border ${getStatusColor(event.status)}`}>
                      {event.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                {event.status === 'live' && (
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse flex-shrink-0"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Currency Strength */}
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            Currency Strength
          </h3>
          <p className="text-sm text-gray-600 mt-1">Real-time strength meter</p>
        </div>
        
        <div className="p-6">
          <div className="space-y-3">
            {currencyStrengths.map((currency) => (
              <div key={currency.currency} className="flex items-center space-x-3">
                <FlagIcon
                  countryCode={getCurrencyFlag(currency.currency)}
                  className="w-5 h-4 rounded shadow-sm flex-shrink-0"
                />
                <span className="text-sm font-semibold text-gray-700 w-8">{currency.currency}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(currency.strength)}`}
                    style={{ width: `${Math.abs(currency.strength)}%` }}
                  ></div>
                </div>
                <span className={`text-xs font-bold w-12 text-right ${
                  currency.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {currency.change >= 0 ? '+' : ''}{currency.change}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Market Sentiment */}
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            Market Sentiment
          </h3>
          <p className="text-sm text-gray-600 mt-1">AI-powered analysis</p>
        </div>
        
        <div className="p-6">
          <div className="space-y-6">
            {/* Overall Sentiment */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <span className="text-2xl">😊</span>
              </div>
              <h4 className="text-lg font-bold text-gray-900">{marketSentiment}</h4>
              <p className="text-sm text-gray-600">Overall market mood</p>
            </div>

            {/* Volatility Level */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Volatility Level</span>
                <span className="text-sm font-bold text-orange-600">{volatilityLevel}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full w-1/2"></div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <p className="text-xs font-medium text-blue-600">Risk-On Assets</p>
                <p className="text-lg font-bold text-blue-800">+2.1%</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                <p className="text-xs font-medium text-red-600">Safe Havens</p>
                <p className="text-lg font-bold text-red-800">-0.8%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
