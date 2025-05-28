'use client';

interface UserData {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
  statistics: {
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
  };
}

interface PlatformStats {
  totalUsers: number;
  totalTrades: number;
  totalProfit: number;
  totalLoss: number;
  totalBalance: number;
  activeUsers: number;
  avgTradesPerUser: number;
  topPerformers: UserData[];
  recentRegistrations: UserData[];
}

interface AnalyticsTabProps {
  users: UserData[];
  platformStats: PlatformStats | null;
}

export default function AnalyticsTab({ users, platformStats }: AnalyticsTabProps) {
  if (!platformStats) {
    return (
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 dark:border-gray-700/30 p-8">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const netPnL = platformStats.totalProfit - platformStats.totalLoss;
  const overallWinRate = platformStats.totalTrades > 0
    ? (users.reduce((sum, user) => sum + user.statistics.winTrades, 0) /
       (users.reduce((sum, user) => sum + user.statistics.winTrades + user.statistics.lossTrades, 0) || 1)) * 100
    : 0;

  const profitFactor = platformStats.totalLoss > 0
    ? platformStats.totalProfit / platformStats.totalLoss
    : platformStats.totalProfit > 0 ? 999 : 0;

  const profitableUsers = users.filter(user => user.statistics.netPnL > 0).length;
  const breakEvenUsers = users.filter(user => user.statistics.netPnL === 0).length;
  const losingUsers = users.filter(user => user.statistics.netPnL < 0).length;

  const veryActiveUsers = users.filter(user => user.statistics.totalTrades >= 50).length;
  const activeUsers = users.filter(user => user.statistics.totalTrades >= 10 && user.statistics.totalTrades < 50).length;
  const moderateUsers = users.filter(user => user.statistics.totalTrades >= 1 && user.statistics.totalTrades < 10).length;
  const inactiveUsers = users.filter(user => user.statistics.totalTrades === 0).length;

  return (
    <div className="space-y-8">
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8">
        <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          Platform Performance Analytics
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {overallWinRate.toFixed(1)}%
            </div>
            <div className="text-sm font-medium text-blue-800 dark:text-blue-300">Overall Win Rate</div>
          </div>

          <div className={`text-center p-6 rounded-xl border ${
            netPnL >= 0
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          }`}>
            <div className={`text-3xl font-bold mb-2 ${
              netPnL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {netPnL >= 0 ? '+' : ''}${netPnL.toFixed(2)}
            </div>
            <div className={`text-sm font-medium ${
              netPnL >= 0 ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'
            }`}>
              Platform Net P&L
            </div>
          </div>

          <div className="text-center p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {profitFactor === 999 ? '∞' : profitFactor.toFixed(2)}
            </div>
            <div className="text-sm font-medium text-purple-800 dark:text-purple-300">Profit Factor</div>
          </div>

          <div className="text-center p-6 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
              {platformStats.avgTradesPerUser.toFixed(1)}
            </div>
            <div className="text-sm font-medium text-orange-800 dark:text-orange-300">Avg Trades/User</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 dark:border-gray-700/30 p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            User Performance Distribution
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="font-medium text-green-800 dark:text-green-300">Profitable Users</span>
              </div>
              <div className="text-right">
                <div className="font-bold text-green-600 dark:text-green-400">{profitableUsers}</div>
                <div className="text-sm text-green-600 dark:text-green-400">
                  {users.length > 0 ? ((profitableUsers / users.length) * 100).toFixed(1) : 0}%
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
                <span className="font-medium text-gray-800 dark:text-gray-300">Break-even Users</span>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-600 dark:text-gray-400">{breakEvenUsers}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {users.length > 0 ? ((breakEvenUsers / users.length) * 100).toFixed(1) : 0}%
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="font-medium text-red-800 dark:text-red-300">Losing Users</span>
              </div>
              <div className="text-right">
                <div className="font-bold text-red-600 dark:text-red-400">{losingUsers}</div>
                <div className="text-sm text-red-600 dark:text-red-400">
                  {users.length > 0 ? ((losingUsers / users.length) * 100).toFixed(1) : 0}%
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 dark:border-gray-700/30 p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Trading Activity Distribution
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="font-medium text-blue-800 dark:text-blue-300">Very Active (50+ trades)</span>
              </div>
              <div className="text-right">
                <div className="font-bold text-blue-600 dark:text-blue-400">{veryActiveUsers}</div>
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  {users.length > 0 ? ((veryActiveUsers / users.length) * 100).toFixed(1) : 0}%
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-indigo-500 rounded-full"></div>
                <span className="font-medium text-indigo-800 dark:text-indigo-300">Active (10-49 trades)</span>
              </div>
              <div className="text-right">
                <div className="font-bold text-indigo-600 dark:text-indigo-400">{activeUsers}</div>
                <div className="text-sm text-indigo-600 dark:text-indigo-400">
                  {users.length > 0 ? ((activeUsers / users.length) * 100).toFixed(1) : 0}%
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                <span className="font-medium text-purple-800 dark:text-purple-300">Moderate (1-9 trades)</span>
              </div>
              <div className="text-right">
                <div className="font-bold text-purple-600 dark:text-purple-400">{moderateUsers}</div>
                <div className="text-sm text-purple-600 dark:text-purple-400">
                  {users.length > 0 ? ((moderateUsers / users.length) * 100).toFixed(1) : 0}%
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
                <span className="font-medium text-gray-800 dark:text-gray-300">Inactive (0 trades)</span>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-600 dark:text-gray-400">{inactiveUsers}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {users.length > 0 ? ((inactiveUsers / users.length) * 100).toFixed(1) : 0}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 dark:border-gray-700/30 p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Platform Health Metrics
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {((platformStats.activeUsers / platformStats.totalUsers) * 100).toFixed(1)}%
            </div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">User Engagement Rate</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {platformStats.activeUsers} of {platformStats.totalUsers} users have trades
            </div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              ${(platformStats.totalBalance / platformStats.totalUsers).toFixed(0)}
            </div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Avg Account Size</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Total: ${platformStats.totalBalance.toLocaleString()}
            </div>
          </div>

          <div className="text-center">
            <div className={`text-3xl font-bold mb-2 ${
              profitableUsers > losingUsers ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {profitableUsers > losingUsers ? '📈' : '📉'}
            </div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Platform Trend</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {profitableUsers > losingUsers ? 'More profitable users' : 'More losing users'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
