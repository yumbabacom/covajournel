'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/AuthProvider';

interface StrategyFormData {
  name: string;
  description: string;
  type: 'scalping' | 'swing' | 'position' | 'day' | 'algorithmic';
  symbols: string[];
  rules: string[];
  riskManagement: {
    maxRiskPerTrade: number;
    stopLoss: number;
    takeProfit: number;
    maxDrawdown: number;
    positionSizing: 'fixed' | 'percentage' | 'kelly' | 'optimal-f';
    riskRewardRatio: number;
  };
  entryConditions: string[];
  exitConditions: string[];
  timeframes: string[];
  indicators: string[];
  marketConditions: {
    trending: boolean;
    ranging: boolean;
    volatile: boolean;
    lowVolatility: boolean;
  };
  tradingHours: {
    start: string;
    end: string;
    timezone: string;
  };
  backtesting: {
    period: string;
    winRate: number;
    profitFactor: number;
    maxDrawdown: number;
  };
  isActive: boolean;
  isPublic: boolean;
  tags: string[];
}

export default function CreateStrategyPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState<StrategyFormData>({
    name: '',
    description: '',
    type: 'scalping',
    symbols: [],
    rules: [''],
    riskManagement: {
      maxRiskPerTrade: 2,
      stopLoss: 1,
      takeProfit: 2,
      maxDrawdown: 10,
      positionSizing: 'percentage',
      riskRewardRatio: 2,
    },
    entryConditions: [''],
    exitConditions: [''],
    timeframes: [],
    indicators: [],
    marketConditions: {
      trending: true,
      ranging: false,
      volatile: false,
      lowVolatility: false,
    },
    tradingHours: {
      start: '09:00',
      end: '17:00',
      timezone: 'UTC',
    },
    backtesting: {
      period: '1Y',
      winRate: 0,
      profitFactor: 0,
      maxDrawdown: 0,
    },
    isActive: true,
    isPublic: false,
    tags: [],
  });

  const [symbolInput, setSymbolInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'scalping':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'swing':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4" />
          </svg>
        );
      case 'position':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'day':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case 'algorithmic':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
        );
      default:
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'scalping': return 'from-red-500 to-orange-600';
      case 'swing': return 'from-blue-500 to-indigo-600';
      case 'position': return 'from-green-500 to-emerald-600';
      case 'day': return 'from-yellow-500 to-orange-600';
      case 'algorithmic': return 'from-purple-500 to-pink-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const addSymbol = () => {
    if (symbolInput.trim() && !formData.symbols.includes(symbolInput.trim())) {
      setFormData(prev => ({
        ...prev,
        symbols: [...prev.symbols, symbolInput.trim().toUpperCase()]
      }));
      setSymbolInput('');
    }
  };

  const removeSymbol = (symbol: string) => {
    setFormData(prev => ({
      ...prev,
      symbols: prev.symbols.filter(s => s !== symbol)
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const addPopularTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const addRule = () => {
    setFormData(prev => ({
      ...prev,
      rules: [...prev.rules, '']
    }));
  };

  const updateRule = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.map((rule, i) => i === index ? value : rule)
    }));
  };

  const removeRule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index)
    }));
  };

  // Entry Conditions helpers
  const addEntryCondition = () => {
    setFormData(prev => ({
      ...prev,
      entryConditions: [...prev.entryConditions, '']
    }));
  };

  const updateEntryCondition = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      entryConditions: prev.entryConditions.map((condition, i) => i === index ? value : condition)
    }));
  };

  const removeEntryCondition = (index: number) => {
    setFormData(prev => ({
      ...prev,
      entryConditions: prev.entryConditions.filter((_, i) => i !== index)
    }));
  };

  // Exit Conditions helpers
  const addExitCondition = () => {
    setFormData(prev => ({
      ...prev,
      exitConditions: [...prev.exitConditions, '']
    }));
  };

  const updateExitCondition = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      exitConditions: prev.exitConditions.map((condition, i) => i === index ? value : condition)
    }));
  };

  const removeExitCondition = (index: number) => {
    setFormData(prev => ({
      ...prev,
      exitConditions: prev.exitConditions.filter((_, i) => i !== index)
    }));
  };

  // Timeframes and Indicators
  const addTimeframe = (timeframe: string) => {
    if (!formData.timeframes.includes(timeframe)) {
      setFormData(prev => ({
        ...prev,
        timeframes: [...prev.timeframes, timeframe]
      }));
    }
  };

  const removeTimeframe = (timeframe: string) => {
    setFormData(prev => ({
      ...prev,
      timeframes: prev.timeframes.filter(tf => tf !== timeframe)
    }));
  };

  const addIndicator = (indicator: string) => {
    if (!formData.indicators.includes(indicator)) {
      setFormData(prev => ({
        ...prev,
        indicators: [...prev.indicators, indicator]
      }));
    }
  };

  const removeIndicator = (indicator: string) => {
    setFormData(prev => ({
      ...prev,
      indicators: prev.indicators.filter(ind => ind !== indicator)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to create strategies');
        return;
      }

      const apiData = {
        name: formData.name,
        description: formData.description,
        marketType: formData.type,
        tradingStyle: formData.type,
        setupConditions: formData.rules.join('; '),
        entryRules: formData.rules.slice(0, Math.ceil(formData.rules.length / 2)).join('; '),
        exitRules: formData.rules.slice(Math.ceil(formData.rules.length / 2)).join('; '),
        riskManagement: JSON.stringify(formData.riskManagement),
        tags: formData.tags,
        indicators: formData.indicators,
        symbols: formData.symbols,
        isActive: formData.isActive,
        isPublic: formData.isPublic,
      };

      const response = await fetch('/api/strategies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create strategy');
      }

      setSuccess('Strategy created successfully!');
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/strategies');
      }, 2000);
    } catch (error) {
      console.error('Error creating strategy:', error);
      setError(error instanceof Error ? error.message : 'Failed to create strategy');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-3 rounded-xl bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 hover:bg-white transition-all"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                  Create Strategy
                </h1>
                <p className="text-gray-600 mt-2">Define your trading strategy with detailed rules and risk management</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-3">
              <div className={`p-4 rounded-2xl bg-gradient-to-br ${getTypeColor(formData.type)} text-white shadow-lg`}>
                {getTypeIcon(formData.type)}
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-green-700 font-medium">{success}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700 font-medium">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Left Column - Basic Info */}
            <div className="xl:col-span-2 space-y-8">
              
              {/* Strategy Basics */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Strategy Basics</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Strategy Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter a unique strategy name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Strategy Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as StrategyFormData['type'] }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="scalping">Scalping - Quick profits from small price movements</option>
                      <option value="swing">Swing Trading - Medium-term position trading</option>
                      <option value="position">Position Trading - Long-term strategic positions</option>
                      <option value="day">Day Trading - Intraday market movements</option>
                      <option value="algorithmic">Algorithmic - Automated trading systems</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Strategy Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Describe your trading strategy, its methodology, and key principles..."
                    required
                  />
                </div>
              </div>

              {/* Trading Symbols */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Trading Instruments</h2>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={symbolInput}
                      onChange={(e) => setSymbolInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSymbol())}
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Add trading symbol (e.g., EURUSD, BTCUSD, AAPL)"
                    />
                    <button
                      type="button"
                      onClick={addSymbol}
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl hover:from-green-700 hover:to-emerald-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {formData.symbols.map((symbol) => (
                      <div key={symbol} className="relative group">
                        <span className="block px-4 py-3 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-xl text-sm font-medium border border-blue-200">
                          {symbol}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeSymbol(symbol)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Trading Rules */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Trading Rules</h2>
                </div>

                <div className="space-y-4">
                  {formData.rules.map((rule, index) => (
                    <div key={index} className="flex gap-3 items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-2">
                        {index + 1}
                      </div>
                      <input
                        type="text"
                        value={rule}
                        onChange={(e) => updateRule(index, e.target.value)}
                        className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder={`Trading rule ${index + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeRule(index)}
                        className="p-3 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={addRule}
                    className="w-full px-4 py-4 border-2 border-dashed border-purple-300 rounded-xl text-purple-600 hover:border-purple-500 hover:text-purple-700 hover:bg-purple-50 transition-all flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Add Trading Rule</span>
                  </button>
                </div>
              </div>

              {/* Entry & Exit Conditions */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-emerald-100 rounded-xl">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Entry & Exit Conditions</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Entry Conditions */}
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <h3 className="text-lg font-semibold text-gray-800">Entry Conditions</h3>
                    </div>
                    <div className="space-y-3">
                      {formData.entryConditions.map((condition, index) => (
                        <div key={index} className="flex gap-3 items-start">
                          <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-2">
                            E{index + 1}
                          </div>
                          <input
                            type="text"
                            value={condition}
                            onChange={(e) => updateEntryCondition(index, e.target.value)}
                            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                            placeholder={`Entry condition ${index + 1} (e.g., RSI > 70, Price above EMA20)`}
                          />
                          <button
                            type="button"
                            onClick={() => removeEntryCondition(index)}
                            className="p-3 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addEntryCondition}
                        className="w-full px-4 py-3 border-2 border-dashed border-green-300 rounded-xl text-green-600 hover:border-green-500 hover:text-green-700 hover:bg-green-50 transition-all flex items-center justify-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Add Entry Condition</span>
                      </button>
                    </div>
                  </div>

                  {/* Exit Conditions */}
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <h3 className="text-lg font-semibold text-gray-800">Exit Conditions</h3>
                    </div>
                    <div className="space-y-3">
                      {formData.exitConditions.map((condition, index) => (
                        <div key={index} className="flex gap-3 items-start">
                          <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-2">
                            X{index + 1}
                          </div>
                          <input
                            type="text"
                            value={condition}
                            onChange={(e) => updateExitCondition(index, e.target.value)}
                            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                            placeholder={`Exit condition ${index + 1} (e.g., Take profit at 2%, Stop loss at 1%)`}
                          />
                          <button
                            type="button"
                            onClick={() => removeExitCondition(index)}
                            className="p-3 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addExitCondition}
                        className="w-full px-4 py-3 border-2 border-dashed border-red-300 rounded-xl text-red-600 hover:border-red-500 hover:text-red-700 hover:bg-red-50 transition-all flex items-center justify-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Add Exit Condition</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Analysis */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-indigo-100 rounded-xl">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Technical Analysis</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Timeframes */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Timeframes</h3>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w', '1M'].map((tf) => (
                        <button
                          key={tf}
                          type="button"
                          onClick={() => formData.timeframes.includes(tf) ? removeTimeframe(tf) : addTimeframe(tf)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            formData.timeframes.includes(tf)
                              ? 'bg-indigo-600 text-white shadow-lg'
                              : 'bg-gray-100 text-gray-700 hover:bg-indigo-100 hover:text-indigo-700'
                          }`}
                        >
                          {tf}
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.timeframes.map((tf) => (
                        <span key={tf} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                          {tf}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Indicators */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Technical Indicators</h3>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {['RSI', 'MACD', 'EMA', 'SMA', 'Bollinger Bands', 'Stochastic', 'ADX', 'Fibonacci', 'Support/Resistance', 'Volume'].map((indicator) => (
                        <button
                          key={indicator}
                          type="button"
                          onClick={() => formData.indicators.includes(indicator) ? removeIndicator(indicator) : addIndicator(indicator)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            formData.indicators.includes(indicator)
                              ? 'bg-indigo-600 text-white shadow-lg'
                              : 'bg-gray-100 text-gray-700 hover:bg-indigo-100 hover:text-indigo-700'
                          }`}
                        >
                          {indicator}
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.indicators.map((indicator) => (
                        <span key={indicator} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                          {indicator}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Risk Management & Settings */}
            <div className="space-y-8">
              
              {/* Risk Management */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-red-100 rounded-xl">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Risk Management</h2>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Max Risk Per Trade (%)</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={formData.riskManagement.maxRiskPerTrade}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            riskManagement: {
                              ...prev.riskManagement,
                              maxRiskPerTrade: parseFloat(e.target.value)
                            }
                          }))}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <span className="text-gray-400 text-sm">%</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Stop Loss (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={formData.riskManagement.stopLoss}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          riskManagement: {
                            ...prev.riskManagement,
                            stopLoss: parseFloat(e.target.value)
                          }
                        }))}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Take Profit (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={formData.riskManagement.takeProfit}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          riskManagement: {
                            ...prev.riskManagement,
                            takeProfit: parseFloat(e.target.value)
                          }
                        }))}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Max Drawdown (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={formData.riskManagement.maxDrawdown}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          riskManagement: {
                            ...prev.riskManagement,
                            maxDrawdown: parseFloat(e.target.value)
                          }
                        }))}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Position Sizing Method</label>
                      <select
                        value={formData.riskManagement.positionSizing}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          riskManagement: {
                            ...prev.riskManagement,
                            positionSizing: e.target.value as 'fixed' | 'percentage' | 'kelly' | 'optimal-f'
                          }
                        }))}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      >
                        <option value="fixed">Fixed Amount</option>
                        <option value="percentage">Percentage of Capital</option>
                        <option value="kelly">Kelly Criterion</option>
                        <option value="optimal-f">Optimal F</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Risk-Reward Ratio</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={formData.riskManagement.riskRewardRatio}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          riskManagement: {
                            ...prev.riskManagement,
                            riskRewardRatio: parseFloat(e.target.value)
                          }
                        }))}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Risk Visualization */}
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 border border-red-100">
                    <div className="flex items-center space-x-2 mb-2">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h4 className="text-sm font-semibold text-red-800">Risk Assessment</h4>
                    </div>
                    <div className="text-xs text-red-700">
                      <p>Max Risk: {formData.riskManagement.maxRiskPerTrade}% per trade</p>
                      <p>Risk-Reward: 1:{formData.riskManagement.riskRewardRatio}</p>
                      <p>Position Sizing: {formData.riskManagement.positionSizing}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Market Conditions */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-teal-100 rounded-xl">
                    <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Market Conditions</h2>
                </div>

                <div className="space-y-4">
                  <p className="text-sm text-gray-600 mb-4">Select which market conditions this strategy works best in:</p>
                  
                  <div className="space-y-3">
                    <label className="flex items-center p-3 rounded-xl border border-gray-200 hover:bg-teal-50 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.marketConditions.trending}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          marketConditions: {
                            ...prev.marketConditions,
                            trending: e.target.checked
                          }
                        }))}
                        className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-700">Trending Markets</span>
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                        <div className="text-xs text-gray-500">Strong directional price movement</div>
                      </div>
                    </label>

                    <label className="flex items-center p-3 rounded-xl border border-gray-200 hover:bg-teal-50 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.marketConditions.ranging}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          marketConditions: {
                            ...prev.marketConditions,
                            ranging: e.target.checked
                          }
                        }))}
                        className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-700">Ranging Markets</span>
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                        <div className="text-xs text-gray-500">Sideways price action within boundaries</div>
                      </div>
                    </label>

                    <label className="flex items-center p-3 rounded-xl border border-gray-200 hover:bg-teal-50 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.marketConditions.volatile}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          marketConditions: {
                            ...prev.marketConditions,
                            volatile: e.target.checked
                          }
                        }))}
                        className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-700">High Volatility</span>
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        </div>
                        <div className="text-xs text-gray-500">Large price swings and uncertainty</div>
                      </div>
                    </label>

                    <label className="flex items-center p-3 rounded-xl border border-gray-200 hover:bg-teal-50 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.marketConditions.lowVolatility}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          marketConditions: {
                            ...prev.marketConditions,
                            lowVolatility: e.target.checked
                          }
                        }))}
                        className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-700">Low Volatility</span>
                          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                        </div>
                        <div className="text-xs text-gray-500">Stable, predictable price movements</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Trading Hours */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-orange-100 rounded-xl">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Trading Schedule</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Active Trading Hours</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Start Time</label>
                        <input
                          type="time"
                          value={formData.tradingHours.start}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            tradingHours: {
                              ...prev.tradingHours,
                              start: e.target.value
                            }
                          }))}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">End Time</label>
                        <input
                          type="time"
                          value={formData.tradingHours.end}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            tradingHours: {
                              ...prev.tradingHours,
                              end: e.target.value
                            }
                          }))}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                    <select
                      value={formData.tradingHours.timezone}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        tradingHours: {
                          ...prev.tradingHours,
                          timezone: e.target.value
                        }
                      }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    >
                      <option value="UTC">UTC (Coordinated Universal Time)</option>
                      <option value="EST">EST (Eastern Standard Time)</option>
                      <option value="PST">PST (Pacific Standard Time)</option>
                      <option value="GMT">GMT (Greenwich Mean Time)</option>
                      <option value="JST">JST (Japan Standard Time)</option>
                      <option value="CET">CET (Central European Time)</option>
                    </select>
                  </div>

                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100">
                    <div className="flex items-center space-x-2 mb-2">
                      <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h4 className="text-sm font-semibold text-orange-800">Schedule Info</h4>
                    </div>
                    <div className="text-xs text-orange-700">
                      <p>Active: {formData.tradingHours.start} - {formData.tradingHours.end} {formData.tradingHours.timezone}</p>
                      <p>Duration: {Math.abs(parseInt(formData.tradingHours.end.split(':')[0]) - parseInt(formData.tradingHours.start.split(':')[0]))} hours</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Backtesting Results */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-violet-100 rounded-xl">
                    <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Backtesting</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Backtest Period</label>
                    <select
                      value={formData.backtesting.period}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        backtesting: {
                          ...prev.backtesting,
                          period: e.target.value
                        }
                      }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                    >
                      <option value="1M">1 Month</option>
                      <option value="3M">3 Months</option>
                      <option value="6M">6 Months</option>
                      <option value="1Y">1 Year</option>
                      <option value="2Y">2 Years</option>
                      <option value="5Y">5 Years</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Expected Win Rate (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={formData.backtesting.winRate}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          backtesting: {
                            ...prev.backtesting,
                            winRate: parseFloat(e.target.value)
                          }
                        }))}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                        placeholder="e.g., 65.5"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Profit Factor</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={formData.backtesting.profitFactor}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          backtesting: {
                            ...prev.backtesting,
                            profitFactor: parseFloat(e.target.value)
                          }
                        }))}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                        placeholder="e.g., 1.75"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Drawdown (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={formData.backtesting.maxDrawdown}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          backtesting: {
                            ...prev.backtesting,
                            maxDrawdown: parseFloat(e.target.value)
                          }
                        }))}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                        placeholder="e.g., 12.5"
                      />
                    </div>
                  </div>

                  {/* Performance Summary */}
                  {(formData.backtesting.winRate > 0 || formData.backtesting.profitFactor > 0) && (
                    <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-4 border border-violet-100">
                      <h4 className="text-sm font-semibold text-violet-800 mb-2">Performance Summary</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs text-violet-700">
                        <div>Win Rate: {formData.backtesting.winRate}%</div>
                        <div>Profit Factor: {formData.backtesting.profitFactor}</div>
                        <div>Max DD: {formData.backtesting.maxDrawdown}%</div>
                        <div>Period: {formData.backtesting.period}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-yellow-100 rounded-xl">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Strategy Tags</h2>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                      placeholder="Add strategy tag (e.g., momentum, breakout, reversal)"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-700 text-white rounded-xl hover:from-yellow-700 hover:to-orange-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>

                  {/* Popular Tags */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Popular Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {['momentum', 'breakout', 'reversal', 'trend-following', 'mean-reversion', 'scalping', 'swing', 'news-based', 'technical', 'fundamental'].map((popularTag) => (
                        <button
                          key={popularTag}
                          type="button"
                          onClick={() => addPopularTag(popularTag)}
                          disabled={formData.tags.includes(popularTag)}
                          className={`px-3 py-1 rounded-full text-sm transition-all ${
                            formData.tags.includes(popularTag)
                              ? 'bg-yellow-200 text-yellow-800 cursor-not-allowed'
                              : 'bg-gray-100 text-gray-700 hover:bg-yellow-100 hover:text-yellow-700 cursor-pointer'
                          }`}
                        >
                          {popularTag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <div key={tag} className="relative group">
                        <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 rounded-full text-sm font-medium border border-yellow-200">
                          {tag}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-gray-100 rounded-xl">
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Strategy Settings</h2>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center p-4 rounded-xl border border-gray-200 hover:bg-green-50 transition-colors cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700">Active Strategy</span>
                        <div className={`w-2 h-2 rounded-full ${formData.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      </div>
                      <div className="text-xs text-gray-500">Enable this strategy for live trading and alerts</div>
                    </div>
                    <div className="text-right">
                      <svg className="w-5 h-5 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </label>

                  <label className="flex items-center p-4 rounded-xl border border-gray-200 hover:bg-blue-50 transition-colors cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.isPublic}
                      onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700">Public Strategy</span>
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <div className="text-xs text-gray-500">Share this strategy with the trading community</div>
                    </div>
                    <div className="text-right">
                      <svg className="w-5 h-5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h2V4a2 2 0 012-2h4a2 2 0 012 2v4z" />
                      </svg>
                    </div>
                  </label>

                  {/* Strategy Summary */}
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3">Strategy Summary</h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Type:</span>
                          <span className="font-medium capitalize">{formData.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Symbols:</span>
                          <span className="font-medium">{formData.symbols.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Rules:</span>
                          <span className="font-medium">{formData.rules.filter(r => r.trim()).length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tags:</span>
                          <span className="font-medium">{formData.tags.length}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Max Risk:</span>
                          <span className="font-medium">{formData.riskManagement.maxRiskPerTrade}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">R:R Ratio:</span>
                          <span className="font-medium">1:{formData.riskManagement.riskRewardRatio}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Timeframes:</span>
                          <span className="font-medium">{formData.timeframes.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Indicators:</span>
                          <span className="font-medium">{formData.indicators.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-8 py-4 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all font-medium"
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Cancel</span>
                </div>
              </button>
              
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-xl hover:from-blue-700 hover:to-purple-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-medium"
              >
                <div className="flex items-center space-x-2">
                  {isLoading ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Creating Strategy...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Create Strategy</span>
                    </>
                  )}
                </div>
              </button>
            </div>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
