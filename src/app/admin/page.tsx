'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthProvider';
import { useRouter } from 'next/navigation';
import UserDetailModal from '../components/UserDetailModal';
import AllTradesTab from '../components/AllTradesTab';
import AnalyticsTab from '../components/AnalyticsTab';
import LiveMonitoringTab from '../components/LiveMonitoringTab';
import ReportsTab from '../components/ReportsTab';
import SettingsTab from '../components/SettingsTab';
import SystemLogsTab from '../components/SystemLogsTab';

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
  accountsCount: number;
  totalAccountBalance: number;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
  statistics: UserStats;
  accounts: any[];
  recentTrades: any[];
}

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'trades' | 'analytics' | 'monitoring' | 'reports' | 'settings' | 'logs'>('overview');
  const [allTrades, setAllTrades] = useState<any[]>([]);
  const [platformStats, setPlatformStats] = useState<any>(null);
  const [realTimeData, setRealTimeData] = useState({
    activeUsers: 0,
    onlineUsers: 0,
    todayTrades: 0,
    todayProfit: 0,
    systemHealth: 'excellent' as 'excellent' | 'good' | 'warning' | 'critical',
    serverLoad: 25,
    memoryUsage: 68,
    diskUsage: 45
  });

  useEffect(() => {
    if (!isLoading) {
      if (!user || !user.isAdmin) {
        router.push('/');
        return;
      }
      fetchUsers();
    }
  }, [user, isLoading, router]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        calculatePlatformStats(data.users);
      } else {
        console.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTrades = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/trades', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAllTrades(data.trades);
      } else {
        console.error('Failed to fetch trades');
      }
    } catch (error) {
      console.error('Error fetching trades:', error);
    }
  };

  const calculatePlatformStats = (usersData: UserData[]) => {
    const stats = {
      totalUsers: usersData.length,
      totalTrades: usersData.reduce((sum, user) => sum + user.statistics.totalTrades, 0),
      totalProfit: usersData.reduce((sum, user) => sum + user.statistics.totalProfit, 0),
      totalLoss: usersData.reduce((sum, user) => sum + user.statistics.totalLoss, 0),
      totalBalance: usersData.reduce((sum, user) => sum + user.statistics.totalAccountBalance, 0),
      activeUsers: usersData.filter(user => user.statistics.totalTrades > 0).length,
      avgTradesPerUser: usersData.length > 0 ? usersData.reduce((sum, user) => sum + user.statistics.totalTrades, 0) / usersData.length : 0,
      topPerformers: usersData
        .filter(user => user.statistics.netPnL > 0)
        .sort((a, b) => b.statistics.netPnL - a.statistics.netPnL)
        .slice(0, 5),
      recentRegistrations: usersData
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10),
    };
    setPlatformStats(stats);
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setUsers(users.filter(u => u.id !== userId));
        setShowDeleteConfirm(null);
        alert('User deleted successfully');
      } else {
        const data = await response.json();
        alert(`Failed to delete user: ${data.message}`);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user');
    }
  };

  const viewUserDetails = (user: UserData) => {
    setSelectedUser(user);
  };

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400">You don't have admin privileges.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-indigo-950 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 flex">
        <div className="fixed left-0 top-0 h-full w-80 bg-white/10 backdrop-blur-xl border-r border-white/20 z-40 pt-20">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                <p className="text-sm text-gray-300">Control Center</p>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-2">
            {[
              {
                id: 'overview',
                label: 'Overview',
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                color: 'from-blue-500 to-cyan-500',
                description: 'Dashboard overview'
              },
              {
                id: 'users',
                label: 'User Management',
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                ),
                color: 'from-purple-500 to-pink-500',
                description: 'Manage users & permissions'
              },
              {
                id: 'trades',
                label: 'All Trades',
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                ),
                color: 'from-green-500 to-emerald-500',
                description: 'View & analyze trades'
              },
              {
                id: 'analytics',
                label: 'Analytics',
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ),
                color: 'from-orange-500 to-red-500',
                description: 'Advanced insights'
              },
              {
                id: 'monitoring',
                label: 'Live Monitoring',
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                ),
                color: 'from-red-500 to-pink-500',
                description: 'Real-time monitoring'
              },
              {
                id: 'reports',
                label: 'Reports',
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
                color: 'from-indigo-500 to-purple-500',
                description: 'Generate reports'
              },
              {
                id: 'settings',
                label: 'Settings',
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
                color: 'from-gray-500 to-slate-500',
                description: 'Platform configuration'
              },
              {
                id: 'logs',
                label: 'System Logs',
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
                color: 'from-teal-500 to-cyan-500',
                description: 'View activity logs'
              },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  if (item.id === 'trades' && allTrades.length === 0) {
                    fetchAllTrades();
                  }
                }}
                className={`w-full flex items-center space-x-4 p-4 rounded-2xl transition-all duration-300 group ${
                  activeTab === item.id
                    ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  activeTab === item.id
                    ? 'bg-white/20'
                    : 'bg-white/10 group-hover:bg-white/20'
                }`}>
                  {item.icon}
                </div>

                <div className="flex-1 text-left">
                  <p className="font-semibold text-sm">{item.label}</p>
                  <p className={`text-xs ${
                    activeTab === item.id ? 'text-white/80' : 'text-white/50'
                  }`}>
                    {item.description}
                  </p>
                </div>

                {activeTab === item.id && (
                  <div className="w-1 h-8 bg-white rounded-full"></div>
                )}
              </button>
            ))}
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
            <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-2xl">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
              <div>
                <p className="text-white text-sm font-medium">System Online</p>
                <p className="text-green-300 text-xs">{realTimeData.activeUsers} users active</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 ml-80">
          <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-30">
            <div className="px-8 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white capitalize">{activeTab} Dashboard</h1>
                  <p className="text-sm text-gray-300">Platform overview and key metrics</p>
                </div>
                <div className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl backdrop-blur-sm">
                  <span className="text-sm font-medium text-white">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Hero Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Total Users Card */}
                  <div className="group relative bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl rounded-3xl border border-blue-500/30 p-6 hover:scale-105 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                          </svg>
                        </div>
                        <div className="text-blue-400 text-sm font-medium">+12% this month</div>
                      </div>
                      <h3 className="text-sm font-bold text-blue-300 uppercase tracking-wider mb-2">Total Users</h3>
                      <p className="text-4xl font-bold text-white mb-2">{users.length}</p>
                      <p className="text-sm text-blue-200">Registered members</p>
                    </div>
                  </div>

                  {/* Total Trades Card */}
                  <div className="group relative bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-3xl border border-green-500/30 p-6 hover:scale-105 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <div className="text-green-400 text-sm font-medium">+8% today</div>
                      </div>
                      <h3 className="text-sm font-bold text-green-300 uppercase tracking-wider mb-2">Total Trades</h3>
                      <p className="text-4xl font-bold text-white mb-2">
                        {users.reduce((sum, user) => sum + user.statistics.totalTrades, 0)}
                      </p>
                      <p className="text-sm text-green-200">Executed trades</p>
                    </div>
                  </div>

                  {/* Total P&L Card */}
                  <div className="group relative bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-3xl border border-purple-500/30 p-6 hover:scale-105 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                        </div>
                        <div className={`text-sm font-medium ${
                          users.reduce((sum, user) => sum + user.statistics.netPnL, 0) >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {users.reduce((sum, user) => sum + user.statistics.netPnL, 0) >= 0 ? '+' : ''}
                          {((users.reduce((sum, user) => sum + user.statistics.netPnL, 0) / 10000) * 100).toFixed(1)}%
                        </div>
                      </div>
                      <h3 className="text-sm font-bold text-purple-300 uppercase tracking-wider mb-2">Total P&L</h3>
                      <p className={`text-4xl font-bold mb-2 ${
                        users.reduce((sum, user) => sum + user.statistics.netPnL, 0) >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        ${users.reduce((sum, user) => sum + user.statistics.netPnL, 0).toFixed(2)}
                      </p>
                      <p className="text-sm text-purple-200">Net profit/loss</p>
                    </div>
                  </div>

                  {/* Total Balance Card */}
                  <div className="group relative bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-xl rounded-3xl border border-orange-500/30 p-6 hover:scale-105 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                        </div>
                        <div className="text-orange-400 text-sm font-medium">+5% growth</div>
                      </div>
                      <h3 className="text-sm font-bold text-orange-300 uppercase tracking-wider mb-2">Total Balance</h3>
                      <p className="text-4xl font-bold text-white mb-2">
                        ${users.reduce((sum, user) => sum + user.statistics.totalAccountBalance, 0).toLocaleString()}
                      </p>
                      <p className="text-sm text-orange-200">Account balances</p>
                    </div>
                  </div>
                </div>

                {/* Platform Performance */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8">
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      Platform Performance
                    </h3>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                        <div>
                          <p className="text-white font-semibold">Active Users</p>
                          <p className="text-blue-300 text-sm">Real-time activity</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-white">{realTimeData.activeUsers}</p>
                          <p className="text-green-400 text-sm">+12% today</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8">
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                        </svg>
                      </div>
                      System Resources
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-white font-medium">CPU Usage</span>
                          <span className="text-white font-bold">{realTimeData.serverLoad}%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${realTimeData.serverLoad}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-white flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                    User Management
                    <span className="ml-4 px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-xl text-sm font-medium text-purple-300">
                      {users.length} users
                    </span>
                  </h2>
                </div>

                {/* Users Table */}
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-white/10 border-b border-white/10">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">User</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">Email</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">Trades</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">P&L</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {users.map((user) => (
                          <tr key={user.id} className="hover:bg-white/5 transition-colors duration-200">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                                  <span className="text-white font-semibold text-sm">
                                    {user.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-lg font-semibold text-white">{user.name}</p>
                                  <p className="text-sm text-gray-300">
                                    Joined {new Date(user.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <p className="text-white font-medium">{user.email}</p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <p className="text-2xl font-bold text-white">{user.statistics.totalTrades}</p>
                              <p className="text-sm text-gray-300">
                                {user.statistics.winTrades}W / {user.statistics.lossTrades}L
                              </p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <p className={`text-2xl font-bold ${
                                user.statistics.netPnL >= 0 ? 'text-green-400' : 'text-red-400'
                              }`}>
                                ${user.statistics.netPnL.toFixed(2)}
                              </p>
                              <p className="text-sm text-gray-300">
                                {user.statistics.winRate.toFixed(1)}% win rate
                              </p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {user.isAdmin && (
                                <span className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm font-medium rounded-xl shadow-lg">
                                  Admin
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => viewUserDetails(user)}
                                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:scale-105"
                                >
                                  View
                                </button>
                                {!user.isAdmin && (
                                  <button
                                    onClick={() => setShowDeleteConfirm(user.id)}
                                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:scale-105"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* All Trades Tab */}
            {activeTab === 'trades' && (
              <AllTradesTab trades={allTrades} onRefresh={fetchAllTrades} />
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <AnalyticsTab users={users} platformStats={platformStats} />
            )}

            {/* Live Monitoring Tab */}
            {activeTab === 'monitoring' && (
              <LiveMonitoringTab users={users} trades={allTrades} />
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <ReportsTab users={users} trades={allTrades} />
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <SettingsTab users={users} />
            )}

            {/* System Logs Tab */}
            {activeTab === 'logs' && (
              <SystemLogsTab users={users} />
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-xl flex items-center justify-center z-50 p-4">
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 max-w-md w-full shadow-2xl">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">Delete User</h3>
                    <p className="text-gray-300 mb-8 leading-relaxed">
                      Are you sure you want to delete this user? This will permanently delete all their trades, accounts, and data. This action cannot be undone.
                    </p>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => setShowDeleteConfirm(null)}
                        className="flex-1 px-6 py-3 bg-white/10 border border-white/20 text-white rounded-2xl hover:bg-white/20 transition-all duration-200 font-semibold backdrop-blur-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDeleteUser(showDeleteConfirm)}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-2xl transition-all duration-200 font-semibold shadow-lg hover:scale-105"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* User Detail Modal */}
            {selectedUser && (
              <UserDetailModal
                user={selectedUser}
                isOpen={!!selectedUser}
                onClose={() => setSelectedUser(null)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
