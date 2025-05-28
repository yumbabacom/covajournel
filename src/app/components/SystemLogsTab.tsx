'use client';

import { useState, useEffect } from 'react';

interface SystemLogsTabProps {
  users: any[];
}

export default function SystemLogsTab({ users }: SystemLogsTabProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    level: '',
    category: '',
    user: '',
    dateRange: 'today'
  });
  const [isLive, setIsLive] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage] = useState(50);

  // Generate sample logs
  useEffect(() => {
    const generateLogs = () => {
      const levels = ['INFO', 'WARNING', 'ERROR', 'DEBUG', 'CRITICAL'];
      const categories = ['AUTH', 'TRADE', 'SYSTEM', 'DATABASE', 'API', 'SECURITY'];
      const messages = [
        'User login successful',
        'Trade executed successfully',
        'Database connection established',
        'API rate limit exceeded',
        'Failed login attempt',
        'System backup completed',
        'Memory usage warning',
        'New user registration',
        'Trade validation failed',
        'Cache cleared successfully',
        'Email notification sent',
        'File upload completed',
        'Session expired',
        'Password reset requested',
        'Account balance updated'
      ];

      const sampleLogs = Array.from({ length: 500 }, (_, i) => ({
        id: i + 1,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        level: levels[Math.floor(Math.random() * levels.length)],
        category: categories[Math.floor(Math.random() * categories.length)],
        message: messages[Math.floor(Math.random() * messages.length)],
        user: users[Math.floor(Math.random() * users.length)]?.name || 'System',
        ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
        details: `Additional context for log entry ${i + 1}`
      }));

      setLogs(sampleLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
    };

    generateLogs();
  }, [users]);

  // Add new logs in real-time
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const levels = ['INFO', 'WARNING', 'ERROR', 'DEBUG'];
      const categories = ['AUTH', 'TRADE', 'SYSTEM', 'API'];
      const messages = [
        'Real-time user activity detected',
        'Trade signal processed',
        'System health check completed',
        'API request processed',
        'User session updated',
        'Cache refresh completed'
      ];

      const newLog = {
        id: Date.now(),
        timestamp: new Date(),
        level: levels[Math.floor(Math.random() * levels.length)],
        category: categories[Math.floor(Math.random() * categories.length)],
        message: messages[Math.floor(Math.random() * messages.length)],
        user: users[Math.floor(Math.random() * users.length)]?.name || 'System',
        ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
        details: `Real-time log entry generated at ${new Date().toISOString()}`
      };

      setLogs(prev => [newLog, ...prev.slice(0, 999)]);
    }, 5000);

    return () => clearInterval(interval);
  }, [isLive, users]);

  // Filter logs
  useEffect(() => {
    let filtered = [...logs];

    if (filters.level) {
      filtered = filtered.filter(log => log.level === filters.level);
    }

    if (filters.category) {
      filtered = filtered.filter(log => log.category === filters.category);
    }

    if (filters.user) {
      filtered = filtered.filter(log => 
        log.user.toLowerCase().includes(filters.user.toLowerCase())
      );
    }

    if (filters.dateRange) {
      const now = new Date();
      let startDate = new Date();

      switch (filters.dateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
      }

      filtered = filtered.filter(log => log.timestamp >= startDate);
    }

    setFilteredLogs(filtered);
    setCurrentPage(1);
  }, [logs, filters]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'ERROR':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'WARNING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'INFO':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'DEBUG':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'AUTH':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'TRADE':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'SYSTEM':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'DATABASE':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
      case 'API':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'SECURITY':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  // Pagination
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 dark:border-gray-700/30 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <span className="text-2xl mr-2">📝</span>
            System Logs ({filteredLogs.length})
          </h2>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Live Updates</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isLive}
                  onChange={(e) => setIsLive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
              {isLive && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>}
            </div>
            
            <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
              Export Logs
            </button>
            
            <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">
              Clear Logs
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Level</label>
            <select
              value={filters.level}
              onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Levels</option>
              <option value="CRITICAL">Critical</option>
              <option value="ERROR">Error</option>
              <option value="WARNING">Warning</option>
              <option value="INFO">Info</option>
              <option value="DEBUG">Debug</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Categories</option>
              <option value="AUTH">Authentication</option>
              <option value="TRADE">Trading</option>
              <option value="SYSTEM">System</option>
              <option value="DATABASE">Database</option>
              <option value="API">API</option>
              <option value="SECURITY">Security</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">User</label>
            <input
              type="text"
              value={filters.user}
              onChange={(e) => setFilters(prev => ({ ...prev, user: e.target.value }))}
              placeholder="Search user..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 dark:border-gray-700/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="text-left py-4 px-4 font-semibold text-gray-900 dark:text-white">Timestamp</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900 dark:text-white">Level</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900 dark:text-white">Category</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900 dark:text-white">Message</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900 dark:text-white">User</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900 dark:text-white">IP</th>
              </tr>
            </thead>
            <tbody>
              {currentLogs.map((log) => (
                <tr key={log.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-mono">
                    {log.timestamp.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(log.level)}`}>
                      {log.level}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(log.category)}`}>
                      {log.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white max-w-xs truncate">
                    {log.message}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {log.user}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400 font-mono">
                    {log.ip}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing {indexOfFirstLog + 1} to {Math.min(indexOfLastLog, filteredLogs.length)} of {filteredLogs.length} logs
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Log Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {['CRITICAL', 'ERROR', 'WARNING', 'INFO', 'DEBUG'].map((level) => {
          const count = filteredLogs.filter(log => log.level === level).length;
          return (
            <div key={level} className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 dark:border-gray-700/30 p-4 text-center">
              <div className={`text-2xl font-bold mb-1 ${
                level === 'CRITICAL' || level === 'ERROR' ? 'text-red-600 dark:text-red-400' :
                level === 'WARNING' ? 'text-yellow-600 dark:text-yellow-400' :
                level === 'INFO' ? 'text-blue-600 dark:text-blue-400' :
                'text-gray-600 dark:text-gray-400'
              }`}>
                {count}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{level}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
