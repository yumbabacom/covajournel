'use client';

import { useState } from 'react';

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

interface StrategyDetailModalProps {
  strategy: Strategy;
  onClose: () => void;
  isOpen: boolean;
  onClone?: (strategy: Strategy) => void;
  onEdit?: (strategy: Strategy) => void;
}

export default function StrategyDetailModal({ strategy, onClose, isOpen, onClone, onEdit }: StrategyDetailModalProps) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'scalping':
        return (
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'swing':
        return (
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4" />
          </svg>
        );
      case 'position':
        return (
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'day':
        return (
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case 'algorithmic':
        return (
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
        );
      default:
        return (
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl border border-gray-200 w-full max-w-6xl max-h-[95vh] overflow-hidden shadow-2xl transform transition-all duration-300 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br ${getTypeColor(strategy.type)} shadow-lg`}>
                {getTypeIcon(strategy.type)}
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">{strategy.name}</h2>
                <p className="text-gray-600 capitalize text-lg">{strategy.type} Strategy</p>
                <div className="flex items-center space-x-2 mt-2">
                  {strategy.isActive && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-lg border border-green-200 font-medium">
                      <svg className="w-3 h-3 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <circle cx="10" cy="10" r="4"/>
                      </svg>
                      Active
                    </span>
                  )}
                  {strategy.isPublic && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-lg border border-blue-200 font-medium">
                      <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Public
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-gray-100 rounded-xl transition-colors group"
            >
              <svg className="w-6 h-6 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 px-6 pt-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          {[
            { 
              id: 'overview', 
              name: 'Overview', 
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              )
            },
            { 
              id: 'performance', 
              name: 'Performance', 
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              )
            },
            { 
              id: 'rules', 
              name: 'Rules & Setup', 
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )
            },
            { 
              id: 'backtest', 
              name: 'Backtest', 
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              )
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-semibold transition-all duration-200 border-b-2 rounded-t-lg flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'text-blue-600 border-blue-600 bg-white'
                  : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.icon}
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Content - Flexible scrollable area */}
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Description */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Description
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-lg">{strategy.description}</p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                    <p className="text-sm text-green-700 mb-2 font-medium">Win Rate</p>
                    <p className="text-2xl font-bold text-green-600">{strategy.performance?.winRate?.toFixed(1) || 0}%</p>
                    <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${strategy.performance?.winRate || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-sm text-blue-700 mb-2 font-medium">Total P&L</p>
                    <p className={`text-2xl font-bold ${(strategy.performance?.profitLoss || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${(strategy.performance?.profitLoss || 0) >= 0 ? '+' : ''}${(strategy.performance?.profitLoss || 0).toFixed(0)}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
                    <p className="text-sm text-purple-700 mb-2 font-medium">Total Trades</p>
                    <p className="text-2xl font-bold text-gray-900">{strategy.performance?.totalTrades || 0}</p>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4">
                    <p className="text-sm text-yellow-700 mb-2 font-medium">Sharpe Ratio</p>
                    <p className={`text-2xl font-bold ${(strategy.performance?.sharpeRatio || 0) >= 1 ? 'text-green-600' : (strategy.performance?.sharpeRatio || 0) >= 0.5 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {(strategy.performance?.sharpeRatio || 0).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Trading Pairs */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    Trading Pairs
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {strategy.symbols.map((symbol, index) => (
                      <span key={index} className="px-4 py-2 bg-blue-100 text-blue-700 border border-blue-200 rounded-xl font-medium hover:bg-blue-200 transition-colors">
                        {symbol}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Risk Management */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Risk Management
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Max Risk/Trade</p>
                      <p className="text-lg font-bold text-gray-900">{strategy.riskManagement.maxRiskPerTrade}%</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Stop Loss</p>
                      <p className="text-lg font-bold text-red-600">{strategy.riskManagement.stopLoss}%</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Take Profit</p>
                      <p className="text-lg font-bold text-green-600">{strategy.riskManagement.takeProfit}%</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Max Drawdown</p>
                      <p className="text-lg font-bold text-orange-600">{strategy.riskManagement.maxDrawdown}%</p>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {strategy.tags.map((tag, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm border border-gray-300 hover:bg-gray-300 transition-colors">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'performance' && (
              <div className="space-y-6">
                {/* Performance Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
                    <h4 className="text-lg font-bold text-green-700 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      Profitability
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Total P&L:</span>
                        <span className={`font-bold ${(strategy.performance?.profitLoss || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${(strategy.performance?.profitLoss || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Avg Return:</span>
                        <span className="text-green-600 font-bold">{(strategy.performance?.avgReturn || 0).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Best Trade:</span>
                        <span className="text-green-600 font-bold">${(strategy.performance?.bestTrade || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Worst Trade:</span>
                        <span className="text-red-600 font-bold">${(strategy.performance?.worstTrade || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-6">
                    <h4 className="text-lg font-bold text-blue-700 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Trading Activity
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Total Trades:</span>
                        <span className="text-blue-600 font-bold">{strategy.performance?.totalTrades || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Win Rate:</span>
                        <span className="text-green-600 font-bold">{(strategy.performance?.winRate || 0).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Sharpe Ratio:</span>
                        <span className="text-purple-600 font-bold">{(strategy.performance?.sharpeRatio || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-6">
                    <h4 className="text-lg font-bold text-orange-700 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Risk Metrics
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Max Drawdown:</span>
                        <span className="text-red-600 font-bold">{(strategy.performance?.maxDrawdown || 0).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Risk/Trade:</span>
                        <span className="text-orange-600 font-bold">{strategy.riskManagement.maxRiskPerTrade}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'rules' && (
              <div className="space-y-6">
                {/* Trading Rules */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    Trading Rules
                  </h3>
                  <div className="space-y-3">
                    {strategy.rules.map((rule, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                        <span className="text-blue-600 font-bold text-sm mt-1">{index + 1}.</span>
                        <span className="text-gray-700">{rule}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risk Management Details */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Risk Management Settings
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <h4 className="text-sm font-medium text-gray-600 mb-2">Maximum Risk Per Trade</h4>
                        <p className="text-2xl font-bold text-gray-900">{strategy.riskManagement.maxRiskPerTrade}%</p>
                        <p className="text-sm text-gray-500 mt-1">of account balance</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <h4 className="text-sm font-medium text-gray-600 mb-2">Stop Loss</h4>
                        <p className="text-2xl font-bold text-red-600">{strategy.riskManagement.stopLoss}%</p>
                        <p className="text-sm text-gray-500 mt-1">maximum loss per trade</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <h4 className="text-sm font-medium text-gray-600 mb-2">Take Profit</h4>
                        <p className="text-2xl font-bold text-green-600">{strategy.riskManagement.takeProfit}%</p>
                        <p className="text-sm text-gray-500 mt-1">target profit per trade</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <h4 className="text-sm font-medium text-gray-600 mb-2">Maximum Drawdown</h4>
                        <p className="text-2xl font-bold text-orange-600">{strategy.riskManagement.maxDrawdown}%</p>
                        <p className="text-sm text-gray-500 mt-1">portfolio protection</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'backtest' && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Backtesting Coming Soon</h3>
                  <p className="text-gray-600">Historical performance analysis and simulation tools will be available in the next update.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Fixed at bottom, outside scrollable area */}
        <div className="px-6 py-4 border-t border-gray-200 bg-white flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Created: {new Date(strategy.createdAt).toLocaleDateString()} • 
              Last updated: {new Date(strategy.updatedAt).toLocaleDateString()}
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={() => {
                  onClone?.(strategy);
                  onClose();
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Clone Strategy</span>
              </button>
              <button 
                onClick={() => {
                  onEdit?.(strategy);
                  onClose();
                }}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit Strategy</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
