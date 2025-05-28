'use client';

import { useState, useRef, useEffect } from 'react';

interface TradingPair {
  symbol: string;
  name: string;
  category: 'forex' | 'crypto' | 'stocks' | 'commodities' | 'indices';
  baseAsset: string;
  quoteAsset: string;
  popular?: boolean;
}

interface TradingPairSelectorProps {
  selectedPair: string;
  onPairSelect: (pair: string) => void;
}

const tradingPairs: TradingPair[] = [
  // Major Forex Pairs
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', category: 'forex', baseAsset: 'EUR', quoteAsset: 'USD', popular: true },
  { symbol: 'GBP/USD', name: 'British Pound / US Dollar', category: 'forex', baseAsset: 'GBP', quoteAsset: 'USD', popular: true },
  { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', category: 'forex', baseAsset: 'USD', quoteAsset: 'JPY', popular: true },
  { symbol: 'AUD/USD', name: 'Australian Dollar / US Dollar', category: 'forex', baseAsset: 'AUD', quoteAsset: 'USD', popular: true },
  { symbol: 'USD/CAD', name: 'US Dollar / Canadian Dollar', category: 'forex', baseAsset: 'USD', quoteAsset: 'CAD' },
  { symbol: 'USD/CHF', name: 'US Dollar / Swiss Franc', category: 'forex', baseAsset: 'USD', quoteAsset: 'CHF' },
  { symbol: 'NZD/USD', name: 'New Zealand Dollar / US Dollar', category: 'forex', baseAsset: 'NZD', quoteAsset: 'USD' },
  { symbol: 'EUR/GBP', name: 'Euro / British Pound', category: 'forex', baseAsset: 'EUR', quoteAsset: 'GBP' },
  { symbol: 'EUR/JPY', name: 'Euro / Japanese Yen', category: 'forex', baseAsset: 'EUR', quoteAsset: 'JPY' },
  { symbol: 'GBP/JPY', name: 'British Pound / Japanese Yen', category: 'forex', baseAsset: 'GBP', quoteAsset: 'JPY' },

  // Major Cryptocurrencies
  { symbol: 'BTC/USD', name: 'Bitcoin / US Dollar', category: 'crypto', baseAsset: 'BTC', quoteAsset: 'USD', popular: true },
  { symbol: 'ETH/USD', name: 'Ethereum / US Dollar', category: 'crypto', baseAsset: 'ETH', quoteAsset: 'USD', popular: true },
  { symbol: 'BNB/USD', name: 'Binance Coin / US Dollar', category: 'crypto', baseAsset: 'BNB', quoteAsset: 'USD' },
  { symbol: 'ADA/USD', name: 'Cardano / US Dollar', category: 'crypto', baseAsset: 'ADA', quoteAsset: 'USD' },
  { symbol: 'SOL/USD', name: 'Solana / US Dollar', category: 'crypto', baseAsset: 'SOL', quoteAsset: 'USD' },
  { symbol: 'DOT/USD', name: 'Polkadot / US Dollar', category: 'crypto', baseAsset: 'DOT', quoteAsset: 'USD' },

  // Popular US Stocks
  { symbol: 'AAPL', name: 'Apple Inc.', category: 'stocks', baseAsset: 'AAPL', quoteAsset: 'USD', popular: true },
  { symbol: 'TSLA', name: 'Tesla Inc.', category: 'stocks', baseAsset: 'TSLA', quoteAsset: 'USD', popular: true },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', category: 'stocks', baseAsset: 'GOOGL', quoteAsset: 'USD', popular: true },
  { symbol: 'MSFT', name: 'Microsoft Corporation', category: 'stocks', baseAsset: 'MSFT', quoteAsset: 'USD', popular: true },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', category: 'stocks', baseAsset: 'AMZN', quoteAsset: 'USD' },
  { symbol: 'META', name: 'Meta Platforms Inc.', category: 'stocks', baseAsset: 'META', quoteAsset: 'USD' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', category: 'stocks', baseAsset: 'NVDA', quoteAsset: 'USD' },
  { symbol: 'NFLX', name: 'Netflix Inc.', category: 'stocks', baseAsset: 'NFLX', quoteAsset: 'USD' },

  // Commodities
  { symbol: 'XAU/USD', name: 'Gold / US Dollar', category: 'commodities', baseAsset: 'XAU', quoteAsset: 'USD', popular: true },
  { symbol: 'XAG/USD', name: 'Silver / US Dollar', category: 'commodities', baseAsset: 'XAG', quoteAsset: 'USD' },
  { symbol: 'OIL/USD', name: 'Crude Oil / US Dollar', category: 'commodities', baseAsset: 'OIL', quoteAsset: 'USD' },
  { symbol: 'GAS/USD', name: 'Natural Gas / US Dollar', category: 'commodities', baseAsset: 'GAS', quoteAsset: 'USD' },

  // Major Indices
  { symbol: 'SPX500', name: 'S&P 500 Index', category: 'indices', baseAsset: 'SPX500', quoteAsset: 'USD', popular: true },
  { symbol: 'NAS100', name: 'NASDAQ 100 Index', category: 'indices', baseAsset: 'NAS100', quoteAsset: 'USD' },
  { symbol: 'US30', name: 'Dow Jones Industrial Average', category: 'indices', baseAsset: 'US30', quoteAsset: 'USD' },
  { symbol: 'UK100', name: 'FTSE 100 Index', category: 'indices', baseAsset: 'UK100', quoteAsset: 'GBP' },
  { symbol: 'GER40', name: 'DAX 40 Index', category: 'indices', baseAsset: 'GER40', quoteAsset: 'EUR' },
];

const categoryColors = {
  forex: 'from-blue-500 to-cyan-500',
  crypto: 'from-orange-500 to-amber-500',
  stocks: 'from-emerald-500 to-teal-500',
  commodities: 'from-yellow-500 to-orange-500',
  indices: 'from-purple-500 to-indigo-500',
};

const categoryBgColors = {
  forex: 'bg-blue-500/10 border-blue-500/20',
  crypto: 'bg-orange-500/10 border-orange-500/20',
  stocks: 'bg-emerald-500/10 border-emerald-500/20',
  commodities: 'bg-yellow-500/10 border-yellow-500/20',
  indices: 'bg-purple-500/10 border-purple-500/20',
};

const categoryIcons = {
  forex: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
    </svg>
  ),
  crypto: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  stocks: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  commodities: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  indices: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
};

export default function TradingPairSelector({ selectedPair, onPairSelect }: TradingPairSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredPairs = tradingPairs.filter(pair => {
    const matchesSearch = pair.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pair.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || pair.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const popularPairs = filteredPairs.filter(pair => pair.popular);
  const otherPairs = filteredPairs.filter(pair => !pair.popular);

  const handlePairSelect = (symbol: string) => {
    onPairSelect(symbol);
    setIsOpen(false);
    setSearchTerm('');
  };

  const selectedPairData = tradingPairs.find(pair => pair.symbol === selectedPair);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-bold text-white/70 mb-6 uppercase tracking-wider flex items-center">
        <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center mr-3">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        Trading Pair
      </label>

      {/* Beautiful Selected Pair Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300 shadow-2xl hover:shadow-emerald-500/10 hover:bg-white/15 group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-5">
            {selectedPairData ? (
              <>
                <div className={`w-14 h-14 bg-gradient-to-br ${categoryColors[selectedPairData.category]} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                  <div className="text-white">
                    {categoryIcons[selectedPairData.category]}
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-white group-hover:text-emerald-300 transition-colors duration-300">{selectedPairData.symbol}</p>
                  <p className="text-sm text-white/60 group-hover:text-white/80 transition-colors duration-300">{selectedPairData.name}</p>
                  <div className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium mt-1 ${categoryBgColors[selectedPairData.category]}`}>
                    <span className="capitalize">{selectedPairData.category}</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="w-14 h-14 bg-gradient-to-br from-gray-500/50 to-gray-600/50 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300 border border-white/20">
                  <svg className="w-7 h-7 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-white group-hover:text-emerald-300 transition-colors duration-300">Select Trading Pair</p>
                  <p className="text-sm text-white/60 group-hover:text-white/80 transition-colors duration-300">Choose from forex, crypto, stocks & more</p>
                  <div className="inline-flex items-center px-2 py-1 bg-white/10 border border-white/20 rounded-lg text-xs font-medium mt-1 text-white/60">
                    <span>Click to browse</span>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
              <svg className={`w-4 h-4 text-white/60 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </button>

      {/* Beautiful Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-4 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl z-50 max-h-[500px] overflow-hidden">
          {/* Enhanced Search and Category Filter */}
          <div className="p-6 border-b border-white/10">
            {/* Search Bar */}
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search trading pairs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 text-white placeholder-white/50 backdrop-blur-xl transition-all duration-300"
              />
            </div>

            {/* Beautiful Category Filters */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center space-x-2 ${
                  selectedCategory === 'all'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25'
                    : 'bg-white/10 border border-white/20 text-white/70 hover:bg-white/20 hover:text-white'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>All Markets</span>
              </button>
              {Object.entries(categoryIcons).map(([category, icon]) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center space-x-2 ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25'
                      : 'bg-white/10 border border-white/20 text-white/70 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  <div className="text-white">
                    {icon}
                  </div>
                  <span className="capitalize">{category}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Beautiful Pairs List */}
          <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            {popularPairs.length > 0 && (
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-6 h-6 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-white/80 uppercase tracking-wider">Popular Pairs</h3>
                </div>
                <div className="space-y-2">
                  {popularPairs.map((pair) => (
                    <button
                      key={pair.symbol}
                      onClick={() => handlePairSelect(pair.symbol)}
                      className="w-full p-4 flex items-center space-x-4 hover:bg-white/10 rounded-2xl transition-all duration-300 group border border-transparent hover:border-white/20"
                    >
                      <div className={`w-12 h-12 bg-gradient-to-br ${categoryColors[pair.category]} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                        <div className="text-white">
                          {categoryIcons[pair.category]}
                        </div>
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-bold text-white text-lg group-hover:text-emerald-300 transition-colors duration-300">{pair.symbol}</p>
                        <p className="text-sm text-white/60 group-hover:text-white/80 transition-colors duration-300">{pair.name}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full shadow-lg"></div>
                        <svg className="w-4 h-4 text-white/40 group-hover:text-white/60 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {otherPairs.length > 0 && (
              <div className="p-6">
                {popularPairs.length > 0 && (
                  <div className="flex items-center mb-4">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-bold text-white/80 uppercase tracking-wider">All Trading Pairs</h3>
                  </div>
                )}
                <div className="space-y-2">
                  {otherPairs.map((pair) => (
                    <button
                      key={pair.symbol}
                      onClick={() => handlePairSelect(pair.symbol)}
                      className="w-full p-4 flex items-center space-x-4 hover:bg-white/10 rounded-2xl transition-all duration-300 group border border-transparent hover:border-white/20"
                    >
                      <div className={`w-12 h-12 bg-gradient-to-br ${categoryColors[pair.category]} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                        <div className="text-white">
                          {categoryIcons[pair.category]}
                        </div>
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-bold text-white text-lg group-hover:text-emerald-300 transition-colors duration-300">{pair.symbol}</p>
                        <p className="text-sm text-white/60 group-hover:text-white/80 transition-colors duration-300">{pair.name}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-white/40 group-hover:text-white/60 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {filteredPairs.length === 0 && (
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-white/10 border border-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-white/60 text-lg font-medium mb-2">No pairs found</p>
                <p className="text-white/40 text-sm">Try adjusting your search or category filter</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
