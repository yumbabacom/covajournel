'use client';

import { useState } from 'react';

interface ReportsTabProps {
  users: any[];
  trades: any[];
}

export default function ReportsTab({ users, trades }: ReportsTabProps) {
  const [selectedReport, setSelectedReport] = useState('');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReports, setGeneratedReports] = useState<any[]>([
    {
      id: 1,
      name: 'Monthly Performance Report',
      type: 'performance',
      date: '2024-01-15',
      size: '2.4 MB',
      status: 'completed'
    },
    {
      id: 2,
      name: 'User Activity Analysis',
      type: 'activity',
      date: '2024-01-14',
      size: '1.8 MB',
      status: 'completed'
    },
    {
      id: 3,
      name: 'Risk Assessment Report',
      type: 'risk',
      date: '2024-01-13',
      size: '3.1 MB',
      status: 'completed'
    }
  ]);

  const reportTypes = [
    {
      id: 'performance',
      name: 'Performance Report',
      description: 'Comprehensive trading performance analysis',
      icon: '📈',
      estimatedTime: '2-3 minutes'
    },
    {
      id: 'user-activity',
      name: 'User Activity Report',
      description: 'User engagement and activity patterns',
      icon: '👥',
      estimatedTime: '1-2 minutes'
    },
    {
      id: 'financial',
      name: 'Financial Summary',
      description: 'Platform financial overview and metrics',
      icon: '💰',
      estimatedTime: '2-4 minutes'
    },
    {
      id: 'risk-analysis',
      name: 'Risk Analysis',
      description: 'Risk management and exposure analysis',
      icon: '⚠️',
      estimatedTime: '3-5 minutes'
    },
    {
      id: 'compliance',
      name: 'Compliance Report',
      description: 'Regulatory compliance and audit trail',
      icon: '📋',
      estimatedTime: '5-7 minutes'
    },
    {
      id: 'custom',
      name: 'Custom Report',
      description: 'Build your own custom report',
      icon: '🔧',
      estimatedTime: 'Variable'
    }
  ];

  const handleGenerateReport = async () => {
    if (!selectedReport) return;
    
    setIsGenerating(true);
    
    // Simulate report generation
    setTimeout(() => {
      const newReport = {
        id: Date.now(),
        name: reportTypes.find(r => r.id === selectedReport)?.name || 'Custom Report',
        type: selectedReport,
        date: new Date().toISOString().split('T')[0],
        size: `${(Math.random() * 3 + 1).toFixed(1)} MB`,
        status: 'completed'
      };
      
      setGeneratedReports(prev => [newReport, ...prev]);
      setIsGenerating(false);
      setSelectedReport('');
    }, 3000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'processing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-8">
      {/* Report Generation */}
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 dark:border-gray-700/30 p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <span className="text-2xl mr-2">📄</span>
          Generate New Report
        </h2>

        {/* Report Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {reportTypes.map((report) => (
            <div
              key={report.id}
              onClick={() => setSelectedReport(report.id)}
              className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                selectedReport === report.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 bg-gray-50 dark:bg-gray-700/50'
              }`}
            >
              <div className="text-3xl mb-3">{report.icon}</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">{report.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{report.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-500">
                  Est. {report.estimatedTime}
                </span>
                {selectedReport === report.id && (
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Date Range Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerateReport}
          disabled={!selectedReport || isGenerating}
          className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
            !selectedReport || isGenerating
              ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg'
          }`}
        >
          {isGenerating ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Generating Report...</span>
            </div>
          ) : (
            'Generate Report'
          )}
        </button>
      </div>

      {/* Generated Reports */}
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 dark:border-gray-700/30 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <span className="text-2xl mr-2">📚</span>
            Generated Reports
          </h2>
          <div className="flex items-center space-x-2">
            <button className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors">
              Export All
            </button>
            <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">
              Clear All
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="text-left py-4 px-4 font-semibold text-gray-900 dark:text-white">Report Name</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900 dark:text-white">Type</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900 dark:text-white">Date Generated</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900 dark:text-white">Size</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900 dark:text-white">Status</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {generatedReports.map((report) => (
                <tr key={report.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">
                        {reportTypes.find(r => r.id === report.type)?.icon || '📄'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{report.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">ID: {report.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium capitalize">
                      {report.type.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-900 dark:text-white">{report.date}</td>
                  <td className="py-4 px-4 text-gray-900 dark:text-white">{report.size}</td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <button className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors">
                        Download
                      </button>
                      <button className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition-colors">
                        View
                      </button>
                      <button className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-colors">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 dark:border-gray-700/30 p-6 text-center">
          <div className="text-3xl mb-2">📊</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">{generatedReports.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Reports</div>
        </div>

        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 dark:border-gray-700/30 p-6 text-center">
          <div className="text-3xl mb-2">💾</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
            {generatedReports.reduce((sum, report) => sum + parseFloat(report.size), 0).toFixed(1)} MB
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Size</div>
        </div>

        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 dark:border-gray-700/30 p-6 text-center">
          <div className="text-3xl mb-2">⏱️</div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
            {generatedReports.filter(r => r.date === new Date().toISOString().split('T')[0]).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Generated Today</div>
        </div>
      </div>
    </div>
  );
}
