'use client';

import React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/AuthProvider';
import { useAccount } from '../../components/AccountProvider';
import { DashboardSkeleton } from '../../components/SimpleLoading';

interface Trade {
  id: string;
  symbol: string;
  status: string;
  tradeDirection: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice: number;
  stopLoss: number;
  takeProfit?: number;
  profitDollars: number;
  lossDollars: number;
  riskRewardRatio: number;
  positionSize?: number;
  riskAmount?: number;
  createdAt: string;
  category: string;
  tags: string[];
  accountId: string;
  context: 'main' | 'am-trader'; // Add context field
}

interface DashboardStats {
  totalTrades: number;
  winTrades: number;
  lossTrades: number;
  netPnL: number;
  totalProfit: number;
  totalLoss: number;
  winRate: number;
  profitFactor: number;
  bestTrade: number;
  worstTrade: number;
  avgWin: number;
  avgLoss: number;
}

export default function AMTraderDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { selectedAccount } = useAccount();
  const router = useRouter();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch trades for AM Trader dashboard only
  const fetchAMTraderTrades = useCallback(async () => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      if (!token || !selectedAccount) return;

      const response = await fetch(`/api/trades?accountId=${selectedAccount.id}&context=am-trader`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Filter only AM Trader dashboard trades
        const amTraderTrades = data.trades.filter((trade: Trade) => 
          trade.context === 'am-trader'
        );
        setTrades(amTraderTrades);
      } else {
        throw new Error(`Failed to fetch trades: ${response.status}`);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load AM Trader dashboard data');
      console.error('Failed to fetch AM Trader stats:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedAccount]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
      return;
    }

    if (user && selectedAccount) {
      fetchAMTraderTrades();
    }
  }, [user, authLoading, selectedAccount, fetchAMTraderTrades]);

  // Calculate AM Trader dashboard stats
  const stats = useMemo((): DashboardStats => {
    if (!trades || !Array.isArray(trades)) {
      return {
        totalTrades: 0,
        winTrades: 0,
        lossTrades: 0,
        netPnL: 0,
        totalProfit: 0,
        totalLoss: 0,
        winRate: 0,
        profitFactor: 0,
        bestTrade: 0,
        worstTrade: 0,
        avgWin: 0,
        avgLoss: 0,
      };
    }

    const totalTrades = trades.length;
    const winTrades = trades.filter(t => t.status === 'WIN').length;
    const lossTrades = trades.filter(t => t.status === 'LOSS').length;

    const winTradesData = trades.filter(t => t.status === 'WIN');
    const lossTradesData = trades.filter(t => t.status === 'LOSS');

    const totalProfit = winTradesData.reduce((sum, t) => sum + (t.profitDollars || 0), 0);
    const totalLoss = lossTradesData.reduce((sum, t) => sum + (t.lossDollars || 0), 0);
    const netPnL = totalProfit - totalLoss;

    const winRate = totalTrades > 0 ? (winTrades / totalTrades) * 100 : 0;
    const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? 999 : 0;
    const avgWin = winTrades > 0 ? totalProfit / winTrades : 0;
    const avgLoss = lossTrades > 0 ? totalLoss / lossTrades : 0;

    const bestTrade = winTradesData.length > 0 ? Math.max(...winTradesData.map(t => t.profitDollars || 0)) : 0;
    const worstTrade = lossTradesData.length > 0 ? Math.max(...lossTradesData.map(t => t.lossDollars || 0)) : 0;

    return {
      totalTrades,
      winTrades,
      lossTrades,
      netPnL,
      totalProfit,
      totalLoss,
      winRate,
      profitFactor,
      bestTrade,
      worstTrade,
      avgWin,
      avgLoss,
    };
  }, [trades]);

  if (loading) {
    return (
      <div className="flex-1 min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 w-full overflow-x-hidden">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 w-full overflow-x-hidden">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="flex items-center justify-center h-64">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-red-200 p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AM Trader Dashboard Error</h3>
                <p className="text-sm text-gray-600 mb-4">{error}</p>
                <button
                  onClick={() => {
                    setError(null);
                    setLoading(true);
                    fetchAMTraderTrades();
                  }}
                  className="w-full px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 w-full overflow-x-hidden">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        
        {/* AM Trader Dashboard Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-emerald-900 mb-2">
                AM Trader Dashboard
              </h1>
              <p className="text-lg text-emerald-700">
                Welcome to your AM Trader performance center! Specialized analytics for your automated trading.
              </p>
            </div>
            <div className="mt-4 lg:mt-0 flex items-center space-x-4">
              <div className="bg-white rounded-xl px-4 py-2 shadow-sm border border-emerald-200">
                <div className="text-sm text-emerald-600">Last Updated</div>
                <div className="text-sm font-semibold text-emerald-900">
                  {new Date().toLocaleString()}
                </div>
              </div>
              {selectedAccount && (
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl px-4 py-2 shadow-lg">
                  <div className="text-sm opacity-90">AM Trader Account</div>
                  <div className="text-sm font-bold">{selectedAccount.name}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Net P&L Widget */}
          <div className="bg-white rounded-2xl shadow-xl border border-emerald-200 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                stats.netPnL >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
              }`}>
                {stats.netPnL >= 0 ? 'Profit' : 'Loss'}
              </div>
            </div>
            <div className="mb-2">
              <div className={`text-3xl font-bold ${
                stats.netPnL >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {stats.netPnL >= 0 ? '+' : ''}${stats.netPnL.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">AM Net P&L</div>
            </div>
            <div className="text-xs text-gray-500">Total AM trades: {stats.totalTrades}</div>
          </div>

          {/* Win Rate Widget */}
          <div className="bg-white rounded-2xl shadow-xl border border-emerald-200 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                stats.winRate >= 50 ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
              }`}>
                {stats.winRate >= 50 ? 'Good' : 'Optimize'}
              </div>
            </div>
            <div className="mb-2">
              <div className="text-3xl font-bold text-gray-900">
                {stats.winRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">AM Win Rate</div>
            </div>
            <div className="text-xs text-gray-500">{stats.winTrades}W / {stats.lossTrades}L</div>
          </div>

          {/* Profit Factor Widget */}
          <div className="bg-white rounded-2xl shadow-xl border border-emerald-200 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                stats.profitFactor >= 1.5 ? 'bg-emerald-100 text-emerald-700' : 
                stats.profitFactor >= 1 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
              }`}>
                {stats.profitFactor >= 1.5 ? 'Excellent' : 
                 stats.profitFactor >= 1 ? 'Good' : 'Needs Work'}
              </div>
            </div>
            <div className="mb-2">
              <div className="text-3xl font-bold text-gray-900">
                {stats.profitFactor.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">AM Profit Factor</div>
            </div>
            <div className="text-xs text-gray-500">Automated efficiency</div>
          </div>

          {/* Best Trade Widget */}
          <div className="bg-white rounded-2xl shadow-xl border border-emerald-200 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                Best AM
              </div>
            </div>
            <div className="mb-2">
              <div className="text-3xl font-bold text-emerald-600">
                +${stats.bestTrade.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Best AM Trade</div>
            </div>
            <div className="text-xs text-gray-500">Top automated performance</div>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Trading Summary */}
          <div className="bg-white rounded-2xl shadow-xl border border-emerald-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              AM Trading Summary
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <span className="text-emerald-600 font-bold text-sm">W</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{stats.winTrades} AM Wins</div>
                    <div className="text-sm text-gray-500">Avg: ${stats.avgWin.toFixed(2)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-emerald-600">+${stats.totalProfit.toFixed(0)}</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-red-600 font-bold text-sm">L</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{stats.lossTrades} AM Losses</div>
                    <div className="text-sm text-gray-500">Avg: ${stats.avgLoss.toFixed(2)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-red-600">-${stats.totalLoss.toFixed(0)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Win Rate Circle */}
          <div className="bg-white rounded-2xl shadow-xl border border-emerald-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              AM Performance Metrics
            </h3>

            <div className="relative h-48 mb-6">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{stats.winRate.toFixed(1)}%</div>
                  <div className="text-sm text-gray-500">AM Win Rate</div>
                </div>
              </div>
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#f1f5f9"
                  strokeWidth="20"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="20"
                  strokeDasharray={`${(stats.winRate / 100) * 502.65} 502.65`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{stats.profitFactor.toFixed(2)}</div>
                <div className="text-xs text-gray-500">Profit Factor</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{stats.totalTrades}</div>
                <div className="text-xs text-gray-500">AM Trades</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-xl border border-emerald-200 p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">AM Trader Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/am-trader/add-trade')}
              className="flex items-center justify-center p-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add AM Trade
            </button>
            <button
              onClick={() => router.push('/am-trader/journal')}
              className="flex items-center justify-center p-4 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl hover:from-teal-600 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              mTrader Journal
            </button>
            <button
              onClick={() => router.push('/am-trader/analytics')}
              className="flex items-center justify-center p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              AM Analytics
            </button>
          </div>
        </div>

        {/* Info Note */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-emerald-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-sm font-semibold text-emerald-900 mb-1">AM Trader Dashboard</h4>
              <p className="text-sm text-emerald-700">
                This dashboard shows trades and performance metrics specifically for your AM Trader system. 
                Main dashboard trades are kept separate and won't appear here.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
} 