'use client';

import React from 'react';

interface OverviewDashboardProps {
  users: any[];
  trades: any[];
  strategies: any[];
  platformStats: any;
  realTimeStats: any;
  systemMetrics: any;
}

export default function OverviewDashboard({
  users,
  trades,
  strategies,
  platformStats,
  realTimeStats,
  systemMetrics
}: OverviewDashboardProps) {
  return (
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
            <p className="text-4xl font-bold text-white mb-2">{trades.length}</p>
            <p className="text-sm text-green-200">Executed trades</p>
          </div>
        </div>

        {/* Total Strategies Card */}
        <div className="group relative bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-3xl border border-purple-500/30 p-6 hover:scale-105 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <div className="text-purple-400 text-sm font-medium">+5% week</div>
            </div>
            <h3 className="text-sm font-bold text-purple-300 uppercase tracking-wider mb-2">Strategies</h3>
            <p className="text-4xl font-bold text-white mb-2">{strategies.length}</p>
            <p className="text-sm text-purple-200">Active strategies</p>
          </div>
        </div>

        {/* System Health Card */}
        <div className="group relative bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-xl rounded-3xl border border-orange-500/30 p-6 hover:scale-105 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className={`text-sm font-medium ${
                systemMetrics.serverHealth === 'excellent' ? 'text-green-400' : 
                systemMetrics.serverHealth === 'good' ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {systemMetrics.serverHealth}
              </div>
            </div>
            <h3 className="text-sm font-bold text-orange-300 uppercase tracking-wider mb-2">System Health</h3>
            <p className="text-4xl font-bold text-white mb-2">{systemMetrics.serverUptime}%</p>
            <p className="text-sm text-orange-200">Uptime</p>
          </div>
        </div>
      </div>

      {/* Platform Performance & System Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            Real-time Activity
          </h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
              <div>
                <p className="text-white font-semibold">Online Users</p>
                <p className="text-blue-300 text-sm">Currently active</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">{realTimeStats.onlineUsers}</p>
                <p className="text-green-400 text-sm">Live</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
              <div>
                <p className="text-white font-semibold">Today's Trades</p>
                <p className="text-blue-300 text-sm">Executed today</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">{realTimeStats.todayTrades}</p>
                <p className="text-green-400 text-sm">+8% vs yesterday</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
              <div>
                <p className="text-white font-semibold">Today's Profit</p>
                <p className="text-blue-300 text-sm">Total P&L today</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-400">${realTimeStats.todayProfit.toFixed(2)}</p>
                <p className="text-green-400 text-sm">+15% vs yesterday</p>
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
                <span className="text-white font-bold">{systemMetrics.cpuUsage}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${systemMetrics.cpuUsage}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-medium">Memory Usage</span>
                <span className="text-white font-bold">{systemMetrics.memoryUsage}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${systemMetrics.memoryUsage}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-medium">Disk Usage</span>
                <span className="text-white font-bold">{systemMetrics.diskUsage}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${systemMetrics.diskUsage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            Recent Activity
          </h3>
          <div className="space-y-4">
            {trades.slice(0, 5).map((trade: any, index: number) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                  trade.pnl > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{trade.symbol || 'EURUSD'}</p>
                  <p className="text-gray-400 text-sm">{trade.userName || 'User'} • {trade.direction || 'BUY'}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${trade.pnl > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${(trade.pnl || Math.random() * 1000).toFixed(2)}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {new Date(trade.entryTime || Date.now()).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            Top Performers
          </h3>
          <div className="space-y-4">
            {users.slice(0, 5).map((user: any, index: number) => (
              <div key={user.id} className="flex items-center space-x-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="flex items-center space-x-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-yellow-500 text-black' :
                    index === 1 ? 'bg-gray-400 text-black' :
                    index === 2 ? 'bg-orange-500 text-black' :
                    'bg-white/20 text-white'
                  }`}>
                    {index + 1}
                  </span>
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{user.name}</p>
                  <p className="text-gray-400 text-sm">{user.statistics.totalTrades} trades</p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-bold">${user.statistics.netPnL.toFixed(2)}</p>
                  <p className="text-gray-400 text-sm">{user.statistics.winRate.toFixed(1)}% win</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 