'use client';

import React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/AuthProvider';
import UpdateTradeModal from '../components/UpdateTradeModal';
import TradeDetailModal from '../components/TradeDetailModal';
import { useAccount } from '../components/AccountProvider';
import { TradingJournalSkeleton } from '../components/SimpleLoading';
import ErrorBoundary from '../components/ErrorBoundary';
import ProfitCalendar from '../components/ProfitCalendar';
import EditTradeModal from '../components/EditTradeModal';
import { 
  CalendarDaysIcon, 
  CalendarIcon, 
  TagIcon, 
  ScaleIcon, 
  ChartPieIcon, 
  ArrowsRightLeftIcon, 
  XMarkIcon, 
  FaceFrownIcon, 
  FaceSmileIcon, 
  SparklesIcon,
  NewspaperIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'; // Assuming outline version, adjust if solid is used elsewhere

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
  tradeDirection: 'LONG' | 'SHORT';
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
  mood?: string;
  confidence?: number;
  marketCondition?: string;
  createdAt: string;
  updatedAt?: string; // Made optional
}

interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  mood: string;
  confidence: number;
  tags: string[];
  images?: string[];
  trades?: string[];
  marketCondition?: string;
  lessons?: string;
  goals?: string;
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
  weeklyPerformance: { week: string; pnl: number }[];
  monthlyPerformance: { month: string; pnl: number }[];
}

const moods = [
  { 
    value: 'excited', 
    label: 'Excited', 
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ), 
    color: 'text-green-500' 
  },
  { 
    value: 'confident', 
    label: 'Confident', 
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ), 
    color: 'text-blue-500' 
  },
  { 
    value: 'calm', 
    label: 'Calm', 
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ), 
    color: 'text-purple-500' 
  },
  { 
    value: 'neutral', 
    label: 'Neutral', 
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
      </svg>
    ), 
    color: 'text-gray-500' 
  },
  { 
    value: 'anxious', 
    label: 'Anxious', 
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ), 
    color: 'text-yellow-500' 
  },
  { 
    value: 'frustrated', 
    label: 'Frustrated', 
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ), 
    color: 'text-orange-500' 
  },
  { 
    value: 'disappointed', 
    label: 'Disappointed', 
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    ), 
    color: 'text-red-500' 
  },
];

const marketConditions = [
  { 
    value: 'trending', 
    label: 'Trending', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    )
  },
  { 
    value: 'ranging', 
    label: 'Ranging', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
      </svg>
    )
  },
  { 
    value: 'volatile', 
    label: 'Volatile', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
  },
  { 
    value: 'quiet', 
    label: 'Quiet', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.5 12a5.5 5.5 0 01-11 0 5.5 5.5 0 0111 0z" />
      </svg>
    )
  },
  { 
    value: 'news-driven', 
    label: 'News Driven', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    )
  },
];

