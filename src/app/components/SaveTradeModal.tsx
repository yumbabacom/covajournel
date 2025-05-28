'use client';

import { useState } from 'react';

interface TradeData {
  symbol: string;
  category: string;
  entryPrice: number;
  exitPrice: number;
  stopLoss: number;
  accountSize: number;
  riskPercentage: number;
  riskAmount: number;
  positionSize: number;
  profitPips: number;
  lossPips: number;
  profitDollars: number;
  lossDollars: number;
  riskRewardRatio: number;
  tradeDirection: string;
}

interface SaveTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  tradeData: TradeData;
  onSaveSuccess?: () => void;
}

export default function SaveTradeModal({ isOpen, onClose, tradeData, onSaveSuccess }: SaveTradeModalProps) {
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState('PLANNED');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to save trades');
        setIsLoading(false);
        return;
      }

      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

      const response = await fetch('/api/trades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...tradeData,
          notes,
          tags: tagsArray,
          status,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (onSaveSuccess) {
          onSaveSuccess();
        }
        onClose();
        // Reset form
        setNotes('');
        setTags('');
        setStatus('PLANNED');
      } else {
        setError(data.message || 'Failed to save trade');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Save Trade</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Add this calculation to your journal</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Trade Summary */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Trade Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Symbol:</span>
                <p className="font-semibold text-gray-900 dark:text-white">{tradeData.symbol}</p>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Direction:</span>
                <p className={`font-semibold ${tradeData.tradeDirection === 'LONG' ? 'text-green-600' : 'text-red-600'}`}>
                  {tradeData.tradeDirection}
                </p>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">R:R Ratio:</span>
                <p className="font-semibold text-gray-900 dark:text-white">1:{tradeData.riskRewardRatio.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Entry:</span>
                <p className="font-semibold text-gray-900 dark:text-white">{tradeData.entryPrice}</p>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Exit:</span>
                <p className="font-semibold text-gray-900 dark:text-white">{tradeData.exitPrice}</p>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Stop Loss:</span>
                <p className="font-semibold text-gray-900 dark:text-white">{tradeData.stopLoss}</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Trade Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
              >
                <option value="PLANNED">Planned</option>
                <option value="ACTIVE">Active</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                placeholder="Add your trade notes, analysis, or strategy..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                placeholder="e.g., scalping, breakout, support-resistance"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-medium transition-all duration-200 shadow-lg disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  'Save Trade'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
