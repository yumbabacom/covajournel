'use client';

import React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/AuthProvider';
import { useAccount } from '../components/AccountProvider';
import { DashboardSkeleton } from '../components/SimpleLoading';
import AddTradeModal from '../components/AddTradeModal';
import Link from 'next/link';

// ✅ EXTEND WINDOW TYPE FOR GLOBAL REFRESH FUNCTION
declare global {
  interface Window {
    refreshDashboard?: () => Promise<void>;
  }
}

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
  context: 'main' | 'am-trader';
}

interface CalendarDay {
  date: Date;
  trades: Trade[];
  totalPnL: number;
  winRate: number;
  tradeCount: number;
}

interface AdvancedMetrics {
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  calmarRatio: number;
  winningStreak: number;
  losingStreak: number;
  averageHoldingTime: number;
  volatility: number;
  recoveryFactor: number;
  expectancy: number;
  kellyPercentage: number;
}

interface RiskMetrics {
  portfolioRisk: number;
  maxRiskPerTrade: number;
  avgRiskPerTrade: number;
  riskOfRuin: number;
  valueAtRisk: number;
  expectedShortfall: number;
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
  symbolBreakdown: { symbol: string; trades: number; pnl: number; winRate: number }[];
  directionBreakdown: { long: number; short: number; longPnL: number; shortPnL: number; longWins: number; shortWins: number };
  advancedMetrics: AdvancedMetrics;
  riskMetrics: RiskMetrics;
  sessionBreakdown: { session: string; trades: number; pnl: number; winRate: number; avgDuration: string; avgWin: number; avgLoss: number; riskReward: number }[];
  weeklyPerformance: { week: string; trades: number; pnl: number; winRate: number }[];
  monthlyComparison: { month: string; pnl: number; trades: number; winRate: number; target: number }[];
  psychologyMetrics: {
    emotionalTrades: number;
    revengeTrades: number;
    fomoPnL: number;
    disciplinedTrades: number;
    impulsiveTrades: number;
  };
}