export default function TradingJournal() {
  const { user, logout } = useAuth();
  const { selectedAccount, updateAccount, refreshAccounts } = useAccount();
  const router = useRouter();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'trades' | 'entries' | 'analytics' | 'insights'>('overview');
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [updateModalTrade, setUpdateModalTrade] = useState<Trade | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [sortBy, setSortBy] = useState<'date' | 'profit' | 'symbol' | 'rr'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [stats, setStats] = useState<JournalStats | null>(null);
  const [showNewEntryModal, setShowNewEntryModal] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState('7d');
  const [editModalTrade, setEditModalTrade] = useState<Trade | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    if (user && selectedAccount) {
      fetchTrades();
      fetchJournalEntries();
    }
  }, [user, router, selectedAccount]);

  const calculateWeeklyPerformance = (trades: Trade[]) => {
    // Implementation for weekly performance calculation
    return [];
  };

  const calculateMonthlyPerformance = (trades: Trade[]) => {
    // Implementation for monthly performance calculation
    return [];
  };

  const calculatedStats = useMemo(() => {
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
          weeklyPerformance: [],
          monthlyPerformance: [],
      };
    }

    const closedTrades = tradesData.filter(t => t.status === 'CLOSED');
    const winningTrades = closedTrades.filter(t => t.profitDollars > t.lossDollars);
    const losingTrades = closedTrades.filter(t => t.profitDollars < t.lossDollars);

    const totalProfit = winningTrades.reduce((sum, t) => sum + t.profitDollars, 0);
    const totalLoss = losingTrades.reduce((sum, t) => sum + t.lossDollars, 0);

      // Calculate weekly and monthly performance
      const weeklyPerf = calculateWeeklyPerformance(closedTrades);
      const monthlyPerf = calculateMonthlyPerformance(closedTrades);

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
        largestWinStreak: 0,
        largestLossStreak: 0,
        currentStreak: 0,
        streakType: 'none',
        weeklyPerformance: weeklyPerf,
        monthlyPerformance: monthlyPerf,
    };
    };

    return calculateStats(trades);
  }, [trades]);

  const fetchTrades = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !selectedAccount) return;

      const response = await fetch(`/api/trades?accountId=${selectedAccount.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setTrades(data.trades || []);
      }
    } catch (error) {
      setError('Failed to fetch trades');
    } finally {
      setLoading(false);
    }
  };

  const fetchJournalEntries = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !selectedAccount) return;

      const response = await fetch(`/api/journal?accountId=${selectedAccount.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setJournalEntries(data.entries || []);
      }
    } catch (error) {
      console.error('Failed to fetch journal entries:', error);
    }
  };

  const handleUpdateTrade = async (tradeId: string, updateData: any) => {
    console.log('=== UPDATE TRADE START ===');
    console.log('Trade ID:', tradeId);
    console.log('Update data:', updateData);
    
    try {
      const response = await fetch(`/api/trades/${tradeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updateData)
      });

      console.log('Update API Response Status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Update API Error Response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('Update API Success Response:', result);
      
      // ✅ REAL-TIME UPDATES: Refresh all data immediately
      await Promise.all([
        fetchTrades(),
        fetchJournalEntries()
      ]);

      // ✅ REFRESH ACCOUNTS if balance was updated by backend
      if (result.balanceUpdated && selectedAccount) {
        await refreshAccounts();
        
        // ✅ BROADCAST BALANCE UPDATE EVENT
        window.dispatchEvent(new CustomEvent('accountBalanceUpdated', { 
          detail: { 
            accountId: selectedAccount.id, 
            pnlAmount: result.pnlAmount,
            tradeStatus: updateData.status 
          } 
        }));
      }

      // ✅ NOTIFY OTHER PAGES TO REFRESH
      window.dispatchEvent(new CustomEvent('tradesUpdated', { 
        detail: { action: 'update', tradeId, updateData } 
      }));

      alert('Trade updated successfully!');
      setUpdateModalTrade(null);
      
    } catch (error) {
      console.error('=== UPDATE TRADE ERROR ===');
      console.error('Error object:', error);
      alert(`Failed to update trade: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const updateAccountBalance = async (updateData: any) => {
    if (!selectedAccount) return;
    
    try {
      let balanceChange = 0;
      
      // Calculate balance change based on trade status
      if (updateData.status === 'WIN' && updateData.profitDollars) {
        balanceChange = updateData.profitDollars;
      } else if (updateData.status === 'LOSS' && updateData.profitDollars) {
        // For LOSS trades, profitDollars contains the loss amount as positive value
        balanceChange = -Math.abs(updateData.profitDollars);
      } else {
        console.log('No profit/loss amount found, skipping balance update');
        return;
      }
      
      const newBalance = selectedAccount.currentBalance + balanceChange;
      
      console.log('Updating account balance:', {
        status: updateData.status,
        currentBalance: selectedAccount.currentBalance,
        balanceChange,
        newBalance,
        profitDollars: updateData.profitDollars
      });
      
      await updateAccount(selectedAccount.id, { currentBalance: newBalance });
      
      // ✅ NOTIFY ACCOUNT BALANCE UPDATE
      window.dispatchEvent(new CustomEvent('accountBalanceUpdated', { 
        detail: { accountId: selectedAccount.id, newBalance } 
      }));
      
    } catch (error) {
      console.error('Failed to update account balance:', error);
      throw error;
    }
  };

  const handleEditTrade = async (tradeId: string, updatedData: any) => {
    console.log('=== EDIT TRADE START ===');
    console.log('Trade ID:', tradeId);
    console.log('Update data:', updatedData);
    
    try {
      const response = await fetch(`/api/trades/${tradeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updatedData)
      });

      console.log('Edit API Response Status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Edit API Error Response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('Edit API Success Response:', result);
      
      // ✅ REAL-TIME UPDATES: Refresh all data
      await Promise.all([
        fetchTrades(),
        fetchJournalEntries()
      ]);

      // ✅ UPDATE ACCOUNT BALANCE if needed
      if (selectedAccount && (updatedData.status === 'WIN' || updatedData.status === 'LOSS')) {
        try {
          await updateAccountBalance(updatedData);
        } catch (balanceError) {
          console.warn('Account balance update failed:', balanceError);
        }
      }

      // ✅ NOTIFY OTHER PAGES TO REFRESH
      window.dispatchEvent(new CustomEvent('tradesUpdated', { 
        detail: { action: 'edit', tradeId, updatedData } 
      }));

      alert('Trade updated successfully!');
      setEditModalTrade(null);
      
    } catch (error) {
      console.error('=== EDIT TRADE ERROR ===');
      console.error('Error object:', error);
      alert(`Failed to edit trade: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (loading) {
    return <TradingJournalSkeleton />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
        {/* Beautiful Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 shadow-lg">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="py-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 via-teal-500 to-blue-500 rounded-3xl flex items-center justify-center shadow-2xl">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-3 border-white flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-emerald-700 bg-clip-text text-transparent">
                      Trading Journal
                    </h1>
                    <p className="text-gray-600 mt-2 text-lg">Track your trades, emotions, and insights with precision</p>
                    <div className="flex items-center space-x-4 mt-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <span className="text-sm text-gray-500">Live Data</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-500">Real-time Analytics</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => router.push('/add-trade')}
                    className="group relative bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 transform"
                  >
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      <span>Add Trade</span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  </button>
                  <button
                    onClick={() => setShowNewEntryModal(true)}
                    data-new-entry
                    className="group relative bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500 hover:from-emerald-600 hover:via-teal-600 hover:to-green-600 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 transform"
                  >
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>New Entry</span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-500 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  </button>
                </div>
              </div>

              {/* Enhanced Navigation Tabs */}
              <div className="mt-10">
                <nav className="flex space-x-2 bg-white/60 backdrop-blur-md rounded-3xl p-2 shadow-lg border border-white/20">
                  {[
                    { 
                      id: 'overview', 
                      label: 'Overview', 
                      icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                      ), 
                      gradient: 'from-purple-500 to-pink-500' 
                    },
                    { 
                      id: 'trades', 
                      label: 'Trades', 
                      icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      ), 
                      gradient: 'from-blue-500 to-indigo-500' 
                    },
                    { 
                      id: 'entries', 
                      label: 'Journal', 
                      icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      ), 
                      gradient: 'from-emerald-500 to-teal-500' 
                    },
                    { 
                      id: 'analytics', 
                      label: 'Analytics', 
                      icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      ), 
                      gradient: 'from-orange-500 to-red-500' 
                    },
                    { 
                      id: 'insights', 
                      label: 'Insights', 
                      icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      ), 
                      gradient: 'from-yellow-500 to-orange-500' 
                    },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`relative flex items-center space-x-3 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 ${
                        activeTab === tab.id
                          ? `bg-gradient-to-r ${tab.gradient} text-white shadow-xl scale-105`
                          : 'text-gray-700 hover:text-gray-900 hover:bg-white/80 hover:shadow-md'
                      }`}
                    >
                      <span className="text-xl">{tab.icon}</span>
                      <span className="font-medium">{tab.label}</span>
                      {activeTab === tab.id && (
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-2xl"></div>
                      )}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
          {activeTab === 'overview' && <OverviewSection stats={calculatedStats} trades={trades} entries={journalEntries} />}
          {activeTab === 'trades' && <TradesSection 
            trades={trades} 
            onEditTrade={setUpdateModalTrade} 
            fetchTrades={fetchTrades} 
            fetchJournalEntries={fetchJournalEntries} 
            selectedAccount={selectedAccount} 
            updateAccountBalance={updateAccountBalance} 
          />}
          {activeTab === 'entries' && <JournalEntriesSection entries={journalEntries} />}
          {activeTab === 'analytics' && <AnalyticsSection stats={calculatedStats} trades={trades} />}
          {activeTab === 'insights' && <InsightsSection trades={trades} entries={journalEntries} />}
        </div>

        {/* New Entry Modal */}
        {showNewEntryModal && (
          <NewJournalEntryModal
            onClose={() => setShowNewEntryModal(false)}
            onSave={(entry) => {
              setJournalEntries([entry, ...journalEntries]);
              setShowNewEntryModal(false);
            }}
          />
        )}

        {/* Trade Detail Modal */}
        {selectedTrade && (
          <TradeDetailModal
            trade={selectedTrade}
            onClose={() => setSelectedTrade(null)}
            onEdit={(tradeFromModal) => {
              // Ensure the trade object has all required properties and preserve the id
              console.log('Main component TradeDetailModal onEdit called with:', { tradeFromModal, selectedTrade });
              const completeTradeData = {
                ...selectedTrade, // Use the selectedTrade as base to ensure id is preserved
                ...tradeFromModal, // Override with any updates from modal
                category: tradeFromModal.category || selectedTrade.category || 'FOREX',
                id: selectedTrade.id // Explicitly ensure id is preserved
              } as Trade;
              console.log('Main component complete trade data being passed to setUpdateModalTrade:', completeTradeData);
              setUpdateModalTrade(completeTradeData);
              setSelectedTrade(null);
            }}
          />
        )}

        {/* Update Trade Modal */}
        {updateModalTrade && (
          <UpdateTradeModal
            trade={updateModalTrade}
            isOpen={!!updateModalTrade}
            onClose={() => setUpdateModalTrade(null)}
            onUpdate={handleUpdateTrade}
          />
        )}

        {/* Edit Trade Modal */}
        {editModalTrade && (
          <EditTradeModal
            trade={editModalTrade}
            onClose={() => setEditModalTrade(null)}
            onSave={handleEditTrade}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

// Overview Section Component
function OverviewSection({ stats, trades, entries }: { stats: JournalStats; trades: Trade[]; entries: JournalEntry[] }) {
  const recentTrades = trades.slice(0, 5);
  const recentEntries = entries.slice(0, 3);

  return (
    <div className="space-y-10">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="group relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-100/50 hover:shadow-2xl transition-all duration-300 hover:scale-105 transform">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Trades</p>
                <p className="text-4xl font-bold text-gray-900 mt-3">{stats.totalTrades}</p>
                <div className="flex items-center mt-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-xs text-gray-500">All time</span>
                </div>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="group relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-100/50 hover:shadow-2xl transition-all duration-300 hover:scale-105 transform">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Win Rate</p>
                <p className="text-4xl font-bold text-emerald-600 mt-3">{stats.winRate.toFixed(1)}%</p>
                <div className="flex items-center mt-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                  <span className="text-xs text-gray-500">{stats.winningTrades}W / {stats.losingTrades}L</span>
                </div>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="group relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-100/50 hover:shadow-2xl transition-all duration-300 hover:scale-105 transform">
          <div className={`absolute inset-0 bg-gradient-to-br ${stats.netPnL >= 0 ? 'from-emerald-500/5 to-green-500/5' : 'from-red-500/5 to-pink-500/5'} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
          <div className="relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Net P&L</p>
                <p className={`text-4xl font-bold mt-3 ${stats.netPnL >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {stats.netPnL >= 0 ? '+' : ''}${stats.netPnL.toFixed(2)}
                </p>
                <div className="flex items-center mt-2">
                  <div className={`w-2 h-2 ${stats.netPnL >= 0 ? 'bg-emerald-500' : 'bg-red-500'} rounded-full mr-2`}></div>
                  <span className="text-xs text-gray-500">Total return</span>
                </div>
              </div>
              <div className={`w-16 h-16 bg-gradient-to-br ${stats.netPnL >= 0 ? 'from-emerald-100 to-emerald-200' : 'from-red-100 to-red-200'} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <svg className={`w-8 h-8 ${stats.netPnL >= 0 ? 'text-emerald-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="group relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-100/50 hover:shadow-2xl transition-all duration-300 hover:scale-105 transform">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Journal Entries</p>
                <p className="text-4xl font-bold text-purple-600 mt-3">{entries.length}</p>
                <div className="flex items-center mt-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  <span className="text-xs text-gray-500">Psychology tracking</span>
                </div>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Recent Trades */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100/50">
          <div className="p-8 border-b border-gray-100/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Recent Trades</h3>
              </div>
              <span className="text-sm text-gray-500">Last 5 trades</span>
            </div>
          </div>
          <div className="p-8 space-y-6">
            {recentTrades.length > 0 ? recentTrades.map((trade) => (
              <div key={trade.id} className="group flex items-center justify-between p-6 bg-gradient-to-r from-gray-50/50 to-white/50 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <div className={`w-4 h-4 rounded-full ${
                    trade.status === 'CLOSED' ? 'bg-emerald-500' : 
                    trade.status === 'ACTIVE' ? 'bg-blue-500' : 'bg-yellow-500'
                  } group-hover:scale-125 transition-transform duration-300`}></div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{trade.symbol}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        trade.tradeDirection === 'LONG' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {trade.tradeDirection === 'LONG' ? (
                          <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                          </svg>
                        )} {trade.tradeDirection}
                      </span>
                      <span className="text-sm text-gray-600">{trade.category}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-lg ${((trade.profitDollars || 0) - (trade.lossDollars || 0)) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {((trade.profitDollars || 0) - (trade.lossDollars || 0)) >= 0 ? '+' : ''}${((trade.profitDollars || 0) - (trade.lossDollars || 0)).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(trade.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            )) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">No trades yet</p>
                <p className="text-sm text-gray-400 mt-1">Start by adding your first trade</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Journal Entries */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100/50">
          <div className="p-8 border-b border-gray-100/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Recent Journal Entries</h3>
              </div>
              <span className="text-sm text-gray-500">Latest insights</span>
            </div>
          </div>
          <div className="p-8 space-y-6">
            {recentEntries.length > 0 ? recentEntries.map((entry) => (
              <div key={entry.id} className="group p-6 bg-gradient-to-r from-gray-50/50 to-white/50 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-gray-900 text-lg group-hover:text-purple-600 transition-colors duration-300">{entry.title}</h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-3xl">
                      {moods.find(m => m.value === entry.mood)?.icon || '😐'}
                    </span>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                            i <= entry.confidence ? 'bg-emerald-500' : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 line-clamp-2 leading-relaxed">{entry.content}</p>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex flex-wrap gap-2">
                    {(entry.tags || []).slice(0, 2).map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                    {(entry.tags || []).length > 2 && (
                      <span className="text-xs text-gray-500">+{(entry.tags || []).length - 2} more</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 font-medium">
                    {new Date(entry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            )) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">No journal entries yet</p>
                <p className="text-sm text-gray-400 mt-1">Start tracking your trading psychology</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Trades Section Component
function TradesSection({ 
  trades, 
  onEditTrade, 
  fetchTrades, 
  fetchJournalEntries, 
  selectedAccount, 
  updateAccountBalance 
}: { 
  trades: Trade[]; 
  onEditTrade: (trade: Trade) => void;
  fetchTrades: () => Promise<void>;
  fetchJournalEntries: () => Promise<void>;
  selectedAccount: any;
  updateAccountBalance: (updateData: any) => Promise<void>;
}) {
  const [filteredTrades, setFilteredTrades] = useState<Trade[]>(trades);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'profit' | 'symbol' | 'rr'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [editModalTrade, setEditModalTrade] = useState<Trade | null>(null);
  const [updateModalTrade, setUpdateModalTrade] = useState<Trade | null>(null);
  const [deleteModalTrade, setDeleteModalTrade] = useState<Trade | null>(null);

  // Filter and search trades
  useEffect(() => {
    let filtered = [...trades];

    // Filter by status
    if (filterStatus !== 'ALL') {
      filtered = filtered.filter(trade => trade.status === filterStatus);
    }

    // Search by symbol or notes
    if (searchTerm) {
      filtered = filtered.filter(trade => 
        trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           trade.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (trade.tags || []).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Sort trades
    filtered.sort((a, b) => {
      let aValue, bValue;

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
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredTrades(filtered);
  }, [trades, filterStatus, searchTerm, sortBy, sortOrder]);

  const handleDeleteTrade = async (tradeId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      console.log('🗑️ DELETING TRADE - Starting comprehensive deletion process');
      console.log('Trade ID:', tradeId);

      const response = await fetch(`/api/trades/${tradeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ Trade deleted from database:', responseData);

        // ✅ COMPREHENSIVE REAL-TIME UPDATES
        console.log('🔄 Starting comprehensive data refresh...');
        
        // 1. Refresh all trade data and journal entries
        await Promise.all([
          fetchTrades(),
          fetchJournalEntries()
        ]);
        console.log('✅ Trades and journal entries refreshed');

        // 2. Trigger recalculation of statistics by refreshing the calculatedStats
        // This will automatically update:
        // - Total trade counts
        // - Win/Loss ratios
        // - P&L calculations
        // - Performance metrics
        // - Streak calculations
        // - All dashboard metrics
        console.log('📊 Statistics will be recalculated on next render');

        // 3. Close any open modals immediately
        setDeleteModalTrade(null);
        setSelectedTrade(null);
        setEditModalTrade(null);
        setUpdateModalTrade(null);

        // 4. ✅ NOTIFY ALL COMPONENTS ACROSS THE ENTIRE PROJECT
        console.log('📡 Broadcasting deletion events to all components...');
        
        // Main deletion event
        window.dispatchEvent(new CustomEvent('tradesUpdated', { 
          detail: { 
            action: 'delete', 
            tradeId,
            timestamp: new Date().toISOString(),
            source: 'journal'
          } 
        }));

        // Specific events for different components
        window.dispatchEvent(new CustomEvent('tradeDeleted', { 
          detail: { 
            tradeId,
            deletedTrade: responseData.deletedTrade,
            timestamp: new Date().toISOString()
          } 
        }));

        // Dashboard refresh event
        window.dispatchEvent(new CustomEvent('dashboardDataUpdate', { 
          detail: { 
            action: 'tradeDeleted',
            tradeId,
            timestamp: new Date().toISOString()
          } 
        }));

        // P&L recalculation event
        window.dispatchEvent(new CustomEvent('pnlRecalculate', { 
          detail: { 
            action: 'tradeDeleted',
            tradeId,
            timestamp: new Date().toISOString()
          } 
        }));

        // Statistics update event
        window.dispatchEvent(new CustomEvent('statisticsUpdate', { 
          detail: { 
            action: 'tradeDeleted',
            tradeId,
            timestamp: new Date().toISOString()
          } 
        }));

        // Account balance may need updating if this was a WIN/LOSS trade
        if (responseData.deletedTrade) {
          window.dispatchEvent(new CustomEvent('accountBalanceRecalculate', { 
            detail: { 
              action: 'tradeDeleted',
              tradeId,
              accountId: responseData.deletedTrade.accountId,
              timestamp: new Date().toISOString()
            } 
          }));
        }

        // 5. ✅ FORCE COMPONENT REFRESHES
        // Force a complete re-render to ensure all components update
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('forceRefresh', { 
            detail: { 
              action: 'tradeDeleted',
              tradeId,
              timestamp: new Date().toISOString()
            } 
          }));
        }, 100);

        console.log('✅ All deletion events broadcast successfully');
        alert(`Trade ${responseData.deletedTrade?.symbol || tradeId} deleted successfully!`);

      } else {
        const errorText = await response.text();
        console.error('❌ Delete API Error Response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Error deleting trade:', error);
      alert(`Failed to delete trade: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleEditTrade = async (tradeId: string, updatedData: any) => {
    console.log('=== EDIT TRADE START ===');
    console.log('Trade ID:', tradeId);
    console.log('Update data:', updatedData);
    
    try {
      const response = await fetch(`/api/trades/${tradeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updatedData)
      });

      console.log('Edit API Response Status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Edit API Error Response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('Edit API Success Response:', result);
      
      // ✅ REAL-TIME UPDATES: Refresh all data
      await Promise.all([
        fetchTrades(),
        fetchJournalEntries()
      ]);

      // ✅ UPDATE ACCOUNT BALANCE if needed
      if (selectedAccount && (updatedData.status === 'WIN' || updatedData.status === 'LOSS')) {
        try {
          await updateAccountBalance(updatedData);
        } catch (balanceError) {
          console.warn('Account balance update failed:', balanceError);
        }
      }

      // ✅ NOTIFY OTHER PAGES TO REFRESH
      window.dispatchEvent(new CustomEvent('tradesUpdated', { 
        detail: { action: 'edit', tradeId, updatedData } 
      }));

      alert('Trade updated successfully!');
      setEditModalTrade(null);
      
    } catch (error) {
      console.error('=== EDIT TRADE ERROR ===');
      console.error('Error object:', error);
      alert(`Failed to edit trade: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleUpdateTrade = async (tradeId: string, updateData: any) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      console.log('Updating trade with ID:', tradeId);
      console.log('Update data:', updateData);

      const response = await fetch(`/api/trades/${tradeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      console.log('API Response status:', response.status);

      if (response.ok) {
        const responseData = await response.json();
        console.log('Update successful:', responseData);
        // Refresh trades list
        window.location.reload();
        setUpdateModalTrade(null);
        return { success: true };
      } else {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        
        throw new Error(errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error: any) {
      console.error('Error updating trade:', error);
      throw error;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'WIN': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'LOSS': return 'bg-red-100 text-red-800 border-red-200';
      case 'ACTIVE': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PLANNED': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CLOSED': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDirectionColor = (direction: string) => {
    return direction === 'LONG' ? 'text-emerald-600' : 'text-red-600';
  };

  const getPnLColor = (pnl: number) => {
    return pnl >= 0 ? 'text-emerald-600' : 'text-red-600';
  };

  return (
    <div className="space-y-8">
      {/* Filters and Search */}
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100/50 p-8">
        <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
            {/* Status Filter */}
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="appearance-none px-6 py-4 pr-12 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/80 backdrop-blur-sm font-medium text-gray-700 shadow-lg transition-all duration-300"
              >
                <option value="ALL">All Status</option>
                <option value="PLANNED">Planned</option>
                <option value="ACTIVE">Active</option>
                <option value="WIN">Win</option>
                <option value="LOSS">Loss</option>
                <option value="CLOSED">Closed</option>
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
          </div>

            {/* Sort Options */}
            <div className="relative">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field as 'date' | 'profit' | 'symbol');
                  setSortOrder(order as 'asc' | 'desc');
                }}
                className="appearance-none px-6 py-4 pr-12 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/80 backdrop-blur-sm font-medium text-gray-700 shadow-lg transition-all duration-300"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="profit-desc">Highest P&L</option>
                <option value="profit-asc">Lowest P&L</option>
                <option value="symbol-asc">Symbol A-Z</option>
                <option value="symbol-desc">Symbol Z-A</option>
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
            </div>
              </div>

          {/* Search */}
          <div className="relative w-full lg:w-80">
            <input
              type="text"
              placeholder="Search trades, symbols, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/80 backdrop-blur-sm font-medium text-gray-700 shadow-lg transition-all duration-300"
            />
            <div className="absolute left-5 top-1/2 transform -translate-y-1/2">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
        </div>
      </div>

        {/* Results Count */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-600">
              Showing {filteredTrades.length} of {trades.length} trades
            </span>
                </div>
          {filteredTrades.length > 0 && (
            <div className="text-sm text-gray-500">
              Total P&L: <span className={`font-bold ${filteredTrades.reduce((sum, t) => sum + ((t.profitDollars || 0) - (t.lossDollars || 0)), 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {filteredTrades.reduce((sum, t) => sum + ((t.profitDollars || 0) - (t.lossDollars || 0)), 0) >= 0 ? '+' : ''}${filteredTrades.reduce((sum, t) => sum + ((t.profitDollars || 0) - (t.lossDollars || 0)), 0).toFixed(2)}
                </span>
              </div>
          )}
              </div>
            </div>

      {/* Trades Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredTrades.map((trade) => {
          // Fixed P&L calculation - profitDollars is the actual profit, don't subtract lossDollars
          const profitValue = Number(trade.profitDollars) || 0;
          const lossValue = Number(trade.lossDollars) || 0;
          
          // Use only profitDollars as the P&L (don't subtract lossDollars)
          const pnl = profitValue;
          
          return (
            <div
              key={trade.id}
              className="group relative bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-100/60 hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] transform hover:bg-white/100"
            >
              {/* Improved Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-purple-50/30 to-emerald-50/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              
              {/* Subtle Corner Accent */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-tr-3xl opacity-30 group-hover:opacity-60 transition-opacity duration-500"></div>

              {/* Action Icons (top-right, hover/focus only) */}
              <div className="absolute top-6 right-6 flex space-x-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity z-10">
                <button
                  onClick={() => setSelectedTrade(trade)}
                  className="p-2 rounded-full bg-gray-50/90 hover:bg-indigo-100 text-gray-500 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm hover:shadow-md transition-all duration-300"
                  aria-label="View"
                  tabIndex={0}
                >
                  <EyeIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setEditModalTrade(trade)}
                  className="p-2 rounded-full bg-gray-50/90 hover:bg-blue-100 text-gray-500 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm hover:shadow-md transition-all duration-300"
                  aria-label="Edit"
                  tabIndex={0}
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setUpdateModalTrade(trade)}
                  className="p-2 rounded-full bg-gray-50/90 hover:bg-emerald-100 text-gray-500 hover:text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm hover:shadow-md transition-all duration-300"
                  aria-label="Update"
                  tabIndex={0}
                >
                  <ArrowPathIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setDeleteModalTrade(trade)}
                  className="p-2 rounded-full bg-gray-50/90 hover:bg-red-100 text-gray-500 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm hover:shadow-md transition-all duration-300"
                  aria-label="Delete"
                  tabIndex={0}
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Enhanced Header */}
              <div className="relative flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 ring-4 ring-white">
                    <span className="text-white font-bold text-xl">
                      {trade.symbol.split('/')[0].charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-xl group-hover:text-indigo-600 transition-colors duration-300 cursor-pointer"
                        onClick={() => setSelectedTrade(trade)}>
                      {trade.symbol}
                    </h3>
                    <p className="text-sm text-gray-600 font-medium flex items-center mt-1">
                      <span className={`w-2 h-2 rounded-full mr-2 ${trade.category === 'Forex' ? 'bg-blue-500' : trade.category === 'Crypto' ? 'bg-orange-500' : trade.category === 'Stocks' ? 'bg-green-500' : 'bg-purple-500'}`}></span>
                      {trade.category}
                    </p>
                  </div>
                </div>
                <span className={`px-4 py-2 rounded-2xl text-xs font-bold border-2 ${getStatusColor(trade.status)} shadow-lg backdrop-blur-sm`}>
                  {trade.status}
                </span>
              </div>

              {/* Trade Details - Improved Layout */}
              <div className="relative space-y-4 mb-6">
                <div className="flex justify-between items-center p-4 bg-gray-50/80 rounded-xl backdrop-blur-sm border border-gray-100/50 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <svg className={`w-4 h-4 ${trade.tradeDirection === 'LONG' ? 'text-green-500' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={trade.tradeDirection === 'LONG' ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"} />
                    </svg>
                    <span className="text-sm font-medium text-gray-600">Direction:</span>
                  </div>
                  <span className={`text-sm font-bold ${getDirectionColor(trade.tradeDirection)}`}>
                    {trade.tradeDirection}
                  </span>
                </div>

                {/* Price Information - Improved Layout */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50/80 rounded-xl p-3 text-center border border-gray-100/50 shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">Entry</p>
                    <p className="font-bold text-gray-800">{trade.entryPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 5})}</p>
                  </div>
                  <div className="bg-gray-50/80 rounded-xl p-3 text-center border border-gray-100/50 shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">Exit</p>
                    <p className="font-bold text-gray-800">{trade.exitPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 5})}</p>
                  </div>
                  <div className="bg-gray-50/80 rounded-xl p-3 text-center border border-gray-100/50 shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">Stop Loss</p>
                    <p className="font-bold text-gray-800">{trade.stopLoss.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 5})}</p>
                  </div>
                </div>

                {/* P&L Section - Visually Enhanced */}
                <div className={`flex justify-between items-center p-4 rounded-xl ${pnl >= 0 ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'} shadow-sm`}>
                  <div className="flex items-center space-x-2">
                    <svg className={`w-5 h-5 ${pnl >= 0 ? 'text-green-500' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={pnl >= 0 ? "M9 11l3 3L22 4" : "M6 18L18 6M6 6l12 12"} />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">P&L:</span>
                  </div>
                  <span className={`text-base font-bold ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {pnl >= 0 ? '+' : ''}{pnl.toLocaleString(undefined, {style: 'currency', currency: 'USD'})}
                  </span>
                </div>

                {/* Risk Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50/80 rounded-xl p-3 text-center border border-gray-100/50 shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">Risk</p>
                    <p className="font-bold text-gray-800">{trade.riskPercentage}%</p>
                  </div>
                  <div className="bg-gray-50/80 rounded-xl p-3 text-center border border-gray-100/50 shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">R:R</p>
                    <p className="font-bold text-gray-800">{trade.riskRewardRatio ? trade.riskRewardRatio.toFixed(2) : 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Footer with Date - Improved */}
              <div className="relative mt-6 pt-6 border-t border-gray-200/50">
                <div className="flex items-center space-x-2 text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm font-medium">
                    {new Date(trade.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredTrades.length === 0 && (
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100/50 p-16 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No trades found</h3>
          <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
            {trades.length === 0 
              ? "You haven't created any trades yet. Start your trading journey today!"
              : "Try adjusting your filters or search terms to find trades."
            }
          </p>
          {trades.length === 0 && (
                  <button
              onClick={() => window.location.href = '/add-trade'}
              className="group relative bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500 hover:from-emerald-600 hover:via-teal-600 hover:to-green-600 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 transform"
                  >
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                <span>Add Your First Trade</span>
              </div>
                  </button>
                )}
              </div>
      )}

      {/* Trade Detail Modal */}
      {selectedTrade && (
        <TradeDetailModal
          trade={selectedTrade}
          onClose={() => setSelectedTrade(null)}
          onEdit={(tradeFromModal) => {
            const completeTradeData = {
              ...selectedTrade,
              ...tradeFromModal,
              category: tradeFromModal.category || selectedTrade.category || 'FOREX',
              id: selectedTrade.id
            } as Trade;
            setUpdateModalTrade(completeTradeData);
            setSelectedTrade(null);
          }}
        />
      )}

      {/* Edit Trade Modal */}
      {editModalTrade && (
        <EditTradeModal
          trade={editModalTrade}
          onClose={() => setEditModalTrade(null)}
          onSave={handleEditTrade}
        />
      )}

      {/* Update Trade Modal */}
      {updateModalTrade && (
        <UpdateTradeModal
          trade={updateModalTrade}
          isOpen={!!updateModalTrade}
          onClose={() => setUpdateModalTrade(null)}
          onUpdate={handleUpdateTrade}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalTrade && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-md p-8 transform transition-all duration-300">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Delete Trade</h3>
              <p className="text-gray-600 mb-2">Are you sure you want to delete</p>
              <p className="text-lg font-semibold text-gray-900 mb-6">{deleteModalTrade.symbol}?</p>
              <p className="text-sm text-red-600 mb-8">This action cannot be undone.</p>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => setDeleteModalTrade(null)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-colors duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteTrade(deleteModalTrade.id)}
                  className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
            </div>
  );
}

// Journal Entries Section Component
function JournalEntriesSection({ entries }: { entries: JournalEntry[] }) {
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>(entries);
  const [filterMood, setFilterMood] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'mood' | 'confidence'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter and search entries
  useEffect(() => {
    let filtered = [...entries];

    // Filter by mood
    if (filterMood !== 'ALL') {
      filtered = filtered.filter(entry => entry.mood === filterMood);
    }

    // Search by title, content, or tags
    if (searchTerm) {
      filtered = filtered.filter(entry => 
        entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (entry.tags || []).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Sort entries
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'mood':
          aValue = a.mood;
          bValue = b.mood;
          break;
        case 'confidence':
          aValue = a.confidence;
          bValue = b.confidence;
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

    setFilteredEntries(filtered);
  }, [entries, filterMood, searchTerm, sortBy, sortOrder]);

  return (
    <div className="space-y-8">
      {/* Filters and Search */}
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100/50 p-8">
        <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
            {/* Mood Filter */}
              <div className="relative">
                <select
                value={filterMood}
                onChange={(e) => setFilterMood(e.target.value)}
                className="appearance-none px-6 py-4 pr-12 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/80 backdrop-blur-sm font-medium text-gray-700 shadow-lg transition-all duration-300"
              >
                <option value="ALL">All Moods</option>
                {moods.map((mood) => (
                  <option key={mood.value} value={mood.value}>
                    {mood.label}
                  </option>
                ))}
                </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
              </div>
            </div>

            {/* Sort Options */}
              <div className="relative">
                <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field as 'date' | 'mood' | 'confidence');
                  setSortOrder(order as 'asc' | 'desc');
                }}
                className="appearance-none px-6 py-4 pr-12 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/80 backdrop-blur-sm font-medium text-gray-700 shadow-lg transition-all duration-300"
              >
                <option value="date-desc">
                  <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Newest First
                </option>
                <option value="date-asc">
                  <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Oldest First
                </option>
                <option value="confidence-desc">
                  <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  Highest Confidence
                </option>
                <option value="confidence-asc">
                  <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  Lowest Confidence
                </option>
                <option value="mood-asc">
                  <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Mood A-Z
                </option>
                <option value="mood-desc">
                  <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Mood Z-A
                </option>
                </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

          {/* Search */}
          <div className="relative w-full lg:w-80">
            <input
              type="text"
              placeholder="Search entries, content, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/80 backdrop-blur-sm font-medium text-gray-700 shadow-lg transition-all duration-300"
            />
            <div className="absolute left-5 top-1/2 transform -translate-y-1/2">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
            {searchTerm && (
                <button
                onClick={() => setSearchTerm('')}
                className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-600">
              Showing {filteredEntries.length} of {entries.length} journal entries
            </span>
          </div>
          {filteredEntries.length > 0 && (
            <div className="text-sm text-gray-500">
              Avg Confidence: <span className="font-bold text-purple-600">
                {(filteredEntries.reduce((sum, entry) => sum + entry.confidence, 0) / filteredEntries.length).toFixed(1)}/5
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Journal Entries Grid */}
      <div className="space-y-8">
        {filteredEntries.length > 0 ? filteredEntries.map((entry) => {
          const moodData = moods.find(m => m.value === entry.mood);
          const marketConditionData = marketConditions.find(mc => mc.value === entry.marketCondition);
          
          return (
            <div key={entry.id} className="group relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-100/50 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] transform">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/20 to-pink-50/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Header */}
              <div className="relative flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-400 via-pink-500 to-red-400 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <span className="text-white">
                        {moodData?.icon || (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        )}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-2xl group-hover:text-purple-600 transition-colors duration-300 mb-1">
                        {entry.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                          <span className="font-medium">
                            {new Date(entry.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        {entry.marketCondition && (
                          <div className="flex items-center space-x-1">
                            <span className="text-gray-600">
                              {marketConditionData?.icon || (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                              )}
                            </span>
                            <span className="font-medium capitalize">{entry.marketCondition}</span>
                          </div>
                        )}
                      </div>
                    </div>
              </div>
            </div>

                {/* Confidence Level */}
                <div className="flex flex-col items-end space-y-2">
                  <span className="text-sm font-medium text-gray-600">Confidence</span>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`w-4 h-4 rounded-full transition-all duration-300 ${
                          i <= entry.confidence 
                            ? 'bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-lg scale-110' 
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
            </div>
                  <span className="text-xs font-bold text-emerald-600">{entry.confidence}/5</span>
          </div>
        </div>

              {/* Content */}
              <div className="relative mb-6">
                <div className="bg-gradient-to-r from-gray-50/80 to-white/80 rounded-2xl p-6 border border-gray-100">
                  <p className="text-gray-700 leading-relaxed text-lg font-medium">{entry.content}</p>
                </div>
              </div>

              {/* Lessons and Goals */}
              {(entry.lessons || entry.goals) && (
                <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {entry.lessons && (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <h4 className="font-bold text-blue-900">Lessons Learned</h4>
                      </div>
                      <p className="text-blue-800 font-medium">{entry.lessons}</p>
          </div>
        )}

                  {entry.goals && (
                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-100">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center">
                          <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                          </svg>
          </div>
                        <h4 className="font-bold text-emerald-900">Goals</h4>
                      </div>
                      <p className="text-emerald-800 font-medium">{entry.goals}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tags */}
              {entry.tags.length > 0 && (
                <div className="relative pt-6 border-t border-gray-200/50">
                  <div className="flex items-center space-x-2 mb-4">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                    <span className="text-sm font-medium text-gray-600">Tags</span>
              </div>
                  <div className="flex flex-wrap gap-3">
                    {entry.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-2xl text-sm font-bold border border-purple-200 hover:shadow-lg transition-all duration-300"
                      >
                        #{tag}
                      </span>
                    ))}
            </div>
                </div>
              )}
            </div>
          );
        }) : (
          // Enhanced Empty State
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100/50 p-16 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No journal entries found</h3>
            <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
              {entries.length === 0 
                ? "Start tracking your trading psychology by creating your first journal entry!"
                : "Try adjusting your filters or search terms to find entries."
              }
            </p>
            {entries.length === 0 && (
                <button
                onClick={() => {
                  const newEntryBtn = document.querySelector('[data-new-entry]') as HTMLButtonElement;
                  newEntryBtn?.click();
                }}
                className="group relative bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 transform"
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Create Your First Entry</span>
              </div>
              </button>
            )}
          </div>
        )}
        </div>
      </div>
  );
}

// Analytics Section Component
function AnalyticsSection({ stats, trades }: { stats: JournalStats; trades: Trade[] }) {
  const [activeChart, setActiveChart] = useState<'daily' | 'monthly' | 'symbols'>('daily');
  
  const dailyPnL = useMemo(() => {
    if (!trades || trades.length === 0) return [];
    const PnLByDate: { [date: string]: number } = {};
    trades.forEach(trade => {
      const date = new Date(trade.createdAt).toLocaleDateString('en-CA'); // YYYY-MM-DD
      const pnl = trade.status === 'WIN' ? (trade.profitDollars || 0) : (trade.status === 'LOSS' ? -(trade.lossDollars || 0) : 0);
      PnLByDate[date] = (PnLByDate[date] || 0) + pnl;
    });

    // Get last 30 days
    const last30Days: { date: string; pnl: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const isoDate = date.toLocaleDateString('en-CA');
      last30Days.push({
        date: formattedDate,
        pnl: PnLByDate[isoDate] || 0,
      });
    }
    return last30Days;
  }, [trades]);

  const maxDailyPnL = useMemo(() => {
    if (!dailyPnL || dailyPnL.length === 0) return 1; // Avoid division by zero
    return Math.max(1, ...dailyPnL.map(d => Math.abs(d.pnl)));
  }, [dailyPnL]);


  const monthlyPerformance = useMemo(() => {
    if (!trades || trades.length === 0) return [];
    const performanceByMonth: { [month: string]: { profit: number; loss: number; trades: number } } = {};
    trades.forEach(trade => {
      const monthYear = new Date(trade.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      if (!performanceByMonth[monthYear]) {
        performanceByMonth[monthYear] = { profit: 0, loss: 0, trades: 0 };
      }
      performanceByMonth[monthYear].trades++;
      if (trade.status === 'WIN') {
        performanceByMonth[monthYear].profit += trade.profitDollars || 0;
      } else if (trade.status === 'LOSS') {
        performanceByMonth[monthYear].loss += trade.lossDollars || 0;
      }
    });
    return Object.entries(performanceByMonth).map(([month, data]) => ({
        month, 
        ...data,
      net: data.profit - data.loss,
    })).sort((a, b) => new Date(b.month).getTime() - new Date(a.month).getTime());
  }, [trades]);

  const symbolPerformance = useMemo(() => {
    if (!trades || trades.length === 0) return [];
    const performanceBySymbol: { [symbol: string]: { trades: number; wins: number; net: number } } = {};
    trades.forEach(trade => {
      if (!performanceBySymbol[trade.symbol]) {
        performanceBySymbol[trade.symbol] = { trades: 0, wins: 0, net: 0 };
      }
      performanceBySymbol[trade.symbol].trades++;
      const pnl = trade.status === 'WIN' ? (trade.profitDollars || 0) : (trade.status === 'LOSS' ? -(trade.lossDollars || 0) : 0);
      performanceBySymbol[trade.symbol].net += pnl;
      if (trade.status === 'WIN') {
        performanceBySymbol[trade.symbol].wins++;
      }
    });
    return Object.entries(performanceBySymbol).map(([symbol, data]) => ({
        symbol, 
        ...data,
      winRate: data.trades > 0 ? (data.wins / data.trades) * 100 : 0,
    })).sort((a, b) => b.net - a.net).slice(0, 12); // Top 12 symbols
  }, [trades]);


  if (!stats) {
  return (
      <div className="bg-white backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200 p-8 text-center">
        <p className="text-gray-500">Loading analytics data...</p>
            </div>
    );
  }
  
  const chartOptions = [
    { id: 'daily', label: 'Daily P&L', icon: <CalendarDaysIcon className="w-5 h-5" /> },
    { id: 'monthly', label: 'Monthly', icon: <CalendarIcon className="w-5 h-5" /> },
    { id: 'symbols', label: 'By Symbol', icon: <TagIcon className="w-5 h-5" /> },
  ];

  return (
    <div className="space-y-10 p-1">
      {/* Enhanced Charts Section with Tabs */}
      <div className="bg-white backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 md:px-8 md:py-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h3 className="text-2xl font-bold text-gray-800">Performance Charts</h3>
            <div className="flex items-center space-x-1 bg-gray-100 rounded-xl p-1 self-start sm:self-center">
              {chartOptions.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveChart(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2.5 sm:px-5 rounded-lg font-semibold text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-orange-500 ${
                    activeChart === tab.id
                      ? 'bg-white text-orange-600 shadow-lg'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
              </div>
            </div>
        </div>

        <div className="p-6 md:p-8 min-h-[300px]">
          {activeChart === 'daily' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <h4 className="text-lg font-bold text-gray-800">Daily P&L (Last 30 Days)</h4>
                <div className="text-sm text-gray-500">
                  Total: <span className={`font-bold ${dailyPnL.reduce((sum, d) => sum + d.pnl, 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {dailyPnL.reduce((sum, d) => sum + d.pnl, 0) >= 0 ? '+' : ''}${dailyPnL.reduce((sum, d) => sum + d.pnl, 0).toFixed(2)}
                  </span>
                </div>
              </div>
              {dailyPnL.length > 0 ? (
                <div className="space-y-3">
                  {dailyPnL.map((item, index) => (
                    <div key={index} className="group flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md hover:border-orange-300 transition-all duration-300">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${item.pnl >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                        <span className="text-sm font-medium text-gray-700 w-20 tabular-nums">{item.date}</span>
                    </div>
                      <div className="flex-1 mx-4 bg-gray-200 rounded-full h-2.5 relative overflow-hidden">
                      <div
                          className={`absolute top-0 h-2.5 rounded-full transition-all duration-500 ${item.pnl >= 0 ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : 'bg-gradient-to-r from-red-400 to-red-600'}`}
                        style={{
                            width: `${Math.min(100, (Math.abs(item.pnl) / maxDailyPnL) * 100)}%`,
                            left: '50%',
                            transform: item.pnl >= 0 ? 'translateX(0)' : `translateX(-100%)`,
                        }}
                      />
                    </div>
                      <span className={`text-sm font-bold w-20 text-right tabular-nums ${item.pnl >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {item.pnl >= 0 ? '+' : ''}${item.pnl.toFixed(2)}
                    </span>
                  </div>
                  ))}
                </div>
              ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <NewspaperIcon className="w-8 h-8 text-gray-400" />
                </div>
                    <p className="text-gray-500 font-medium">No trading data available</p>
                  <p className="text-sm text-gray-400 mt-1">Start trading to see your daily P&L.</p>
                  </div>
                )}
            </div>
          )}

          {activeChart === 'monthly' && (
            <div className="space-y-6">
              <h4 className="text-lg font-bold text-gray-800">Monthly Performance</h4>
              {monthlyPerformance.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {monthlyPerformance.map((month, index) => (
                    <div key={index} className="group bg-gradient-to-br from-gray-50 to-white rounded-2xl p-5 border border-gray-200 hover:shadow-xl hover:border-orange-300 transition-all duration-300 hover:scale-[1.03] transform">
                    <div className="flex items-center justify-between mb-4">
                        <h5 className="font-bold text-gray-800 text-md">{month.month}</h5>
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${month.net >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {month.net >= 0 ? '+' : ''}${month.net.toFixed(2)}
                      </span>
                    </div>
                      <div className="grid grid-cols-3 gap-3 text-xs">
                      <div className="text-center">
                          <p className="text-gray-500 font-medium">Trades</p>
                          <p className="font-bold text-lg text-gray-800">{month.trades}</p>
                      </div>
                      <div className="text-center">
                          <p className="text-gray-500 font-medium">Profit</p>
                        <p className="font-bold text-lg text-emerald-600">${month.profit.toFixed(2)}</p>
                      </div>
                      <div className="text-center">
                          <p className="text-gray-500 font-medium">Loss</p>
                        <p className="font-bold text-lg text-red-600">${month.loss.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CalendarDaysIcon className="w-8 h-8 text-gray-400" />
            </div>
                  <p className="text-gray-500 font-medium">No monthly data available.</p>
                  <p className="text-sm text-gray-400 mt-1">Complete trades to see monthly trends.</p>
            </div>
                )}
          </div>
          )}

          {activeChart === 'symbols' && (
            <div className="space-y-6">
              <h4 className="text-lg font-bold text-gray-800">Performance by Symbol</h4>
              {symbolPerformance.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {symbolPerformance.map((symbol, index) => (
                    <div key={index} className="group bg-gradient-to-br from-gray-50 to-white rounded-2xl p-5 border border-gray-200 hover:shadow-xl hover:border-orange-300 transition-all duration-300 hover:scale-[1.03] transform">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-9 h-9 bg-gradient-to-br from-orange-100 to-amber-200 rounded-xl flex items-center justify-center">
                            <span className="font-bold text-orange-600 text-sm">
                              {symbol.symbol.length > 1 ? symbol.symbol.substring(0, symbol.symbol.indexOf('/') !== -1 ? Math.min(4,symbol.symbol.indexOf('/')) : Math.min(4, symbol.symbol.length)) : symbol.symbol}
                          </span>
        </div>
                          <h5 className="font-bold text-gray-800 text-sm truncate">{symbol.symbol}</h5>
    </div>
                        <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                        symbol.net >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {symbol.net >= 0 ? '+' : ''}${symbol.net.toFixed(2)}
                      </span>
                    </div>
                      <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-gray-100">
                    <div>
                          <p className="text-gray-500 font-medium">Trades</p>
                          <p className="font-bold text-gray-800 text-base">{symbol.trades}</p>
                      </div>
                      <div>
                          <p className="text-gray-500 font-medium">Win Rate</p>
                          <p className="font-bold text-orange-600 text-base">{symbol.winRate.toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                  ))}
                </div>
              ) : (
                 <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <TagIcon className="w-8 h-8 text-gray-400" />
                      </div>
                  <p className="text-gray-500 font-medium">No symbol data available.</p>
                  <p className="text-sm text-gray-400 mt-1">Trade different symbols for a breakdown.</p>
                        </div>
                )}
                      </div>
          )}
                  </div>
                  </div>

      {/* Enhanced Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {[
          { title: 'Best vs Worst', icon: <ArrowsRightLeftIcon className="w-6 h-6 text-green-600" />, data: [ { label: 'Best Trade', value: stats.bestTrade, prefix: '+', color: 'emerald' }, { label: 'Worst Trade', value: stats.worstTrade, color: 'red' } ], gradientFrom: 'from-green-500/5', gradientTo: 'to-emerald-500/5', iconBgFrom: 'from-green-100', iconBgTo: 'to-emerald-200' },
          { title: 'Average Performance', icon: <ScaleIcon className="w-6 h-6 text-blue-600" />, data: [ { label: 'Avg Win', value: stats.avgWin, color: 'emerald' }, { label: 'Avg Loss', value: stats.avgLoss, color: 'red' } ], gradientFrom: 'from-blue-500/5', gradientTo: 'to-indigo-500/5', iconBgFrom: 'from-blue-100', iconBgTo: 'to-indigo-200' },
          { title: 'Trade Distribution', icon: <ChartPieIcon className="w-6 h-6 text-purple-600" />, data: [ { label: 'Winning Trades', value: stats.winningTrades, color: 'emerald' }, { label: 'Losing Trades', value: stats.losingTrades, color: 'red' } ], gradientFrom: 'from-purple-500/5', gradientTo: 'to-pink-500/5', iconBgFrom: 'from-purple-100', iconBgTo: 'to-pink-200' },
        ].map(metric => (
          <div key={metric.title} className="group relative bg-white backdrop-blur-md rounded-3xl shadow-xl border border-gray-200 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] transform">
            <div className={`absolute inset-0 bg-gradient-to-br ${metric.gradientFrom} ${metric.gradientTo} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
          <div className="relative">
              <div className="flex items-center space-x-3.5 mb-5">
                <div className={`w-11 h-11 bg-gradient-to-br ${metric.iconBgFrom} ${metric.iconBgTo} rounded-xl flex items-center justify-center shadow-sm`}>
                  {metric.icon}
            </div>
                <h4 className="font-bold text-gray-800 text-lg">{metric.title}</h4>
            </div>
              <div className="space-y-3.5">
                {metric.data.map(item => (
                  <div key={item.label} className={`flex justify-between items-center p-3.5 bg-gray-50 rounded-xl border border-gray-100`}>
                    <span className="text-gray-700 font-medium text-sm">{item.label}</span>
                    <span className={`font-bold text-base ${item.color === 'emerald' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {item.prefix || ''}{typeof item.value === 'number' ? `$${item.value.toFixed(2)}` : item.value}
                    </span>
            </div>
                ))}
            </div>
            </div>
            </div>
        ))}
                  </div>
                </div>
  );
}

// Insights Section Component
function InsightsSection({ trades, entries }: { trades: Trade[]; entries: JournalEntry[] }) {
  return (
    <div className="space-y-8 p-1">
      <div className="flex items-center justify-between mb-0">
        <h2 className="text-3xl font-bold text-gray-900">Performance Calendar</h2>
      </div>
      <div className="bg-white backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200 p-0.5 md:p-1 overflow-hidden">
        <ProfitCalendar trades={trades} className="!shadow-none !border-none" />
      </div>
              </div>
  );
}

// New Journal Entry Modal Component
function NewJournalEntryModal({ onClose, onSave }: { onClose: () => void; onSave: (entry: JournalEntry) => void }) {
  const { selectedAccount } = useAccount(); // Ensure useAccount is imported
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    mood: 'neutral', // Default mood
    confidence: 3, // Default confidence (1-5 scale)
    tags: '', // Comma-separated string
    marketCondition: '',
    lessons: '',
    goals: '',
  });
  const [saving, setSaving] = useState(false);

  // Mood options - ensure these match available icons and logic
  const moodOptions = [
    { value: 'terrible', label: 'Terrible', icon: <FaceFrownIcon className="w-6 h-6 text-red-500" /> },
    { value: 'bad', label: 'Bad', icon: <FaceFrownIcon className="w-6 h-6 text-orange-500" /> }, // Using Frown for bad too, adjust if specific icon exists
    { value: 'neutral', label: 'Neutral', icon: <FaceSmileIcon className="w-6 h-6 text-yellow-500 opacity-70" /> }, // Using Smile with opacity, adjust
    { value: 'good', label: 'Good', icon: <FaceSmileIcon className="w-6 h-6 text-green-500" /> },
    { value: 'great', label: 'Great', icon: <SparklesIcon className="w-6 h-6 text-emerald-500" /> }, // Or a more expressive happy icon
  ];
  
  // Confidence options
  const confidenceLevels = [
    { value: 1, label: 'Very Low' },
    { value: 2, label: 'Low' },
    { value: 3, label: 'Medium' },
    { value: 4, label: 'High' },
    { value: 5, label: 'Very High' },
  ];


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) {
      // Consider using a more integrated notification system if available
      alert('Please select an account to associate this journal entry.');
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem('token'); // Ensure this token mechanism is correct
      const response = await fetch('/api/journal', { // Ensure API endpoint is correct
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          accountId: selectedAccount.id,
          ...formData,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          confidence: Number(formData.confidence), // Ensure confidence is a number
        }),
      });

      if (response.ok) {
        const newEntry = await response.json();
        onSave(newEntry.entry); // Assuming API returns { entry: ... }
        onClose(); // Close modal on successful save
      } else {
        const errorData = await response.json();
        // Better error display than alert if possible
        alert(`Failed to save journal entry: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.error('Error saving journal entry:', error);
      alert('An unexpected error occurred while saving the journal entry.');
    } finally {
      setSaving(false);
    }
  };
  
  const handleTagInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Basic input handling for tags, can be enhanced with a proper tag input component later
    setFormData({ ...formData, tags: e.target.value });
  };


  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-[60] p-4 transition-opacity duration-300 ease-in-out" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modalEnter"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">New Journal Entry</h2>
            <button
              onClick={onClose}
              disabled={saving}
            className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            aria-label="Close modal"
            >
            <XMarkIcon className="w-6 h-6" />
            </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-grow styled-scrollbar">
          <div>
            <label htmlFor="entry-title" className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
            <input
              id="entry-title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 placeholder-gray-400 transition-colors"
              placeholder="e.g., Reflections on today's trades"
              required
              disabled={saving}
            />
      </div>

          <div>
            <label htmlFor="entry-content" className="block text-sm font-medium text-gray-700 mb-1.5">Content / Notes</label>
            <textarea
              id="entry-content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={5}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 placeholder-gray-400 transition-colors styled-scrollbar"
              placeholder="Describe your thoughts, observations, rationale for trades, etc."
              required
              disabled={saving}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mood</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {moodOptions.map(opt => (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => setFormData({...formData, mood: opt.value})}
                    disabled={saving}
                    className={`p-2.5 rounded-lg border-2 flex flex-col items-center justify-center space-y-1 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${
                      formData.mood === opt.value ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                    title={opt.label}
                  >
                    {opt.icon}
                    <span className={`text-xs font-medium ${formData.mood === opt.value ? 'text-orange-600' : 'text-gray-600'}`}>{opt.label}</span>
                  </button>
                ))}
              </div>
              </div>
            <div>
              <label htmlFor="entry-confidence" className="block text-sm font-medium text-gray-700 mb-1.5">Confidence Level ({formData.confidence}/5)</label>
              <input
                id="entry-confidence"
                type="range"
                min="1"
                max="5"
                step="1"
                value={formData.confidence}
                onChange={(e) => setFormData({ ...formData, confidence: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1"
                disabled={saving}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1.5 px-0.5">
                {confidenceLevels.map(level => <span key={level.value}>{level.label}</span>)}
              </div>
            </div>
            </div>

          <div>
            <label htmlFor="entry-tags" className="block text-sm font-medium text-gray-700 mb-1.5">Tags (comma-separated)</label>
            <input
              id="entry-tags"
              type="text"
              value={formData.tags}
              onChange={handleTagInput}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 placeholder-gray-400 transition-colors"
              placeholder="e.g., FOMO, Scalping, News Event"
              disabled={saving}
            />
            </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
              <label htmlFor="entry-market-condition" className="block text-sm font-medium text-gray-700 mb-1.5">Market Condition</label>
              <input
                id="entry-market-condition"
                type="text"
              value={formData.marketCondition}
              onChange={(e) => setFormData({ ...formData, marketCondition: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 placeholder-gray-400 transition-colors"
                placeholder="e.g., Ranging, Bullish Trend, Volatile"
              disabled={saving}
              />
          </div>
          <div>
              <label htmlFor="entry-lessons" className="block text-sm font-medium text-gray-700 mb-1.5">Lessons Learned</label>
              <input
                id="entry-lessons"
                type="text"
              value={formData.lessons}
              onChange={(e) => setFormData({ ...formData, lessons: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 placeholder-gray-400 transition-colors"
                placeholder="e.g., Stick to plan, Avoid overtrading"
              disabled={saving}
            />
              </div>
          </div>
          <div>
            <label htmlFor="entry-goals" className="block text-sm font-medium text-gray-700 mb-1.5">Goals for Next Time</label>
            <input
              id="entry-goals"
              type="text"
              value={formData.goals}
              onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 placeholder-gray-400 transition-colors"
              placeholder="e.g., Improve entry timing, Manage risk better"
              disabled={saving}
            />
              </div>
        </form>

        <div className="p-5 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="new-journal-entry-form" // Points to form id if not wrapping form directly, here it is implicitly part of form due to onSubmit on form tag
              onClick={handleSubmit} // Can be on the button too if form has id and button has form="id"
              disabled={saving}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 dark:focus:ring-offset-slate-800 disabled:opacity-70 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center"
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Entry'
              )}
            </button>
            </div>
      </div>
      </div>
      <style jsx global>{`
        .animate-modalEnter {
          animation: modalEnterAnimation 0.3s ease-out forwards;
        }
        @keyframes modalEnterAnimation {
          0% { transform: scale(0.95); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .styled-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .styled-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1; // slate-300
          border-radius: 10px;
          border: 2px solid transparent;
          background-clip: content-box;
        }
        .dark .styled-scrollbar::-webkit-scrollbar-thumb {
          background-color: #475569; // slate-600
        }
        .styled-scrollbar::-webkit-scrollbar-track {
          background-color: transparent;
        }
        .styled-scrollbar::-webkit-scrollbar-corner {
          background-color: transparent;
        }
      `}</style>
    </div>
  );
}




