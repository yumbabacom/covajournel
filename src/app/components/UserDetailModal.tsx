'use client';

import { useState, useEffect } from 'react';

interface UserStats {
  totalTrades: number;
  winTrades: number;
  lossTrades: number;
  openTrades: number;
  planningTrades: number;
  totalProfit: number;
  totalLoss: number;
  netPnL: number;
  winRate: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  bestTrade: number;
  worstTrade: number;
  symbolBreakdown: Array<{
    symbol: string;
    count: number;
    pnl: number;
  }>;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
}

interface Trade {
  id: string;
  symbol: string;
  status: string;
  entryPrice: number;
  exitPrice?: number;
  stopLoss: number;
  profitDollars?: number;
  lossDollars?: number;
  createdAt: string;
  tradeDirection: string;
}

interface UserDetailModalProps {
  user: UserData;
  isOpen: boolean;
  onClose: () => void;
}

export default function UserDetailModal({ user, isOpen, onClose }: UserDetailModalProps) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [statistics, setStatistics] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (isOpen && user) {
      fetchUserTrades();
    }
  }, [isOpen, user, currentPage]);

  const fetchUserTrades = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${user.id}/trades?page=${currentPage}&limit=20`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTrades(data.trades);
        setStatistics(data.statistics);
        setTotalPages(data.pagination.totalPages);
      } else {
        console.error('Failed to fetch user trades');
      }
    } catch (error) {
      console.error('Error fetching user trades:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50 w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800/50 dark:to-gray-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
                <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-xl transition-colors"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Statistics Grid */}
              {statistics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                    <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">Total Trades</h3>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{statistics.totalTrades}</p>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                    <h3 className="text-sm font-semibold text-green-800 dark:text-green-300 mb-2">Win Rate</h3>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">{statistics.winRate.toFixed(1)}%</p>
                  </div>
                  
                  <div className={`p-4 rounded-xl border ${
                    statistics.netPnL >= 0 
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                      : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  }`}>
                    <h3 className={`text-sm font-semibold mb-2 ${
                      statistics.netPnL >= 0 
                        ? 'text-green-800 dark:text-green-300'
                        : 'text-red-800 dark:text-red-300'
                    }`}>Net P&L</h3>
                    <p className={`text-2xl font-bold ${
                      statistics.netPnL >= 0 
                        ? 'text-green-900 dark:text-green-100'
                        : 'text-red-900 dark:text-red-100'
                    }`}>
                      {statistics.netPnL >= 0 ? '+' : ''}${statistics.netPnL.toFixed(2)}
                    </p>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                    <h3 className="text-sm font-semibold text-purple-800 dark:text-purple-300 mb-2">Profit Factor</h3>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                      {statistics.profitFactor === 999 ? '∞' : statistics.profitFactor.toFixed(2)}
                    </p>
                  </div>
                </div>
              )}

              {/* Top Symbols */}
              {statistics && statistics.symbolBreakdown.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Top Trading Symbols</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {statistics.symbolBreakdown.slice(0, 6).map((symbol, index) => (
                      <div key={symbol.symbol} className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{symbol.symbol}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{symbol.count} trades</p>
                        </div>
                        <span className={`font-bold ${
                          symbol.pnl >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {symbol.pnl >= 0 ? '+' : ''}${symbol.pnl.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Trades */}
              <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Trades</h3>
                  {totalPages > 1 && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg text-sm transition-colors"
                      >
                        Previous
                      </button>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg text-sm transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-2 px-3 text-sm font-semibold text-gray-900 dark:text-white">Symbol</th>
                        <th className="text-left py-2 px-3 text-sm font-semibold text-gray-900 dark:text-white">Direction</th>
                        <th className="text-left py-2 px-3 text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                        <th className="text-left py-2 px-3 text-sm font-semibold text-gray-900 dark:text-white">P&L</th>
                        <th className="text-left py-2 px-3 text-sm font-semibold text-gray-900 dark:text-white">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trades.map((trade) => (
                        <tr key={trade.id} className="border-b border-gray-100 dark:border-gray-700/50">
                          <td className="py-2 px-3 font-semibold text-gray-900 dark:text-white">{trade.symbol}</td>
                          <td className="py-2 px-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              trade.tradeDirection === 'LONG' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                            }`}>
                              {trade.tradeDirection}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              trade.status === 'WIN' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                : trade.status === 'LOSS'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                : trade.status === 'OPEN' || trade.status === 'ACTIVE'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                            }`}>
                              {trade.status}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            {trade.status === 'WIN' && trade.profitDollars && (
                              <span className="font-semibold text-green-600 dark:text-green-400">
                                +${trade.profitDollars.toFixed(2)}
                              </span>
                            )}
                            {trade.status === 'LOSS' && trade.lossDollars && (
                              <span className="font-semibold text-red-600 dark:text-red-400">
                                -${trade.lossDollars.toFixed(2)}
                              </span>
                            )}
                            {(trade.status === 'OPEN' || trade.status === 'ACTIVE' || trade.status === 'PLANNING') && (
                              <span className="text-gray-500 dark:text-gray-400">-</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-sm text-gray-500 dark:text-gray-400">
                            {new Date(trade.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
