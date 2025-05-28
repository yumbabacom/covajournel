'use client';

import { useState, useEffect } from 'react';
import TradeDetailModal from './TradeDetailModal';

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
  lotSize: number;
  accountSize?: number;
  riskPercentage?: number;
  riskAmount?: number;
  profitPips?: number;
  lossPips?: number;
  riskRewardRatio?: number;
  category?: string;
  notes?: string;
  tags?: string[];
  entryImage?: string;
  exitImage?: string;
  images?: string[];
  user: {
    id: string;
    name: string;
    email: string;
    isAdmin: boolean;
  };
  account: {
    id: string;
    name: string;
    currentBalance: number;
  };
}

interface AllTradesTabProps {
  trades: Trade[];
  onRefresh: () => void;
}

export default function AllTradesTab({ trades, onRefresh }: AllTradesTabProps) {
  const [filteredTrades, setFilteredTrades] = useState<Trade[]>(trades);
  const [filters, setFilters] = useState({
    status: '',
    symbol: '',
    user: '',
    direction: '',
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [tradesPerPage] = useState(20);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

  useEffect(() => {
    let filtered = [...trades];

    // Apply filters
    if (filters.status) {
      filtered = filtered.filter(trade => trade.status === filters.status);
    }
    if (filters.symbol) {
      filtered = filtered.filter(trade =>
        trade.symbol.toLowerCase().includes(filters.symbol.toLowerCase())
      );
    }
    if (filters.user) {
      filtered = filtered.filter(trade =>
        trade.user?.name.toLowerCase().includes(filters.user.toLowerCase()) ||
        trade.user?.email.toLowerCase().includes(filters.user.toLowerCase())
      );
    }
    if (filters.direction) {
      filtered = filtered.filter(trade => trade.tradeDirection === filters.direction);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Trade];
      let bValue: any = b[sortBy as keyof Trade];

      if (sortBy === 'user') {
        aValue = a.user?.name || '';
        bValue = b.user?.name || '';
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredTrades(filtered);
    setCurrentPage(1);
  }, [trades, filters, sortBy, sortOrder]);

  // Pagination
  const indexOfLastTrade = currentPage * tradesPerPage;
  const indexOfFirstTrade = indexOfLastTrade - tradesPerPage;
  const currentTrades = filteredTrades.slice(indexOfFirstTrade, indexOfLastTrade);
  const totalPages = Math.ceil(filteredTrades.length / tradesPerPage);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ status: '', symbol: '', user: '', direction: '' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'WIN':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'LOSS':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'OPEN':
      case 'ACTIVE':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'PLANNING':
      case 'PLANNED':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getDirectionColor = (direction: string) => {
    return direction === 'LONG'
      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
  };

  return (
    <div className="space-y-8">
      {/* Professional Header */}
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-white flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            All Trades ({filteredTrades.length})
          </h2>
          <div className="flex items-center space-x-4">
            <div className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-xl backdrop-blur-sm">
              <span className="text-green-300 font-medium">{filteredTrades.length} Trades</span>
            </div>
            <button
              onClick={onRefresh}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-2xl transition-all duration-200 flex items-center space-x-2 font-semibold shadow-lg hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Professional Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div>
            <label className="block text-sm font-bold text-white mb-3">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-4 py-3 border border-white/20 rounded-2xl bg-white/10 backdrop-blur-sm text-white placeholder-gray-300 focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all"
            >
              <option value="" className="bg-gray-800 text-white">All Statuses</option>
              <option value="WIN" className="bg-gray-800 text-white">Win</option>
              <option value="LOSS" className="bg-gray-800 text-white">Loss</option>
              <option value="OPEN" className="bg-gray-800 text-white">Open</option>
              <option value="ACTIVE" className="bg-gray-800 text-white">Active</option>
              <option value="PLANNING" className="bg-gray-800 text-white">Planning</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-white mb-3">Symbol</label>
            <input
              type="text"
              value={filters.symbol}
              onChange={(e) => handleFilterChange('symbol', e.target.value)}
              placeholder="Search symbol..."
              className="w-full px-4 py-3 border border-white/20 rounded-2xl bg-white/10 backdrop-blur-sm text-white placeholder-gray-300 focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-white mb-3">User</label>
            <input
              type="text"
              value={filters.user}
              onChange={(e) => handleFilterChange('user', e.target.value)}
              placeholder="Search user..."
              className="w-full px-4 py-3 border border-white/20 rounded-2xl bg-white/10 backdrop-blur-sm text-white placeholder-gray-300 focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-white mb-3">Direction</label>
            <select
              value={filters.direction}
              onChange={(e) => handleFilterChange('direction', e.target.value)}
              className="w-full px-4 py-3 border border-white/20 rounded-2xl bg-white/10 backdrop-blur-sm text-white placeholder-gray-300 focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all"
            >
              <option value="" className="bg-gray-800 text-white">All Directions</option>
              <option value="LONG" className="bg-gray-800 text-white">Long</option>
              <option value="SHORT" className="bg-gray-800 text-white">Short</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-3 bg-gradient-to-r from-gray-500 to-slate-500 hover:from-gray-600 hover:to-slate-600 text-white rounded-2xl transition-all duration-200 font-semibold shadow-lg hover:scale-105"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Professional Sort Controls */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <label className="text-sm font-bold text-white">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-white/20 rounded-xl bg-white/10 backdrop-blur-sm text-white text-sm focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all"
            >
              <option value="createdAt" className="bg-gray-800 text-white">Date</option>
              <option value="symbol" className="bg-gray-800 text-white">Symbol</option>
              <option value="status" className="bg-gray-800 text-white">Status</option>
              <option value="user" className="bg-gray-800 text-white">User</option>
              <option value="profitDollars" className="bg-gray-800 text-white">Profit</option>
            </select>
          </div>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all duration-200 text-sm flex items-center space-x-2 backdrop-blur-sm"
          >
            <span className="text-lg">{sortOrder === 'asc' ? '↑' : '↓'}</span>
            <span>{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
          </button>
        </div>
      </div>

      {/* Professional Trades Table */}
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr className="border-b border-white/10">
                <th className="text-left py-6 px-6 font-bold text-white">User</th>
                <th className="text-left py-6 px-6 font-bold text-white">Symbol</th>
                <th className="text-left py-6 px-6 font-bold text-white">Direction</th>
                <th className="text-left py-6 px-6 font-bold text-white">Status</th>
                <th className="text-left py-6 px-6 font-bold text-white">Entry</th>
                <th className="text-left py-6 px-6 font-bold text-white">Exit</th>
                <th className="text-left py-6 px-6 font-bold text-white">P&L</th>
                <th className="text-left py-6 px-6 font-bold text-white">Lot Size</th>
                <th className="text-left py-6 px-6 font-bold text-white">Date</th>
                <th className="text-left py-6 px-6 font-bold text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentTrades.map((trade) => (
                <tr key={trade.id} className="border-b border-white/5 hover:bg-white/5 transition-all duration-200">
                  <td className="py-6 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-sm">
                          {trade.user?.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-white">{trade.user?.name}</p>
                        <p className="text-sm text-gray-300">{trade.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-6 px-6 font-bold text-white text-lg">{trade.symbol}</td>
                  <td className="py-6 px-6">
                    <span className={`inline-flex items-center px-4 py-2 rounded-2xl text-sm font-bold shadow-lg ${
                      trade.tradeDirection === 'LONG'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                        : 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                    }`}>
                      {trade.tradeDirection}
                    </span>
                  </td>
                  <td className="py-6 px-6">
                    <span className={`inline-flex items-center px-4 py-2 rounded-2xl text-sm font-bold shadow-lg ${
                      trade.status === 'WIN' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' :
                      trade.status === 'LOSS' ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' :
                      trade.status === 'OPEN' || trade.status === 'ACTIVE' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' :
                      'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                    }`}>
                      {trade.status}
                    </span>
                  </td>
                  <td className="py-6 px-6 text-white font-semibold">{trade.entryPrice}</td>
                  <td className="py-6 px-6 text-white font-semibold">{trade.exitPrice || '-'}</td>
                  <td className="py-6 px-6">
                    <div className="text-center">
                      {trade.status === 'WIN' && trade.profitDollars && (
                        <span className="font-bold text-green-400 text-lg">
                          +${trade.profitDollars.toFixed(2)}
                        </span>
                      )}
                      {trade.status === 'LOSS' && trade.lossDollars && (
                        <span className="font-bold text-red-400 text-lg">
                          -${trade.lossDollars.toFixed(2)}
                        </span>
                      )}
                      {(trade.status === 'OPEN' || trade.status === 'ACTIVE' || trade.status === 'PLANNING') && (
                        <span className="text-gray-400 text-lg font-semibold">-</span>
                      )}
                    </div>
                  </td>
                  <td className="py-6 px-6 text-white font-semibold text-center">{trade.lotSize}</td>
                  <td className="py-6 px-6 text-gray-300 text-center">
                    {new Date(trade.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-6 px-6">
                    <div className="flex justify-center">
                      <button
                        onClick={() => setSelectedTrade(trade)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-2xl transition-all duration-200 flex items-center space-x-2 font-semibold shadow-lg hover:scale-105"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>View</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Professional Pagination */}
        {totalPages > 1 && (
          <div className="px-8 py-6 bg-white/5 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="text-sm text-white font-medium">
                Showing {indexOfFirstTrade + 1} to {Math.min(indexOfLastTrade, filteredTrades.length)} of {filteredTrades.length} trades
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-sm text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 backdrop-blur-sm"
                >
                  Previous
                </button>
                <span className="text-sm text-white font-semibold px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl backdrop-blur-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-sm text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 backdrop-blur-sm"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Trade Detail Modal */}
      {selectedTrade && (
        <TradeDetailModal
          trade={selectedTrade}
          onClose={() => setSelectedTrade(null)}
        />
      )}
    </div>
  );
}
