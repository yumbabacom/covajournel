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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {trade.symbol.split('/')[0]}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {trade.symbol}
              </h2>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(trade.status)}`}>
                  {trade.status}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDirectionColor(trade.tradeDirection)}`}>
                  {trade.tradeDirection}
                </span>
                {trade.user && (
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-semibold">
                    {trade.user.name}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full flex items-center justify-center transition-colors duration-200"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Side - Key Trade Info */}
            <div className="space-y-6">
              {/* Price Levels */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Entry</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {trade.entryPrice}
                  </p>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <p className="text-xs text-green-600 dark:text-green-400 mb-1">Target</p>
                  <p className="text-lg font-bold text-green-700 dark:text-green-300">
                    {trade.exitPrice || 'N/A'}
                  </p>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                  <p className="text-xs text-red-600 dark:text-red-400 mb-1">Stop Loss</p>
                  <p className="text-lg font-bold text-red-700 dark:text-red-300">
                    {trade.stopLoss}
                  </p>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-center">
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-1">Net P&L</p>
                  <p className={`text-2xl font-bold ${getPnLColor(trade)}`}>
                    ${netPnL >= 0 ? '+' : ''}{netPnL.toFixed(2)}
                  </p>
                </div>
                {trade.riskRewardRatio && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center">
                    <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Risk:Reward</p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                      1:{trade.riskRewardRatio.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>

              {/* Position Info */}
              <div className="grid grid-cols-3 gap-4">
                {trade.accountSize && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Account Size</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      ${trade.accountSize.toLocaleString()}
                    </p>
                  </div>
                )}
                {trade.riskPercentage && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Risk %</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {trade.riskPercentage}%
                    </p>
                  </div>
                )}
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs text-blue-600 dark:text-blue-400">Lot Size</p>
                  <p className="font-semibold text-blue-700 dark:text-blue-300">
                    {trade.lotSize.toFixed(4)}
                  </p>
                  <p className="text-xs text-blue-500 dark:text-blue-400">
                    {trade.symbol.includes('/') ? 'Lots' : 'Units'}
                  </p>
                </div>
              </div>

              {/* Account Info */}
              {trade.account && (
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                  <h3 className="text-sm font-semibold text-indigo-800 dark:text-indigo-300 mb-2">Account</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-900 dark:text-white font-medium">{trade.account.name}</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                      ${trade.account.currentBalance.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side - Images & Notes */}
            <div className="space-y-6">
              {/* Trade Images */}
              {allImages.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Screenshots ({allImages.length})
                  </h3>
                  <div className="space-y-3">
                    {allImages.map((image, index) => (
                      <div
                        key={index}
                        className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer"
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
                          <div className={`absolute top-2 left-2 px-2 py-1 rounded-md text-xs font-semibold ${
                            image.type === 'entry'
                              ? 'bg-green-500 text-white'
                              : image.type === 'exit'
                              ? 'bg-red-500 text-white'
                              : 'bg-blue-500 text-white'
                          }`}>
                            {image.type === 'entry' ? '📈' : image.type === 'exit' ? '📉' : '📊'}
                          </div>

                          {/* Zoom Icon */}
                          <div className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                        </div>

                        <div className="p-3">
                          <p className="font-medium text-gray-900 dark:text-white text-sm">
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
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Notes</h3>
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200/50 dark:border-amber-700/50">
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                      {trade.notes}
                    </p>
                  </div>
                </div>
              )}

              {/* Tags */}
              {trade.tags && trade.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {trade.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Trade Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Trade Info</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Created</span>
                    <span className="text-gray-900 dark:text-white">
                      {new Date(trade.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {trade.category && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Category</span>
                      <span className="text-gray-900 dark:text-white">{trade.category}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Trade ID</span>
                    <span className="text-gray-900 dark:text-white font-mono text-xs">{trade.id}</span>
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
