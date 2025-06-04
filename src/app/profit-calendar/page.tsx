'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/AuthProvider';
import { useAccount } from '../components/AccountProvider';
import ProfitCalendar from '../components/ProfitCalendar';

interface Trade {
  id: string;
  symbol: string;
  status: string;
  profitDollars: number;
  lossDollars: number;
  createdAt: string;
  [key: string]: any;
}

export default function ProfitCalendarPage() {
  const { user, loading: authLoading } = useAuth();
  const { selectedAccount } = useAccount();
  const router = useRouter();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
      return;
    }
  }, [user, authLoading, router]);

  // Fetch trades from API
  const fetchTrades = useCallback(async () => {
    if (!user || !selectedAccount) return;

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      const response = await fetch(`/api/trades?accountId=${selectedAccount.id}&limit=1000`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTrades(data.trades || []);
      } else if (response.status === 401) {
        setError('Session expired. Please log in again.');
        router.push('/');
      } else {
        setError('Failed to fetch trade data');
      }
    } catch (error) {
      console.error('Error fetching trades:', error);
      setError('Failed to load trade data');
    } finally {
      setLoading(false);
    }
  }, [user, selectedAccount, router]);

  useEffect(() => {
    if (user && selectedAccount) {
      fetchTrades();
    }
  }, [user, selectedAccount, fetchTrades]);

  // Show loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading profit calendar...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchTrades}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Don't render if no user or account
  if (!user || !selectedAccount) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* Enhanced Page Header */}
        <div className="text-center mb-16">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="relative w-20 h-20 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 rounded-3xl flex items-center justify-center mx-auto shadow-2xl transform hover:scale-110 transition-all duration-500">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-transparent mb-6">
            Profit Calendar Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Track your daily trading performance with our enhanced calendar view. 
            Visualize profit patterns, identify trends, and optimize your trading strategy.
          </p>
          
          {/* Account Info */}
          <div className="mt-6 flex items-center justify-center space-x-3 text-lg">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <span className="font-semibold text-gray-700">Account:</span>
            <span className="font-bold text-blue-600">{selectedAccount.name}</span>
            <span className="text-gray-500">•</span>
            <span className="font-semibold text-green-600">${selectedAccount.currentBalance.toLocaleString()}</span>
          </div>
          
          {/* Decorative Elements */}
          <div className="flex items-center justify-center space-x-4 mt-8">
            <div className="h-1 w-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
            <div className="h-3 w-3 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full animate-pulse"></div>
            <div className="h-1 w-24 bg-gradient-to-r from-red-500 to-rose-500 rounded-full"></div>
          </div>
        </div>

        {/* Calendar Component */}
        <div className="max-w-8xl mx-auto mb-16">
          {trades.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-16 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No Trading Data Found</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Start adding trades to see your daily profit and loss patterns in the calendar view.
              </p>
              <button
                onClick={() => router.push('/add-trade')}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
              >
                Add Your First Trade
              </button>
            </div>
          ) : (
            <ProfitCalendar trades={trades} />
          )}
        </div>

        {/* Enhanced Quick Stats - Only show if we have trades */}
        {trades.length > 0 && (
          <div className="max-w-7xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Performance Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
                <div className="relative bg-white rounded-3xl shadow-xl border border-gray-100 p-8 transform hover:scale-105 transition-all duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Total</div>
                  </div>
                  <div className="mb-4">
                    <div className="text-3xl font-black text-gray-900 mb-2">
                      ${trades.filter(t => t.status === 'WIN').reduce((sum, t) => sum + t.profitDollars, 0).toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600 font-semibold">Total Profits</div>
                  </div>
                  <div className="text-xs text-green-600 font-bold bg-green-50 px-3 py-2 rounded-xl">
                    {trades.filter(t => t.status === 'WIN').length} winning trades
                  </div>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-rose-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
                <div className="relative bg-white rounded-3xl shadow-xl border border-gray-100 p-8 transform hover:scale-105 transition-all duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                      </svg>
                    </div>
                    <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Total</div>
                  </div>
                  <div className="mb-4">
                    <div className="text-3xl font-black text-gray-900 mb-2">
                      ${trades.filter(t => t.status === 'LOSS').reduce((sum, t) => sum + t.lossDollars, 0).toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600 font-semibold">Total Losses</div>
                  </div>
                  <div className="text-xs text-red-600 font-bold bg-red-50 px-3 py-2 rounded-xl">
                    {trades.filter(t => t.status === 'LOSS').length} losing trades
                  </div>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
                <div className="relative bg-white rounded-3xl shadow-xl border border-gray-100 p-8 transform hover:scale-105 transition-all duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Performance</div>
                  </div>
                  <div className="mb-4">
                    <div className="text-3xl font-black text-gray-900 mb-2">
                      {(() => {
                        const completedTrades = trades.filter(t => t.status === 'WIN' || t.status === 'LOSS');
                        const winTrades = trades.filter(t => t.status === 'WIN');
                        return completedTrades.length > 0 ? ((winTrades.length / completedTrades.length) * 100).toFixed(1) : '0.0';
                      })()}%
                    </div>
                    <div className="text-sm text-gray-600 font-semibold">Win Rate</div>
                  </div>
                  <div className="text-xs text-blue-600 font-bold bg-blue-50 px-3 py-2 rounded-xl">
                    {trades.filter(t => t.status === 'WIN' || t.status === 'LOSS').length} completed trades
                  </div>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
                <div className="relative bg-white rounded-3xl shadow-xl border border-gray-100 p-8 transform hover:scale-105 transition-all duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Net P&L</div>
                  </div>
                  <div className="mb-4">
                    {(() => {
                      const totalProfit = trades.filter(t => t.status === 'WIN').reduce((sum, t) => sum + t.profitDollars, 0);
                      const totalLoss = trades.filter(t => t.status === 'LOSS').reduce((sum, t) => sum + t.lossDollars, 0);
                      const netPnL = totalProfit - totalLoss;
                      return (
                        <>
                          <div className={`text-3xl font-black mb-2 ${netPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {netPnL >= 0 ? '+' : ''}${netPnL.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-600 font-semibold">Net Profit/Loss</div>
                        </>
                      );
                    })()}
                  </div>
                  <div className="text-xs text-purple-600 font-bold bg-purple-50 px-3 py-2 rounded-xl">
                    {trades.length} total trades
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Instructions */}
        <div className="max-w-5xl mx-auto">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-slate-200 to-gray-300 rounded-3xl blur opacity-50"></div>
            <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 p-10">
              <div className="text-center mb-10">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">How to Use the Profit Calendar</h3>
                <p className="text-gray-600 text-lg">Master your trading performance with visual insights</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-2xl border border-green-100">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg mb-2">Green Days</h4>
                      <p className="text-gray-700">Profitable trading days with positive P&L. These represent successful trading sessions.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 bg-red-50 rounded-2xl border border-red-100">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg mb-2">Red Days</h4>
                      <p className="text-gray-700">Loss days where you experienced negative P&L. Learn from these sessions to improve.</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg mb-2">No Trading Days</h4>
                      <p className="text-gray-700">Days with no trading activity. These help identify trading frequency patterns.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg mb-2">Today Indicator</h4>
                      <p className="text-gray-700">Current day is highlighted with a blue circle for easy identification.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 