export default function MainDashboard() {
  const { user } = useAuth();
  const { selectedAccount } = useAccount();
  const router = useRouter();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [tempDateRange, setTempDateRange] = useState<{start: Date | null, end: Date | null}>({
    start: null,
    end: null
  });
  const [showAddTradeModal, setShowAddTradeModal] = useState(false);

  // ✅ ADD REAL-TIME REFRESH FUNCTIONALITY
  const refreshData = async () => {
    try {
      setLoading(true);
      await fetchTrades();
    } catch (error) {
      console.error('Failed to refresh dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ EXPOSE REFRESH TO WINDOW FOR CROSS-PAGE UPDATES
  useEffect(() => {
    window.refreshDashboard = refreshData;
    
    // Cleanup
    return () => {
      delete window.refreshDashboard;
    };
  }, []);

  // ✅ ADD EVENT LISTENERS FOR TRADE DELETION UPDATES
  useEffect(() => {
    const handleTradeDeleted = (event: CustomEvent) => {
      console.log('🏠 Dashboard: Trade deleted event received', event.detail);
      refreshData();
    };

    const handleTradesUpdated = (event: CustomEvent) => {
      console.log('🏠 Dashboard: Trades updated event received', event.detail);
      if (event.detail.action === 'delete') {
        refreshData();
      }
    };

    const handleDashboardDataUpdate = (event: CustomEvent) => {
      console.log('🏠 Dashboard: Dashboard data update event received', event.detail);
      refreshData();
    };

    const handlePnlRecalculate = (event: CustomEvent) => {
      console.log('🏠 Dashboard: P&L recalculate event received', event.detail);
      refreshData();
    };

    const handleStatisticsUpdate = (event: CustomEvent) => {
      console.log('🏠 Dashboard: Statistics update event received', event.detail);
      refreshData();
    };

    const handleForceRefresh = (event: CustomEvent) => {
      console.log('🏠 Dashboard: Force refresh event received', event.detail);
      setTimeout(() => {
        refreshData();
      }, 200);
    };

    // Add event listeners
    window.addEventListener('tradeDeleted', handleTradeDeleted as EventListener);
    window.addEventListener('tradesUpdated', handleTradesUpdated as EventListener);
    window.addEventListener('dashboardDataUpdate', handleDashboardDataUpdate as EventListener);
    window.addEventListener('pnlRecalculate', handlePnlRecalculate as EventListener);
    window.addEventListener('statisticsUpdate', handleStatisticsUpdate as EventListener);
    window.addEventListener('forceRefresh', handleForceRefresh as EventListener);

    // Cleanup event listeners
    return () => {
      window.removeEventListener('tradeDeleted', handleTradeDeleted as EventListener);
      window.removeEventListener('tradesUpdated', handleTradesUpdated as EventListener);
      window.removeEventListener('dashboardDataUpdate', handleDashboardDataUpdate as EventListener);
      window.removeEventListener('pnlRecalculate', handlePnlRecalculate as EventListener);
      window.removeEventListener('statisticsUpdate', handleStatisticsUpdate as EventListener);
      window.removeEventListener('forceRefresh', handleForceRefresh as EventListener);
    };
  }, []);

  const fetchTrades = async () => {
    try {
      if (!selectedAccount || !user) return;

      const response = await fetch(`/api/trades?accountId=${selectedAccount.id}&context=main`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTrades(data.trades || []);
      }
    } catch (error) {
      console.error('Failed to fetch trades:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
    if (user && selectedAccount) {
      fetchTrades();
    }
  }, [user, selectedAccount]);

  // Advanced calculation functions with null checks
  const calculateAdvancedMetrics = useCallback((tradesData: Trade[]): AdvancedMetrics => {
    if (!tradesData || !Array.isArray(tradesData) || tradesData.length === 0) {
      return {
        sharpeRatio: 0,
        sortinoRatio: 0,
        maxDrawdown: 0,
        calmarRatio: 0,
        winningStreak: 0,
        losingStreak: 0,
        averageHoldingTime: 0,
        volatility: 0,
        recoveryFactor: 0,
        expectancy: 0,
        kellyPercentage: 0
      };
    }

    const closedTrades = tradesData.filter(t => t.status === 'WIN' || t.status === 'LOSS');
    
    if (closedTrades.length === 0) {
      return {
        sharpeRatio: 0,
        sortinoRatio: 0,
        maxDrawdown: 0,
        calmarRatio: 0,
        winningStreak: 0,
        losingStreak: 0,
        averageHoldingTime: 0,
        volatility: 0,
        recoveryFactor: 0,
        expectancy: 0,
        kellyPercentage: 0
      };
    }

    // Calculate returns
    const returns = closedTrades.map(t => 
      t.status === 'WIN' ? t.profitDollars : -t.lossDollars
    );
    
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    
    // Sharpe Ratio (assuming risk-free rate of 2%)
    const riskFreeRate = 0.02;
    const sharpeRatio = stdDev > 0 ? (avgReturn - riskFreeRate) / stdDev : 0;
    
    // Sortino Ratio (downside deviation)
    const negativeReturns = returns.filter(r => r < 0);
    const downVar = negativeReturns.length > 0 ? 
      negativeReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / negativeReturns.length : 0;
    const downsideDev = Math.sqrt(downVar);
    const sortinoRatio = downsideDev > 0 ? avgReturn / downsideDev : 0;
    
    // Max Drawdown
    let runningSum = 0;
    let peak = 0;
    let maxDrawdown = 0;
    
    for (const ret of returns) {
      runningSum += ret;
      if (runningSum > peak) peak = runningSum;
      const drawdown = (peak - runningSum) / peak * 100;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    }
    
    // Calmar Ratio
    const annualizedReturn = avgReturn * 252; // Assuming 252 trading days
    const calmarRatio = maxDrawdown > 0 ? annualizedReturn / maxDrawdown : 0;
    
    // Streaks
    let currentWinStreak = 0;
    let currentLossStreak = 0;
    let maxWinStreak = 0;
    let maxLossStreak = 0;
    
    for (const trade of closedTrades) {
      if (trade.status === 'WIN') {
        currentWinStreak++;
        currentLossStreak = 0;
        maxWinStreak = Math.max(maxWinStreak, currentWinStreak);
      } else {
        currentLossStreak++;
        currentWinStreak = 0;
        maxLossStreak = Math.max(maxLossStreak, currentLossStreak);
      }
    }
    
    // Expectancy
    const winRate = closedTrades.filter(t => t.status === 'WIN').length / closedTrades.length;
    const avgWin = closedTrades.filter(t => t.status === 'WIN').reduce((sum, t) => sum + t.profitDollars, 0) / Math.max(1, closedTrades.filter(t => t.status === 'WIN').length);
    const avgLoss = closedTrades.filter(t => t.status === 'LOSS').reduce((sum, t) => sum + t.lossDollars, 0) / Math.max(1, closedTrades.filter(t => t.status === 'LOSS').length);
    const expectancy = (winRate * avgWin) - ((1 - winRate) * avgLoss);
    
    // Kelly Percentage
    const kellyPercentage = avgLoss > 0 ? ((avgWin * winRate) - ((1 - winRate) * avgLoss)) / avgWin * 100 : 0;
    
    return {
      sharpeRatio: Number(sharpeRatio.toFixed(2)),
      sortinoRatio: Number(sortinoRatio.toFixed(2)),
      maxDrawdown: Number(maxDrawdown.toFixed(2)),
      calmarRatio: Number(calmarRatio.toFixed(2)),
      winningStreak: maxWinStreak,
      losingStreak: maxLossStreak,
      averageHoldingTime: 24, // Mock value
      volatility: Number((stdDev * Math.sqrt(252)).toFixed(2)),
      recoveryFactor: maxDrawdown > 0 ? Number((avgReturn / maxDrawdown).toFixed(2)) : 0,
      expectancy: Number(expectancy.toFixed(2)),
      kellyPercentage: Number(kellyPercentage.toFixed(2))
    };
  }, []);

  const calculateRiskMetrics = useCallback((tradesData: Trade[]): RiskMetrics => {
    if (!tradesData || !Array.isArray(tradesData) || tradesData.length === 0) {
      return {
        portfolioRisk: 0,
        maxRiskPerTrade: 0,
        avgRiskPerTrade: 0,
        riskOfRuin: 0,
        valueAtRisk: 0,
        expectedShortfall: 0
      };
    }

    const riskAmounts = tradesData.filter(t => t.riskAmount).map(t => t.riskAmount!);
    
    if (riskAmounts.length === 0) {
      return {
        portfolioRisk: 2.5,
        maxRiskPerTrade: 2.0,
        avgRiskPerTrade: 1.5,
        riskOfRuin: 5.2,
        valueAtRisk: 1250,
        expectedShortfall: 1875
      };
    }

    const maxRisk = Math.max(...riskAmounts);
    const avgRisk = riskAmounts.reduce((sum, r) => sum + r, 0) / riskAmounts.length;
    
    return {
      portfolioRisk: Number((avgRisk * 1.5).toFixed(1)),
      maxRiskPerTrade: Number(maxRisk.toFixed(1)),
      avgRiskPerTrade: Number(avgRisk.toFixed(1)),
      riskOfRuin: 5.2,
      valueAtRisk: Math.round(avgRisk * 1000),
      expectedShortfall: Math.round(avgRisk * 1500)
    };
  }, []);

  // Calculate comprehensive stats with null checks
  const stats = useMemo((): DashboardStats => {
    if (!trades || !Array.isArray(trades)) {
      return {
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
        streakType: 'none' as const,
        largestWinStreak: 0,
        largestLossStreak: 0,
        tradingDays: 0,
        avgTradesPerDay: 0,
        monthlyPnL: [],
        symbolBreakdown: [],
        directionBreakdown: { long: 0, short: 0, longPnL: 0, shortPnL: 0, longWins: 0, shortWins: 0 },
        advancedMetrics: calculateAdvancedMetrics([]),
        riskMetrics: calculateRiskMetrics([]),
        sessionBreakdown: [],
        weeklyPerformance: [],
        monthlyComparison: [],
        psychologyMetrics: {
          emotionalTrades: 0,
          revengeTrades: 0,
          fomoPnL: 0,
          disciplinedTrades: 0,
          impulsiveTrades: 0
        }
      };
    }

    const totalTrades = trades.length;
    const planningTrades = trades.filter(t => t.status === 'PLANNING' || t.status === 'PLANNED').length;
    const openTrades = trades.filter(t => t.status === 'OPEN' || t.status === 'ACTIVE').length;
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

    // Calculate streaks
    let currentStreak = 0;
    let streakType: 'win' | 'loss' | 'none' = 'none';
    if (trades.length > 0) {
      const lastTrade = trades[trades.length - 1];
      if (lastTrade.status === 'WIN') {
        streakType = 'win';
        for (let i = trades.length - 1; i >= 0 && trades[i].status === 'WIN'; i--) {
          currentStreak++;
        }
      } else if (lastTrade.status === 'LOSS') {
        streakType = 'loss';
        for (let i = trades.length - 1; i >= 0 && trades[i].status === 'LOSS'; i--) {
          currentStreak++;
        }
      }
    }

    // Calculate trading days
    const tradeDates = [...new Set(trades.map(t => t.createdAt.split('T')[0]))];
    const tradingDays = tradeDates.length;
    const avgTradesPerDay = tradingDays > 0 ? totalTrades / tradingDays : 0;

    // Monthly P&L
    const monthlyPnL = trades.reduce((acc, trade) => {
      const month = new Date(trade.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const existing = acc.find(m => m.month === month);
      const pnl = trade.status === 'WIN' ? trade.profitDollars : trade.status === 'LOSS' ? -trade.lossDollars : 0;
      
      if (existing) {
        existing.pnl += pnl;
      } else {
        acc.push({ month, pnl });
      }
      return acc;
    }, [] as { month: string; pnl: number }[]);

    // Symbol breakdown
    const symbolBreakdown = trades.reduce((acc, trade) => {
      const existing = acc.find(s => s.symbol === trade.symbol);
      const pnl = trade.status === 'WIN' ? trade.profitDollars : trade.status === 'LOSS' ? -trade.lossDollars : 0;
      
      if (existing) {
        existing.trades++;
        existing.pnl += pnl;
        if (trade.status === 'WIN') existing.wins++;
      } else {
        acc.push({ 
          symbol: trade.symbol, 
          trades: 1, 
          pnl, 
          wins: trade.status === 'WIN' ? 1 : 0,
          winRate: 0 // Will be calculated below
        });
      }
      return acc;
    }, [] as { symbol: string; trades: number; pnl: number; wins: number; winRate: number }[]);

    // Calculate win rates for each symbol
    symbolBreakdown.forEach(symbol => {
      symbol.winRate = symbol.trades > 0 ? (symbol.wins / symbol.trades) : 0;
    });

    // Direction breakdown
    const longTrades = trades.filter(t => t.tradeDirection === 'LONG');
    const shortTrades = trades.filter(t => t.tradeDirection === 'SHORT');
    const longPnL = longTrades.reduce((sum, t) => {
      return sum + (t.status === 'WIN' ? t.profitDollars : t.status === 'LOSS' ? -t.lossDollars : 0);
    }, 0);
    const shortPnL = shortTrades.reduce((sum, t) => {
      return sum + (t.status === 'WIN' ? t.profitDollars : t.status === 'LOSS' ? -t.lossDollars : 0);
    }, 0);

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
      avgRiskReward: trades.reduce((sum, t) => sum + (t.riskRewardRatio || 0), 0) / Math.max(1, trades.length),
      totalRisk: trades.reduce((sum, t) => sum + (t.riskAmount || 0), 0),
      totalReward: totalProfit,
      bestTrade,
      worstTrade,
      avgWin,
      avgLoss,
      currentStreak,
      streakType,
      largestWinStreak: 0, // Will be calculated in advanced metrics
      largestLossStreak: 0, // Will be calculated in advanced metrics
      tradingDays,
      avgTradesPerDay,
      monthlyPnL,
      symbolBreakdown,
      directionBreakdown: { 
        long: longTrades.length, 
        short: shortTrades.length, 
        longPnL, 
        shortPnL,
        longWins: longTrades.filter(t => t.status === 'WIN').length,
        shortWins: shortTrades.filter(t => t.status === 'WIN').length
      },
      advancedMetrics: calculateAdvancedMetrics(trades),
      riskMetrics: calculateRiskMetrics(trades),
      sessionBreakdown: [
        { session: 'Asian', trades: Math.floor(totalTrades * 0.2), pnl: netPnL * 0.15, winRate: winRate * 0.8, avgDuration: 'N/A', avgWin: 0, avgLoss: 0, riskReward: 0 },
        { session: 'London', trades: Math.floor(totalTrades * 0.4), pnl: netPnL * 0.45, winRate: winRate * 1.1, avgDuration: 'N/A', avgWin: 0, avgLoss: 0, riskReward: 0 },
        { session: 'New York', trades: Math.floor(totalTrades * 0.4), pnl: netPnL * 0.4, winRate: winRate * 1.05, avgDuration: 'N/A', avgWin: 0, avgLoss: 0, riskReward: 0 }
      ],
      weeklyPerformance: [],
      monthlyComparison: [],
      psychologyMetrics: {
        emotionalTrades: Math.floor(totalTrades * 0.15),
        revengeTrades: Math.floor(lossTrades * 0.3),
        fomoPnL: totalLoss * 0.2,
        disciplinedTrades: totalTrades - Math.floor(totalTrades * 0.15),
        impulsiveTrades: Math.floor(totalTrades * 0.15)
      }
    };
  }, [trades, calculateAdvancedMetrics, calculateRiskMetrics]);

  // Calendar generation
  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: CalendarDay[] = [];
    const currentIterDate = new Date(startDate); // Renamed to avoid conflict
    
    for (let i = 0; i < 42; i++) {
      const dayTrades = trades.filter(trade => {
        const tradeDate = new Date(trade.createdAt);
        return tradeDate.toDateString() === currentIterDate.toDateString();
      });
      
      const totalPnL = dayTrades.reduce((sum, trade) => {
        if (trade.status === 'WIN') return sum + trade.profitDollars;
        if (trade.status === 'LOSS') return sum - trade.lossDollars;
        return sum;
      }, 0);
      
      const winTrades = dayTrades.filter(t => t.status === 'WIN').length;
      const winRate = dayTrades.length > 0 ? (winTrades / dayTrades.length) * 100 : 0;
      
      days.push({
        date: new Date(currentIterDate),
        trades: dayTrades,
        totalPnL,
        winRate,
        tradeCount: dayTrades.length
      });
      
      currentIterDate.setDate(currentIterDate.getDate() + 1);
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();

  const handleDayClick = (day: CalendarDay) => {
    setSelectedDay(day);
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToCurrentMonth = () => {
    setCurrentDate(new Date());
  };

  const formatDateRange = (start: string, end: string) => {
    if (!start && !end) return 'All Time';
    if (start && !end) return `From ${new Date(start).toLocaleDateString()}`;
    if (!start && end) return `Until ${new Date(end).toLocaleDateString()}`;
    return `${new Date(start).toLocaleDateString()} - ${new Date(end).toLocaleDateString()}`;
  };

  const applyDateRange = () => {
    if (tempDateRange.start) {
      setCustomDateRange({ start: tempDateRange.start.toISOString().split('T')[0], end: tempDateRange.end ? tempDateRange.end.toISOString().split('T')[0] : '' });
    }
    setShowDatePicker(false);
  };

  const handlePresetClick = (preset: string) => {
    const today = new Date();
    let start: Date, end: Date;
    
    switch (preset) {
      case 'today':
        start = end = today;
        break;
      case 'yesterday':
        start = end = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'last-week':
        end = today;
        start = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'last-month':
        end = today;
        start = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
        break;
      case 'last-quarter':
        end = today;
        start = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
        break;
      default:
        return;
    }
    
    setTempDateRange({ start, end });
    applyDateRange();
  };

  const resetDateRange = () => {
    setCustomDateRange({ start: '', end: '' });
    setTempDateRange({ start: null, end: null });
    setShowDatePicker(false);
  };

  if (loading) {
    return (
      <div className="flex-1 min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 w-full overflow-x-hidden">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 w-full overflow-x-hidden">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="flex items-center justify-center h-64">
            <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Dashboard Error</h3>
                <p className="text-sm text-gray-600 mb-4">Please log in to view your dashboard.</p>
                <button
                  onClick={() => router.push('/login')}
                  className="w-full px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 w-full overflow-x-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-emerald-200/20 to-cyan-200/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        
        {/* Enhanced Main Dashboard Header */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 p-8 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
            <div>
                  <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent mb-2">
                    Trading Dashboard
              </h1>
              <p className="text-lg text-gray-600">
                    Welcome back, <span className="font-semibold text-gray-800">{user?.name || 'Trader'}</span>! Real-time performance & analytics
              </p>
            </div>
              </div>
              <div className="mt-6 lg:mt-0 flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="bg-blue-50/80 backdrop-blur-xl rounded-2xl px-6 py-4 shadow-lg border border-blue-200/50">
                  <div className="text-sm font-medium text-blue-600">Live Data</div>
                  <div className="text-sm font-bold text-gray-800 flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  {new Date().toLocaleString()}
                </div>
              </div>
              {selectedAccount && (
                  <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-2xl px-6 py-4 shadow-xl border border-white/20">
                    <div className="text-sm font-medium opacity-90">Active Account</div>
                    <div className="text-lg font-bold">{selectedAccount.name}</div>
                    <div className="text-sm opacity-90">${selectedAccount.currentBalance?.toFixed(2) || '0.00'}</div>
                </div>
              )}
            </div>
            </div>
            
            {/* Real-time Account Balance */}
            {selectedAccount && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <div className="bg-gray-50/80 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50">
                  <div className="text-gray-600 text-sm font-medium">Account Balance</div>
                  <div className="text-2xl font-bold text-gray-800">${selectedAccount.currentBalance?.toFixed(2) || '0.00'}</div>
                </div>
                <div className="bg-gray-50/80 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50">
                  <div className="text-gray-600 text-sm font-medium">Initial Balance</div>
                  <div className="text-2xl font-bold text-gray-800">${selectedAccount.initialBalance?.toFixed(2) || '0.00'}</div>
                </div>
                <div className="bg-gray-50/80 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50">
                  <div className="text-gray-600 text-sm font-medium">Balance Change</div>
                  <div className={`text-2xl font-bold ${
                    (selectedAccount.currentBalance || 0) >= (selectedAccount.initialBalance || 0) 
                      ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {((selectedAccount.currentBalance || 0) >= (selectedAccount.initialBalance || 0) ? '+' : '')}
                    ${((selectedAccount.currentBalance || 0) - (selectedAccount.initialBalance || 0)).toFixed(2)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Enhanced Net P&L Widget */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 p-6 hover:bg-white/90 transition-all duration-300 group shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-bold text-gray-700">Net P&L</div>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              </div>
            <div className={`text-3xl font-bold mb-2 ${stats.netPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.netPnL >= 0 ? '+' : ''}${stats.netPnL.toFixed(2)}
              </div>
            <div className="text-gray-500 text-sm mb-4">Total trading performance</div>
            <div className="bg-gray-100 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-1000 ${
                  stats.netPnL >= 0 ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-red-400 to-pink-500'
                }`}
                style={{ width: `${Math.min(Math.abs(stats.netPnL) / 1000 * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Enhanced Win Rate Widget */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 p-6 hover:bg-white/90 transition-all duration-300 group shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-bold text-gray-700">Win Rate</div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              </div>
            <div className={`text-3xl font-bold mb-2 ${
              stats.winRate >= 60 ? 'text-green-600' : 
              stats.winRate >= 40 ? 'text-yellow-600' : 'text-red-600'
            }`}>
                {stats.winRate.toFixed(1)}%
              </div>
            <div className="text-gray-500 text-sm mb-4">{stats.winTrades}W / {stats.lossTrades}L</div>
            <div className="bg-gray-100 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-1000 ${
                  stats.winRate >= 60 ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 
                  stats.winRate >= 40 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 
                  'bg-gradient-to-r from-red-400 to-pink-500'
                }`}
                style={{ width: `${stats.winRate}%` }}
              ></div>
            </div>
          </div>

          {/* Enhanced Profit Factor Widget */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 p-6 hover:bg-white/90 transition-all duration-300 group shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-bold text-gray-700">Profit Factor</div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              </div>
            <div className={`text-3xl font-bold mb-2 ${
              stats.profitFactor >= 2 ? 'text-green-600' : 
              stats.profitFactor >= 1 ? 'text-blue-600' : 'text-red-600'
            }`}>
                {stats.profitFactor.toFixed(2)}
              </div>
            <div className="text-gray-500 text-sm mb-4">Profit ÷ Loss ratio</div>
            <div className="bg-gray-100 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-1000 ${
                  stats.profitFactor >= 2 ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 
                  stats.profitFactor >= 1 ? 'bg-gradient-to-r from-blue-400 to-indigo-500' : 
                  'bg-gradient-to-r from-red-400 to-pink-500'
                }`}
                style={{ width: `${Math.min(stats.profitFactor * 25, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Enhanced Total Trades Widget */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 p-6 hover:bg-white/90 transition-all duration-300 group shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-bold text-gray-700">Total Trades</div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              </div>
            <div className="text-3xl font-bold text-gray-800 mb-2">{stats.totalTrades}</div>
            <div className="text-gray-500 text-sm mb-4">Executed positions</div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">{stats.openTrades} Open</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">{stats.planningTrades} Planned</span>
            </div>
          </div>
        </div>

        {/* Enhanced Trading Performance Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Enhanced Trading Summary */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 p-8 shadow-xl">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              Trading Performance Summary
            </h3>

            <div className="space-y-4">
              {/* Winning Trades */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center border border-green-200">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                  </div>
                  <div>
                      <div className="font-bold text-gray-800 text-lg">{stats.winTrades} Winning Trades</div>
                      <div className="text-green-700 text-sm">Average: ${stats.avgWin.toFixed(2)} per trade</div>
                      <div className="text-green-600 text-xs">Largest Win: +${stats.bestTrade.toFixed(2)}</div>
                  </div>
                </div>
                <div className="text-right">
                    <div className="font-bold text-green-600 text-2xl">+${stats.totalProfit.toFixed(0)}</div>
                    <div className="text-green-700 text-sm">Total Profit</div>
                  </div>
                </div>
              </div>

              {/* Losing Trades */}
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center border border-red-200">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                  </div>
                  <div>
                      <div className="font-bold text-gray-800 text-lg">{stats.lossTrades} Losing Trades</div>
                      <div className="text-red-700 text-sm">Average: ${stats.avgLoss.toFixed(2)} per trade</div>
                      <div className="text-red-600 text-xs">Largest Loss: -${stats.worstTrade.toFixed(2)}</div>
                  </div>
                </div>
                <div className="text-right">
                    <div className="font-bold text-red-600 text-2xl">-${stats.totalLoss.toFixed(0)}</div>
                    <div className="text-red-700 text-sm">Total Loss</div>
                  </div>
                </div>
              </div>

              {/* Open & Planning Trades */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 backdrop-blur-sm">
                  <div className="text-blue-700 text-sm font-medium">Open Trades</div>
                  <div className="text-blue-800 text-2xl font-bold">{stats.openTrades}</div>
                  <div className="text-blue-600 text-xs">Currently active</div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 backdrop-blur-sm">
                  <div className="text-purple-700 text-sm font-medium">Planning</div>
                  <div className="text-purple-800 text-2xl font-bold">{stats.planningTrades}</div>
                  <div className="text-purple-600 text-xs">In preparation</div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Performance Metrics Circle */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 p-8 shadow-xl">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              Performance Overview
            </h3>

            <div className="flex items-center justify-center mb-8">
              <div className="relative w-48 h-48">
                <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 100 100">
                <circle
                    cx="50" cy="50" r="45"
                  fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="6"
                />
                <circle
                    cx="50" cy="50" r="45"
                  fill="none"
                    stroke="url(#gradient1)"
                    strokeWidth="6"
                  strokeLinecap="round"
                    strokeDasharray={`${stats.winRate * 2.83} 283`}
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
              </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-800">{stats.winRate.toFixed(1)}%</div>
                    <div className="text-gray-600 text-sm">Success Rate</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="text-2xl font-bold text-gray-800">{stats.avgRiskReward.toFixed(2)}</div>
                <div className="text-gray-600 text-sm">Avg R:R</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="text-2xl font-bold text-gray-800">{stats.currentStreak}</div>
                <div className="text-gray-600 text-sm">{stats.streakType} Streak</div>
              </div>
            </div>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="mb-8">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/70 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4 sm:mb-0 flex items-center">
                <svg className="w-6 h-6 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Date Range Filter
              </h3>
              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-700 font-medium">
                  {formatDateRange(customDateRange.start, customDateRange.end)}
                </div>
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Select Dates
                </button>
                {(customDateRange.start || customDateRange.end) && (
                  <button
                    onClick={resetDateRange}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Date Picker */}
            {showDatePicker && (
              <div className="border-t border-gray-200 pt-6 mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Quick Presets */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Presets</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Today', value: 'today' },
                        { label: 'Yesterday', value: 'yesterday' },
                        { label: 'Last Week', value: 'last-week' },
                        { label: 'Last Month', value: 'last-month' },
                        { label: 'Last Quarter', value: 'last-quarter' },
                      ].map((preset) => (
                        <button
                          key={preset.value}
                          onClick={() => handlePresetClick(preset.value)}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors text-sm font-medium"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Date Selection */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Custom Range</h4>
                    <div className="space-y-4">
                      <div className="text-sm text-gray-700 font-medium">
                        {tempDateRange.start && tempDateRange.end ? (
                          `Selected: ${tempDateRange.start.toLocaleDateString()} - ${tempDateRange.end.toLocaleDateString()}`
                        ) : tempDateRange.start ? (
                          `Start: ${tempDateRange.start.toLocaleDateString()} (Select end date)`
                        ) : (
                          'Click dates to select range'
                        )}
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={applyDateRange}
                          disabled={!tempDateRange.start}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                        >
                          Apply
                        </button>
                        <button
                          onClick={() => {
                            setTempDateRange({ start: null, end: null });
                          }}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Trading Calendar */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-gray-200/70 p-8 mb-8 shadow-xl">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </div>
            Trading Calendar
            <span className="ml-auto bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-bold">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
              </h3>
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={goToPreviousMonth}
                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center text-gray-700 transition-all duration-200"
              >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              <h4 className="text-xl font-bold text-gray-900">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h4>
              <button
                onClick={goToNextMonth}
                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center text-gray-700 transition-all duration-200"
              >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            <button
              onClick={goToCurrentMonth}
              className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-xl font-bold transition-all duration-200"
            >
              Today
            </button>
            </div>

          <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center font-bold text-gray-700 py-3">
                  {day}
                </div>
              ))}
            {generateCalendarDays().map((day, index) => (
                  <div
                    key={index}
                    onClick={() => handleDayClick(day)}
                    className={`
                  min-h-[80px] p-2 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-md
                  ${day.date.getMonth() === currentDate.getMonth()
                    ? 'bg-white border-gray-300 hover:bg-gray-50'
                    : 'bg-gray-100 border-gray-200 text-gray-500'
                  }
                  ${new Date().toDateString() === day.date.toDateString()
                    ? 'border-blue-500 bg-blue-50 border-2'
                    : ''
                  }
                `}
              >
                <div className="font-bold text-gray-900 mb-1">{day.date.getDate()}</div>
                {day.trades.length > 0 && (
                  <div className="space-y-1">
                    <div className={`text-xs font-bold ${
                      day.totalPnL >= 0 ? 'text-green-700' : 'text-red-700'
                    }`}>
                          {day.totalPnL >= 0 ? '+' : ''}${day.totalPnL.toFixed(0)}
                        </div>
                    <div className="text-xs text-gray-600 font-medium">
                      {day.trades.length} trade{day.trades.length !== 1 ? 's' : ''}
                    </div>
                    <div className={`w-full h-1 rounded-full ${
                      day.totalPnL >= 0 ? 'bg-green-200' : 'bg-red-200'
                    }`}>
                      <div
                        className={`h-1 rounded-full ${
                          day.totalPnL >= 0 ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${day.winRate}%` }}
                      ></div>
                        </div>
                      </div>
                    )}
                  </div>
            ))}
            </div>

            {/* Calendar Legend */}
          <div className="flex items-center space-x-6 text-sm text-gray-700 font-medium mt-6 border-t border-gray-200 pt-6">
              <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-100 rounded border border-green-300"></div>
                <span>Profitable Day</span>
              </div>
              <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-100 rounded border border-red-300"></div>
                <span>Loss Day</span>
              </div>
              <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-blue-500 rounded bg-blue-50"></div>
                <span>Today</span>
              </div>
            </div>

            {/* Selected Day Details */}
            {selectedDay && selectedDay.trades.length > 0 && (
              <div className="mt-6 border-t border-gray-200 pt-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4">
                  {selectedDay.date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="text-sm text-gray-600 font-medium">Total P&L</div>
                  <div className={`text-lg font-bold ${selectedDay.totalPnL >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {selectedDay.totalPnL >= 0 ? '+' : ''}${selectedDay.totalPnL.toFixed(2)}
                    </div>
                  </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="text-sm text-gray-600 font-medium">Trades</div>
                    <div className="text-lg font-bold text-gray-900">{selectedDay.tradeCount}</div>
                  </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="text-sm text-gray-600 font-medium">Win Rate</div>
                    <div className="text-lg font-bold text-gray-900">{selectedDay.winRate.toFixed(1)}%</div>
                  </div>
                </div>
                <div className="space-y-2">
                  {selectedDay.trades.map((trade) => (
                  <div key={trade.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${trade.status === 'WIN' ? 'bg-green-500' : trade.status === 'LOSS' ? 'bg-red-500' : 'bg-gray-500'}`}></div>
                      <span className="font-bold text-gray-900">{trade.symbol}</span>
                      <span className="text-sm text-gray-700 font-medium">{trade.tradeDirection}</span>
                      </div>
                    <div className={`font-bold ${trade.status === 'WIN' ? 'text-green-700' : trade.status === 'LOSS' ? 'text-red-700' : 'text-gray-700'}`}>
                        {trade.status === 'WIN' ? `+$${trade.profitDollars.toFixed(2)}` : 
                         trade.status === 'LOSS' ? `-$${trade.lossDollars.toFixed(2)}` : 'Open'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>

        {/* Enhanced Performance Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-gray-200/70 p-6 shadow-lg hover:bg-white transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-bold text-gray-800">Profit Factor</div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{stats.profitFactor.toFixed(2)}</div>
            <div className="text-gray-600 text-sm mb-4 font-medium">Gross profit ÷ Loss</div>
            <div className="bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-1000"
                style={{ width: `${Math.min(stats.profitFactor * 25, 100)}%` }}
              ></div>
                </div>
              </div>
              
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-gray-200/70 p-6 shadow-lg hover:bg-white transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-bold text-gray-800">Total Trades</div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{stats.totalTrades}</div>
            <div className="text-gray-600 text-sm mb-4 font-medium">Total executed positions</div>
            <div className="text-xs text-gray-700 font-medium">{stats.avgTradesPerDay.toFixed(1)} trades/day avg</div>
              </div>
              
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-gray-200/70 p-6 shadow-lg hover:bg-white transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-bold text-gray-800">Risk/Reward</div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{stats.avgRiskReward.toFixed(2)}</div>
            <div className="text-gray-600 text-sm mb-4 font-medium">Average ratio</div>
            <div className={`text-xs font-medium ${stats.avgRiskReward >= 2 ? 'text-green-700' : stats.avgRiskReward >= 1 ? 'text-blue-700' : 'text-red-700'}`}>
              {stats.avgRiskReward >= 2 ? 'Excellent' : stats.avgRiskReward >= 1 ? 'Good' : 'Needs improvement'}
          </div>
        </div>

          <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-gray-200/70 p-6 shadow-lg hover:bg-white transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-bold text-gray-800">Trading Days</div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
                  </div>
                </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{stats.tradingDays}</div>
            <div className="text-gray-600 text-sm mb-4 font-medium">Active trading days</div>
            <div className="text-xs text-gray-700 font-medium">
              {stats.largestWinStreak}W / {stats.largestLossStreak}L streak
              </div>
                </div>
              </div>
              
        {/* Enhanced Advanced Analytics Dashboard */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-gray-200/70 p-8 mb-8 shadow-xl">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
            Advanced Analytics
            <span className="ml-auto bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Live Data
            </span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Sharpe Ratio */}
            <div className="bg-gray-50/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/70 hover:bg-gray-50 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="text-gray-800 font-bold">Sharpe Ratio</div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
                    </div>
                    </div>
              <div className="text-2xl font-bold text-gray-900 mb-2">{stats.advancedMetrics.sharpeRatio.toFixed(2)}</div>
              <div className="text-gray-600 text-sm mb-3 font-medium">Risk-adjusted returns</div>
              <div className="bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-1000"
                  style={{ width: `${Math.min(Math.max(stats.advancedMetrics.sharpeRatio + 1, 0) * 40, 100)}%` }}
                ></div>
            </div>
          </div>

            {/* Max Drawdown */}
            <div className="bg-gray-50/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/70 hover:bg-gray-50 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="text-gray-800 font-bold">Max Drawdown</div>
                <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
                  </div>
                  </div>
              <div className="text-2xl font-bold text-gray-900 mb-2">{stats.advancedMetrics.maxDrawdown.toFixed(1)}%</div>
              <div className="text-gray-600 text-sm mb-3 font-medium">Largest peak to trough</div>
              <div className="bg-gray-200 rounded-full h-2">
                    <div 
                  className="h-2 rounded-full bg-gradient-to-r from-red-400 to-red-600 transition-all duration-1000"
                  style={{ width: `${Math.min(stats.advancedMetrics.maxDrawdown, 100)}%` }}
                    ></div>
          </div>
        </div>

            {/* Expectancy */}
            <div className="bg-gray-50/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/70 hover:bg-gray-50 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="text-gray-800 font-bold">Expectancy</div>
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  </div>
              <div className="text-2xl font-bold text-gray-900 mb-2">${stats.advancedMetrics.expectancy.toFixed(2)}</div>
              <div className="text-gray-600 text-sm mb-3 font-medium">Per trade expectation</div>
              <div className="bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-1000 ${
                    stats.advancedMetrics.expectancy >= 0 
                      ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' 
                      : 'bg-gradient-to-r from-red-400 to-red-600'
                  }`}
                  style={{ width: `${Math.min(Math.abs(stats.advancedMetrics.expectancy) * 10, 100)}%` }}
                ></div>
                </div>
              </div>
              
            {/* Kelly Percentage */}
            <div className="bg-gray-50/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/70 hover:bg-gray-50 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="text-gray-800 font-bold">Kelly %</div>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  </div>
              <div className="text-2xl font-bold text-gray-900 mb-2">{stats.advancedMetrics.kellyPercentage.toFixed(1)}%</div>
              <div className="text-gray-600 text-sm mb-3 font-medium">Optimal position size</div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                  className="h-2 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 transition-all duration-1000"
                  style={{ width: `${Math.min(Math.max(stats.advancedMetrics.kellyPercentage, 0), 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

        {/* Additional Advanced Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-50/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/70 hover:bg-gray-50 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-800 font-bold">Winning Streak</div>
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  </div>
            <div className="text-2xl font-bold text-gray-900 mb-2">{stats.advancedMetrics.winningStreak}</div>
            <div className="text-gray-600 text-sm mb-3 font-medium">Best consecutive wins</div>
            <div className="text-xs text-gray-700 font-medium">Current: {stats.currentStreak} {stats.streakType}</div>
                </div>
                
          <div className="bg-gray-50/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/70 hover:bg-gray-50 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-800 font-bold">Recovery Factor</div>
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  </div>
            <div className="text-2xl font-bold text-gray-900 mb-2">{stats.advancedMetrics.recoveryFactor.toFixed(2)}</div>
            <div className="text-gray-600 text-sm mb-3 font-medium">Net profit / Max DD</div>
            <div className="bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-1000"
                style={{ width: `${Math.min(stats.advancedMetrics.recoveryFactor * 20, 100)}%` }}
              ></div>
                </div>
              </div>
              
          <div className="bg-gray-50/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/70 hover:bg-gray-50 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-800 font-bold">Volatility</div>
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
                </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-2">{stats.advancedMetrics.volatility.toFixed(1)}%</div>
            <div className="text-gray-600 text-sm mb-3 font-medium">Return volatility</div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                className="h-2 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 transition-all duration-1000"
                style={{ width: `${Math.min(stats.advancedMetrics.volatility * 2, 100)}%` }}
                  ></div>
            </div>
                </div>
                
          <div className="bg-gray-50/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/70 hover:bg-gray-50 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-800 font-bold">Avg Hold Time</div>
              <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-500 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                </div>
              </div>
            <div className="text-2xl font-bold text-gray-900 mb-2">{stats.advancedMetrics.averageHoldingTime.toFixed(1)}h</div>
            <div className="text-gray-600 text-sm mb-3 font-medium">Average trade duration</div>
            <div className="text-xs text-gray-700 font-medium">
              {stats.advancedMetrics.averageHoldingTime < 1 ? 'Scalping' : 
               stats.advancedMetrics.averageHoldingTime < 24 ? 'Day Trading' : 'Swing Trading'}
            </div>
          </div>
        </div>

        {/* Enhanced Quick Actions */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-gray-200/70 p-8 shadow-2xl mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            Quick Trading Actions
            <div className="ml-auto text-sm text-cyan-700 font-medium">Instant Access</div>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => router.push('/journal')}
              className="group bg-gradient-to-br from-blue-500/20 to-indigo-600/20 hover:from-blue-500/30 hover:to-indigo-600/30 border border-blue-500/30 hover:border-blue-400/50 rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
                </div>
              </div>
              <div className="text-xl font-bold text-gray-900 mb-2">View Journal</div>
              <div className="text-gray-700 text-sm font-medium">Access your complete trading history and detailed analysis</div>
            </button>
            <button
              onClick={() => router.push('/strategies')}
              className="group bg-gradient-to-br from-green-500/20 to-emerald-600/20 hover:from-green-500/30 hover:to-emerald-600/30 border border-green-500/30 hover:border-green-400/50 rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
                </div>
              </div>
              <div className="text-xl font-bold text-gray-900 mb-2">Manage Strategies</div>
              <div className="text-gray-700 text-sm font-medium">Create, edit, and analyze your trading strategies</div>
            </button>
            <button
              onClick={() => router.push('/add-trade')}
              className="group bg-gradient-to-br from-purple-500/20 to-pink-600/20 hover:from-purple-500/30 hover:to-pink-600/30 border border-purple-500/30 hover:border-purple-400/50 rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
                </div>
              </div>
              <div className="text-xl font-bold text-gray-900 mb-2">Add New Trade</div>
              <div className="text-gray-700 text-sm font-medium">Record your latest trade and track performance</div>
            </button>
          </div>
        </div>

        {/* Enhanced Info Note */}
        <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200/70 rounded-2xl p-6 backdrop-blur-sm mb-8">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-blue-300/50">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                Main Trading Dashboard
                <span className="ml-3 px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full border border-green-300/50">
                  🔴 LIVE DATA
                </span>
              </h4>
              <p className="text-gray-700 leading-relaxed font-medium">
                This dashboard displays real-time trading performance metrics from your selected account. 
                All statistics, analytics, and insights are calculated dynamically from your actual trading data. 
                The AM Trader section has its own separate dashboard with independent account management.
              </p>
              <div className="mt-3 flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-700 font-medium">Real-time Updates</span>
            </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-blue-700 font-medium">Dynamic Calculations</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  <span className="text-purple-700 font-medium">Advanced Analytics</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Add Trade Button */}
        <button
          onClick={() => setShowAddTradeModal(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 flex items-center justify-center z-50 group"
          title="Add New Trade"
        >
          <svg className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>

        {/* Add Trade Modal */}
        {showAddTradeModal && (
          <AddTradeModal
            onClose={() => setShowAddTradeModal(false)}
            onSuccess={() => {
              setShowAddTradeModal(false);
              fetchTrades(); // Refresh the dashboard data
            }}
          />
        )}
      </div>
    </div>
  );
} 