'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../components/Header';
import { useAuth } from '../components/AuthProvider';
import { useAccount } from '../components/AccountProvider';

interface Trade {
  id: string;
  symbol: string;
  status: string;
  tradeDirection: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice: number;
  stopLoss: number;
  profitDollars: number;
  lossDollars: number;
  riskRewardRatio: number;
  createdAt: string;
  category: string;
  tags: string[];
  accountId: string;
}

interface DashboardStats {
  totalTrades: number;
  planningTrades: number;
  openTrades: number;
  winTrades: number;
  lossTrades: number;
  netPnL: number;
  totalProfit: number;
  totalLoss: number;
  winRate: number;
  profitFactor: number;
  avgRiskReward: number;
  totalRisk: number;
  totalReward: number;
  bestTrade: number;
  worstTrade: number;
  avgWin: number;
  avgLoss: number;
  currentStreak: number;
  streakType: 'win' | 'loss' | 'none';
  largestWinStreak: number;
  largestLossStreak: number;
  tradingDays: number;
  avgTradesPerDay: number;
  monthlyPnL: { month: string; pnl: number }[];
  symbolBreakdown: { symbol: string; trades: number; pnl: number }[];
  directionBreakdown: { long: number; short: number; longPnL: number; shortPnL: number };
}

export default function Dashboard() {
  const { user, logout, isLoading } = useAuth();
  const { selectedAccount } = useAccount();
  const router = useRouter();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalTrades: 0,
    planningTrades: 0,
    openTrades: 0,
    winTrades: 0,
    lossTrades: 0,
    netPnL: 0,
    totalProfit: 0,
    totalLoss: 0,
    winRate: 0,
    profitFactor: 0,
    avgRiskReward: 0,
    totalRisk: 0,
    totalReward: 0,
    bestTrade: 0,
    worstTrade: 0,
    avgWin: 0,
    avgLoss: 0,
    currentStreak: 0,
    streakType: 'none',
    largestWinStreak: 0,
    largestLossStreak: 0,
    tradingDays: 0,
    avgTradesPerDay: 0,
    monthlyPnL: [],
    symbolBreakdown: [],
    directionBreakdown: { long: 0, short: 0, longPnL: 0, shortPnL: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
      return;
    }

    if (user && selectedAccount) {
      fetchStats();
    }
  }, [user, isLoading, router, selectedAccount]);

  const calculateStats = (tradesData: Trade[]): DashboardStats => {
    const totalTrades = tradesData.length;

    // Status breakdown
    const planningTrades = tradesData.filter(t => t.status === 'PLANNING' || t.status === 'PLANNED').length;
    const openTrades = tradesData.filter(t => t.status === 'OPEN' || t.status === 'ACTIVE').length;
    const winTrades = tradesData.filter(t => t.status === 'WIN').length;
    const lossTrades = tradesData.filter(t => t.status === 'LOSS').length;
    const closedTrades = winTrades + lossTrades;

    // P&L calculations
    const winTradesData = tradesData.filter(t => t.status === 'WIN');
    const lossTradesData = tradesData.filter(t => t.status === 'LOSS');

    const totalProfit = winTradesData.reduce((sum, t) => sum + (t.profitDollars || 0), 0);
    const totalLoss = lossTradesData.reduce((sum, t) => sum + (t.lossDollars || 0), 0);
    const netPnL = totalProfit - totalLoss;

    // Performance metrics
    const winRate = closedTrades > 0 ? (winTrades / closedTrades) * 100 : 0;
    const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? 999 : 0;
    const avgWin = winTrades > 0 ? totalProfit / winTrades : 0;
    const avgLoss = lossTrades > 0 ? totalLoss / lossTrades : 0;

    // Best and worst trades
    const bestTrade = winTradesData.length > 0 ? Math.max(...winTradesData.map(t => t.profitDollars || 0)) : 0;
    const worstTrade = lossTradesData.length > 0 ? Math.max(...lossTradesData.map(t => t.lossDollars || 0)) : 0;

    // Risk/Reward
    const totalRisk = tradesData.reduce((sum, t) => sum + (t.lossDollars || 0), 0);
    const totalReward = tradesData.reduce((sum, t) => sum + (t.profitDollars || 0), 0);
    const avgRiskReward = tradesData.length > 0
      ? tradesData.reduce((sum, t) => sum + (t.riskRewardRatio || 0), 0) / tradesData.length
      : 0;

    // Calculate streaks
    const closedTradesChronological = tradesData
      .filter(t => t.status === 'WIN' || t.status === 'LOSS')
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    let currentStreak = 0;
    let streakType: 'win' | 'loss' | 'none' = 'none';
    let largestWinStreak = 0;
    let largestLossStreak = 0;
    let tempWinStreak = 0;
    let tempLossStreak = 0;

    for (let i = closedTradesChronological.length - 1; i >= 0; i--) {
      const trade = closedTradesChronological[i];
      if (i === closedTradesChronological.length - 1) {
        // Start with the most recent trade
        currentStreak = 1;
        streakType = trade.status === 'WIN' ? 'win' : 'loss';
      } else {
        const prevTrade = closedTradesChronological[i + 1];
        if (trade.status === prevTrade.status) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // Calculate largest streaks
    let currentWinStreak = 0;
    let currentLossStreak = 0;

    closedTradesChronological.forEach(trade => {
      if (trade.status === 'WIN') {
        currentWinStreak++;
        currentLossStreak = 0;
        largestWinStreak = Math.max(largestWinStreak, currentWinStreak);
      } else {
        currentLossStreak++;
        currentWinStreak = 0;
        largestLossStreak = Math.max(largestLossStreak, currentLossStreak);
      }
    });

    // Trading frequency
    const tradingDates = [...new Set(tradesData.map(t => new Date(t.createdAt).toDateString()))];
    const tradingDays = tradingDates.length;
    const avgTradesPerDay = tradingDays > 0 ? totalTrades / tradingDays : 0;

    // Monthly P&L
    const monthlyPnL = calculateMonthlyPnL(tradesData);

    // Symbol breakdown
    const symbolBreakdown = calculateSymbolBreakdown(tradesData);

    // Direction breakdown
    const directionBreakdown = calculateDirectionBreakdown(tradesData);

    return {
      totalTrades,
      planningTrades,
      openTrades,
      winTrades,
      lossTrades,
      netPnL,
      totalProfit,
      totalLoss,
      winRate,
      profitFactor,
      avgRiskReward,
      totalRisk,
      totalReward,
      bestTrade,
      worstTrade,
      avgWin,
      avgLoss,
      currentStreak,
      streakType,
      largestWinStreak,
      largestLossStreak,
      tradingDays,
      avgTradesPerDay,
      monthlyPnL,
      symbolBreakdown,
      directionBreakdown,
    };
  };

  const calculateMonthlyPnL = (tradesData: Trade[]) => {
    const monthlyData: { [key: string]: number } = {};

    tradesData.filter(t => t.status === 'WIN' || t.status === 'LOSS').forEach(trade => {
      const date = new Date(trade.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = 0;
      }

      if (trade.status === 'WIN') {
        monthlyData[monthKey] += trade.profitDollars || 0;
      } else {
        monthlyData[monthKey] -= trade.lossDollars || 0;
      }
    });

    return Object.entries(monthlyData)
      .map(([month, pnl]) => ({ month, pnl }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6); // Last 6 months
  };

  const calculateSymbolBreakdown = (tradesData: Trade[]) => {
    const symbolData: { [key: string]: { trades: number; pnl: number } } = {};

    tradesData.forEach(trade => {
      if (!symbolData[trade.symbol]) {
        symbolData[trade.symbol] = { trades: 0, pnl: 0 };
      }

      symbolData[trade.symbol].trades++;

      if (trade.status === 'WIN') {
        symbolData[trade.symbol].pnl += trade.profitDollars || 0;
      } else if (trade.status === 'LOSS') {
        symbolData[trade.symbol].pnl -= trade.lossDollars || 0;
      }
    });

    return Object.entries(symbolData)
      .map(([symbol, data]) => ({ symbol, trades: data.trades, pnl: data.pnl }))
      .sort((a, b) => b.trades - a.trades)
      .slice(0, 10); // Top 10 symbols
  };

  const calculateDirectionBreakdown = (tradesData: Trade[]) => {
    const longTrades = tradesData.filter(t => t.tradeDirection === 'LONG');
    const shortTrades = tradesData.filter(t => t.tradeDirection === 'SHORT');

    const longPnL = longTrades.reduce((sum, t) => {
      if (t.status === 'WIN') return sum + (t.profitDollars || 0);
      if (t.status === 'LOSS') return sum - (t.lossDollars || 0);
      return sum;
    }, 0);

    const shortPnL = shortTrades.reduce((sum, t) => {
      if (t.status === 'WIN') return sum + (t.profitDollars || 0);
      if (t.status === 'LOSS') return sum - (t.lossDollars || 0);
      return sum;
    }, 0);

    return {
      long: longTrades.length,
      short: shortTrades.length,
      longPnL,
      shortPnL,
    };
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !selectedAccount) return;

      const response = await fetch(`/api/trades?accountId=${selectedAccount.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const tradesData = data.trades;

        setTrades(tradesData);
        const calculatedStats = calculateStats(tradesData);
        setStats(calculatedStats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
        {/* Stunning Header Section */}
        <div className="text-center mb-12">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl shadow-2xl shadow-blue-500/30 transform hover:scale-105 transition-all duration-300">
              <div className="absolute inset-2 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl opacity-50"></div>
              <svg className="relative w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>

          <div className="space-y-6">
            <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent leading-tight">
              Trading
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Dashboard
              </span>
            </h1>

            {selectedAccount && (
              <div className="mb-6">
                <div className="inline-flex items-center space-x-4 px-8 py-4 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">
                      {selectedAccount.name}
                    </p>
                    <p className="text-sm text-blue-200">
                      ${selectedAccount.currentBalance.toLocaleString()} balance
                    </p>
                  </div>
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              </div>
            )}

            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Advanced analytics and insights for
              <span className="text-blue-400 font-semibold"> {user.name}'s </span>
              trading performance
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/add-trade" className="group flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl transition-all duration-300 font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105">
              <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Add New Trade</span>
            </Link>
            <Link href="/journal" className="group flex items-center space-x-3 px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all duration-300 font-semibold border border-white/20 hover:border-white/30 backdrop-blur-xl">
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>View Journal</span>
            </Link>
          </div>
        </div>

        {/* Stunning Key Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Net P&L Card */}
          <div className="group relative bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 hover:bg-white/15 transition-all duration-300 hover:scale-105 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-white/70 uppercase tracking-wider">Net P&L</h3>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                  stats.netPnL >= 0
                    ? 'bg-gradient-to-br from-green-500 to-emerald-500'
                    : 'bg-gradient-to-br from-red-500 to-pink-500'
                }`}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                      stats.netPnL >= 0
                        ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                        : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                    } />
                  </svg>
                </div>
              </div>
              <p className={`text-4xl font-black mb-3 ${
                stats.netPnL >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {stats.netPnL >= 0 ? '+' : ''}${stats.netPnL.toFixed(2)}
              </p>
              <p className="text-sm text-white/60">Total profit/loss</p>
              <div className={`mt-4 px-3 py-1 rounded-xl text-xs font-medium ${
                stats.netPnL >= 0
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                  : 'bg-red-500/20 text-red-300 border border-red-500/30'
              }`}>
                {stats.netPnL >= 0 ? '📈 Profitable' : '📉 Loss'}
              </div>
            </div>
          </div>

          {/* Win Rate Card */}
          <div className="group relative bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 hover:bg-white/15 transition-all duration-300 hover:scale-105 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-white/70 uppercase tracking-wider">Win Rate</h3>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-4xl font-black text-blue-400 mb-3">{stats.winRate.toFixed(1)}%</p>
              <p className="text-sm text-white/60">{stats.winTrades}W / {stats.lossTrades}L</p>
              <div className="mt-4 w-full bg-white/10 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(stats.winRate, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Profit Factor Card */}
          <div className="group relative bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 hover:bg-white/15 transition-all duration-300 hover:scale-105 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-white/70 uppercase tracking-wider">Profit Factor</h3>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <p className="text-4xl font-black text-purple-400 mb-3">
                {stats.profitFactor === 999 ? '∞' : stats.profitFactor.toFixed(2)}
              </p>
              <p className="text-sm text-white/60">Profit/Loss ratio</p>
              <div className={`mt-4 px-3 py-1 rounded-xl text-xs font-medium ${
                stats.profitFactor >= 2
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                  : stats.profitFactor >= 1.5
                  ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                  : 'bg-red-500/20 text-red-300 border border-red-500/30'
              }`}>
                {stats.profitFactor >= 2 ? '🚀 Excellent' : stats.profitFactor >= 1.5 ? '👍 Good' : '⚠️ Needs Work'}
              </div>
            </div>
          </div>

          {/* Total Trades Card */}
          <div className="group relative bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 hover:bg-white/15 transition-all duration-300 hover:scale-105 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-white/70 uppercase tracking-wider">Total Trades</h3>
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <p className="text-4xl font-black text-indigo-400 mb-3">{stats.totalTrades}</p>
              <p className="text-sm text-white/60">All time</p>
              <div className="mt-4 flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-white/60">Active trading</span>
              </div>
            </div>
          </div>
        </div>

        {/* Beautiful Trade Status Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {/* Planning Trades */}
          <div className="group relative bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="font-bold text-white">Planning</h3>
            </div>
            <p className="text-3xl font-black text-blue-400 mb-2">{stats.planningTrades}</p>
            <p className="text-xs text-white/60">Ideas & setups</p>
          </div>

          {/* Open Trades */}
          <div className="group relative bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="font-bold text-white">Open</h3>
            </div>
            <p className="text-3xl font-black text-yellow-400 mb-2">{stats.openTrades}</p>
            <p className="text-xs text-white/60">Active positions</p>
          </div>

          {/* Winning Trades */}
          <div className="group relative bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-white">Wins</h3>
            </div>
            <p className="text-3xl font-black text-green-400 mb-2">{stats.winTrades}</p>
            <p className="text-xs text-white/60">Profitable trades</p>
          </div>

          {/* Losing Trades */}
          <div className="group relative bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              </div>
              <h3 className="font-bold text-white">Losses</h3>
            </div>
            <p className="text-3xl font-black text-red-400 mb-2">{stats.lossTrades}</p>
            <p className="text-xs text-white/60">Learning experiences</p>
          </div>
        </div>

        {/* Recent Trades & Quick Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Recent Trades */}
          <div className="lg:col-span-2 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-white flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                Recent Trades
              </h3>
              <Link href="/journal" className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-200 text-sm font-medium border border-white/20">
                View All
              </Link>
            </div>

            <div className="space-y-4">
              {trades.slice(0, 5).map((trade, index) => (
                <div key={trade.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-200">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      trade.status === 'WIN' ? 'bg-green-500/20 border border-green-500/30' :
                      trade.status === 'LOSS' ? 'bg-red-500/20 border border-red-500/30' :
                      trade.status === 'OPEN' ? 'bg-yellow-500/20 border border-yellow-500/30' :
                      'bg-blue-500/20 border border-blue-500/30'
                    }`}>
                      <span className="text-sm font-bold text-white">
                        {trade.symbol.substring(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-white">{trade.symbol}</p>
                      <p className="text-sm text-white/60">{trade.tradeDirection}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      trade.status === 'WIN' ? 'text-green-400' :
                      trade.status === 'LOSS' ? 'text-red-400' :
                      'text-white'
                    }`}>
                      {trade.status === 'WIN' ? `+$${trade.profitDollars?.toFixed(2)}` :
                       trade.status === 'LOSS' ? `-$${trade.lossDollars?.toFixed(2)}` :
                       trade.status}
                    </p>
                    <p className="text-xs text-white/60">
                      {new Date(trade.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}

              {trades.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <p className="text-white/60 mb-4">No trades yet</p>
                  <Link href="/add-trade" className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:scale-105 transition-all duration-200">
                    Add Your First Trade
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Performance Insights */}
          <div className="space-y-6">
            {/* Current Streak */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
              <h4 className="text-lg font-bold text-white mb-4 flex items-center">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center mr-3 ${
                  stats.streakType === 'win' ? 'bg-green-500/20 border border-green-500/30' :
                  stats.streakType === 'loss' ? 'bg-red-500/20 border border-red-500/30' :
                  'bg-gray-500/20 border border-gray-500/30'
                }`}>
                  <span className="text-sm">
                    {stats.streakType === 'win' ? '🔥' : stats.streakType === 'loss' ? '❄️' : '➖'}
                  </span>
                </div>
                Current Streak
              </h4>
              <p className={`text-2xl font-bold mb-2 ${
                stats.streakType === 'win' ? 'text-green-400' :
                stats.streakType === 'loss' ? 'text-red-400' :
                'text-white'
              }`}>
                {stats.currentStreak} {stats.streakType === 'win' ? 'Wins' : stats.streakType === 'loss' ? 'Losses' : 'No streak'}
              </p>
              <p className="text-sm text-white/60">
                Best: {stats.largestWinStreak} wins
              </p>
            </div>

            {/* Best Trade */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
              <h4 className="text-lg font-bold text-white mb-4 flex items-center">
                <div className="w-8 h-8 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center justify-center mr-3">
                  <span className="text-sm">🏆</span>
                </div>
                Best Trade
              </h4>
              <p className="text-2xl font-bold text-green-400 mb-2">
                +${stats.bestTrade.toFixed(2)}
              </p>
              <p className="text-sm text-white/60">Single trade profit</p>
            </div>

            {/* Average Win */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
              <h4 className="text-lg font-bold text-white mb-4 flex items-center">
                <div className="w-8 h-8 bg-blue-500/20 border border-blue-500/30 rounded-xl flex items-center justify-center mr-3">
                  <span className="text-sm">📊</span>
                </div>
                Average Win
              </h4>
              <p className="text-2xl font-bold text-blue-400 mb-2">
                ${stats.avgWin.toFixed(2)}
              </p>
              <p className="text-sm text-white/60">Per winning trade</p>
            </div>
          </div>
        </div>

        {/* Advanced Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Performance Metrics */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Performance Metrics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <span className="text-gray-700 dark:text-gray-300">Best Trade</span>
                <span className="font-bold text-green-600 dark:text-green-400">+${stats.bestTrade.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <span className="text-gray-700 dark:text-gray-300">Worst Trade</span>
                <span className="font-bold text-red-600 dark:text-red-400">-${stats.worstTrade.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <span className="text-gray-700 dark:text-gray-300">Average Win</span>
                <span className="font-bold text-green-600 dark:text-green-400">${stats.avgWin.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <span className="text-gray-700 dark:text-gray-300">Average Loss</span>
                <span className="font-bold text-red-600 dark:text-red-400">${stats.avgLoss.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <span className="text-gray-700 dark:text-gray-300">Avg R:R Ratio</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">1:{stats.avgRiskReward.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Streak Analysis */}
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 dark:border-gray-700/30 p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Streak Analysis
            </h3>
            <div className="space-y-4">
              <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Streak</p>
                <p className={`text-2xl font-bold ${
                  stats.streakType === 'win' ? 'text-green-600 dark:text-green-400' :
                  stats.streakType === 'loss' ? 'text-red-600 dark:text-red-400' :
                  'text-gray-600 dark:text-gray-400'
                }`}>
                  {stats.currentStreak} {stats.streakType === 'win' ? 'Wins' : stats.streakType === 'loss' ? 'Losses' : 'No Streak'}
                </p>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <span className="text-gray-700 dark:text-gray-300">Largest Win Streak</span>
                <span className="font-bold text-green-600 dark:text-green-400">{stats.largestWinStreak}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <span className="text-gray-700 dark:text-gray-300">Largest Loss Streak</span>
                <span className="font-bold text-red-600 dark:text-red-400">{stats.largestLossStreak}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <span className="text-gray-700 dark:text-gray-300">Trading Days</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{stats.tradingDays}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <span className="text-gray-700 dark:text-gray-300">Avg Trades/Day</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{stats.avgTradesPerDay.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Symbol & Direction Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Trading Symbols */}
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 dark:border-gray-700/30 p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
              Top Trading Symbols
            </h3>
            <div className="space-y-3">
              {stats.symbolBreakdown.slice(0, 5).map((symbol, index) => (
                <div key={symbol.symbol} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">{symbol.symbol}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-white">{symbol.trades} trades</p>
                    <p className={`text-sm font-semibold ${
                      symbol.pnl >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {symbol.pnl >= 0 ? '+' : ''}${symbol.pnl.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
              {stats.symbolBreakdown.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">No trading data available</p>
              )}
            </div>
          </div>

          {/* Long vs Short Analysis */}
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 dark:border-gray-700/30 p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              Long vs Short Analysis
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Long Trades</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.directionBreakdown.long}</p>
                  <p className={`text-sm font-semibold mt-1 ${
                    stats.directionBreakdown.longPnL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {stats.directionBreakdown.longPnL >= 0 ? '+' : ''}${stats.directionBreakdown.longPnL.toFixed(2)}
                  </p>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Short Trades</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.directionBreakdown.short}</p>
                  <p className={`text-sm font-semibold mt-1 ${
                    stats.directionBreakdown.shortPnL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {stats.directionBreakdown.shortPnL >= 0 ? '+' : ''}${stats.directionBreakdown.shortPnL.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 dark:text-gray-300">Long Preference</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {stats.directionBreakdown.long + stats.directionBreakdown.short > 0
                      ? ((stats.directionBreakdown.long / (stats.directionBreakdown.long + stats.directionBreakdown.short)) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${stats.directionBreakdown.long + stats.directionBreakdown.short > 0
                        ? (stats.directionBreakdown.long / (stats.directionBreakdown.long + stats.directionBreakdown.short)) * 100
                        : 0}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 dark:border-gray-700/30 p-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/add-trade"
              className="flex items-center space-x-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 transition-all duration-200 border border-blue-200/50 dark:border-blue-700/50 group"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Add Trade</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Create a new trade entry</p>
              </div>
            </Link>

            <Link
              href="/journal"
              className="flex items-center space-x-4 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 transition-all duration-200 border border-green-200/50 dark:border-green-700/50 group"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Trade Journal</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">View and manage trades</p>
              </div>
            </Link>

            <div className="flex items-center space-x-4 p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200/50 dark:border-purple-700/50">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Analytics</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">You're viewing them now!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
