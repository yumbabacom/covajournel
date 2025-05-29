'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TradeStatusManager from '../components/TradeStatusManager';
import UpdateTradeModal from '../components/UpdateTradeModal';
import TradeDetailModal from '../components/TradeDetailModal';
import { useAuth } from '../components/AuthProvider';
import { useAccount } from '../components/AccountProvider';

interface Trade {
  id: string;
  accountId?: string;
  symbol: string;
  category: string;
  entryPrice: number;
  exitPrice: number;
  stopLoss: number;
  accountSize: number;
  riskPercentage: number;
  riskAmount: number;
  lotSize: number;
  profitPips: number;
  lossPips: number;
  profitDollars: number;
  lossDollars: number;
  riskRewardRatio: number;
  tradeDirection: string;
  status: string;
  notes: string;
  tags: string[];
  entryImage?: string;
  exitImage?: string;
  images?: string[];
  strategyId?: string;
  strategy?: {
    id: string;
    name: string;
    marketType: string;
    timeframe: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface JournalStats {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalProfit: number;
  totalLoss: number;
  netPnL: number;
  avgRiskReward: number;
  bestTrade: number;
  worstTrade: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  largestWinStreak: number;
  largestLossStreak: number;
  currentStreak: number;
  streakType: 'win' | 'loss' | 'none';
}

export default function TradingJournal() {
  const { user, logout, isLoading } = useAuth();
  const { selectedAccount } = useAccount();
  const router = useRouter();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [updateModalTrade, setUpdateModalTrade] = useState<Trade | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'analytics'>('cards');
  const [sortBy, setSortBy] = useState<'date' | 'profit' | 'symbol' | 'rr'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [stats, setStats] = useState<JournalStats | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
      return;
    }

    if (user && selectedAccount) {
      fetchTrades();
    }
  }, [user, isLoading, router, selectedAccount]);

  const calculateStats = (tradesData: Trade[]): JournalStats => {
    if (tradesData.length === 0) {
      return {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        totalProfit: 0,
        totalLoss: 0,
        netPnL: 0,
        avgRiskReward: 0,
        bestTrade: 0,
        worstTrade: 0,
        profitFactor: 0,
        avgWin: 0,
        avgLoss: 0,
        largestWinStreak: 0,
        largestLossStreak: 0,
        currentStreak: 0,
        streakType: 'none',
      };
    }

    const closedTrades = tradesData.filter(t => t.status === 'CLOSED');
    const winningTrades = closedTrades.filter(t => t.profitDollars > t.lossDollars);
    const losingTrades = closedTrades.filter(t => t.profitDollars < t.lossDollars);

    const totalProfit = winningTrades.reduce((sum, t) => sum + t.profitDollars, 0);
    const totalLoss = losingTrades.reduce((sum, t) => sum + t.lossDollars, 0);

    // Calculate streaks
    let currentStreak = 0;
    let streakType: 'win' | 'loss' | 'none' = 'none';
    let largestWinStreak = 0;
    let largestLossStreak = 0;
    let tempWinStreak = 0;
    let tempLossStreak = 0;

    const sortedClosedTrades = [...closedTrades].sort((a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    for (let i = 0; i < sortedClosedTrades.length; i++) {
      const trade = sortedClosedTrades[i];
      const isWin = trade.profitDollars > trade.lossDollars;

      if (isWin) {
        tempWinStreak++;
        tempLossStreak = 0;
        largestWinStreak = Math.max(largestWinStreak, tempWinStreak);
        if (i === sortedClosedTrades.length - 1) {
          currentStreak = tempWinStreak;
          streakType = 'win';
        }
      } else {
        tempLossStreak++;
        tempWinStreak = 0;
        largestLossStreak = Math.max(largestLossStreak, tempLossStreak);
        if (i === sortedClosedTrades.length - 1) {
          currentStreak = tempLossStreak;
          streakType = 'loss';
        }
      }
    }

    return {
      totalTrades: tradesData.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate: closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0,
      totalProfit,
      totalLoss,
      netPnL: totalProfit - totalLoss,
      avgRiskReward: tradesData.length > 0 ? tradesData.reduce((sum, t) => sum + t.riskRewardRatio, 0) / tradesData.length : 0,
      bestTrade: Math.max(...closedTrades.map(t => t.profitDollars - t.lossDollars), 0),
      worstTrade: Math.min(...closedTrades.map(t => t.profitDollars - t.lossDollars), 0),
      profitFactor: totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? Infinity : 0,
      avgWin: winningTrades.length > 0 ? totalProfit / winningTrades.length : 0,
      avgLoss: losingTrades.length > 0 ? totalLoss / losingTrades.length : 0,
      largestWinStreak,
      largestLossStreak,
      currentStreak,
      streakType,
    };
  };

  const fetchTrades = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      if (!selectedAccount) {
        setError('No account selected');
        return;
      }

      const url = `/api/trades?accountId=${selectedAccount.id}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTrades(data.trades);
        setStats(calculateStats(data.trades));
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch trades');
      }
    } catch (error) {
      setError('An error occurred while fetching trades');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (tradeId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      const response = await fetch(`/api/trades/${tradeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Update local state
        setTrades(prev => prev.map(trade =>
          trade.id === tradeId ? { ...trade, status: newStatus } : trade
        ));
        // Recalculate stats
        const updatedTrades = trades.map(trade =>
          trade.id === tradeId ? { ...trade, status: newStatus } : trade
        );
        setStats(calculateStats(updatedTrades));
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating trade status:', error);
    }
  };

  const handleTradeUpdate = async (tradeId: string, updateData: any) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      const response = await fetch(`/api/trades/${tradeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const result = await response.json();

        // Update local state with the updated trade
        setTrades(prev => prev.map(trade =>
          trade.id === tradeId ? { ...trade, ...result.trade } : trade
        ));

        // Show success message if balance was updated
        if (result.balanceUpdated) {
          const profitLoss = result.profitLoss;
          const message = updateData.status === 'WIN'
            ? `🏆 Trade marked as WIN! +$${Math.abs(profitLoss).toFixed(2)} added to account balance.`
            : updateData.status === 'LOSS'
            ? `📉 Trade marked as LOSS. -$${Math.abs(profitLoss).toFixed(2)} deducted from account balance.`
            : 'Trade updated successfully.';

          // You can replace this with a toast notification
          alert(message);
        }

        return result;
      } else {
        throw new Error('Failed to update trade');
      }
    } catch (error) {
      console.error('Error updating trade:', error);
      throw error;
    }
  };

  const handleTradeDelete = async (tradeId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      const response = await fetch(`/api/trades/${tradeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Update local state
        const updatedTrades = trades.filter(trade => trade.id !== tradeId);
        setTrades(updatedTrades);
        setStats(calculateStats(updatedTrades));
      } else {
        throw new Error('Failed to delete trade');
      }
    } catch (error) {
      console.error('Error deleting trade:', error);
    }
  };

  const filteredAndSortedTrades = trades
    .filter(trade => {
      const matchesFilter = filter === 'ALL' || trade.status === filter;
      const matchesSearch = trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           trade.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           trade.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'date':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'profit':
          aValue = a.profitDollars - a.lossDollars;
          bValue = b.profitDollars - b.lossDollars;
          break;
        case 'symbol':
          aValue = a.symbol;
          bValue = b.symbol;
          break;
        case 'rr':
          aValue = a.riskRewardRatio;
          bValue = b.riskRewardRatio;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNING': return 'bg-blue-100 text-blue-800';
      case 'OPEN': return 'bg-yellow-100 text-yellow-800';
      case 'WIN': return 'bg-green-100 text-green-800';
      case 'LOSS': return 'bg-red-100 text-red-800';
      // Legacy support
      case 'PLANNED': return 'bg-blue-100 text-blue-800';
      case 'ACTIVE': return 'bg-yellow-100 text-yellow-800';
      case 'CLOSED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDirectionColor = (direction: string) => {
    return direction === 'LONG'
      ? 'text-green-600'
      : 'text-red-600';
  };

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your trading journal...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                Trading Journal
              </h1>
              <p className="text-gray-600 mt-1">Track and analyze your trading performance</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Trades</p>
                <p className="text-2xl font-bold text-gray-900">{trades.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Page Content */}
        <div className="space-y-8">

          {/* Enhanced Performance Overview Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Net P&L */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  stats.netPnL >= 0
                    ? 'bg-green-100 text-green-600'
                    : 'bg-red-100 text-red-600'
                }`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stats.netPnL >= 0 ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"} />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  NET P&L
                </span>
              </div>
              <div className="space-y-2">
                <p className={`text-3xl font-bold ${stats.netPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${stats.netPnL >= 0 ? '+' : ''}${stats.netPnL.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">
                  {stats.totalTrades} trades • {stats.winningTrades}W / {stats.losingTrades}L
                </p>
              </div>
            </div>

            {/* Win Rate */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  WIN RATE
                </span>
              </div>
              <div className="space-y-3">
                <p className="text-3xl font-bold text-blue-600">
                  {stats.winRate.toFixed(1)}%
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min(stats.winRate, 100)}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">
                  {stats.winningTrades} wins • {stats.losingTrades} losses
                </p>
              </div>
            </div>

            {/* Profit Factor */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  PROFIT FACTOR
                </span>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-bold text-purple-600">
                  {stats.profitFactor === Infinity ? '∞' : stats.profitFactor.toFixed(2)}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Avg R:R {stats.avgRiskReward.toFixed(2)}
                  </p>
                  <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    stats.profitFactor >= 2 ? 'bg-green-100 text-green-700' :
                    stats.profitFactor >= 1.5 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {stats.profitFactor >= 2 ? 'Excellent' : stats.profitFactor >= 1.5 ? 'Good' : 'Poor'}
                  </div>
                </div>
              </div>
            </div>

            {/* Current Streak */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  stats.streakType === 'win' ? 'bg-green-100 text-green-600' :
                  stats.streakType === 'loss' ? 'bg-red-100 text-red-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  STREAK
                </span>
              </div>
              <div className="space-y-2">
                <p className={`text-3xl font-bold ${
                  stats.streakType === 'win' ? 'text-green-600' :
                  stats.streakType === 'loss' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {stats.currentStreak}
                  {stats.streakType === 'win' ? 'W' : stats.streakType === 'loss' ? 'L' : ''}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Best: {stats.largestWinStreak}W
                  </p>
                  <div className="flex space-x-1">
                    {[...Array(Math.min(stats.currentStreak, 5))].map((_, i) => (
                      <div key={i} className={`w-2 h-2 rounded-full ${
                        stats.streakType === 'win' ? 'bg-green-500' :
                        stats.streakType === 'loss' ? 'bg-red-500' : 'bg-gray-500'
                      }`}></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}

        {/* Enhanced Controls */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
              <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              Filters & Search
            </h2>
            <p className="text-gray-600">Filter and search through your trading history</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Search Trades
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by symbol, notes, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:bg-white placeholder-gray-500 transition-all duration-200"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Status
              </label>
              <div className="relative">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:bg-white transition-all duration-200 appearance-none cursor-pointer"
                >
                  <option value="ALL">All Trades</option>
                  <option value="PLANNING">Planning</option>
                  <option value="OPEN">Open</option>
                  <option value="WIN">Win</option>
                  <option value="LOSS">Loss</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Sort By
              </label>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:bg-white transition-all duration-200 appearance-none cursor-pointer"
                >
                  <option value="date">Date Created</option>
                  <option value="profit">Profit/Loss</option>
                  <option value="symbol">Symbol</option>
                  <option value="rr">Risk:Reward</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>


          </div>

          {/* Enhanced View Mode Toggle */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-10 pt-8 border-t-2 border-gray-200 gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <span className="text-lg font-bold text-gray-700">View Mode</span>
              </div>
              <div className="flex bg-gray-100 rounded-2xl p-2 shadow-lg backdrop-blur-sm">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center space-x-2 ${
                    viewMode === 'cards'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 scale-105'
                      : 'text-gray-600 hover:text-emerald-600 hover:bg-white/50'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z" />
                  </svg>
                  <span>Cards</span>
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center space-x-2 ${
                    viewMode === 'table'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 scale-105'
                      : 'text-gray-600 hover:text-emerald-600 hover:bg-white/50'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Table</span>
                </button>
                <button
                  onClick={() => setViewMode('analytics')}
                  className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center space-x-2 ${
                    viewMode === 'analytics'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 scale-105'
                      : 'text-gray-600 hover:text-emerald-600 hover:bg-white/50'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>Analytics</span>
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-gray-50 px-6 py-3 rounded-2xl shadow-lg backdrop-blur-sm">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-bold text-gray-700">
                Showing {filteredAndSortedTrades.length} of {trades.length} trades
              </span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Content Based on View Mode */}
        {viewMode === 'analytics' && stats ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Analytics View</h3>
            <p className="text-gray-600">Analytics view coming soon...</p>
          </div>
        ) : filteredAndSortedTrades.length === 0 ? (
          <div className="text-center py-24">
            <div className="relative mb-12">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl"></div>
              <div className="relative w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              No trades found
            </h3>
            <p className="text-xl text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
              {trades.length === 0
                ? "Start your trading journey by calculating and saving your first trade"
                : "Try adjusting your search terms or filters to find your trades"
              }
            </p>
            {trades.length === 0 && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push('/')}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-2xl transition-all duration-200 font-bold shadow-lg hover:shadow-xl hover:scale-105 flex items-center space-x-3"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span>Go to Calculator</span>
                </button>
                <button
                  onClick={() => router.push('/add-trade')}
                  className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl transition-all duration-200 font-bold shadow-lg hover:shadow-xl hover:scale-105 flex items-center space-x-3"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add Trade</span>
                </button>
              </div>
            )}
          </div>
        ) : viewMode === 'cards' ? (
          <CardsView
            trades={filteredAndSortedTrades}
            onTradeClick={setSelectedTrade}
            onStatusUpdate={handleStatusUpdate}
            onTradeUpdate={handleTradeUpdate}
            onTradeDelete={handleTradeDelete}
            onOpenUpdateModal={setUpdateModalTrade}
          />
        ) : (
          <TableView
            trades={filteredAndSortedTrades}
            onTradeClick={setSelectedTrade}
            onStatusUpdate={handleStatusUpdate}
            onTradeUpdate={handleTradeUpdate}
            onTradeDelete={handleTradeDelete}
            onOpenUpdateModal={setUpdateModalTrade}
          />
        )}

        {/* Trade Detail Modal */}
        {selectedTrade && (
          <TradeDetailModal
            trade={selectedTrade}
            onClose={() => setSelectedTrade(null)}
          />
        )}

        {/* Update Trade Modal */}
        {updateModalTrade && (
          <UpdateTradeModal
            trade={updateModalTrade}
            isOpen={!!updateModalTrade}
            onClose={() => setUpdateModalTrade(null)}
            onUpdate={handleTradeUpdate}
          />
        )}
        </div>
      </div>
    </div>
  );
}

// Cards View Component
function CardsView({
  trades,
  onTradeClick,
  onStatusUpdate,
  onTradeUpdate,
  onTradeDelete,
  onOpenUpdateModal
}: {
  trades: Trade[],
  onTradeClick: (trade: Trade) => void,
  onStatusUpdate: (tradeId: string, newStatus: string) => void,
  onTradeUpdate: (tradeId: string, updateData: any) => void,
  onTradeDelete: (tradeId: string) => void,
  onOpenUpdateModal: (trade: Trade) => void
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNING': return 'bg-blue-100 text-blue-800';
      case 'OPEN': return 'bg-yellow-100 text-yellow-800';
      case 'WIN': return 'bg-green-100 text-green-800';
      case 'LOSS': return 'bg-red-100 text-red-800';
      // Legacy support
      case 'PLANNED': return 'bg-blue-100 text-blue-800';
      case 'ACTIVE': return 'bg-yellow-100 text-yellow-800';
      case 'CLOSED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDirectionColor = (direction: string) => {
    return direction === 'LONG'
      ? 'text-green-600'
      : 'text-red-600';
  };

  const getPnLColor = (trade: Trade) => {
    const pnl = trade.profitDollars - trade.lossDollars;
    return pnl >= 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
      {trades.map((trade) => (
        <div
          key={trade.id}
          onClick={() => onTradeClick(trade)}
          className="group relative bg-white rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer overflow-visible"
        >
          {/* Background Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-transparent to-teal-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          {/* Content */}
          <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 transition-all duration-300">
                  <span className="text-white font-bold text-xl">
                    {trade.symbol.split('/')[0].charAt(0)}
                  </span>
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {trade.category.charAt(0)}
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors duration-300">
                  {trade.symbol}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm font-medium text-gray-500">
                    {trade.category}
                  </span>
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <span className="text-xs text-gray-400">
                    {new Date(trade.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div onClick={(e) => e.stopPropagation()}>
              <TradeStatusManager
                trade={trade}
                onStatusUpdate={onStatusUpdate}
                onTradeUpdate={onTradeUpdate}
                onTradeDelete={onTradeDelete}
                onOpenUpdateModal={onOpenUpdateModal}
              />
            </div>
          </div>

          {/* Trade Direction & P&L */}
          <div className="bg-gray-50 rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`px-4 py-2 rounded-xl text-sm font-bold shadow-lg ${
                  trade.tradeDirection === 'LONG'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                    : 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
                }`}>
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {trade.tradeDirection === 'LONG' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                      )}
                    </svg>
                    <span>{trade.tradeDirection}</span>
                  </div>
                </div>
                <div className="px-3 py-2 bg-blue-100 rounded-xl">
                  <span className="text-sm font-semibold text-blue-700">
                    R:R 1:{trade.riskRewardRatio.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold ${getPnLColor(trade)}`}>
                  ${(trade.profitDollars - trade.lossDollars >= 0 ? '+' : '')}
                  {(trade.profitDollars - trade.lossDollars).toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 font-medium">
                  Potential P&L
                </p>
              </div>
            </div>
          </div>

          {/* Price Levels */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 group-hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-center mb-2">
                <div className="w-8 h-8 bg-gray-500/10 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Entry</p>
              <p className="font-bold text-gray-900 text-lg">
                {trade.entryPrice}
              </p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl border border-green-200 group-hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-center mb-2">
                <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                </div>
              </div>
              <p className="text-xs font-semibold text-green-600 mb-2 uppercase tracking-wider">Target</p>
              <p className="font-bold text-green-700 text-lg">
                {trade.exitPrice}
              </p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-red-50 to-rose-100 rounded-2xl border border-red-200 group-hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-center mb-2">
                <div className="w-8 h-8 bg-red-500/10 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                  </svg>
                </div>
              </div>
              <p className="text-xs font-semibold text-red-600 mb-2 uppercase tracking-wider">Stop</p>
              <p className="font-bold text-red-700 text-lg">
                {trade.stopLoss}
              </p>
            </div>
          </div>

          {/* Tags */}
          {trade.tags.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">Tags</p>
              <div className="flex flex-wrap gap-2">
                {trade.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-200"
                  >
                    #{tag}
                  </span>
                ))}
                {trade.tags.length > 3 && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold border border-gray-200">
                    +{trade.tags.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Strategy Information */}
          {trade.strategy && (
            <div className="mb-6">
              <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">Strategy</p>
              <div className="flex items-center p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
                <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{trade.strategy.name}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-md text-xs font-medium">
                      {trade.strategy.marketType}
                    </span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-medium">
                      {trade.strategy.timeframe}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-medium">{new Date(trade.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-emerald-600 group-hover:text-emerald-700 transition-colors font-medium">
              <span>View Details</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Table View Component
function TableView({
  trades,
  onTradeClick,
  onStatusUpdate,
  onTradeUpdate,
  onTradeDelete,
  onOpenUpdateModal
}: {
  trades: Trade[],
  onTradeClick: (trade: Trade) => void,
  onStatusUpdate: (tradeId: string, newStatus: string) => void,
  onTradeUpdate: (tradeId: string, updateData: any) => void,
  onTradeDelete: (tradeId: string) => void,
  onOpenUpdateModal: (trade: Trade) => void
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNING': return 'bg-blue-100 text-blue-800';
      case 'OPEN': return 'bg-yellow-100 text-yellow-800';
      case 'WIN': return 'bg-green-100 text-green-800';
      case 'LOSS': return 'bg-red-100 text-red-800';
      // Legacy support
      case 'PLANNED': return 'bg-blue-100 text-blue-800';
      case 'ACTIVE': return 'bg-yellow-100 text-yellow-800';
      case 'CLOSED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDirectionColor = (direction: string) => {
    return direction === 'LONG'
      ? 'text-green-600'
      : 'text-red-600';
  };

  const getPnLColor = (trade: Trade) => {
    const pnl = trade.profitDollars - trade.lossDollars;
    return pnl >= 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto overflow-y-visible">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-emerald-50 to-teal-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Symbol
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Strategy
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Direction
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Entry
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Target
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Stop Loss
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                R:R
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                P&L
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {trades.map((trade) => (
              <tr
                key={trade.id}
                onClick={() => onTradeClick(trade)}
                className="hover:bg-emerald-50 cursor-pointer transition-colors duration-200"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white font-bold text-sm">
                        {trade.symbol.split('/')[0].charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        {trade.symbol}
                      </div>
                      <div className="text-xs text-gray-500">
                        {trade.category}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {trade.strategy ? (
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-indigo-500 rounded-lg flex items-center justify-center mr-2">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {trade.strategy.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {trade.strategy.timeframe}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 italic">No strategy</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-lg ${getDirectionColor(trade.tradeDirection)} bg-gray-100`}>
                    {trade.tradeDirection}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {trade.entryPrice}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                  {trade.exitPrice}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                  {trade.stopLoss}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  1:{trade.riskRewardRatio.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm font-bold ${getPnLColor(trade)}`}>
                    ${(trade.profitDollars - trade.lossDollars >= 0 ? '+' : '')}
                    {(trade.profitDollars - trade.lossDollars).toFixed(2)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap w-32 relative" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-start">
                    <TradeStatusManager
                      trade={trade}
                      onStatusUpdate={onStatusUpdate}
                      onTradeUpdate={onTradeUpdate}
                      onTradeDelete={onTradeDelete}
                      onOpenUpdateModal={onOpenUpdateModal}
                    />
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(trade.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Analytics View Component
function AnalyticsView({ stats, trades }: { stats: JournalStats, trades: Trade[] }) {
  const categoryBreakdown = trades.reduce((acc, trade) => {
    acc[trade.category] = (acc[trade.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const monthlyBreakdown = trades.reduce((acc, trade) => {
    const month = new Date(trade.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-8">
      {/* Detailed Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Advanced Metrics */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            Advanced Metrics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Best Trade:</span>
              <span className="font-bold text-green-600">
                ${stats.bestTrade.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Worst Trade:</span>
              <span className="font-bold text-red-600">
                ${stats.worstTrade.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Avg Win:</span>
              <span className="font-bold text-green-600">
                ${stats.avgWin.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Avg Loss:</span>
              <span className="font-bold text-red-600">
                ${stats.avgLoss.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Largest Win Streak:</span>
              <span className="font-bold text-emerald-600">
                {stats.largestWinStreak}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Largest Loss Streak:</span>
              <span className="font-bold text-red-600">
                {stats.largestLossStreak}
              </span>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
            </div>
            By Category
          </h3>
          <div className="space-y-3">
            {Object.entries(categoryBreakdown).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-gray-600">{category}:</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                      style={{ width: `${(count / stats.totalTrades) * 100}%` }}
                    ></div>
                  </div>
                  <span className="font-semibold text-gray-900 text-sm">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Activity */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            Monthly Activity
          </h3>
          <div className="space-y-3">
            {Object.entries(monthlyBreakdown).slice(-6).map(([month, count]) => (
              <div key={month} className="flex items-center justify-between">
                <span className="text-gray-600">{month}:</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                      style={{ width: `${(count / Math.max(...Object.values(monthlyBreakdown))) * 100}%` }}
                    ></div>
                  </div>
                  <span className="font-semibold text-gray-900 text-sm">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50 p-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mr-4">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          Performance Insights
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Win Rate Analysis */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Win Rate Analysis</h4>
            <div className="relative">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-4">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-4 rounded-full flex items-center justify-center"
                  style={{ width: `${stats.winRate}%` }}
                >
                  <span className="text-white text-xs font-bold">
                    {stats.winRate.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {stats.winRate >= 60 ? '🎯 Excellent win rate! You\'re consistently profitable.' :
                 stats.winRate >= 50 ? '✅ Good win rate. Focus on improving risk management.' :
                 stats.winRate >= 40 ? '⚠️ Below average win rate. Review your strategy.' :
                 '🚨 Low win rate. Consider strategy adjustment.'}
              </p>
            </div>
          </div>

          {/* Risk Management */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Risk Management</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <span className="text-gray-600 dark:text-gray-400">Avg Risk:Reward:</span>
                <span className={`font-bold ${stats.avgRiskReward >= 2 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                  1:{stats.avgRiskReward.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <span className="text-gray-600 dark:text-gray-400">Profit Factor:</span>
                <span className={`font-bold ${stats.profitFactor >= 1.5 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {stats.profitFactor === Infinity ? '∞' : stats.profitFactor.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {stats.avgRiskReward >= 2 ? '🎯 Excellent risk management! Keep it up.' :
                 stats.avgRiskReward >= 1.5 ? '✅ Good risk:reward ratio.' :
                 '⚠️ Consider improving your risk:reward ratio.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

