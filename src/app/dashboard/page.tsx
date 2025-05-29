'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

interface CalendarDay {
  date: Date;
  trades: Trade[];
  totalPnL: number;
  winRate: number;
  tradeCount: number;
}

interface WeeklyTarget {
  week: number;
  target: number;
  actual: number;
  percentage: number;
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
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [showTradePopup, setShowTradePopup] = useState(false);
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

  // Helper functions for new dashboard features
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const generateCalendarData = (): CalendarDay[] => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Get the first day of the week for the month (0 = Sunday)
    const firstDayOfWeek = startOfMonth.getDay();

    // Calculate start date (might be from previous month)
    const calendarStart = new Date(startOfMonth);
    calendarStart.setDate(calendarStart.getDate() - firstDayOfWeek);

    // Calculate end date (might be from next month) - ensure we have 6 weeks
    const calendarEnd = new Date(calendarStart);
    calendarEnd.setDate(calendarEnd.getDate() + 41); // 6 weeks = 42 days

    const days: CalendarDay[] = [];

    for (let d = new Date(calendarStart); d <= calendarEnd; d.setDate(d.getDate() + 1)) {
      const dayTrades = trades.filter(trade => {
        const tradeDate = new Date(trade.createdAt);
        return tradeDate.toDateString() === d.toDateString();
      });

      const totalPnL = dayTrades.reduce((sum, trade) => {
        if (trade.status === 'WIN') return sum + (trade.profitDollars || 0);
        if (trade.status === 'LOSS') return sum - (trade.lossDollars || 0);
        return sum;
      }, 0);

      const winTrades = dayTrades.filter(t => t.status === 'WIN').length;
      const totalClosedTrades = dayTrades.filter(t => t.status === 'WIN' || t.status === 'LOSS').length;
      const winRate = totalClosedTrades > 0 ? (winTrades / totalClosedTrades) * 100 : 0;

      // Calculate average risk/reward for the day
      const avgRiskReward = dayTrades.length > 0
        ? dayTrades.reduce((sum, t) => sum + (t.riskRewardRatio || 0), 0) / dayTrades.length
        : 0;

      days.push({
        date: new Date(d),
        trades: dayTrades,
        totalPnL,
        winRate,
        tradeCount: dayTrades.length
      });
    }

