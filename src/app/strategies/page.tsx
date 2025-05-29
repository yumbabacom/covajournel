'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/AuthProvider';
import { useAccount } from '../components/AccountProvider';
import AppLayout from '../components/AppLayout';
import CreateStrategyModal from '../components/CreateStrategyModal';
import StrategyDetailModal from '../components/StrategyDetailModal';

interface Strategy {
  id: string;
  name: string;
  marketType: string;
  setupConditions: string;
  entryRules: string;
  exitRules: string;
  timeframe: string;
  indicators: string[];
  tags: string[];
  images: string[];
  createdAt: string;
  updatedAt: string;
  userId: string;
  accountId: string;
  usageCount?: number;
  winRate?: number;
  totalPnL?: number;
}

export default function StrategiesPage() {
  const { user, isLoading } = useAuth();
  const { selectedAccount } = useAccount();
  const router = useRouter();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [strategyToEdit, setStrategyToEdit] = useState<Strategy | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMarket, setFilterMarket] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  useEffect(() => {
    if (user && selectedAccount) {
      fetchStrategies();
    }
  }, [user, selectedAccount]);

  const fetchStrategies = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/strategies', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setStrategies(data);
      } else {
        console.error('Failed to fetch strategies:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching strategies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStrategy = async (strategyData: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/strategies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(strategyData),
      });

      if (response.ok) {
        await fetchStrategies();
        setIsCreateModalOpen(false);
      } else {
        const errorData = await response.json();
        console.error('Failed to create strategy:', errorData);
        alert(`Failed to create strategy: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating strategy:', error);
      alert('Failed to create strategy. Please try again.');
    }
  };

  const handleEditStrategy = (strategy: Strategy) => {
    setStrategyToEdit(strategy);
    setIsEditModalOpen(true);
    setSelectedStrategy(null); // Close details modal if open
  };

  const handleUpdateStrategy = async (strategyData: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/strategies/${strategyData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(strategyData),
      });

      if (response.ok) {
        await fetchStrategies();
        setIsEditModalOpen(false);
        setStrategyToEdit(null);
        alert('Strategy updated successfully!');
      } else {
        const errorData = await response.json();
        console.error('Failed to update strategy:', errorData);
        alert(`Failed to update strategy: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating strategy:', error);
      alert('Failed to update strategy. Please try again.');
    }
  };

  const handleDeleteStrategy = async (strategyId: string) => {
    if (!confirm('Are you sure you want to delete this strategy?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/strategies/${strategyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchStrategies();
        setSelectedStrategy(null);
      }
    } catch (error) {
      console.error('Error deleting strategy:', error);
    }
  };

  const filteredStrategies = strategies.filter(strategy => {
    const matchesSearch = strategy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         strategy.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesMarket = !filterMarket || strategy.marketType === filterMarket;
    const matchesTag = !filterTag || strategy.tags.includes(filterTag);

    return matchesSearch && matchesMarket && matchesTag;
  });

  const marketTypes = ['Forex', 'Stocks', 'Crypto', 'Options', 'Futures'];
  const allTags = [...new Set(strategies.flatMap(s => s.tags))];

  if (isLoading || loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading strategies...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!user) {
    router.push('/');
    return null;
  }

  return (
    <AppLayout>
      <div className="w-full">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="space-y-6">
          {/* Beautiful Header Section */}
          <div className="text-center py-12">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-lg opacity-20"></div>
              <div className="relative bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h1 className="text-4xl font-black text-gray-900 mb-4">Strategy Library</h1>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">Create, manage, and track your trading strategies with detailed rules, conditions, and performance analytics</p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl font-bold transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 flex items-center space-x-3 mx-auto"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                  <svg className="relative w-6 h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="relative">Create New Strategy</span>
                </button>
              </div>
            </div>
          </div>

          {/* Beautiful Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="group relative bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-200 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-blue-700 mb-2">Total Strategies</h3>
                <p className="text-3xl font-black text-blue-900">{strategies.length}</p>
                <p className="text-xs text-blue-600 mt-2">Active trading strategies</p>
              </div>
            </div>

            <div className="group relative bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-emerald-200 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-emerald-700 mb-2">Active Tags</h3>
                <p className="text-3xl font-black text-emerald-900">{allTags.length}</p>
                <p className="text-xs text-emerald-600 mt-2">Unique strategy tags</p>
              </div>
            </div>

            <div className="group relative bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-200 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-purple-600 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-purple-700 mb-2">Markets Covered</h3>
                <p className="text-3xl font-black text-purple-900">{marketTypes.length}</p>
                <p className="text-xs text-purple-600 mt-2">Different market types</p>
              </div>
            </div>

            <div className="group relative bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-200 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-orange-700 mb-2">Filtered Results</h3>
                <p className="text-3xl font-black text-orange-900">{filteredStrategies.length}</p>
                <p className="text-xs text-orange-600 mt-2">Matching your filters</p>
              </div>
            </div>
          </div>

          {/* Beautiful Filters Section */}
          <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-3xl shadow-xl border border-gray-200 p-8">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl"></div>
            <div className="relative">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Filter & Search</h2>
                    <p className="text-gray-600">Find the perfect strategy for your trading style</p>
                  </div>
                  <div className="hidden sm:block">
                    <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-2xl text-sm font-bold border border-blue-200">
                      {filteredStrategies.length} of {strategies.length} strategies
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex bg-white rounded-2xl p-1 shadow-lg border border-gray-200">
                    <button
                      onClick={() => setViewMode('cards')}
                      className={`px-6 py-3 text-sm font-bold rounded-xl transition-all duration-300 flex items-center space-x-2 ${
                        viewMode === 'cards'
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z" />
                      </svg>
                      <span>Cards</span>
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`px-6 py-3 text-sm font-bold rounded-xl transition-all duration-300 flex items-center space-x-2 ${
                        viewMode === 'table'
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                      <span>Table</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Beautiful Search */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  <div className="relative bg-white rounded-2xl border-2 border-gray-200 group-hover:border-blue-300 transition-colors duration-300 shadow-lg">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search strategies..."
                      className="w-full pl-12 pr-12 py-4 bg-transparent border-0 rounded-2xl focus:outline-none focus:ring-0 text-gray-900 placeholder-gray-500 font-medium"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center group"
                      >
                        <div className="w-6 h-6 bg-gray-200 hover:bg-red-500 rounded-full flex items-center justify-center transition-colors duration-200">
                          <svg className="w-3 h-3 text-gray-600 hover:text-white transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                      </button>
                    )}
                  </div>
                </div>

                {/* Beautiful Market Filter */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  <div className="relative bg-white rounded-2xl border-2 border-gray-200 group-hover:border-emerald-300 transition-colors duration-300 shadow-lg">
                    <select
                      value={filterMarket}
                      onChange={(e) => setFilterMarket(e.target.value)}
                      className="w-full px-4 py-4 bg-transparent border-0 rounded-2xl focus:outline-none focus:ring-0 text-gray-900 font-medium appearance-none cursor-pointer"
                    >
                      <option value="" className="text-gray-900">🌍 All Markets</option>
                      {marketTypes.map(market => (
                        <option key={market} value={market} className="text-gray-900">{market}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-emerald-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Beautiful Tag Filter */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  <div className="relative bg-white rounded-2xl border-2 border-gray-200 group-hover:border-purple-300 transition-colors duration-300 shadow-lg">
                    <select
                      value={filterTag}
                      onChange={(e) => setFilterTag(e.target.value)}
                      className="w-full px-4 py-4 bg-transparent border-0 rounded-2xl focus:outline-none focus:ring-0 text-gray-900 font-medium appearance-none cursor-pointer"
                    >
                      <option value="" className="text-gray-900">🏷️ All Tags</option>
                      {allTags.map(tag => (
                        <option key={tag} value={tag} className="text-gray-900">#{tag}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Filters */}
              {(searchTerm || filterMarket || filterTag) && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">Active filters:</span>
                      <div className="flex items-center space-x-2">
                        {searchTerm && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            Search: "{searchTerm}"
                            <button
                              onClick={() => setSearchTerm('')}
                              className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full bg-indigo-200 hover:bg-indigo-300"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </span>
                        )}
                        {filterMarket && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Market: {filterMarket}
                            <button
                              onClick={() => setFilterMarket('')}
                              className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full bg-purple-200 hover:bg-purple-300"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </span>
                        )}
                        {filterTag && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                            Tag: #{filterTag}
                            <button
                              onClick={() => setFilterTag('')}
                              className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full bg-pink-200 hover:bg-pink-300"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setFilterMarket('');
                        setFilterTag('');
                      }}
                      className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                    >
                      Clear all
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Strategies Content */}
          {filteredStrategies.length === 0 ? (
            <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-indigo-50 rounded-3xl shadow-lg border border-gray-100 p-16 text-center">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}></div>
            </div>

            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {strategies.length === 0 ? "No strategies yet" : "No strategies found"}
              </h3>

              <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                {strategies.length === 0
                  ? "Start building your trading strategy library. Create detailed strategies with rules, conditions, and performance tracking."
                  : "No strategies match your current filters. Try adjusting your search criteria or clearing the filters."
                }
              </p>

              {strategies.length === 0 ? (
                <div className="space-y-4">
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="group px-8 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white rounded-2xl font-bold transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 flex items-center justify-center space-x-3 mx-auto"
                  >
                    <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Create Your First Strategy</span>
                  </button>

                  <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>Track Performance</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span>Organize Rules</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span>Upload Screenshots</span>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterMarket('');
                    setFilterTag('');
                  }}
                  className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Clear All Filters
                </button>
              )}
            </div>
            </div>
          ) : (
            <div>
              {viewMode === 'cards' ? (
                /* Dashboard-style Strategy Cards */
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredStrategies.map((strategy) => (
                  <div
                    key={strategy.id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group"
                    onClick={() => setSelectedStrategy(strategy)}
                  >
                    {/* Clean Card Header */}
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <span className="text-blue-600 font-bold text-lg">
                              {strategy.name.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate group-hover:text-blue-600 transition-colors">
                              {strategy.name}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-medium">
                                {strategy.marketType}
                              </span>
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md font-medium">
                                {strategy.timeframe}
                              </span>
                            </div>
                          </div>
                        </div>
                        {strategy.usageCount !== undefined && strategy.usageCount > 0 && (
                          <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold">{strategy.usageCount}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6">
                      {/* Setup Conditions Preview */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Setup Conditions</h4>
                        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                          {strategy.setupConditions}
                        </p>
                      </div>

                      {/* Tags */}
                      {strategy.tags.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1">
                            {strategy.tags.slice(0, 3).map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-md font-medium"
                              >
                                #{tag}
                              </span>
                            ))}
                            {strategy.tags.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md font-medium">
                                +{strategy.tags.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Performance Metrics */}
                      {(strategy.winRate !== undefined || strategy.totalPnL !== undefined) && (
                        <div className="mb-4">
                          <div className="grid grid-cols-2 gap-3">
                            {strategy.winRate !== undefined && (
                              <div className="bg-green-50 rounded-lg p-3">
                                <p className="text-xs text-green-600 font-medium mb-1">Win Rate</p>
                                <p className="text-lg font-bold text-green-700">{strategy.winRate.toFixed(1)}%</p>
                              </div>
                            )}
                            {strategy.totalPnL !== undefined && (
                              <div className={`rounded-lg p-3 ${
                                strategy.totalPnL >= 0
                                  ? 'bg-green-50'
                                  : 'bg-red-50'
                              }`}>
                                <p className={`text-xs font-medium mb-1 ${
                                  strategy.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>Total P&L</p>
                                <p className={`text-lg font-bold ${
                                  strategy.totalPnL >= 0 ? 'text-green-700' : 'text-red-700'
                                }`}>
                                  ${strategy.totalPnL >= 0 ? '+' : ''}{strategy.totalPnL.toFixed(2)}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span>Updated {new Date(strategy.updatedAt).toLocaleDateString()}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          {strategy.images && strategy.images.length > 0 && (
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>{strategy.images.length}</span>
                            </div>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditStrategy(strategy);
                            }}
                            className="w-8 h-8 bg-gray-500 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors duration-200"
                            title="Edit Strategy"
                          >
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStrategy(strategy);
                            }}
                            className="w-8 h-8 bg-blue-500 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors duration-200"
                            title="View Strategy Details"
                          >
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Strategy Table View */
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Strategy
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Market & Timeframe
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Tags
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Performance
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Last Modified
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredStrategies.map((strategy) => (
                        <tr
                          key={strategy.id}
                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => setSelectedStrategy(strategy)}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold">
                                  {strategy.name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900">{strategy.name}</p>
                                <p className="text-xs text-gray-500 line-clamp-1">{strategy.setupConditions}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium">
                                {strategy.marketType}
                              </span>
                              <br />
                              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                                {strategy.timeframe}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {strategy.tags.slice(0, 2).map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium"
                                >
                                  #{tag}
                                </span>
                              ))}
                              {strategy.tags.length > 2 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                                  +{strategy.tags.length - 2}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              {strategy.winRate !== undefined && (
                                <div className="text-xs">
                                  <span className="text-gray-500">Win Rate: </span>
                                  <span className="font-semibold text-green-600">{strategy.winRate.toFixed(1)}%</span>
                                </div>
                              )}
                              {strategy.totalPnL !== undefined && (
                                <div className="text-xs">
                                  <span className="text-gray-500">P&L: </span>
                                  <span className={`font-semibold ${
                                    strategy.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    ${strategy.totalPnL >= 0 ? '+' : ''}{strategy.totalPnL.toFixed(2)}
                                  </span>
                                </div>
                              )}
                              {strategy.usageCount !== undefined && (
                                <div className="text-xs text-gray-500">
                                  Used {strategy.usageCount} times
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(strategy.updatedAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedStrategy(strategy);
                                }}
                                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-lg font-medium transition-colors"
                              >
                                View
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditStrategy(strategy);
                                }}
                                className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-xs rounded-lg font-medium transition-colors"
                              >
                                Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            </div>
          )}

          {/* Create Strategy Modal */}
          {isCreateModalOpen && (
            <CreateStrategyModal
              onClose={() => setIsCreateModalOpen(false)}
              onSubmit={handleCreateStrategy}
            />
          )}

          {/* Edit Strategy Modal */}
          {isEditModalOpen && strategyToEdit && (
            <CreateStrategyModal
              onClose={() => setIsEditModalOpen(false)}
              onSubmit={handleUpdateStrategy}
              editStrategy={strategyToEdit}
              isEditMode={true}
            />
          )}

          {/* Strategy Detail Modal */}
          {selectedStrategy && (
            <StrategyDetailModal
              strategy={selectedStrategy}
              onClose={() => setSelectedStrategy(null)}
              onDelete={handleDeleteStrategy}
              onEdit={(strategy) => {
                handleEditStrategy(strategy);
              }}
            />
          )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
