'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from '../../components/AccountProvider';

interface Trade {
  id: string;
  dateTime: string;
  weekend: string;
  week: string;
  month: string;
  quarter: string;
  year: string;
  market: string;
  setup: string;
  htfFramework: string;
  dailyProfile: string;
  entryCandle: string;
  entryTime: string;
  entryTimeFrame: string;
  entryConfluence: string[];
  duration: string;
  riskPercent: string;
  plannedRR: string;
  realizedRR: string;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export default function TradingJournal() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterMarket, setFilterMarket] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'market' | 'rr'>('date');
  const { selectedAccount } = useAccount();

  useEffect(() => {
    fetchTrades();
  }, [selectedAccount]);

  const fetchTrades = async () => {
    try {
      setLoading(true);
      const accountId = selectedAccount?.id || 'default';
      console.log('Fetching trades for account:', accountId);
      
      const url = `/api/trades?accountId=${accountId}&context=am-trader`;
      console.log('Fetch URL:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer dummy-token`,
        },
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        console.log('Raw API response:', data);
        console.log('Response structure:', {
          hasSuccess: 'success' in data,
          hasTrades: 'trades' in data,
          hasTotal: 'total' in data,
          responseKeys: Object.keys(data)
        });
        
        // Ensure we get the trades array from the response
        const tradesArray = data.trades || data || [];
        console.log('Extracted trades array:', tradesArray);
        console.log('Trades array type:', typeof tradesArray);
        console.log('Is trades array?', Array.isArray(tradesArray));
        console.log('Trades count:', Array.isArray(tradesArray) ? tradesArray.length : 'Not an array');
        
        // Ensure it's always an array
        if (Array.isArray(tradesArray)) {
          setTrades(tradesArray);
          console.log('Set trades successfully:', tradesArray.length, 'trades');
        } else {
          console.error('Expected trades to be an array, got:', typeof tradesArray);
          console.error('Trades value:', tradesArray);
          setTrades([]);
        }
      } else {
        const errorData = await response.text();
        console.error('Failed to fetch trades:', response.status, errorData);
        setTrades([]);
      }
    } catch (error) {
      console.error('Error fetching trades:', error);
      console.error('Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      setTrades([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort trades - add safety checks
  const filteredTrades = (Array.isArray(trades) ? trades : []).filter(trade => 
    filterMarket === 'all' || trade.market === filterMarket
  ).sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'market':
        return (a.market || '').localeCompare(b.market || '');
      case 'rr':
        return (parseFloat(b.realizedRR) || 0) - (parseFloat(a.realizedRR) || 0);
      default:
        return 0;
    }
  });

  // Get unique markets for filter - add safety checks
  const uniqueMarkets = Array.from(new Set((Array.isArray(trades) ? trades : []).map(trade => trade.market))).filter(Boolean);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-green-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 -left-20 w-60 h-60 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 via-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse shadow-2xl">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Loading mTrader Journal
            </h3>
            <p className="text-gray-600 font-medium">Fetching your trading entries...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!Array.isArray(trades) || trades.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-green-600/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/3 -left-20 w-60 h-60 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-3xl blur-xl opacity-60 animate-pulse"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 rounded-3xl flex items-center justify-center shadow-2xl">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-emerald-800 to-green-800 bg-clip-text text-transparent mb-4">
              mTrader Journal
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Your comprehensive AM trading journal and performance analytics center
            </p>
          </div>

          {/* Empty State */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden p-16 text-center">
            <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-6">No Journal Entries Found</h3>
            <p className="text-xl text-gray-600 mb-10 max-w-md mx-auto">
              You haven't created any AM trades yet. Start building your trading journal by adding your first trade entry.
            </p>
            <a
              href="/am-trader/add-trade"
              className="inline-flex items-center space-x-3 px-10 py-5 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-600 text-white rounded-2xl hover:from-emerald-600 hover:via-green-600 hover:to-teal-700 transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl transform hover:scale-[1.02] text-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Add Your First AM Trade</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-green-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -left-20 w-60 h-60 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Beautiful Hero Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-3xl blur-xl opacity-60 animate-pulse"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 rounded-3xl flex items-center justify-center shadow-2xl">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-emerald-800 to-green-800 bg-clip-text text-transparent mb-4">
            mTrader Journal
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-6">
            Your comprehensive AM trading journal with {Array.isArray(trades) ? trades.length : 0} recorded trades
          </p>
          <div className="flex justify-center">
            <div className="flex items-center space-x-6 px-8 py-3 bg-white/60 backdrop-blur-sm rounded-full border border-white/20 shadow-lg">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">{Array.isArray(trades) ? trades.length : 0} Trades</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">Live Analytics</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">Performance Tracking</span>
              </div>
            </div>
          </div>
        </div>

        {/* Controls & Filters */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Left side - View controls */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="font-medium text-gray-700">View:</span>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                      viewMode === 'grid'
                        ? 'bg-emerald-500 text-white shadow-md'
                        : 'text-gray-600 hover:text-emerald-600'
                    }`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                      viewMode === 'list'
                        ? 'bg-emerald-500 text-white shadow-md'
                        : 'text-gray-600 hover:text-emerald-600'
                    }`}
                  >
                    List
                  </button>
                </div>
              </div>
            </div>

            {/* Right side - Filters and sort */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              {/* Market Filter */}
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span className="font-medium text-gray-700">Market:</span>
                <select
                  value={filterMarket}
                  onChange={(e) => setFilterMarket(e.target.value)}
                  className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="all">All Markets</option>
                  {uniqueMarkets.map((market) => (
                    <option key={market} value={market}>{market}</option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                <span className="font-medium text-gray-700">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'market' | 'rr')}
                  className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="date">Date</option>
                  <option value="market">Market</option>
                  <option value="rr">Realized RR</option>
                </select>
              </div>

              {/* Add Trade Button */}
              <a
                href="/am-trader/add-trade"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add Trade</span>
              </a>
            </div>
          </div>
        </div>

        {/* Debug Info - Temporary */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 font-medium">
            Debug Info: Found {trades.length} total trades, {filteredTrades.length} filtered trades
          </p>
          {trades.length > 0 && (
            <p className="text-yellow-700 text-sm mt-1">
              Latest trade: {trades[0]?.market} created at {trades[0]?.createdAt}
            </p>
          )}
          <div className="mt-3 space-x-3">
            <button
              onClick={async () => {
                try {
                  const response = await fetch('/api/trades');
                  const data = await response.json();
                  console.log('All trades (no filter):', data);
                  alert(`Total trades in MongoDB: ${data.trades?.length || 0}\nContext breakdown: ${JSON.stringify(data.debug?.contextBreakdown || {}, null, 2)}`);
                } catch (error) {
                  console.error('Test fetch error:', error);
                  alert('Error fetching all trades');
                }
              }}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              Test Fetch All Trades
            </button>
            <button
              onClick={async () => {
                try {
                  const response = await fetch('/api/trades?context=am-trader');
                  const data = await response.json();
                  console.log('AM trader trades only:', data);
                  alert(`AM trader trades in MongoDB: ${data.trades?.length || 0}\nQuery used: ${JSON.stringify(data.debug?.query || {}, null, 2)}`);
                } catch (error) {
                  console.error('Test AM trader fetch error:', error);
                  alert('Error fetching AM trader trades');
                }
              }}
              className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
            >
              Test Fetch AM Trades
            </button>
            <button
              onClick={() => {
                console.log('Current trades state:', trades);
                console.log('Selected account:', selectedAccount);
                alert(`Current state: ${trades.length} trades, Account: ${selectedAccount?.name || 'None'}`);
              }}
              className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
            >
              Check State
            </button>
            <button
              onClick={async () => {
                try {
                  const sampleTrade = {
                    dateTime: new Date().toISOString(),
                    weekend: 'Monday',
                    week: 'Week 1',
                    month: 'December 2024',
                    quarter: 'Q4-24',
                    year: '2024',
                    market: 'S&P 500',
                    setup: 'Reversal Date',
                    htfFramework: 'Manipulation',
                    dailyProfile: '18:00 Reversal',
                    entryCandle: '08:00 Candle',
                    entryTime: '01:00 - 01:59',
                    entryTimeFrame: '15 minutes',
                    entryConfluence: ['Short Term Saving', 'Opposing Candle'],
                    duration: '2 hours',
                    riskPercent: '2%',
                    plannedRR: '3R',
                    realizedRR: '2.5R',
                    comment: 'Test trade saved to MongoDB',
                    accountId: selectedAccount?.id || 'default',
                    context: 'am-trader'
                  };

                  const response = await fetch('/api/trades', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': 'Bearer dummy-token'
                    },
                    body: JSON.stringify(sampleTrade)
                  });

                  const result = await response.json();
                  console.log('Created sample trade:', result);
                  
                  if (result.success) {
                    alert(`Sample AM trader trade saved to MongoDB!\nTrade ID: ${result.trade._id}`);
                    fetchTrades(); // Refresh the trades list
                  } else {
                    alert(`Failed to create sample trade: ${result.error}`);
                  }
                } catch (error) {
                  console.error('Error creating sample trade:', error);
                  alert('Error creating sample trade');
                }
              }}
              className="px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600"
            >
              Create Sample Trade
            </button>
            <button
              onClick={async () => {
                if (confirm('Are you sure you want to clear ALL trades from MongoDB? This cannot be undone.')) {
                  try {
                    const response = await fetch('/api/trades?clearAll=true', {
                      method: 'DELETE'
                    });
                    const result = await response.json();
                    console.log('Clear result:', result);
                    alert(`Cleared ${result.deletedCount || 0} trades from MongoDB`);
                    fetchTrades(); // Refresh the trades list
                  } catch (error) {
                    console.error('Error clearing trades:', error);
                    alert('Error clearing trades from MongoDB');
                  }
                }
              }}
              className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
            >
              Clear All Trades
            </button>
          </div>
        </div>

        {/* Trade Cards Grid/List View */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTrades.map((trade) => (
              <div
                key={trade.id}
                onClick={() => setSelectedTrade(trade)}
                className="group relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/30 overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 cursor-pointer"
              >
                {/* Status indicator bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${
                  trade.realizedRR && parseFloat(trade.realizedRR) > 0 
                    ? 'bg-gradient-to-r from-emerald-400 to-green-500' 
                    : trade.realizedRR && parseFloat(trade.realizedRR) < 0
                    ? 'bg-gradient-to-r from-red-400 to-pink-500'
                    : 'bg-gradient-to-r from-blue-400 to-indigo-500'
                }`}></div>

                {/* Card Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                          trade.realizedRR && parseFloat(trade.realizedRR) > 0 
                            ? 'bg-gradient-to-br from-emerald-500 to-green-600' 
                            : trade.realizedRR && parseFloat(trade.realizedRR) < 0
                            ? 'bg-gradient-to-br from-red-500 to-pink-600'
                            : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                        }`}>
                          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        </div>
                        {/* Performance indicator dot */}
                        <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                          trade.realizedRR && parseFloat(trade.realizedRR) > 0 
                            ? 'bg-emerald-400' 
                            : trade.realizedRR && parseFloat(trade.realizedRR) < 0
                            ? 'bg-red-400'
                            : 'bg-blue-400'
                        } animate-pulse`}></div>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{trade.market}</h3>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          trade.setup === 'Reversal Date' 
                            ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                            : 'bg-orange-100 text-orange-800 border border-orange-200'
                        }`}>
                          {trade.setup}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 mb-1">#{trade.id.slice(-4)}</div>
                      <div className="text-xs font-medium text-gray-700">
                        {new Date(trade.createdAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="px-6 pb-6 space-y-5">
                  {/* Performance Metrics Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-gray-600">Risk</p>
                        <div className={`w-2 h-2 rounded-full ${
                          parseFloat(trade.riskPercent || '0') <= 1 ? 'bg-green-400' : 
                          parseFloat(trade.riskPercent || '0') <= 2 ? 'bg-yellow-400' : 'bg-red-400'
                        }`}></div>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{trade.riskPercent || 'N/A'}</p>
                    </div>
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-gray-600">Planned RR</p>
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{trade.plannedRR || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Trading Details */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span className="text-sm text-gray-600">HTF Framework</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{trade.htfFramework || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-gray-600">Entry Time</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{trade.entryTime || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-gray-600">Duration</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{trade.duration || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Realized RR Badge */}
                  {trade.realizedRR && (
                    <div className="flex items-center justify-center pt-2">
                      <div className={`px-4 py-2 rounded-xl text-sm font-bold shadow-lg ${
                        parseFloat(trade.realizedRR) > 0 
                          ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white' 
                          : 'bg-gradient-to-r from-red-500 to-pink-600 text-white'
                      }`}>
                        <div className="flex items-center space-x-2">
                          <span>Realized: {trade.realizedRR}</span>
                          {parseFloat(trade.realizedRR) > 0 ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Entry Confluence Tags */}
                  {trade.entryConfluence && trade.entryConfluence.length > 0 && (
                    <div className="pt-2">
                      <p className="text-xs font-medium text-gray-500 mb-2">Entry Confluence</p>
                      <div className="flex flex-wrap gap-2">
                        {trade.entryConfluence.slice(0, 2).map((confluence, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-xs font-medium rounded-lg border border-blue-200"
                          >
                            {confluence}
                          </span>
                        ))}
                        {trade.entryConfluence.length > 2 && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg border border-gray-200">
                            +{trade.entryConfluence.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                  <div className="absolute bottom-6 right-6">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 shadow-lg">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Animated border on hover */}
                <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-gradient-to-r group-hover:from-emerald-400 group-hover:to-blue-500 transition-all duration-500 pointer-events-none"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredTrades.map((trade) => (
              <div
                key={trade.id}
                onClick={() => setSelectedTrade(trade)}
                className="group relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/30 p-8 hover:shadow-2xl hover:scale-[1.01] transition-all duration-500 cursor-pointer overflow-hidden"
              >
                {/* Status indicator bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${
                  trade.realizedRR && parseFloat(trade.realizedRR) > 0 
                    ? 'bg-gradient-to-r from-emerald-400 to-green-500' 
                    : trade.realizedRR && parseFloat(trade.realizedRR) < 0
                    ? 'bg-gradient-to-r from-red-400 to-pink-500'
                    : 'bg-gradient-to-r from-blue-400 to-indigo-500'
                }`}></div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                        trade.realizedRR && parseFloat(trade.realizedRR) > 0 
                          ? 'bg-gradient-to-br from-emerald-500 to-green-600' 
                          : trade.realizedRR && parseFloat(trade.realizedRR) < 0
                          ? 'bg-gradient-to-br from-red-500 to-pink-600'
                          : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                      }`}>
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      {/* Performance indicator dot */}
                      <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                        trade.realizedRR && parseFloat(trade.realizedRR) > 0 
                          ? 'bg-emerald-400' 
                          : trade.realizedRR && parseFloat(trade.realizedRR) < 0
                          ? 'bg-red-400'
                          : 'bg-blue-400'
                      } animate-pulse`}></div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{trade.market}</h3>
                      <div className="flex items-center space-x-4">
                        <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium ${
                          trade.setup === 'Reversal Date' 
                            ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                            : 'bg-orange-100 text-orange-800 border border-orange-200'
                        }`}>
                          {trade.setup}
                        </span>
                        {trade.realizedRR && (
                          <div className={`px-4 py-2 rounded-xl text-sm font-bold shadow-lg ${
                            parseFloat(trade.realizedRR) > 0 
                              ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white' 
                              : 'bg-gradient-to-r from-red-500 to-pink-600 text-white'
                          }`}>
                            <div className="flex items-center space-x-2">
                              <span>Realized: {trade.realizedRR}</span>
                              {parseFloat(trade.realizedRR) > 0 ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                                </svg>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500 mb-1">Trade #{trade.id.slice(-4)}</div>
                    <div className="text-sm font-medium text-gray-700 mb-3">
                      {new Date(trade.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    {/* Entry Confluence Tags */}
                    {trade.entryConfluence && trade.entryConfluence.length > 0 && (
                      <div className="flex flex-wrap gap-2 justify-end">
                        {trade.entryConfluence.slice(0, 3).map((confluence, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-xs font-medium rounded-lg border border-blue-200"
                          >
                            {confluence}
                          </span>
                        ))}
                        {trade.entryConfluence.length > 3 && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg border border-gray-200">
                            +{trade.entryConfluence.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-6 grid grid-cols-2 md:grid-cols-6 gap-4">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-gray-600">Risk %</p>
                      <div className={`w-2 h-2 rounded-full ${
                        parseFloat(trade.riskPercent || '0') <= 1 ? 'bg-green-400' : 
                        parseFloat(trade.riskPercent || '0') <= 2 ? 'bg-yellow-400' : 'bg-red-400'
                      }`}></div>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{trade.riskPercent || 'N/A'}</p>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-gray-600">Planned RR</p>
                      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{trade.plannedRR || 'N/A'}</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-blue-600">HTF Framework</p>
                      <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <p className="text-sm font-bold text-blue-900">{trade.htfFramework || 'N/A'}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-green-600">Entry Time</p>
                      <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-sm font-bold text-green-900">{trade.entryTime || 'N/A'}</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-purple-600">Duration</p>
                      <svg className="w-3 h-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-sm font-bold text-purple-900">{trade.duration || 'N/A'}</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-orange-600">Daily Profile</p>
                      <svg className="w-3 h-3 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <p className="text-sm font-bold text-orange-900">{trade.dailyProfile || 'N/A'}</p>
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                  <div className="absolute bottom-6 right-6">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 shadow-lg">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Animated border on hover */}
                <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-gradient-to-r group-hover:from-emerald-400 group-hover:to-blue-500 transition-all duration-500 pointer-events-none"></div>
              </div>
            ))}
          </div>
        )}

        {/* Trade Details Modal */}
        {selectedTrade && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-8 border-b border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">{selectedTrade.market} Trade</h2>
                    <p className="text-emerald-600 font-medium">Trade #{selectedTrade.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTrade(null)}
                  className="p-3 hover:bg-gray-100 rounded-full transition-colors duration-300"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-200">
                      <h3 className="text-lg font-bold text-emerald-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Trade Information
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Date & Time</label>
                          <p className="font-semibold text-gray-900">
                            {selectedTrade.dateTime ? new Date(selectedTrade.dateTime).toLocaleString() : 'Not set'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Market</label>
                          <p className="font-semibold text-gray-900">{selectedTrade.market}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Setup</label>
                          <p className="font-semibold text-gray-900">{selectedTrade.setup}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">HTF Framework</label>
                          <p className="font-semibold text-gray-900">{selectedTrade.htfFramework}</p>
                        </div>
                      </div>
                    </div>

                    {/* Time Periods */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                      <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Time Classification
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Weekend</label>
                          <p className="font-semibold text-gray-900">{selectedTrade.weekend || 'Not set'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Week</label>
                          <p className="font-semibold text-gray-900">{selectedTrade.week || 'Not set'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Month</label>
                          <p className="font-semibold text-gray-900">{selectedTrade.month || 'Not set'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Quarter</label>
                          <p className="font-semibold text-gray-900">{selectedTrade.quarter || 'Not set'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Entry Details */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                      <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                        </svg>
                        Entry Details
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Entry Candle:</span>
                          <span className="font-semibold text-gray-900">{selectedTrade.entryCandle || 'Not set'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Entry Time:</span>
                          <span className="font-semibold text-gray-900">{selectedTrade.entryTime || 'Not set'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Time Frame:</span>
                          <span className="font-semibold text-gray-900">{selectedTrade.entryTimeFrame || 'Not set'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Daily Profile:</span>
                          <span className="font-semibold text-gray-900">{selectedTrade.dailyProfile || 'Not set'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Risk Management */}
                    <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-6 border border-red-200">
                      <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Risk Management
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Risk %</label>
                          <p className="font-semibold text-gray-900">{selectedTrade.riskPercent || 'Not set'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Duration</label>
                          <p className="font-semibold text-gray-900">{selectedTrade.duration || 'Not set'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Planned RR</label>
                          <p className="font-semibold text-gray-900">{selectedTrade.plannedRR || 'Not set'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Realized RR</label>
                          <p className={`font-semibold ${
                            selectedTrade.realizedRR && parseFloat(selectedTrade.realizedRR) > 0 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {selectedTrade.realizedRR || 'Not set'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Entry Confluence */}
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
                      <h3 className="text-lg font-bold text-yellow-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a1 1 0 01-1-1V9a1 1 0 011-1h1a2 2 0 100-4H4a1 1 0 01-1-1V5a1 1 0 011-1h3a1 1 0 001-1v-1z" />
                        </svg>
                        Entry Confluence
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedTrade.entryConfluence && selectedTrade.entryConfluence.length > 0 ? (
                          selectedTrade.entryConfluence.map((confluence, index) => (
                            <span
                              key={index}
                              className="px-3 py-2 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full border border-yellow-200"
                            >
                              {confluence}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500 italic">No confluence factors selected</span>
                        )}
                      </div>
                    </div>

                    {/* Comment */}
                    {selectedTrade.comment && (
                      <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                          </svg>
                          Comments & Notes
                        </h3>
                        <p className="text-gray-900 leading-relaxed">{selectedTrade.comment}</p>
                      </div>
                    )}

                    {/* Trade Metadata */}
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-200">
                      <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Trade Metadata
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Created:</span>
                          <span className="font-medium text-gray-900">
                            {new Date(selectedTrade.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Updated:</span>
                          <span className="font-medium text-gray-900">
                            {new Date(selectedTrade.updatedAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Trade ID:</span>
                          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                            {selectedTrade.id}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 