    return days;
  };

  const generateWeeklyTargets = (): WeeklyTarget[] => {
    const weeklyTarget = 1000; // $1000 per week target
    const weeks: WeeklyTarget[] = [];

    for (let week = 1; week <= 6; week++) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (startDate.getDay() + 7 * (6 - week)));
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);

      const weekTrades = trades.filter(trade => {
        const tradeDate = new Date(trade.createdAt);
        return tradeDate >= startDate && tradeDate <= endDate;
      });

      const actual = weekTrades.reduce((sum, trade) => {
        if (trade.status === 'WIN') return sum + (trade.profitDollars || 0);
        if (trade.status === 'LOSS') return sum - (trade.lossDollars || 0);
        return sum;
      }, 0);

      weeks.push({
        week,
        target: weeklyTarget,
        actual,
        percentage: (actual / weeklyTarget) * 100
      });
    }

    return weeks;
  };

  const calculateTradeExpectancy = () => {
    const winTrades = trades.filter(t => t.status === 'WIN');
    const lossTrades = trades.filter(t => t.status === 'LOSS');
    const totalClosedTrades = winTrades.length + lossTrades.length;

    if (totalClosedTrades === 0) return 0;

    const avgWin = winTrades.length > 0 ? winTrades.reduce((sum, t) => sum + (t.profitDollars || 0), 0) / winTrades.length : 0;
    const avgLoss = lossTrades.length > 0 ? lossTrades.reduce((sum, t) => sum + (t.lossDollars || 0), 0) / lossTrades.length : 0;
    const winRate = winTrades.length / totalClosedTrades;

    return (winRate * avgWin) - ((1 - winRate) * avgLoss);
  };

  const calculateZealousScore = () => {
    // Zealous Score: Combination of win rate, profit factor, and consistency
    const winRateScore = Math.min(stats.winRate / 70, 1) * 30; // Max 30 points for 70%+ win rate
    const profitFactorScore = Math.min(stats.profitFactor / 2, 1) * 40; // Max 40 points for 2+ profit factor
    const consistencyScore = Math.min(stats.tradingDays / 30, 1) * 30; // Max 30 points for 30+ trading days

    return Math.round(winRateScore + profitFactorScore + consistencyScore);
  };

  const calendarData = generateCalendarData();
  const weeklyTargets = generateWeeklyTargets();
  const tradeExpectancy = calculateTradeExpectancy();
  const zealousScore = calculateZealousScore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-6">

        {/* Key Performance Widgets - Horizontal Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
          {/* Net P&L Widget */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                stats.netPnL >= 0 ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <svg className={`w-6 h-6 ${stats.netPnL >= 0 ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                    stats.netPnL >= 0 ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                  } />
                </svg>
              </div>
            </div>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Net P&L</h3>
            <p className={`text-2xl font-bold ${stats.netPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.netPnL >= 0 ? '+' : ''}${stats.netPnL.toFixed(2)}
            </p>
          </div>

          {/* Profit Factor Widget */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Profit Factor</h3>
            <p className="text-2xl font-bold text-purple-600">
              {stats.profitFactor === 999 ? '∞' : stats.profitFactor.toFixed(2)}
            </p>
          </div>

          {/* Current Streak Widget */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                stats.streakType === 'win' ? 'bg-green-100' : stats.streakType === 'loss' ? 'bg-red-100' : 'bg-gray-100'
              }`}>
                <span className="text-lg">
                  {stats.streakType === 'win' ? '🔥' : stats.streakType === 'loss' ? '❄️' : '➖'}
                </span>
              </div>
            </div>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Current Streak</h3>
            <p className={`text-2xl font-bold ${
              stats.streakType === 'win' ? 'text-green-600' : stats.streakType === 'loss' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {stats.currentStreak} {stats.streakType === 'win' ? 'W' : stats.streakType === 'loss' ? 'L' : '-'}
            </p>
          </div>

          {/* Account Balance Widget */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
            </div>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Account Balance</h3>
            <p className="text-2xl font-bold text-blue-600">
              ${selectedAccount?.currentBalance.toLocaleString() || '0'}
            </p>
          </div>

          {/* Trade Win Percentage Widget */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Win Rate</h3>
            <p className="text-2xl font-bold text-emerald-600">{stats.winRate.toFixed(1)}%</p>
          </div>
        </div>

        {/* Enhanced Trading Calendar Section with Weekly Targets */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-8">
          {/* Calendar Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <button className="p-3 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-105">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="text-center">
                <div className="text-sm text-gray-500 uppercase tracking-wide font-medium">TODAY</div>
                <div className="text-xl font-bold text-gray-900">
                  {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
              </div>
              <button className="p-3 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-105">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Monthly Performance</div>
              <div className="flex items-center space-x-3">
                <span className={`text-xl font-bold ${stats.netPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.netPnL >= 0 ? '+' : ''}${stats.netPnL.toFixed(2)}
                </span>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>{stats.tradingDays} days</span>
                  <div className={`w-3 h-3 rounded-full ${stats.netPnL >= 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar and Weekly Targets Layout */}
          <div className="p-6">
            <div className="flex gap-8">
              {/* Calendar Section */}
              <div className="flex-1">
                <div className="grid grid-cols-7 gap-3">
                  {/* Day Headers */}
                  {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => (
                    <div key={day} className="p-4 text-center">
                      <div className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                        {day.substring(0, 3)}
                      </div>
                      <div className={`w-full h-1 rounded-full mt-2 ${
                        index === 0 || index === 6 ? 'bg-gray-300' : 'bg-blue-200'
                      }`}></div>
                    </div>
                  ))}

                  {/* Calendar Days */}
                  {calendarData.map((day, index) => {
                    const isToday = day.date.toDateString() === new Date().toDateString();
                    const hasProfit = day.totalPnL > 0;
                    const hasLoss = day.totalPnL < 0;
                    const hasTrades = day.tradeCount > 0;
                    const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6;
                    const isCurrentMonth = day.date.getMonth() === new Date().getMonth();

                    return (
                      <div
                        key={index}
                        onClick={() => {
                          if (hasTrades && isCurrentMonth) {
                            setSelectedDay(day);
                            setShowTradePopup(true);
                          }
                        }}
                        className={`relative min-h-[120px] p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer transform hover:-translate-y-2 hover:shadow-2xl hover:scale-105 ${
                          !isCurrentMonth
                            ? 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 text-gray-400 opacity-60'
                            : isToday
                            ? 'bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100 border-blue-400 shadow-xl ring-2 ring-blue-200'
                            : hasProfit
                            ? 'bg-gradient-to-br from-green-100 via-green-50 to-emerald-100 border-green-300 hover:border-green-400 shadow-lg'
                            : hasLoss
                            ? 'bg-gradient-to-br from-red-100 via-red-50 to-rose-100 border-red-300 hover:border-red-400 shadow-lg'
                            : isWeekend
                            ? 'bg-gradient-to-br from-gray-50 to-slate-100 border-gray-200 hover:border-gray-300'
                            : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-blue-300 hover:shadow-lg'
                        }`}
                      >
                        {/* Day Number */}
                        <div className={`text-lg font-bold mb-3 ${
                          !isCurrentMonth
                            ? 'text-gray-400'
                            : isToday
                            ? 'text-blue-700'
                            : hasProfit
                            ? 'text-green-700'
                            : hasLoss
                            ? 'text-red-700'
                            : 'text-gray-800'
                        }`}>
                          {day.date.getDate()}
                        </div>

                        {/* Trade Information */}
                        {hasTrades && isCurrentMonth && (
                          <div className="space-y-2">
                            {/* P&L Amount with Icon */}
                            <div className={`flex items-center space-x-1 text-lg font-bold ${
                              hasProfit ? 'text-green-600' : 'text-red-600'
                            }`}>
                              <span className="text-xs">
                                {hasProfit ? '📈' : '📉'}
                              </span>
                              <span>
                                {hasProfit ? '+' : ''}${Math.abs(day.totalPnL) >= 1000
                                  ? `${(Math.abs(day.totalPnL) / 1000).toFixed(1)}K`
                                  : Math.abs(day.totalPnL).toFixed(0)}
                              </span>
                            </div>

                            {/* Trade Count with Badge */}
                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                              hasProfit ? 'bg-green-200 text-green-800' :
                              hasLoss ? 'bg-red-200 text-red-800' : 'bg-blue-200 text-blue-800'
                            }`}>
                              {day.tradeCount} trade{day.tradeCount !== 1 ? 's' : ''}
                            </div>

                            {/* Win Rate with Progress Bar */}
                            <div className="space-y-1">
                              <div className="text-xs text-gray-600 font-medium">
                                {day.winRate.toFixed(0)}% win rate
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                  className={`h-1.5 rounded-full transition-all duration-500 ${
                                    day.winRate >= 70 ? 'bg-green-500' :
                                    day.winRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${day.winRate}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Today Indicator */}
                        {isToday && (
                          <div className="absolute top-3 right-3">
                            <div className="relative">
                              <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                              <div className="absolute inset-0 w-4 h-4 bg-blue-400 rounded-full animate-ping"></div>
                            </div>
                          </div>
                        )}

                        {/* Trade Status Indicators */}
                        {hasTrades && isCurrentMonth && (
                          <div className="absolute bottom-3 right-3 flex space-x-1">
                            {day.trades.some(t => t.status === 'WIN') && (
                              <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                            )}
                            {day.trades.some(t => t.status === 'LOSS') && (
                              <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-sm"></div>
                            )}
                            {day.trades.some(t => t.status === 'ACTIVE') && (
                              <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
                            )}
                          </div>
                        )}

                        {/* Hover Effect Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"></div>
                      </div>
                    );
                  })}
                </div>


              </div>

              {/* Weekly Targets Sidebar */}
              <div className="w-80">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    Weekly Targets
                  </h3>

                  <div className="space-y-4">
                    {weeklyTargets.map((week) => (
                      <div key={week.week} className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-900">Week {week.week}</h4>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            week.actual >= week.target ? 'bg-green-100 text-green-700' :
                            week.actual >= week.target * 0.7 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {week.percentage.toFixed(0)}%
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xl font-bold ${
                            week.actual >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {week.actual >= 0 ? '+' : ''}${week.actual.toFixed(0)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {Math.ceil(week.actual / 7)} Days
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              week.percentage >= 100 ? 'bg-green-500' :
                              week.percentage >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(week.percentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Trade Popup Modal */}
        {showTradePopup && selectedDay && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden">
              {/* Popup Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      📊 Trading Day Details
                    </h3>
                    <div className="flex items-center space-x-4">
                      <p className="text-lg font-semibold text-gray-700">
                        {selectedDay.date.toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        selectedDay.totalPnL >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {selectedDay.totalPnL >= 0 ? '+' : ''}${selectedDay.totalPnL.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowTradePopup(false)}
                    className="p-3 hover:bg-white/50 rounded-xl transition-all duration-200 hover:scale-110"
                  >
                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Day Summary Stats */}
                <div className="grid grid-cols-4 gap-4 mt-4">
                  <div className="bg-white/70 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-blue-600">{selectedDay.tradeCount}</div>
                    <div className="text-xs text-gray-600">Total Trades</div>
                  </div>
                  <div className="bg-white/70 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-green-600">{selectedDay.trades.filter(t => t.status === 'WIN').length}</div>
                    <div className="text-xs text-gray-600">Wins</div>
                  </div>
                  <div className="bg-white/70 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-red-600">{selectedDay.trades.filter(t => t.status === 'LOSS').length}</div>
                    <div className="text-xs text-gray-600">Losses</div>
                  </div>
                  <div className="bg-white/70 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-purple-600">{selectedDay.winRate.toFixed(0)}%</div>
                    <div className="text-xs text-gray-600">Win Rate</div>
                  </div>
                </div>
              </div>

              {/* Trades List */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="space-y-4">
                  {selectedDay.trades.map((trade, index) => (
                    <div key={index} className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                      <div className="flex items-start justify-between">
                        {/* Trade Info Left Side */}
                        <div className="flex items-start space-x-4">
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                            trade.status === 'WIN' ? 'bg-gradient-to-br from-green-100 to-green-200 border-2 border-green-300' :
                            trade.status === 'LOSS' ? 'bg-gradient-to-br from-red-100 to-red-200 border-2 border-red-300' :
                            'bg-gradient-to-br from-blue-100 to-blue-200 border-2 border-blue-300'
                          }`}>
                            <span className={`text-lg font-bold ${
                              trade.status === 'WIN' ? 'text-green-700' :
                              trade.status === 'LOSS' ? 'text-red-700' :
                              'text-blue-700'
                            }`}>
                              {trade.symbol?.substring(0, 3) || 'N/A'}
                            </span>
                          </div>

                          <div className="space-y-2">
                            <div>
                              <h4 className="text-xl font-bold text-gray-900">{trade.symbol || 'Unknown Symbol'}</h4>
                              <div className="flex items-center space-x-3 mt-1">
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                  trade.tradeDirection === 'LONG' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                  {trade.tradeDirection || 'N/A'}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                  trade.status === 'WIN' ? 'bg-green-100 text-green-700' :
                                  trade.status === 'LOSS' ? 'bg-red-100 text-red-700' :
                                  'bg-blue-100 text-blue-700'
                                }`}>
                                  {trade.status}
                                </span>
                              </div>
                            </div>

                            {/* Trade Details Grid */}
                            <div className="grid grid-cols-2 gap-4 mt-3">
                              <div className="space-y-1">
                                <div className="text-xs text-gray-500 uppercase tracking-wide">Entry Price</div>
                                <div className="text-lg font-semibold text-gray-900">${trade.entryPrice?.toFixed(4) || '0.0000'}</div>
                              </div>
                              <div className="space-y-1">
                                <div className="text-xs text-gray-500 uppercase tracking-wide">Exit Price</div>
                                <div className="text-lg font-semibold text-gray-900">
                                  {trade.exitPrice ? `$${trade.exitPrice.toFixed(4)}` : 'Pending'}
                                </div>
                              </div>
                              <div className="space-y-1">
                                <div className="text-xs text-gray-500 uppercase tracking-wide">Stop Loss</div>
                                <div className="text-lg font-semibold text-gray-900">${trade.stopLoss?.toFixed(4) || '0.0000'}</div>
                              </div>
                              <div className="space-y-1">
                                <div className="text-xs text-gray-500 uppercase tracking-wide">Risk:Reward</div>
                                <div className="text-lg font-semibold text-purple-600">1:{trade.riskRewardRatio?.toFixed(2) || '0.00'}</div>
                              </div>
                            </div>

                            {/* Trade Tags */}
                            {trade.tags && trade.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {trade.tags.map((tag, tagIndex) => (
                                  <span key={tagIndex} className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Trade Result Right Side */}
                        <div className="text-right space-y-2">
                          <div className={`text-3xl font-bold ${
                            trade.status === 'WIN' ? 'text-green-600' :
                            trade.status === 'LOSS' ? 'text-red-600' :
                            'text-blue-600'
                          }`}>
                            {trade.status === 'WIN' ? `+$${trade.profitDollars?.toFixed(2) || '0.00'}` :
                             trade.status === 'LOSS' ? `-$${trade.lossDollars?.toFixed(2) || '0.00'}` :
                             'Active'}
                          </div>
                          <div className="text-sm text-gray-500">
                            <div>{new Date(trade.createdAt).toLocaleDateString()}</div>
                            <div>{new Date(trade.createdAt).toLocaleTimeString()}</div>
                          </div>
                          {trade.category && (
                            <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                              {trade.category}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trade Expectancy and Zealous Score */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Trade Expectancy Widget */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-3 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Trade Expectancy
            </h3>
            <div className="text-center">
              <div className={`text-4xl font-bold mb-4 ${
                tradeExpectancy >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {tradeExpectancy >= 0 ? '+' : ''}${tradeExpectancy.toFixed(2)}
              </div>
              <p className="text-gray-600 mb-4">Expected value per trade</p>
              <div className={`px-4 py-2 rounded-xl text-sm font-medium ${
                tradeExpectancy >= 50 ? 'bg-green-100 text-green-700' :
                tradeExpectancy >= 0 ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {tradeExpectancy >= 50 ? '🚀 Excellent' :
                 tradeExpectancy >= 0 ? '👍 Positive' : '⚠️ Negative'}
              </div>
            </div>
          </div>

          {/* Zealous Score Widget */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-3 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              Zealous Score
            </h3>
            <div className="text-center">
              <div className={`text-4xl font-bold mb-4 ${
                zealousScore >= 80 ? 'text-green-600' :
                zealousScore >= 60 ? 'text-yellow-600' :
                zealousScore >= 40 ? 'text-orange-600' : 'text-red-600'
              }`}>
                {zealousScore}/100
              </div>
              <p className="text-gray-600 mb-4">Overall trading performance</p>
              <div className={`px-4 py-2 rounded-xl text-sm font-medium ${
                zealousScore >= 80 ? 'bg-green-100 text-green-700' :
                zealousScore >= 60 ? 'bg-yellow-100 text-yellow-700' :
                zealousScore >= 40 ? 'bg-orange-100 text-orange-700' :
                'bg-red-100 text-red-700'
              }`}>
                {zealousScore >= 80 ? '🏆 Elite Trader' :
                 zealousScore >= 60 ? '📈 Good Trader' :
                 zealousScore >= 40 ? '📊 Developing' : '📉 Needs Work'}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Trades & Quick Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Recent Trades */}
          <div className="lg:col-span-2 bg-white backdrop-blur-xl rounded-3xl border border-gray-200 p-8 shadow-lg">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                Recent Trades
              </h3>
              <button
                onClick={() => router.push('/journal')}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl transition-all duration-200 text-sm font-medium border border-gray-200"
              >
                View All
              </button>
            </div>

            <div className="space-y-4">
              {trades.slice(0, 5).map((trade, index) => (
                <div key={trade.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-gray-100 transition-all duration-200">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      trade.status === 'WIN' ? 'bg-green-100 border border-green-200' :
                      trade.status === 'LOSS' ? 'bg-red-100 border border-red-200' :
                      trade.status === 'OPEN' ? 'bg-yellow-100 border border-yellow-200' :
                      'bg-blue-100 border border-blue-200'
                    }`}>
                      <span className={`text-sm font-bold ${
                        trade.status === 'WIN' ? 'text-green-700' :
                        trade.status === 'LOSS' ? 'text-red-700' :
                        trade.status === 'OPEN' ? 'text-yellow-700' :
                        'text-blue-700'
                      }`}>
                        {trade.symbol.substring(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{trade.symbol}</p>
                      <p className="text-sm text-gray-500">{trade.tradeDirection}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      trade.status === 'WIN' ? 'text-green-600' :
                      trade.status === 'LOSS' ? 'text-red-600' :
                      'text-gray-900'
                    }`}>
                      {trade.status === 'WIN' ? `+$${trade.profitDollars?.toFixed(2)}` :
                       trade.status === 'LOSS' ? `-$${trade.lossDollars?.toFixed(2)}` :
                       trade.status}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(trade.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}

              {trades.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <p className="text-gray-500 mb-4">No trades yet</p>
                  <button
                    onClick={() => router.push('/add-trade')}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:scale-105 transition-all duration-200"
                  >
                    Add Your First Trade
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Performance Insights */}
          <div className="space-y-6">
            {/* Current Streak */}
            <div className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 p-6 shadow-lg">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center mr-3 ${
                  stats.streakType === 'win' ? 'bg-green-100 border border-green-200' :
                  stats.streakType === 'loss' ? 'bg-red-100 border border-red-200' :
                  'bg-gray-100 border border-gray-200'
                }`}>
                  <span className="text-sm">
                    {stats.streakType === 'win' ? '🔥' : stats.streakType === 'loss' ? '❄️' : '➖'}
                  </span>
                </div>
                Current Streak
              </h4>
              <p className={`text-2xl font-bold mb-2 ${
                stats.streakType === 'win' ? 'text-green-600' :
                stats.streakType === 'loss' ? 'text-red-600' :
                'text-gray-900'
              }`}>
                {stats.currentStreak} {stats.streakType === 'win' ? 'Wins' : stats.streakType === 'loss' ? 'Losses' : 'No streak'}
              </p>
              <p className="text-sm text-gray-500">
                Best: {stats.largestWinStreak} wins
              </p>
            </div>

            {/* Best Trade */}
            <div className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 p-6 shadow-lg">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <div className="w-8 h-8 bg-green-100 border border-green-200 rounded-xl flex items-center justify-center mr-3">
                  <span className="text-sm">🏆</span>
                </div>
                Best Trade
              </h4>
              <p className="text-2xl font-bold text-green-600 mb-2">
                +${stats.bestTrade.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500">Single trade profit</p>
            </div>

            {/* Average Win */}
            <div className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 p-6 shadow-lg">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <div className="w-8 h-8 bg-blue-100 border border-blue-200 rounded-xl flex items-center justify-center mr-3">
                  <span className="text-sm">📊</span>
                </div>
                Average Win
              </h4>
              <p className="text-2xl font-bold text-blue-600 mb-2">
                ${stats.avgWin.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500">Per winning trade</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
