'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/AuthProvider';
import { useAccount } from '../components/AccountProvider';
import StrategyDetailModal from '../components/StrategyDetailModal';
import StrategyEditModal from '../components/StrategyEditModal';
import StrategyCard from '../components/StrategyCard';
import ErrorBoundary from '../components/ErrorBoundary';
import { StrategyLibrarySkeleton } from '../components/SimpleLoading';
import AuthDebug from '../components/AuthDebug';

interface Strategy {
  id: string;
  name: string;
  description: string;
  type: 'scalping' | 'swing' | 'position' | 'day' | 'algorithmic';
  symbols: string[];
  rules: string[];
  riskManagement: {
    maxRiskPerTrade: number;
    stopLoss: number;
    takeProfit: number;
    maxDrawdown: number;
  };
  performance?: {
    totalTrades: number;
    winRate: number;
    profitLoss: number;
    avgReturn: number;
    maxDrawdown: number;
    sharpeRatio: number;
    bestTrade: number;
    worstTrade: number;
  };
  isActive: boolean;
  isPublic: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  lastUsed?: string;
}

export default function StrategiesPage() {
  const { user, loading, isHydrated } = useAuth();
  const { selectedAccount } = useAccount();
  const router = useRouter();
  
  // State
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [activeTab, setActiveTab] = useState('my-strategies');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('updated');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Modal states
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Fetch strategies from API
  const fetchStrategies = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!user) {
        router.push('/login');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        router.push('/login');
        return;
      }

      console.log('🔍 Fetching strategies from API...');
      const response = await fetch('/api/strategies', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error(`HTTP ${response.status}: Failed to fetch strategies`);
      }

      const data = await response.json();
      console.log('✅ Strategies fetched successfully:', data);
      
      // Handle different possible response formats and transform API data to match Strategy interface
      const rawStrategies = data.strategies || data || [];
      
      // Transform API data to match Strategy interface
      const transformedStrategies: Strategy[] = rawStrategies.map((apiStrategy: any) => ({
        id: apiStrategy.id || apiStrategy._id?.toString(),
        name: apiStrategy.name || '',
        description: apiStrategy.description || '',
        type: (apiStrategy.marketType || apiStrategy.tradingStyle || 'day') as Strategy['type'],
        symbols: apiStrategy.symbols || [], // API might not have symbols, use empty array
        rules: [
          ...(apiStrategy.setupConditions ? [apiStrategy.setupConditions] : []),
          ...(apiStrategy.entryRules ? [apiStrategy.entryRules] : []),
          ...(apiStrategy.exitRules ? [apiStrategy.exitRules] : [])
        ].filter(rule => rule), // Filter out empty rules
        riskManagement: {
          maxRiskPerTrade: parseFloat(apiStrategy.maxRisk || '2'),
          stopLoss: 1, // Default value since API doesn't provide this
          takeProfit: 2, // Default value since API doesn't provide this
          maxDrawdown: parseFloat(apiStrategy.drawdownLimit || '10'),
        },
        performance: apiStrategy.usageCount > 0 ? {
          totalTrades: apiStrategy.usageCount || 0,
          winRate: apiStrategy.winRate || 0,
          profitLoss: apiStrategy.totalPnL || 0,
          avgReturn: 0, // Would need calculation
          maxDrawdown: parseFloat(apiStrategy.drawdownLimit || '0'),
          sharpeRatio: parseFloat(apiStrategy.sharpeRatio || '0'),
          bestTrade: 0, // Would need calculation from trades
          worstTrade: 0, // Would need calculation from trades
        } : undefined, // Only include performance if there are trades
        isActive: true, // Default to active since API doesn't specify
        isPublic: false, // Default to private
        tags: apiStrategy.tags || [],
        createdAt: apiStrategy.createdAt || new Date().toISOString(),
        updatedAt: apiStrategy.updatedAt || new Date().toISOString(),
        lastUsed: apiStrategy.lastUsed, // Optional field
      }));
      
      setStrategies(transformedStrategies);
      
      if (transformedStrategies.length === 0) {
        console.log('📝 No strategies found in database');
      } else {
        console.log(`📊 Loaded ${transformedStrategies.length} strategies`);
      }

    } catch (error) {
      console.error('❌ Error fetching strategies:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch strategies');
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize data fetch
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (user && isHydrated) {
      fetchStrategies();
    }
  }, [user, isHydrated, router]);

  // ✅ ADD EVENT LISTENERS FOR STRATEGY UPDATES
  useEffect(() => {
    const handleStrategiesUpdated = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('📊 Strategies: Strategies updated event received', customEvent.detail);
      fetchStrategies();
    };

    const handleStrategyDeleted = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('📊 Strategies: Strategy deleted event received', customEvent.detail);
      fetchStrategies();
    };

    const handleForceRefresh = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('📊 Strategies: Force refresh event received', customEvent.detail);
      if (customEvent.detail.action === 'strategyUpdated' || customEvent.detail.action === 'strategyDeleted') {
        fetchStrategies();
      }
    };

    // Add event listeners
    window.addEventListener('strategiesUpdated', handleStrategiesUpdated);
    window.addEventListener('strategyDeleted', handleStrategyDeleted);
    window.addEventListener('forceRefresh', handleForceRefresh);

    // Cleanup event listeners
    return () => {
      window.removeEventListener('strategiesUpdated', handleStrategiesUpdated);
      window.removeEventListener('strategyDeleted', handleStrategyDeleted);
      window.removeEventListener('forceRefresh', handleForceRefresh);
    };
  }, []);

  // Filter and sort strategies
  const filteredStrategies = useMemo(() => {
    let filtered = strategies;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(strategy =>
        strategy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        strategy.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        strategy.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(strategy => strategy.type === filterType);
    }

    // Sort strategies
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'performance':
          return (b.performance?.profitLoss || 0) - (a.performance?.profitLoss || 0);
        case 'winRate':
          return (b.performance?.winRate || 0) - (a.performance?.winRate || 0);
        case 'trades':
          return (b.performance?.totalTrades || 0) - (a.performance?.totalTrades || 0);
        case 'updated':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

    return filtered;
  }, [strategies, searchQuery, filterType, sortBy]);

  // Handler functions
  const handleViewStrategy = (strategy: Strategy) => {
    setSelectedStrategy(strategy);
    setShowDetailModal(true);
  };

  const handleEditStrategy = (strategy: Strategy) => {
    console.log('Edit strategy called with:', strategy);
    setSelectedStrategy(strategy);
    setShowEditModal(true);
  };

  const handleCloneStrategy = (strategy: Strategy) => {
    console.log('Clone strategy called with:', strategy);
    const clonedStrategy: Strategy = {
      ...strategy,
      id: `${strategy.id}_clone_${Date.now()}`,
      name: `${strategy.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    delete (clonedStrategy as any).lastUsed;
    delete (clonedStrategy as any).performance; // Remove performance data from clone
    console.log('Cloned strategy:', clonedStrategy);
    setSelectedStrategy(clonedStrategy);
    setShowEditModal(true);
  };

  const handleDeleteStrategy = async (strategyId: string) => {
    try {
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      console.log('🗑️ Deleting strategy:', strategyId);
      
      const response = await fetch(`/api/strategies/${strategyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        if (response.status === 404) {
          throw new Error('Strategy not found');
        }
        throw new Error(`Failed to delete strategy: HTTP ${response.status}`);
      }

      console.log('✅ Strategy deleted successfully');
      
      // Remove from local state
      setStrategies(prev => prev.filter(s => s.id !== strategyId));
      setSuccess('Strategy deleted successfully');
      
      // ✅ BROADCAST DELETION EVENTS FOR REAL-TIME UPDATES
      console.log('📡 Broadcasting strategy deletion events...');
      
      // Main deletion event
      window.dispatchEvent(new CustomEvent('strategiesUpdated', { 
        detail: { 
          action: 'delete', 
          strategyId,
          timestamp: new Date().toISOString(),
          source: 'strategies-page'
        } 
      }));

      // Specific deletion event
      window.dispatchEvent(new CustomEvent('strategyDeleted', { 
        detail: { 
          strategyId,
          timestamp: new Date().toISOString()
        } 
      }));

      // Force refresh event
      window.dispatchEvent(new CustomEvent('forceRefresh', { 
        detail: { 
          action: 'strategyDeleted',
          strategyId,
          timestamp: new Date().toISOString()
        } 
      }));
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (error) {
      console.error('❌ Error deleting strategy:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete strategy');
    }
  };

  const handleSaveStrategy = async (strategyData: Strategy) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to save strategies');
        return;
      }

      // Map the Strategy interface fields to what the API expects
      const apiData = {
        name: strategyData.name,
        description: strategyData.description,
        marketType: strategyData.type, // Map 'type' to 'marketType'
        tradingStyle: strategyData.type, // Use type as trading style for now
        setupConditions: strategyData.rules?.join('; ') || '', // Convert rules array to string
        entryRules: strategyData.rules?.slice(0, Math.ceil(strategyData.rules.length / 2))?.join('; ') || '',
        exitRules: strategyData.rules?.slice(Math.ceil(strategyData.rules.length / 2))?.join('; ') || '',
        riskManagement: JSON.stringify(strategyData.riskManagement || {}),
        tags: strategyData.tags || [],
        indicators: [], // Add default empty array
        symbols: strategyData.symbols || [], // Add symbols if available
        isActive: strategyData.isActive || true,
        isPublic: strategyData.isPublic || false,
      };

      // Check if this is an existing strategy (not a clone) that needs updating
      const isExistingStrategy = !strategyData.id.includes('clone') && strategies.find(s => s.id === strategyData.id);
      
      if (isExistingStrategy) {
        // Update existing strategy
        console.log('🔄 Updating existing strategy:', strategyData.id);
        const response = await fetch(`/api/strategies/${strategyData.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(apiData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update strategy');
        }

        const updatedStrategy = await response.json();
        console.log('✅ Strategy updated:', updatedStrategy);
        
        // Update in local state
        setStrategies(prev => prev.map(s => s.id === strategyData.id ? strategyData : s));
        setSuccess('Strategy updated successfully!');
        
      } else {
        // Create new strategy (either truly new or cloned)
        console.log('➕ Creating new strategy');
        const response = await fetch('/api/strategies', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(apiData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create strategy');
        }

        const newStrategy = await response.json();
        console.log('✅ New strategy created:', newStrategy);
        
        // Transform the API response to match our Strategy interface
        const strategyToAdd: Strategy = {
          id: newStrategy.id,
          name: newStrategy.name,
          description: newStrategy.description || '',
          type: (newStrategy.marketType || newStrategy.tradingStyle || 'day') as Strategy['type'],
          symbols: newStrategy.symbols || [],
          rules: [
            ...(newStrategy.setupConditions ? [newStrategy.setupConditions] : []),
            ...(newStrategy.entryRules ? [newStrategy.entryRules] : []),
            ...(newStrategy.exitRules ? [newStrategy.exitRules] : [])
          ].filter(rule => rule),
          riskManagement: {
            maxRiskPerTrade: parseFloat(newStrategy.maxRisk || '2'),
            stopLoss: 1,
            takeProfit: 2,
            maxDrawdown: parseFloat(newStrategy.drawdownLimit || '10'),
          },
          // performance is optional and new strategies don't have performance data yet
          isActive: true,
          isPublic: false,
          tags: newStrategy.tags || [],
          createdAt: newStrategy.createdAt || new Date().toISOString(),
          updatedAt: newStrategy.updatedAt || new Date().toISOString(),
        };

        setStrategies(prev => [strategyToAdd, ...prev]);
        setSuccess(strategyData.id.includes('clone') ? 'Strategy cloned successfully!' : 'Strategy created successfully!');
      }
      
      // Close modals
      setShowDetailModal(false);
      setShowEditModal(false);
      setSelectedStrategy(null);
      
      // ✅ BROADCAST STRATEGY EVENTS FOR REAL-TIME UPDATES
      console.log('📡 Broadcasting strategy save events...');
      
      // Main update event
      window.dispatchEvent(new CustomEvent('strategiesUpdated', { 
        detail: { 
          action: isExistingStrategy ? 'update' : 'create', 
          strategyId: strategyData.id,
          timestamp: new Date().toISOString(),
          source: 'strategies-page'
        } 
      }));

      // Strategy saved event
      window.dispatchEvent(new CustomEvent('strategySaved', { 
        detail: { 
          strategyId: strategyData.id,
          isNew: !isExistingStrategy,
          timestamp: new Date().toISOString()
        } 
      }));

      // Force refresh event
      window.dispatchEvent(new CustomEvent('forceRefresh', { 
        detail: { 
          action: 'strategySaved',
          strategyId: strategyData.id,
          timestamp: new Date().toISOString()
        } 
      }));
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (error) {
      console.error('❌ Error saving strategy:', error);
      setError(error instanceof Error ? error.message : 'Failed to save strategy');
    }
  };

  const handleCreateNew = () => {
    router.push('/create-strategy');
  };

  if (loading || !isHydrated) {
    return <StrategyLibrarySkeleton />;
  }

  if (!user) {
    return null;
  }

  return (
    <ErrorBoundary>
      <AuthDebug />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                  Trading Strategies
                </h1>
                <p className="text-gray-600 mt-2">Manage your trading strategies and discover new approaches</p>
              </div>
              <button
                onClick={handleCreateNew}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-xl hover:from-blue-700 hover:to-purple-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Create Strategy</span>
                </div>
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700 font-medium">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-red-500 hover:text-red-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Success Display */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-green-700 font-medium">{success}</p>
                <button
                  onClick={() => setSuccess(null)}
                  className="ml-auto text-green-500 hover:text-green-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Strategies</p>
                  <p className="text-2xl font-bold text-gray-900">{strategies.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Strategies</p>
                  <p className="text-2xl font-bold text-green-600">{strategies.filter(s => s.isActive).length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Win Rate</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {(strategies.reduce((acc, s) => acc + (s.performance?.winRate || 0), 0) / strategies.length || 0).toFixed(1)}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total P&L</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${strategies.reduce((acc, s) => acc + (s.performance?.profitLoss || 0), 0).toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Controls */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="lg:col-span-1">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search strategies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filter by Type */}
              <div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="scalping">Scalping</option>
                  <option value="swing">Swing Trading</option>
                  <option value="position">Position Trading</option>
                  <option value="day">Day Trading</option>
                  <option value="algorithmic">Algorithmic</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="updated">Last Updated</option>
                  <option value="name">Name</option>
                  <option value="performance">Performance</option>
                  <option value="winRate">Win Rate</option>
                  <option value="trades">Total Trades</option>
                </select>
              </div>

              {/* View Mode */}
              <div className="flex rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 px-4 py-3 flex items-center justify-center space-x-2 transition-colors ${
                    viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  <span>Grid</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex-1 px-4 py-3 flex items-center justify-center space-x-2 transition-colors ${
                    viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <span>List</span>
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-xl mb-6">
              {success}
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white/80 rounded-2xl p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            /* Strategy Grid/List */
            <div>
              {filteredStrategies.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No strategies found</h3>
                  <p className="text-gray-600 mb-6">Create your first trading strategy or adjust your filters.</p>
                  <button
                    onClick={handleCreateNew}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-xl hover:from-blue-700 hover:to-purple-800 transition-all"
                  >
                    Create Strategy
                  </button>
                </div>
              ) : (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
                  {filteredStrategies.map((strategy) => (
                    viewMode === 'grid' ? (
                      <StrategyCard
                        key={strategy.id}
                        strategy={strategy}
                        onView={handleViewStrategy}
                        onEdit={handleEditStrategy}
                        onDelete={handleDeleteStrategy}
                        onClone={handleCloneStrategy}
                      />
                    ) : (
                      <div key={strategy.id} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20 hover:shadow-xl transition-all">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 flex-1">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white bg-gradient-to-br ${
                              strategy.type === 'scalping' ? 'from-red-500 to-orange-600' :
                              strategy.type === 'swing' ? 'from-blue-500 to-indigo-600' :
                              strategy.type === 'position' ? 'from-green-500 to-emerald-600' :
                              strategy.type === 'day' ? 'from-yellow-500 to-orange-600' :
                              strategy.type === 'algorithmic' ? 'from-purple-500 to-pink-600' :
                              'from-gray-500 to-gray-600'
                            }`}>
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <h3 className="text-lg font-semibold text-gray-900">{strategy.name}</h3>
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full capitalize">
                                  {strategy.type}
                                </span>
                                <div className={`w-2 h-2 rounded-full ${strategy.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{strategy.description}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-6">
                            {strategy.performance && (
                              <>
                                <div className="text-center">
                                  <p className={`text-lg font-bold ${strategy.performance.winRate >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                                    {strategy.performance.winRate.toFixed(1)}%
                                  </p>
                                  <p className="text-xs text-gray-500">Win Rate</p>
                                </div>
                                <div className="text-center">
                                  <p className={`text-lg font-bold ${strategy.performance.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    ${strategy.performance.profitLoss >= 0 ? '+' : ''}{strategy.performance.profitLoss.toFixed(0)}
                                  </p>
                                  <p className="text-xs text-gray-500">P&L</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-lg font-bold text-gray-900">{strategy.performance.totalTrades}</p>
                                  <p className="text-xs text-gray-500">Trades</p>
                                </div>
                              </>
                            )}
                            
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleViewStrategy(strategy)}
                                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                title="View Details"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleEditStrategy(strategy)}
                                className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                                title="Edit Strategy"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleCloneStrategy(strategy)}
                                className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                                title="Clone Strategy"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteStrategy(strategy.id)}
                                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                title="Delete Strategy"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modals */}
        {showDetailModal && selectedStrategy && (
          <StrategyDetailModal
            isOpen={showDetailModal}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedStrategy(null);
            }}
            strategy={selectedStrategy}
            onClone={handleCloneStrategy}
            onEdit={handleEditStrategy}
          />
        )}

        {showEditModal && (
          <StrategyEditModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedStrategy(null);
            }}
            onSave={handleSaveStrategy}
            strategy={selectedStrategy}
          />
        )}
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </ErrorBoundary>
  );
} 