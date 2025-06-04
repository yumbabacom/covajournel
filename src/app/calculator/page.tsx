'use client';

import { useState, useEffect } from 'react';
import SaveTradeModal from '../components/SaveTradeModal';
import { useAuth } from '../components/AuthProvider';
import Link from 'next/link';

// Trading Pair Interface
interface TradingPair {
  symbol: string;
  name: string;
  category: 'Forex' | 'Commodities' | 'Stocks' | 'Indices' | 'Crypto';
  pipValue: number;
  pipSize: number;
  contractSize: number;
}

// Expanded Trading Pairs Database
const tradingPairs: TradingPair[] = [
  // Major Forex Pairs
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', category: 'Forex', pipValue: 10, pipSize: 0.0001, contractSize: 100000 },
  { symbol: 'GBP/USD', name: 'British Pound / US Dollar', category: 'Forex', pipValue: 10, pipSize: 0.0001, contractSize: 100000 },
  { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', category: 'Forex', pipValue: 10, pipSize: 0.01, contractSize: 100000 },
  { symbol: 'USD/CHF', name: 'US Dollar / Swiss Franc', category: 'Forex', pipValue: 10, pipSize: 0.0001, contractSize: 100000 },
  { symbol: 'AUD/USD', name: 'Australian Dollar / US Dollar', category: 'Forex', pipValue: 10, pipSize: 0.0001, contractSize: 100000 },
  { symbol: 'USD/CAD', name: 'US Dollar / Canadian Dollar', category: 'Forex', pipValue: 10, pipSize: 0.0001, contractSize: 100000 },
  { symbol: 'NZD/USD', name: 'New Zealand Dollar / US Dollar', category: 'Forex', pipValue: 10, pipSize: 0.0001, contractSize: 100000 },

  // Minor Forex Pairs
  { symbol: 'EUR/GBP', name: 'Euro / British Pound', category: 'Forex', pipValue: 10, pipSize: 0.0001, contractSize: 100000 },
  { symbol: 'EUR/JPY', name: 'Euro / Japanese Yen', category: 'Forex', pipValue: 10, pipSize: 0.01, contractSize: 100000 },
  { symbol: 'EUR/CHF', name: 'Euro / Swiss Franc', category: 'Forex', pipValue: 10, pipSize: 0.0001, contractSize: 100000 },
  { symbol: 'EUR/AUD', name: 'Euro / Australian Dollar', category: 'Forex', pipValue: 10, pipSize: 0.0001, contractSize: 100000 },
  { symbol: 'EUR/CAD', name: 'Euro / Canadian Dollar', category: 'Forex', pipValue: 10, pipSize: 0.0001, contractSize: 100000 },
  { symbol: 'GBP/JPY', name: 'British Pound / Japanese Yen', category: 'Forex', pipValue: 10, pipSize: 0.01, contractSize: 100000 },
  { symbol: 'GBP/CHF', name: 'British Pound / Swiss Franc', category: 'Forex', pipValue: 10, pipSize: 0.0001, contractSize: 100000 },
  { symbol: 'GBP/AUD', name: 'British Pound / Australian Dollar', category: 'Forex', pipValue: 10, pipSize: 0.0001, contractSize: 100000 },
  { symbol: 'GBP/CAD', name: 'British Pound / Canadian Dollar', category: 'Forex', pipValue: 10, pipSize: 0.0001, contractSize: 100000 },
  { symbol: 'AUD/JPY', name: 'Australian Dollar / Japanese Yen', category: 'Forex', pipValue: 10, pipSize: 0.01, contractSize: 100000 },
  { symbol: 'AUD/CHF', name: 'Australian Dollar / Swiss Franc', category: 'Forex', pipValue: 10, pipSize: 0.0001, contractSize: 100000 },
  { symbol: 'AUD/CAD', name: 'Australian Dollar / Canadian Dollar', category: 'Forex', pipValue: 10, pipSize: 0.0001, contractSize: 100000 },
  { symbol: 'CAD/JPY', name: 'Canadian Dollar / Japanese Yen', category: 'Forex', pipValue: 10, pipSize: 0.01, contractSize: 100000 },
  { symbol: 'CHF/JPY', name: 'Swiss Franc / Japanese Yen', category: 'Forex', pipValue: 10, pipSize: 0.01, contractSize: 100000 },
  { symbol: 'NZD/JPY', name: 'New Zealand Dollar / Japanese Yen', category: 'Forex', pipValue: 10, pipSize: 0.01, contractSize: 100000 },

  // Exotic Forex Pairs
  { symbol: 'USD/SGD', name: 'US Dollar / Singapore Dollar', category: 'Forex', pipValue: 10, pipSize: 0.0001, contractSize: 100000 },
  { symbol: 'USD/HKD', name: 'US Dollar / Hong Kong Dollar', category: 'Forex', pipValue: 10, pipSize: 0.0001, contractSize: 100000 },
  { symbol: 'USD/SEK', name: 'US Dollar / Swedish Krona', category: 'Forex', pipValue: 10, pipSize: 0.0001, contractSize: 100000 },
  { symbol: 'USD/NOK', name: 'US Dollar / Norwegian Krone', category: 'Forex', pipValue: 10, pipSize: 0.0001, contractSize: 100000 },
  { symbol: 'USD/DKK', name: 'US Dollar / Danish Krone', category: 'Forex', pipValue: 10, pipSize: 0.0001, contractSize: 100000 },
  { symbol: 'USD/PLN', name: 'US Dollar / Polish Zloty', category: 'Forex', pipValue: 10, pipSize: 0.0001, contractSize: 100000 },
  { symbol: 'USD/CZK', name: 'US Dollar / Czech Koruna', category: 'Forex', pipValue: 10, pipSize: 0.0001, contractSize: 100000 },
  { symbol: 'USD/HUF', name: 'US Dollar / Hungarian Forint', category: 'Forex', pipValue: 10, pipSize: 0.01, contractSize: 100000 },

  // FAANG Stocks
  { symbol: 'AAPL', name: 'Apple Inc.', category: 'Stocks', pipValue: 1, pipSize: 0.01, contractSize: 100 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', category: 'Stocks', pipValue: 1, pipSize: 0.01, contractSize: 100 },
  { symbol: 'GOOGL', name: 'Alphabet Inc. Class A', category: 'Stocks', pipValue: 1, pipSize: 0.01, contractSize: 100 },
  { symbol: 'META', name: 'Meta Platforms Inc.', category: 'Stocks', pipValue: 1, pipSize: 0.01, contractSize: 100 },
  { symbol: 'NFLX', name: 'Netflix Inc.', category: 'Stocks', pipValue: 1, pipSize: 0.01, contractSize: 100 },

  // Major Tech Stocks
  { symbol: 'MSFT', name: 'Microsoft Corporation', category: 'Stocks', pipValue: 1, pipSize: 0.01, contractSize: 100 },
  { symbol: 'TSLA', name: 'Tesla Inc.', category: 'Stocks', pipValue: 1, pipSize: 0.01, contractSize: 100 },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', category: 'Stocks', pipValue: 1, pipSize: 0.01, contractSize: 100 },
  { symbol: 'AMD', name: 'Advanced Micro Devices', category: 'Stocks', pipValue: 1, pipSize: 0.01, contractSize: 100 },
  { symbol: 'INTC', name: 'Intel Corporation', category: 'Stocks', pipValue: 1, pipSize: 0.01, contractSize: 100 },
  { symbol: 'CRM', name: 'Salesforce Inc.', category: 'Stocks', pipValue: 1, pipSize: 0.01, contractSize: 100 },
  { symbol: 'ORCL', name: 'Oracle Corporation', category: 'Stocks', pipValue: 1, pipSize: 0.01, contractSize: 100 },
  { symbol: 'ADBE', name: 'Adobe Inc.', category: 'Stocks', pipValue: 1, pipSize: 0.01, contractSize: 100 },

  // Financial Stocks
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', category: 'Stocks', pipValue: 1, pipSize: 0.01, contractSize: 100 },
  { symbol: 'BAC', name: 'Bank of America Corp.', category: 'Stocks', pipValue: 1, pipSize: 0.01, contractSize: 100 },
  { symbol: 'WFC', name: 'Wells Fargo & Company', category: 'Stocks', pipValue: 1, pipSize: 0.01, contractSize: 100 },
  { symbol: 'GS', name: 'Goldman Sachs Group Inc.', category: 'Stocks', pipValue: 1, pipSize: 0.01, contractSize: 100 },
  { symbol: 'MS', name: 'Morgan Stanley', category: 'Stocks', pipValue: 1, pipSize: 0.01, contractSize: 100 },

  // Major Indices
  { symbol: 'SPX500', name: 'S&P 500 Index', category: 'Indices', pipValue: 25, pipSize: 0.25, contractSize: 50 },
  { symbol: 'NAS100', name: 'NASDAQ 100 Index', category: 'Indices', pipValue: 20, pipSize: 0.25, contractSize: 20 },
  { symbol: 'DOW30', name: 'Dow Jones Industrial Average', category: 'Indices', pipValue: 25, pipSize: 1, contractSize: 25 },
  { symbol: 'DAX40', name: 'DAX 40 Index', category: 'Indices', pipValue: 25, pipSize: 0.5, contractSize: 25 },
  { symbol: 'FTSE100', name: 'FTSE 100 Index', category: 'Indices', pipValue: 10, pipSize: 0.5, contractSize: 10 },
  { symbol: 'NIKKEI225', name: 'Nikkei 225 Index', category: 'Indices', pipValue: 5, pipSize: 5, contractSize: 5 },
  { symbol: 'ASX200', name: 'ASX 200 Index', category: 'Indices', pipValue: 25, pipSize: 1, contractSize: 25 },

  // Commodities
  { symbol: 'GOLD', name: 'Gold Spot', category: 'Commodities', pipValue: 10, pipSize: 0.01, contractSize: 100 },
  { symbol: 'SILVER', name: 'Silver Spot', category: 'Commodities', pipValue: 50, pipSize: 0.001, contractSize: 5000 },
  { symbol: 'WTI', name: 'West Texas Intermediate Oil', category: 'Commodities', pipValue: 10, pipSize: 0.01, contractSize: 1000 },
  { symbol: 'BRENT', name: 'Brent Crude Oil', category: 'Commodities', pipValue: 10, pipSize: 0.01, contractSize: 1000 },
  { symbol: 'NATGAS', name: 'Natural Gas', category: 'Commodities', pipValue: 10, pipSize: 0.001, contractSize: 10000 },
  { symbol: 'COPPER', name: 'Copper', category: 'Commodities', pipValue: 25, pipSize: 0.00005, contractSize: 25000 },
  { symbol: 'PLATINUM', name: 'Platinum', category: 'Commodities', pipValue: 5, pipSize: 0.1, contractSize: 50 },
  { symbol: 'PALLADIUM', name: 'Palladium', category: 'Commodities', pipValue: 10, pipSize: 0.05, contractSize: 100 },

  // Major Cryptocurrencies
  { symbol: 'BTC/USD', name: 'Bitcoin / US Dollar', category: 'Crypto', pipValue: 1, pipSize: 1, contractSize: 1 },
  { symbol: 'ETH/USD', name: 'Ethereum / US Dollar', category: 'Crypto', pipValue: 1, pipSize: 0.01, contractSize: 1 },
  { symbol: 'BNB/USD', name: 'Binance Coin / US Dollar', category: 'Crypto', pipValue: 1, pipSize: 0.01, contractSize: 1 },
  { symbol: 'ADA/USD', name: 'Cardano / US Dollar', category: 'Crypto', pipValue: 1, pipSize: 0.0001, contractSize: 1 },
  { symbol: 'SOL/USD', name: 'Solana / US Dollar', category: 'Crypto', pipValue: 1, pipSize: 0.01, contractSize: 1 },
  { symbol: 'XRP/USD', name: 'Ripple / US Dollar', category: 'Crypto', pipValue: 1, pipSize: 0.0001, contractSize: 1 },
  { symbol: 'DOT/USD', name: 'Polkadot / US Dollar', category: 'Crypto', pipValue: 1, pipSize: 0.001, contractSize: 1 },
  { symbol: 'AVAX/USD', name: 'Avalanche / US Dollar', category: 'Crypto', pipValue: 1, pipSize: 0.01, contractSize: 1 },
  { symbol: 'MATIC/USD', name: 'Polygon / US Dollar', category: 'Crypto', pipValue: 1, pipSize: 0.0001, contractSize: 1 },
  { symbol: 'LTC/USD', name: 'Litecoin / US Dollar', category: 'Crypto', pipValue: 1, pipSize: 0.01, contractSize: 1 },
  { symbol: 'LINK/USD', name: 'Chainlink / US Dollar', category: 'Crypto', pipValue: 1, pipSize: 0.001, contractSize: 1 },
  { symbol: 'UNI/USD', name: 'Uniswap / US Dollar', category: 'Crypto', pipValue: 1, pipSize: 0.001, contractSize: 1 },
];

export default function CalculatorPage() {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSaveTradeModalOpen, setIsSaveTradeModalOpen] = useState(false);
  const [currentTradeData, setCurrentTradeData] = useState<any>(null);
  const [isPairModalOpen, setIsPairModalOpen] = useState(false);

  // Enhanced Modal State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [filteredPairs, setFilteredPairs] = useState(tradingPairs);

  // Calculator State
  const [accountSize, setAccountSize] = useState('10000');
  const [riskPercentage, setRiskPercentage] = useState('2');
  const [selectedPair, setSelectedPair] = useState('EUR/USD');
  const [entryPrice, setEntryPrice] = useState('1.1000');
  const [exitPrice, setExitPrice] = useState('1.1100');
  const [stopLoss, setStopLoss] = useState('1.0950');

  // Calculated Values
  const [lotSize, setLotSize] = useState(0);
  const [riskDollars, setRiskDollars] = useState(0);
  const [profitDollars, setProfitDollars] = useState(0);
  const [lossDollars, setLossDollars] = useState(0);
  const [riskRewardRatio, setRiskRewardRatio] = useState(0);
  const [stopLossPips, setStopLossPips] = useState(0);
  const [profitPips, setProfitPips] = useState(0);

  const handleSaveTrade = (tradeData: any) => {
    setCurrentTradeData(tradeData);
    setIsSaveTradeModalOpen(true);
  };

  const handleSaveSuccess = () => {
    console.log('Trade saved successfully!');
  };

  // Helper Functions
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Stocks':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case 'Indices':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        );
    }
  };

  // Get country flag for currency codes
  const getCurrencyFlag = (currency: string) => {
    const flagMap: { [key: string]: string } = {
      // Major Currencies - Using text representations for better compatibility
      'USD': 'US', // United States
      'EUR': 'EU', // European Union
      'GBP': 'GB', // United Kingdom
      'JPY': 'JP', // Japan
      'CHF': 'CH', // Switzerland
      'AUD': 'AU', // Australia
      'CAD': 'CA', // Canada
      'NZD': 'NZ', // New Zealand
      'SGD': 'SG', // Singapore
      'HKD': 'HK', // Hong Kong
      'SEK': 'SE', // Sweden
      'NOK': 'NO', // Norway
      'DKK': 'DK', // Denmark
      'PLN': 'PL', // Poland
      'CZK': 'CZ', // Czech Republic
      'HUF': 'HU', // Hungary
    };
    return flagMap[currency] || currency;
  };

  // Get company/asset country flag
  const getAssetFlag = (symbol: string) => {
    const assetFlagMap: { [key: string]: string } = {
      // US Stocks - Using text representations
      'AAPL': 'US', 'AMZN': 'US', 'GOOGL': 'US', 'META': 'US', 'NFLX': 'US',
      'MSFT': 'US', 'TSLA': 'US', 'NVDA': 'US', 'AMD': 'US', 'INTC': 'US',
      'CRM': 'US', 'ORCL': 'US', 'ADBE': 'US', 'JPM': 'US', 'BAC': 'US',
      'WFC': 'US', 'GS': 'US', 'MS': 'US',

      // US Indices
      'SPX500': 'US', 'NAS100': 'US', 'DOW30': 'US',

      // International Indices
      'DAX40': 'DE', 'FTSE100': 'GB', 'NIKKEI225': 'JP', 'ASX200': 'AU',

      // Commodities (use symbols)
      'GOLD': '🥇', 'SILVER': '🥈', 'WTI': 'US', 'BRENT': 'GB',
      'NATGAS': '⛽', 'COPPER': '🔶', 'PLATINUM': '⚪', 'PALLADIUM': '⚫',

      // Crypto (use crypto symbol)
      'BTC': '₿', 'ETH': 'Ξ', 'BNB': '🔶', 'ADA': '🔷', 'SOL': '◎',
      'XRP': '◊', 'DOT': '●', 'AVAX': '🔺', 'MATIC': '🔷', 'LTC': 'Ł',
      'LINK': '🔗', 'UNI': '🦄'
    };
    return assetFlagMap[symbol] || symbol;
  };

  // Get trading pair flags
  const getTradingPairFlags = (symbol: string, category: string) => {
    if (category === 'Forex') {
      // For forex pairs like EUR/USD, GBP/JPY
      const currencies = symbol.split('/');
      if (currencies.length === 2) {
        return {
          primary: getCurrencyFlag(currencies[0]),
          secondary: getCurrencyFlag(currencies[1]),
          display: 'dual' as const
        };
      }
    } else if (category === 'Crypto') {
      // For crypto pairs like BTC/USD, ETH/USD
      const parts = symbol.split('/');
      if (parts.length === 2) {
        return {
          primary: getAssetFlag(parts[0]),
          secondary: getCurrencyFlag(parts[1]),
          display: 'dual' as const
        };
      }
    } else {
      // For stocks, indices, commodities
      const baseSymbol = symbol.replace(/\/.*/, ''); // Remove any suffix
      return {
        primary: getAssetFlag(baseSymbol),
        secondary: '',
        display: 'single' as const
      };
    }

    // Fallback
    return {
      primary: getCategoryIcon(category),
      secondary: '',
      display: 'single' as const
    };
  };

  // Calculate trading values
  useEffect(() => {
    const account = parseFloat(accountSize) || 0;
    const risk = parseFloat(riskPercentage) || 0;
    const entry = parseFloat(entryPrice) || 0;
    const exit = parseFloat(exitPrice) || 0;
    const stop = parseFloat(stopLoss) || 0;

    if (account > 0 && risk > 0 && entry > 0 && stop > 0) {
      const pair = tradingPairs.find(p => p.symbol === selectedPair);
      if (pair) {
        // Calculate risk in dollars
        const riskAmount = (account * risk) / 100;
        setRiskDollars(riskAmount);

        // Calculate pip difference for stop loss
        const calculatedStopLossPips = Math.abs(entry - stop) / pair.pipSize;
        setStopLossPips(calculatedStopLossPips);

        // Calculate lot size based on risk
        const calculatedLotSize = riskAmount / (calculatedStopLossPips * pair.pipValue);
        setLotSize(calculatedLotSize);

        // Calculate loss dollars (should equal risk amount)
        const lossAmount = calculatedStopLossPips * pair.pipValue * calculatedLotSize;
        setLossDollars(lossAmount);

        // Calculate profit if exit price is provided
        if (exit > 0) {
          const calculatedProfitPips = Math.abs(exit - entry) / pair.pipSize;
          setProfitPips(calculatedProfitPips);

          const profitAmount = calculatedProfitPips * pair.pipValue * calculatedLotSize;
          setProfitDollars(profitAmount);

          // Calculate risk/reward ratio
          const rrRatio = profitAmount / lossAmount;
          setRiskRewardRatio(rrRatio);
        } else {
          setProfitPips(0);
          setProfitDollars(0);
          setRiskRewardRatio(0);
        }
      }
    } else {
      setLotSize(0);
      setRiskDollars(0);
      setProfitDollars(0);
      setLossDollars(0);
      setRiskRewardRatio(0);
      setStopLossPips(0);
      setProfitPips(0);
    }
  }, [accountSize, riskPercentage, selectedPair, entryPrice, exitPrice, stopLoss]);

  // Filter pairs based on search and category
  useEffect(() => {
    let filtered = tradingPairs;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(pair => pair.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(pair =>
        pair.symbol.toLowerCase().includes(query) ||
        pair.name.toLowerCase().includes(query) ||
        pair.category.toLowerCase().includes(query)
      );
    }

    setFilteredPairs(filtered);
  }, [searchQuery, selectedCategory]);

  // Get unique categories for filter tabs
  const categories = ['All', ...Array.from(new Set(tradingPairs.map(pair => pair.category)))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-400/30 to-pink-600/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-blue-400/30 to-indigo-600/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-gradient-to-r from-cyan-400/20 to-purple-600/20 rounded-full blur-2xl animate-pulse delay-500"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-l from-pink-400/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse delay-700"></div>

        {/* Floating Calculator Elements */}
        <div className="absolute top-20 left-10 w-4 h-4 bg-purple-400/40 rounded-full animate-bounce"></div>
        <div className="absolute top-40 right-20 w-6 h-6 bg-blue-400/40 rounded-full animate-bounce delay-300"></div>
        <div className="absolute bottom-40 left-20 w-5 h-5 bg-pink-400/40 rounded-full animate-bounce delay-700"></div>
        <div className="absolute bottom-20 right-10 w-3 h-3 bg-indigo-400/40 rounded-full animate-bounce delay-1000"></div>
      </div>



      {/* Enhanced Navigation Header */}
      <nav className="relative z-20 bg-white/90 backdrop-blur-2xl border-b border-gray-200/50 shadow-xl">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            {/* Enhanced Logo */}
            <Link href="/" className="flex items-center space-x-4 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-all duration-500"></div>
                <div className="relative w-14 h-14 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="group-hover:translate-x-1 transition-transform duration-300">
                <h1 className="text-2xl font-black bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent tracking-tight">
                  CovaJournal
                </h1>
                <p className="text-sm text-blue-600 font-semibold tracking-wide">Trading Calculator</p>
              </div>
            </Link>

            {/* Enhanced Navigation Menu */}
            <div className="hidden md:flex items-center space-x-2">
              <Link href="/" className="group relative px-6 py-3 text-gray-700 hover:text-blue-600 font-semibold transition-all duration-300 flex items-center space-x-3">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100"></div>
                <div className="relative flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <span>Home</span>
                </div>
              </Link>
              <Link href="/calculator" className="group relative px-6 py-3 text-purple-600 font-semibold transition-all duration-300 flex items-center space-x-3">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl opacity-100 transition-all duration-300"></div>
                <div className="relative flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center scale-110 transition-transform duration-300">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span>Calculator</span>
                </div>
              </Link>
              <Link href="/market-hours" className="group relative px-6 py-3 text-gray-700 hover:text-green-600 font-semibold transition-all duration-300 flex items-center space-x-3">
                <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100"></div>
                <div className="relative flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span>Market Hours</span>
                </div>
              </Link>
              <Link href="/login" className="group relative px-6 py-3 text-gray-700 hover:text-emerald-600 font-semibold transition-all duration-300 flex items-center space-x-3">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100"></div>
                <div className="relative flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                  </div>
                  <span>Login</span>
                </div>
              </Link>
              {user ? (
                <Link href="/dashboard" className="group relative px-8 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white rounded-2xl transition-all duration-300 font-semibold shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 flex items-center space-x-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <span>Dashboard</span>
                  </div>
                </Link>
              ) : (
                <Link href="/login" className="group relative px-8 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white rounded-2xl transition-all duration-300 font-semibold shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 flex items-center space-x-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                    </div>
                    <span>Get Started</span>
                  </div>
                </Link>
              )}
            </div>

            {/* Enhanced Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-12 h-12 bg-white/80 hover:bg-white rounded-2xl flex items-center justify-center transition-all duration-300 border border-gray-200/50 shadow-lg hover:shadow-xl"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Enhanced Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-6 py-6 border-t border-gray-200/50 bg-white/50 backdrop-blur-xl rounded-2xl">
              <nav className="flex flex-col space-y-4">
                <Link href="/" className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all duration-300 font-semibold">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <span>Home</span>
                </Link>
                <Link href="/calculator" className="flex items-center space-x-3 px-4 py-3 text-purple-600 bg-purple-50 rounded-2xl transition-all duration-300 font-semibold">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span>Calculator</span>
                </Link>
                <Link href="/market-hours" className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-2xl transition-all duration-300 font-semibold">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span>Market Hours</span>
                </Link>
                <Link href="/login" className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all duration-300 font-semibold">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                  </div>
                  <span>Login</span>
                </Link>
                {user ? (
                  <Link href="/dashboard" className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl transition-all duration-300 font-semibold shadow-lg shadow-blue-500/30">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <span>Dashboard</span>
                  </Link>
                ) : (
                  <Link href="/login" className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl transition-all duration-300 font-semibold shadow-lg shadow-blue-500/30">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                    </div>
                    <span>Get Started</span>
                  </Link>
                )}
              </nav>
            </div>
          )}
        </div>
      </nav>

      {/* Professional Calculator Page */}
      <div className="relative z-10 py-16">
        <div className="container mx-auto px-6">
          {/* Beautiful Professional Header */}
          <div className="text-center mb-20">
            <div className="relative mb-10">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl"></div>
              <div className="relative inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl shadow-blue-500/25 mb-8 group hover:scale-105 transition-all duration-300">
                <div className="absolute inset-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl opacity-60"></div>
                <svg className="relative w-14 h-14 text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Trading Calculator
              </span>
            </h1>






            <p className="text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
              Calculate position sizes, manage risk, and analyze potential profits with
              <span className="font-semibold text-blue-600"> professional precision</span>
            </p>

            {/* Decorative Elements */}
            <div className="flex items-center justify-center space-x-4 mt-8">
              <div className="h-1 w-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
              <div className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
              <div className="h-1 w-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
            </div>
          </div>

          {/* Professional Calculator Layout */}
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
              {/* Beautiful Calculator Header */}
              <div className="relative bg-gradient-to-r from-gray-50 via-blue-50/30 to-indigo-50/30 border-b border-gray-200/50 px-10 py-8">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
                <div className="relative flex items-center space-x-6">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
                    <div className="relative w-16 h-16 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/25 group-hover:scale-105 transition-all duration-300">
                      <div className="absolute inset-1 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl opacity-60"></div>
                      <svg className="relative w-8 h-8 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-3xl font-black bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
                      Trading Parameters
                    </h2>
                    <p className="text-lg text-gray-600 font-medium">Configure your trade settings and view live calculations</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse delay-200"></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-400"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Calculator Content */}
              <div className="p-8">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                  {/* Beautiful Input Fields Column */}
                  <div className="space-y-8">
                    {/* Enhanced Account Size */}
                    <div className="group">
                      <label className="block text-lg font-bold text-gray-800 mb-4 flex items-center space-x-3">
                        <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center shadow-lg">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                        </div>
                        <span>Account Size</span>
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                          <div className="w-10 h-10 bg-gradient-to-r from-emerald-100 to-green-100 rounded-xl flex items-center justify-center group-focus-within:from-emerald-500 group-focus-within:to-green-500 transition-all duration-300 shadow-sm">
                            <span className="text-emerald-600 group-focus-within:text-white text-xl font-bold transition-colors duration-300">$</span>
                          </div>
                        </div>
                        <input
                          type="number"
                          value={accountSize}
                          onChange={(e) => setAccountSize(e.target.value)}
                          className="w-full pl-20 pr-6 py-5 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-2xl shadow-lg focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:shadow-xl transition-all duration-300 hover:shadow-xl hover:border-emerald-300 text-xl font-semibold text-gray-900 placeholder-gray-500"
                          placeholder="10,000"
                        />
                      </div>
                    </div>

                    {/* Enhanced Risk Percentage */}
                    <div className="group">
                      <label className="block text-lg font-bold text-gray-800 mb-4 flex items-center space-x-3">
                        <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-lg">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                        <span>Risk Percentage</span>
                      </label>
                      <div className="relative group">
                        <input
                          type="number"
                          step="0.1"
                          value={riskPercentage}
                          onChange={(e) => setRiskPercentage(e.target.value)}
                          className="w-full pl-6 pr-20 py-5 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-2xl shadow-lg focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 focus:shadow-xl transition-all duration-300 hover:shadow-xl hover:border-orange-300 text-xl font-semibold text-gray-900 placeholder-gray-500"
                          placeholder="2.0"
                        />
                        <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none">
                          <div className="w-10 h-10 bg-gradient-to-r from-orange-100 to-red-100 rounded-xl flex items-center justify-center group-focus-within:from-orange-500 group-focus-within:to-red-500 transition-all duration-300 shadow-sm">
                            <span className="text-orange-600 group-focus-within:text-white text-xl font-bold transition-colors duration-300">%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Trading Pair */}
                    <div className="group">
                      <label className="block text-lg font-bold text-gray-800 mb-4 flex items-center space-x-3">
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-lg">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <span>Trading Pair</span>
                      </label>
                      <button
                        onClick={() => setIsPairModalOpen(true)}
                        className="w-full px-6 py-5 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-2xl shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:shadow-xl transition-all duration-300 hover:shadow-xl hover:border-blue-300 text-left flex items-center justify-between group"
                      >
                        <div className="flex items-center space-x-4">
                          {(() => {
                            const currentPair = tradingPairs.find(p => p.symbol === selectedPair);
                            const flags = getTradingPairFlags(selectedPair, currentPair?.category || 'Forex');

                            return (
                              <div className="w-24 h-12 bg-white border-2 border-gray-200 rounded-xl flex items-center justify-center group-hover:border-blue-500 transition-all duration-300 shadow-sm">
                                {flags.display === 'dual' ? (
                                  <div className="flex items-center space-x-1">
                                    <span className="px-1 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-bold">
                                      {flags.primary}
                                    </span>
                                    <span className="text-xs text-gray-400">/</span>
                                    <span className="px-1 py-0.5 bg-green-100 text-green-800 rounded text-xs font-bold">
                                      {flags.secondary}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm font-bold">
                                    {flags.primary}
                                  </span>
                                )}
                              </div>
                            );
                          })()}
                          <div>
                            <div className="text-xl font-bold text-gray-900">{selectedPair}</div>
                            <div className="text-sm text-gray-500 font-medium">
                              {tradingPairs.find(p => p.symbol === selectedPair)?.name}
                            </div>
                          </div>
                        </div>
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center group-hover:from-blue-500 group-hover:to-indigo-500 transition-all duration-300 shadow-sm">
                          <svg className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                          </svg>
                        </div>
                      </button>
                    </div>

                    {/* Enhanced Entry Price */}
                    <div className="group">
                      <label className="block text-lg font-bold text-gray-800 mb-4 flex items-center space-x-3">
                        <div className="w-6 h-6 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                          </svg>
                        </div>
                        <span>Entry Price</span>
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                          <div className="w-10 h-10 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-xl flex items-center justify-center group-focus-within:from-cyan-500 group-focus-within:to-blue-500 transition-all duration-300 shadow-sm">
                            <svg className="w-5 h-5 text-cyan-600 group-focus-within:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                            </svg>
                          </div>
                        </div>
                        <input
                          type="number"
                          step="0.00001"
                          value={entryPrice}
                          onChange={(e) => setEntryPrice(e.target.value)}
                          className="w-full pl-20 pr-6 py-5 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-2xl shadow-lg focus:outline-none focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 focus:shadow-xl transition-all duration-300 hover:shadow-xl hover:border-cyan-300 text-xl font-semibold text-gray-900 placeholder-gray-500"
                          placeholder="1.10000"
                        />
                      </div>
                    </div>

                    {/* Enhanced Exit Price */}
                    <div className="group">
                      <label className="block text-lg font-bold text-gray-800 mb-4 flex items-center space-x-3">
                        <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-lg">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        </div>
                        <span>Exit Price (Take Profit)</span>
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                          <div className="w-10 h-10 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl flex items-center justify-center group-focus-within:from-green-500 group-focus-within:to-emerald-500 transition-all duration-300 shadow-sm">
                            <svg className="w-5 h-5 text-green-600 group-focus-within:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                          </div>
                        </div>
                        <input
                          type="number"
                          step="0.00001"
                          value={exitPrice}
                          onChange={(e) => setExitPrice(e.target.value)}
                          className="w-full pl-20 pr-6 py-5 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-2xl shadow-lg focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 focus:shadow-xl transition-all duration-300 hover:shadow-xl hover:border-green-300 text-xl font-semibold text-gray-900 placeholder-gray-500"
                          placeholder="1.11000"
                        />
                      </div>
                    </div>

                    {/* Enhanced Stop Loss */}
                    <div className="group">
                      <label className="block text-lg font-bold text-gray-800 mb-4 flex items-center space-x-3">
                        <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                          </svg>
                        </div>
                        <span>Stop Loss Price</span>
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                          <div className="w-10 h-10 bg-gradient-to-r from-red-100 to-pink-100 rounded-xl flex items-center justify-center group-focus-within:from-red-500 group-focus-within:to-pink-500 transition-all duration-300 shadow-sm">
                            <svg className="w-5 h-5 text-red-600 group-focus-within:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                            </svg>
                          </div>
                        </div>
                        <input
                          type="number"
                          step="0.00001"
                          value={stopLoss}
                          onChange={(e) => setStopLoss(e.target.value)}
                          className="w-full pl-20 pr-6 py-5 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-2xl shadow-lg focus:outline-none focus:ring-4 focus:ring-red-500/20 focus:border-red-500 focus:shadow-xl transition-all duration-300 hover:shadow-xl hover:border-red-300 text-xl font-semibold text-gray-900 placeholder-gray-500"
                          placeholder="1.09500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Results Column */}
                  <div className="space-y-8">
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600/20 via-blue-600/20 to-purple-600/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-all duration-500"></div>
                      <div className="relative bg-gradient-to-br from-white via-gray-50/50 to-white rounded-3xl p-8 border border-gray-200/50 shadow-2xl group-hover:shadow-3xl transition-all duration-500">
                        <div className="flex items-center space-x-4 mb-8">
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/30 to-blue-500/30 rounded-2xl blur-lg"></div>
                            <div className="relative w-16 h-16 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
                              <svg className="w-8 h-8 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                            </div>
                          </div>
                          <div>
                            <h3 className="text-3xl font-black bg-gradient-to-r from-gray-900 via-emerald-800 to-blue-800 bg-clip-text text-transparent mb-2">
                              Trading Results
                            </h3>
                            <p className="text-lg text-gray-600 font-medium">Live calculations & analysis</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-200"></div>
                              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-400"></div>
                            </div>
                          </div>
                        </div>

                        {/* Professional Results Layout */}
                        <div className="space-y-6">
                          {/* Position Sizing Section */}
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200/50">
                            <h4 className="text-lg font-bold text-blue-900 mb-4 flex items-center space-x-2">
                              <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                </svg>
                              </div>
                              <span>Position Sizing</span>
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-white rounded-xl p-4 shadow-sm">
                                <div className="text-sm text-gray-600 font-medium mb-1">Lot Size</div>
                                <div className="text-2xl font-black text-blue-900">{lotSize.toFixed(2)}</div>
                                <div className="text-xs text-blue-600 font-semibold">Standard Lots</div>
                              </div>
                              <div className="bg-white rounded-xl p-4 shadow-sm">
                                <div className="text-sm text-gray-600 font-medium mb-1">Risk Amount</div>
                                <div className="text-2xl font-black text-orange-900">${riskDollars.toFixed(2)}</div>
                                <div className="text-xs text-orange-600 font-semibold">Maximum Risk</div>
                              </div>
                            </div>
                          </div>

                          {/* Pips Analysis Section */}
                          <div className="bg-gradient-to-r from-red-50 to-green-50 rounded-2xl p-6 border border-gray-200/50">
                            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                              <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-green-500 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                              </div>
                              <span>Pips Analysis</span>
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-red-500">
                                <div className="text-sm text-gray-600 font-medium mb-1">Stop Loss</div>
                                <div className="text-2xl font-black text-red-900">{stopLossPips.toFixed(1)}</div>
                                <div className="text-xs text-red-600 font-semibold">Pips</div>
                              </div>
                              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
                                <div className="text-sm text-gray-600 font-medium mb-1">Take Profit</div>
                                <div className="text-2xl font-black text-green-900">{profitPips.toFixed(1)}</div>
                                <div className="text-xs text-green-600 font-semibold">Pips</div>
                              </div>
                            </div>
                          </div>

                          {/* Profit & Risk Analysis Section */}
                          <div className="bg-gradient-to-r from-emerald-50 to-purple-50 rounded-2xl p-6 border border-gray-200/50">
                            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                              <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-purple-500 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                              </div>
                              <span>Profit & Risk Analysis</span>
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-white rounded-xl p-4 shadow-sm">
                                <div className="text-sm text-gray-600 font-medium mb-1">Profit Potential</div>
                                <div className="text-2xl font-black text-emerald-900">${profitDollars.toFixed(2)}</div>
                                <div className="text-xs text-emerald-600 font-semibold">If Target Hit</div>
                              </div>
                              <div className="bg-white rounded-xl p-4 shadow-sm">
                                <div className="text-sm text-gray-600 font-medium mb-1">Risk/Reward Ratio</div>
                                <div className="text-2xl font-black text-purple-900">1:{riskRewardRatio.toFixed(2)}</div>
                                <div className="text-xs text-purple-600 font-semibold">Ratio</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Enhanced Save Trade Button */}
                        {user && (
                          <div className="mt-8 pt-8 border-t border-gray-200/50">
                            <div className="relative group">
                              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/30 via-indigo-600/30 to-purple-600/30 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                              <button
                                onClick={() => handleSaveTrade({
                                  pair: selectedPair,
                                  entryPrice: parseFloat(entryPrice),
                                  exitPrice: parseFloat(exitPrice),
                                  stopLoss: parseFloat(stopLoss),
                                  lotSize: lotSize,
                                  riskAmount: riskDollars,
                                  profitPotential: profitDollars,
                                  riskRewardRatio: riskRewardRatio
                                })}
                                className="relative w-full px-8 py-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-4 group"
                              >
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 backdrop-blur-sm">
                                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                </div>
                                <div className="text-center">
                                  <div className="text-xl font-black">Save Trade to Journal</div>
                                  <div className="text-white/80 text-sm font-medium">Add to your trading portfolio</div>
                                </div>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stunning Trading Pair Selection Modal */}
      {isPairModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="relative max-w-6xl w-full max-h-[90vh] overflow-hidden">
            {/* Beautiful Background Effects */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 rounded-3xl blur-2xl opacity-50 animate-pulse"></div>
            <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-purple-500/20 rounded-3xl blur-xl opacity-40"></div>

            <div className="relative bg-white/95 backdrop-blur-3xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
              {/* Stunning Modal Header */}
              <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-8 py-6">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/50 via-indigo-500/50 to-purple-500/50 backdrop-blur-sm"></div>
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-xl">
                      <svg className="w-8 h-8 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-white drop-shadow-lg mb-1">Select Trading Pair</h3>
                      <p className="text-white/90 font-semibold">Choose from {tradingPairs.length}+ professional trading instruments</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsPairModalOpen(false);
                      setSearchQuery('');
                      setSelectedCategory('All');
                    }}
                    className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center hover:bg-white/30 hover:scale-110 hover:rotate-90 transition-all duration-300 backdrop-blur-sm group"
                  >
                    <svg className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Enhanced Search and Filter Section */}
              <div className="p-8 border-b border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-blue-50/30">
                {/* Beautiful Search Bar */}
                <div className="relative mb-6 group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-all duration-300"></div>
                  <div className="relative flex items-center">
                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl flex items-center justify-center group-focus-within:from-blue-500 group-focus-within:to-purple-500 transition-all duration-300 shadow-sm">
                        <svg className="w-6 h-6 text-blue-600 group-focus-within:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by symbol, name, or category..."
                      className="w-full pl-24 pr-6 py-6 bg-white/80 border-2 border-gray-200/50 rounded-2xl shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white focus:shadow-2xl transition-all duration-300 hover:shadow-xl hover:border-blue-300 text-xl font-semibold text-gray-900 placeholder-gray-500 backdrop-blur-sm"
                    />
                  </div>
                </div>

                {/* Beautiful Category Filter Tabs */}
                <div className="flex flex-wrap gap-3">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 ${
                        selectedCategory === category
                          ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-blue-500/30'
                          : 'bg-white/80 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 border border-gray-200/50'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">
                          {category === 'All' ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          ) : category === 'Forex' ? 'EU/US' : 
                           category === 'Stocks' ? 'US' :
                           category === 'Crypto' ? '₿/US' :
                           category === 'Commodities' ? 'GOLD' :
                           category === 'Indices' ? 'US' :
                           getCategoryIcon(category)}
                        </span>
                        <span>{category}</span>
                        {category !== 'All' && (
                          <span className="text-xs opacity-75">
                            ({tradingPairs.filter(p => p.category === category).length})
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Enhanced Trading Pairs Grid */}
              <div className="p-8 overflow-y-auto max-h-[50vh]">
                {filteredPairs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPairs.map((pair, index) => (
                      <button
                        key={pair.symbol}
                        onClick={() => {
                          setSelectedPair(pair.symbol);
                          setIsPairModalOpen(false);
                          setSearchQuery('');
                          setSelectedCategory('All');
                        }}
                        className="group relative p-6 rounded-2xl border-2 border-gray-200/50 hover:border-transparent bg-gradient-to-br from-white via-gray-50/50 to-white hover:from-blue-50 hover:via-indigo-50 hover:to-purple-50 transition-all duration-500 text-left hover:scale-105 hover:shadow-2xl"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        {/* Beautiful Hover Background Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        <div className="relative flex items-center space-x-4">
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            {(() => {
                              const flags = getTradingPairFlags(pair.symbol, pair.category);

                              return (
                                <div className="relative w-24 h-14 bg-white border-2 border-gray-200 rounded-xl flex items-center justify-center group-hover:border-blue-500 group-hover:bg-blue-50 transition-all duration-300 shadow-lg">
                                  {flags.display === 'dual' ? (
                                    <div className="flex items-center space-x-1">
                                      <span className="px-1.5 py-1 bg-blue-100 text-blue-800 rounded text-xs font-bold group-hover:bg-blue-200">
                                        {flags.primary}
                                      </span>
                                      <span className="text-xs text-gray-400">/</span>
                                      <span className="px-1.5 py-1 bg-green-100 text-green-800 rounded text-xs font-bold group-hover:bg-green-200">
                                        {flags.secondary}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm font-bold group-hover:bg-gray-200">
                                      {flags.primary}
                                    </span>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                          <div className="flex-1">
                            <div className="font-black text-gray-900 text-lg mb-1 group-hover:text-gray-800 transition-colors duration-300">{pair.symbol}</div>
                            <div className="text-sm text-gray-600 font-semibold mb-2 group-hover:text-gray-700 transition-colors duration-300 line-clamp-1">{pair.name}</div>
                            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 group-hover:from-blue-500 group-hover:to-indigo-500 group-hover:text-white transition-all duration-300">
                              {pair.category}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.291-1.007-5.824-2.562M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No pairs found</h3>
                    <p className="text-gray-600">Try adjusting your search or filter criteria</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Trade Modal */}
      {currentTradeData && (
        <SaveTradeModal
          isOpen={isSaveTradeModalOpen}
          onClose={() => setIsSaveTradeModalOpen(false)}
          tradeData={currentTradeData}
          onSaveSuccess={handleSaveSuccess}
        />
      )}
    </div>
  );
}
