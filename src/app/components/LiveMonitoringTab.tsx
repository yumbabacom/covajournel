'use client';

import { useState, useEffect } from 'react';

interface LiveMonitoringTabProps {
  users: any[];
  trades: any[];
}

export default function LiveMonitoringTab({ users, trades }: LiveMonitoringTabProps) {
  const [realTimeData, setRealTimeData] = useState({
    activeUsers: 0,
    onlineUsers: 0,
    todayTrades: 0,
    todayProfit: 0,
    systemHealth: 'excellent' as 'excellent' | 'good' | 'warning' | 'critical',
    serverLoad: 25,
    memoryUsage: 68,
    diskUsage: 45,
    responseTime: 120,
    uptime: '99.9%'
  });

  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        ...prev,
        activeUsers: Math.floor(Math.random() * 50) + 10,
        onlineUsers: Math.floor(Math.random() * 20) + 5,
        todayTrades: Math.floor(Math.random() * 100) + 50,
        todayProfit: Math.random() * 10000 - 2000,
        serverLoad: Math.floor(Math.random() * 40) + 20,
        memoryUsage: Math.floor(Math.random() * 30) + 60,
        diskUsage: Math.floor(Math.random() * 20) + 40,
        responseTime: Math.floor(Math.random() * 100) + 80,
      }));

      // Simulate recent activity
      const activities = [
        'New user registration: john.doe@email.com',
        'Trade executed: EUR/USD LONG by Alice Johnson',
        'Account balance updated: +$1,250.00',
        'System backup completed successfully',
        'New trade alert: GBP/JPY analysis ready',
        'User login: trader@example.com',
        'Trade closed: PROFIT +$850.00',
        'Database optimization completed',
      ];

      setRecentActivity(prev => [
        {
          id: Date.now(),
          message: activities[Math.floor(Math.random() * activities.length)],
          timestamp: new Date(),
          type: Math.random() > 0.7 ? 'warning' : Math.random() > 0.5 ? 'success' : 'info'
        },
        ...prev.slice(0, 9)
      ]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600 dark:text-green-400';
      case 'good': return 'text-blue-600 dark:text-blue-400';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400';
      case 'critical': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getHealthBg = (health: string) => {
    switch (health) {
      case 'excellent': return 'bg-green-100 dark:bg-green-900/20';
      case 'good': return 'bg-blue-100 dark:bg-blue-900/20';
      case 'warning': return 'bg-yellow-100 dark:bg-yellow-900/20';
      case 'critical': return 'bg-red-100 dark:bg-red-900/20';
      default: return 'bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  return (
    <div className="space-y-8">
      {/* Real-time Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 dark:border-gray-700/30 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Active Users</h3>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{realTimeData.activeUsers}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {realTimeData.onlineUsers} online now
          </p>
        </div>

        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 dark:border-gray-700/30 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Today's Trades</h3>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{realTimeData.todayTrades}</p>
          <p className={`text-sm mt-1 font-semibold ${
            realTimeData.todayProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {realTimeData.todayProfit >= 0 ? '+' : ''}${realTimeData.todayProfit.toFixed(2)}
          </p>
        </div>

        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 dark:border-gray-700/30 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">System Health</h3>
            <div className={`w-3 h-3 rounded-full animate-pulse ${
              realTimeData.systemHealth === 'excellent' ? 'bg-green-500' :
              realTimeData.systemHealth === 'good' ? 'bg-blue-500' :
              realTimeData.systemHealth === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
          </div>
          <p className={`text-3xl font-bold capitalize ${getHealthColor(realTimeData.systemHealth)}`}>
            {realTimeData.systemHealth}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Uptime: {realTimeData.uptime}
          </p>
        </div>

        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 dark:border-gray-700/30 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Response Time</h3>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
          </div>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{realTimeData.responseTime}ms</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Average response
          </p>
        </div>
      </div>

      {/* System Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 dark:border-gray-700/30 p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <span className="text-2xl mr-2">⚡</span>
            System Performance
          </h3>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Server Load</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{realTimeData.serverLoad}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    realTimeData.serverLoad > 80 ? 'bg-red-500' :
                    realTimeData.serverLoad > 60 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${realTimeData.serverLoad}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Memory Usage</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{realTimeData.memoryUsage}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    realTimeData.memoryUsage > 80 ? 'bg-red-500' :
                    realTimeData.memoryUsage > 60 ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${realTimeData.memoryUsage}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Disk Usage</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{realTimeData.diskUsage}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    realTimeData.diskUsage > 80 ? 'bg-red-500' :
                    realTimeData.diskUsage > 60 ? 'bg-yellow-500' : 'bg-purple-500'
                  }`}
                  style={{ width: `${realTimeData.diskUsage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 dark:border-gray-700/30 p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <span className="text-2xl mr-2">📡</span>
            Live Activity Feed
          </h3>
          
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-lg">{getActivityIcon(activity.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white font-medium">
                    {activity.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 dark:border-gray-700/30 p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <span className="text-2xl mr-2">🚀</span>
          Quick Actions
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-800 transition-colors">
            <div className="text-2xl mb-2">🔄</div>
            <div className="text-sm font-semibold text-blue-800 dark:text-blue-300">Restart Services</div>
          </button>
          
          <button className="p-4 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-xl border border-green-200 dark:border-green-800 transition-colors">
            <div className="text-2xl mb-2">💾</div>
            <div className="text-sm font-semibold text-green-800 dark:text-green-300">Backup Database</div>
          </button>
          
          <button className="p-4 bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded-xl border border-yellow-200 dark:border-yellow-800 transition-colors">
            <div className="text-2xl mb-2">🧹</div>
            <div className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">Clear Cache</div>
          </button>
          
          <button className="p-4 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-xl border border-purple-200 dark:border-purple-800 transition-colors">
            <div className="text-2xl mb-2">📊</div>
            <div className="text-sm font-semibold text-purple-800 dark:text-purple-300">Generate Report</div>
          </button>
        </div>
      </div>
    </div>
  );
}
