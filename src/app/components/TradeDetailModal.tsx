'use client';

import { useState } from 'react';

interface Trade {
  id: string;
  symbol: string;
  status: string;
  entryPrice: number;
  exitPrice?: number;
  stopLoss: number;
  profitDollars?: number;
  lossDollars?: number;
  createdAt: string;
  tradeDirection: string;
  lotSize: number;
  accountSize?: number;
  riskPercentage?: number;
  riskAmount?: number;
  profitPips?: number;
  lossPips?: number;
  riskRewardRatio?: number;
  category?: string;
  notes?: string;
  tags?: string[];
  entryImage?: string;
  exitImage?: string;
  images?: string[];
  strategyId?: string;
  strategy?: {
    id: string;
    name: string;
    marketType: string;
    timeframe: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
    isAdmin: boolean;
  };
  account?: {
    id: string;
    name: string;
    currentBalance: number;
  };
}

interface TradeDetailModalProps {
  trade: Trade;
  onClose: () => void;
}

export default function TradeDetailModal({ trade, onClose }: TradeDetailModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'WIN':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'LOSS':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'OPEN':
      case 'ACTIVE':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'PLANNING':
      case 'PLANNED':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getDirectionColor = (direction: string) => {
    return direction === 'LONG'
      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
  };

  const getPnLColor = (trade: Trade) => {
    const profit = trade.profitDollars || 0;
    const loss = trade.lossDollars || 0;
    const pnl = profit - loss;
    return pnl >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  };

  // Collect all images
  const allImages = [
    ...(trade.entryImage ? [{ url: trade.entryImage, type: 'entry', label: 'Entry Screenshot' }] : []),
    ...(trade.exitImage ? [{ url: trade.exitImage, type: 'exit', label: 'Exit Screenshot' }] : []),
    ...(trade.images || []).map((url, index) => ({ url, type: 'other' as const, label: `Additional Image ${index + 1}` }))
  ];

  const profit = trade.profitDollars || 0;
  const loss = trade.lossDollars || 0;
  const netPnL = profit - loss;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-6xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">
                  {trade.symbol.split('/')[0].charAt(0)}
                </span>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  {trade.symbol}
                </h2>
                <div className="flex items-center space-x-3 mt-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    trade.status === 'WIN' ? 'bg-green-100 text-green-800' :
                    trade.status === 'LOSS' ? 'bg-red-100 text-red-800' :
                    trade.status === 'OPEN' || trade.status === 'ACTIVE' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {trade.status}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    trade.tradeDirection === 'LONG' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {trade.tradeDirection}
                  </span>
                  {trade.category && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                      {trade.category}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white hover:bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center transition-colors duration-200 shadow-sm"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 max-h-[calc(95vh-180px)] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Key Trade Info */}
            <div className="space-y-6">
              {/* Price Levels */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Price Levels
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-xs text-gray-500 mb-1 font-medium">Entry Price</p>
                    <p className="text-lg font-bold text-gray-900">
                      {trade.entryPrice}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                      </svg>
                    </div>
                    <p className="text-xs text-green-600 mb-1 font-medium">Target Price</p>
                    <p className="text-lg font-bold text-green-700">
                      {trade.exitPrice || 'N/A'}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-xl border border-red-200">
                    <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                      </svg>
                    </div>
                    <p className="text-xs text-red-600 mb-1 font-medium">Stop Loss</p>
                    <p className="text-lg font-bold text-red-700">
                      {trade.stopLoss}
                    </p>
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  Performance Metrics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 text-center">
                    <p className="text-sm text-emerald-600 mb-2 font-medium">Net P&L</p>
                    <p className={`text-3xl font-bold ${netPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${netPnL >= 0 ? '+' : ''}{netPnL.toFixed(2)}
                    </p>
                  </div>
                  {trade.riskRewardRatio && (
                    <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 text-center">
                      <p className="text-sm text-blue-600 mb-2 font-medium">Risk:Reward</p>
                      <p className="text-3xl font-bold text-blue-700">
                        1:{trade.riskRewardRatio.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Position Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Position Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1 font-medium">Lot Size</p>
                    <p className="text-lg font-bold text-gray-900">
                      {trade.lotSize.toFixed(4)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {trade.symbol.includes('/') ? 'Lots' : 'Units'}
                    </p>
                  </div>
                  {trade.riskPercentage && (
                    <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                      <p className="text-xs text-orange-600 mb-1 font-medium">Risk Percentage</p>
                      <p className="text-lg font-bold text-orange-700">
                        {trade.riskPercentage}%
                      </p>
                      <p className="text-xs text-orange-500">of account</p>
                    </div>
                  )}
                  {trade.accountSize && (
                    <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                      <p className="text-xs text-purple-600 mb-1 font-medium">Account Size</p>
                      <p className="text-lg font-bold text-purple-700">
                        ${trade.accountSize.toLocaleString()}
                      </p>
                    </div>
                  )}
                  {trade.riskAmount && (
                    <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                      <p className="text-xs text-yellow-600 mb-1 font-medium">Risk Amount</p>
                      <p className="text-lg font-bold text-yellow-700">
                        ${trade.riskAmount.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Account Info */}
              {trade.account && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Account Information
                  </h3>
                  <div className="p-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-indigo-600 font-medium">Account Name</p>
                        <p className="text-lg font-bold text-gray-900">{trade.account.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-indigo-600 font-medium">Current Balance</p>
                        <p className="text-lg font-bold text-indigo-700">
                          ${trade.account.currentBalance.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Strategy Information */}
              {trade.strategy && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    Trading Strategy
                  </h3>
                  <div className="p-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 8l2 2 4-4" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-900">{trade.strategy.name}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-md text-xs font-medium">
                            {trade.strategy.marketType}
                          </span>
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-medium">
                            {trade.strategy.timeframe}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <button
                        onClick={() => {
                          // Navigate to strategy details - you can implement this
                          window.open(`/strategies?highlight=${trade.strategy?.id}`, '_blank');
                        }}
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Strategy Details
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side - Images & Notes */}
            <div className="space-y-6">
              {/* Trade Images */}
              {allImages.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Trade Screenshots ({allImages.length})
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {allImages.map((image, index) => (
                      <div
                        key={index}
                        className="group relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer"
                        onClick={() => setSelectedImageIndex(index)}
                      >
                        <div className="aspect-video relative overflow-hidden">
                          <img
                            src={image.url}
                            alt={image.label}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>

                          {/* Image Type Badge */}
                          <div className={`absolute top-3 left-3 px-3 py-1 rounded-lg text-xs font-semibold shadow-lg ${
                            image.type === 'entry'
                              ? 'bg-green-500 text-white'
                              : image.type === 'exit'
                              ? 'bg-red-500 text-white'
                              : 'bg-blue-500 text-white'
                          }`}>
                            {image.type === 'entry' ? '📈 Entry' : image.type === 'exit' ? '📉 Exit' : '📊 Analysis'}
                          </div>

                          {/* Zoom Icon */}
                          <div className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                        </div>

                        <div className="p-4">
                          <p className="font-medium text-gray-900 text-sm">
                            {image.label}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {trade.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Trade Notes
                  </h3>
                  <div className="p-5 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border border-amber-200">
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                      {trade.notes}
                    </p>
                  </div>
                </div>
              )}

              {/* Tags */}
              {trade.tags && trade.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {trade.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-medium border border-purple-200"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Trade Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Trade Information
                </h3>
                <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 font-medium">Created Date</span>
                      <span className="text-sm text-gray-900 font-semibold">
                        {new Date(trade.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    {trade.category && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 font-medium">Category</span>
                        <span className="text-sm text-gray-900 font-semibold">{trade.category}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 font-medium">Trade ID</span>
                      <span className="text-xs text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                        {trade.id.slice(0, 8)}...
                      </span>
                    </div>
                    {trade.user && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 font-medium">Trader</span>
                        <span className="text-sm text-gray-900 font-semibold">{trade.user.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Image Lightbox Modal */}
        {selectedImageIndex !== null && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
            <div className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center">
              {/* Close Button */}
              <button
                onClick={() => setSelectedImageIndex(null)}
                className="absolute top-4 right-4 z-10 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Navigation Buttons */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIndex(selectedImageIndex > 0 ? selectedImageIndex - 1 : allImages.length - 1)}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setSelectedImageIndex(selectedImageIndex < allImages.length - 1 ? selectedImageIndex + 1 : 0)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* Image */}
              <div className="relative max-w-full max-h-full">
                <img
                  src={allImages[selectedImageIndex].url}
                  alt={allImages[selectedImageIndex].label}
                  className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
                />

                {/* Image Info */}
                <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-semibold text-lg">
                        {allImages[selectedImageIndex].label}
                      </h3>
                      <p className="text-gray-300 text-sm">
                        {selectedImageIndex + 1} of {allImages.length}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      allImages[selectedImageIndex].type === 'entry'
                        ? 'bg-green-500 text-white'
                        : allImages[selectedImageIndex].type === 'exit'
                        ? 'bg-red-500 text-white'
                        : 'bg-blue-500 text-white'
                    }`}>
                      {allImages[selectedImageIndex].type === 'entry' ? '📈 Entry' : allImages[selectedImageIndex].type === 'exit' ? '📉 Exit' : '📊 Analysis'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
