'use client';

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

interface StrategyCardProps {
  strategy: Strategy;
  onView: (strategy: Strategy) => void;
  onEdit: (strategy: Strategy) => void;
  onDelete: (strategyId: string) => void;
  onClone: (strategy: Strategy) => void;
}

export default function StrategyCard({ strategy, onView, onEdit, onDelete, onClone }: StrategyCardProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'scalping':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'swing':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4" />
          </svg>
        );
      case 'position':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'day':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case 'algorithmic':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'scalping': return 'from-red-500 to-orange-600';
      case 'swing': return 'from-blue-500 to-indigo-600';
      case 'position': return 'from-green-500 to-emerald-600';
      case 'day': return 'from-yellow-500 to-orange-600';
      case 'algorithmic': return 'from-purple-500 to-pink-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Enhanced confirmation dialog
    const message = `Are you sure you want to delete "${strategy.name}"?\n\n` +
      `Type: ${strategy.type}\n` +
      `${strategy.performance ? `Trades: ${strategy.performance.totalTrades}\n` : ''}` +
      `This action cannot be undone.`;
    
    if (window.confirm(message)) {
      onDelete(strategy.id);
    }
  };

  return (
    <div className="group relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
      {/* Status Indicator */}
      <div className="absolute top-4 right-4 z-[60]">
        <div className={`w-3 h-3 rounded-full ${strategy.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
      </div>

      {/* Card Header */}
      <div className="relative p-6 pb-4">
        {/* Background Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${getTypeColor(strategy.type)} opacity-5`}></div>
        
        <div className="relative flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-14 h-14 bg-gradient-to-br ${getTypeColor(strategy.type)} rounded-xl flex items-center justify-center text-white shadow-lg`}>
              {getTypeIcon(strategy.type)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{strategy.name}</h3>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                {strategy.type}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="px-6 pb-6 space-y-4">
        {/* Description */}
        <p className="text-gray-600 text-sm line-clamp-2">{strategy.description}</p>

        {/* Symbols */}
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">Trading Pairs</p>
          <div className="flex flex-wrap gap-1">
            {(strategy.symbols || []).slice(0, 3).map((symbol) => (
              <span key={symbol} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                {symbol}
              </span>
            ))}
            {(strategy.symbols || []).length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                +{(strategy.symbols || []).length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Performance Metrics */}
        {strategy.performance && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-500 mb-1">Win Rate</p>
              <div className="flex items-center space-x-2">
                <p className={`text-lg font-bold ${strategy.performance.winRate >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                  {strategy.performance.winRate.toFixed(1)}%
                </p>
                <div className={`w-2 h-2 rounded-full ${strategy.performance.winRate >= 50 ? 'bg-green-500' : 'bg-red-500'}`}></div>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Total P&L</p>
              <p className={`text-lg font-bold ${strategy.performance.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${strategy.performance.profitLoss >= 0 ? '+' : ''}{strategy.performance.profitLoss.toFixed(0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Total Trades</p>
              <p className="text-lg font-bold text-gray-900">{strategy.performance.totalTrades}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Sharpe Ratio</p>
              <p className={`text-lg font-bold ${strategy.performance.sharpeRatio >= 1 ? 'text-green-600' : strategy.performance.sharpeRatio >= 0.5 ? 'text-yellow-600' : 'text-red-600'}`}>
                {strategy.performance.sharpeRatio.toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {/* Tags */}
        {(strategy.tags || []).length > 0 && (
          <div>
            <div className="flex flex-wrap gap-2">
              {(strategy.tags || []).slice(0, 2).map((tag) => (
                <span key={tag} className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  {tag}
                </span>
              ))}
              {(strategy.tags || []).length > 2 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                  +{(strategy.tags || []).length - 2}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Last Used */}
        <div className="text-xs text-gray-500">
          Updated {new Date(strategy.updatedAt).toLocaleDateString()}
        </div>
      </div>

      {/* Action Overlay - Appears on Hover */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center z-[60]">
        <div className="flex space-x-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log('👁️ View button clicked for strategy:', strategy.name);
              onView(strategy);
            }}
            className="p-3 bg-white text-gray-700 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-all shadow-lg"
            title="View Details"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log('✏️ Edit button clicked for strategy:', strategy.name);
              onEdit(strategy);
            }}
            className="p-3 bg-white text-gray-700 rounded-full hover:bg-green-50 hover:text-green-600 transition-all shadow-lg"
            title="Edit Strategy"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log('📋 Clone button clicked for strategy:', strategy.name);
              onClone(strategy);
            }}
            className="p-3 bg-white text-gray-700 rounded-full hover:bg-purple-50 hover:text-purple-600 transition-all shadow-lg"
            title="Clone Strategy"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log('🗑️ Delete button clicked for strategy:', strategy.name);
              handleDelete(e);
            }}
            className="p-3 bg-white text-gray-700 rounded-full hover:bg-red-50 hover:text-red-600 transition-all shadow-lg"
            title="Delete Strategy"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Click overlay for view action - only active when NOT hovering */}
      <div
        className="absolute inset-0 cursor-pointer z-10 group-hover:pointer-events-none"
        onClick={() => onView(strategy)}
      ></div>
    </div>
  );
} 