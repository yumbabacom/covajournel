'use client';

import { useState } from 'react';

interface Trade {
  id: string;
  symbol: string;
  status: string;
  [key: string]: any;
}

interface TradeStatusManagerProps {
  trade: Trade;
  onStatusUpdate: (tradeId: string, newStatus: string) => void;
  onTradeUpdate: (tradeId: string, updateData: any) => void;
  onTradeDelete: (tradeId: string) => void;
  onOpenUpdateModal?: (trade: Trade) => void;
}

export default function TradeStatusManager({
  trade,
  onStatusUpdate,
  onTradeUpdate,
  onTradeDelete,
  onOpenUpdateModal
}: TradeStatusManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    notes: trade.notes || '',
    tags: trade.tags?.join(', ') || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'right' | 'left'>('right');

  const statusOptions = [
    { value: 'PLANNED', label: '📋 Planned', color: 'bg-blue-500' },
    { value: 'ACTIVE', label: '⚡ Active', color: 'bg-yellow-500' },
    { value: 'CLOSED', label: '✅ Closed', color: 'bg-green-500' },
  ];

  const handleStatusChange = async (newStatus: string) => {
    setIsLoading(true);
    try {
      await onStatusUpdate(trade.id, newStatus);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async () => {
    setIsLoading(true);
    try {
      const updateData = {
        notes: editData.notes,
        tags: editData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
      };
      await onTradeUpdate(trade.id, updateData);
      setIsEditing(false);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to update trade:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this trade? This action cannot be undone.')) {
      setIsLoading(true);
      try {
        await onTradeDelete(trade.id);
        setIsOpen(false);
      } catch (error) {
        console.error('Failed to delete trade:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const currentStatus = statusOptions.find(s => s.value === trade.status);

  return (
    <div className="relative inline-block">
      {/* Status Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow-md min-w-0"
      >
        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${currentStatus?.color || 'bg-gray-400'}`}></div>
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
          {currentStatus?.label || trade.status}
        </span>
        <svg
          className={`w-3 h-3 text-gray-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`absolute top-full mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-2xl z-[9999] max-h-96 overflow-y-auto ${
          dropdownPosition === 'right' ? 'right-0' : 'left-0'
        }`}>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Manage Trade: {trade.symbol}
            </h3>

            {!isEditing ? (
              <>
                {/* Status Options */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Change Status
                  </label>
                  <div className="space-y-2">
                    {statusOptions.map((status) => (
                      <button
                        key={status.value}
                        onClick={() => handleStatusChange(status.value)}
                        disabled={isLoading || trade.status === status.value}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                          trade.status === status.value
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700 border border-transparent'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {status.label}
                        </span>
                        {trade.status === status.value && (
                          <svg className="w-4 h-4 text-emerald-600 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  {/* Update Trade Button */}
                  {onOpenUpdateModal && (
                    <button
                      onClick={() => {
                        onOpenUpdateModal(trade);
                        setIsOpen(false);
                      }}
                      className="w-full px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-lg text-sm font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
                    >
                      📝 Update Trade
                    </button>
                  )}

                  <div className="flex space-x-2">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors duration-200"
                    >
                      Edit Notes
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={isLoading}
                      className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Edit Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={editData.notes}
                      onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 dark:bg-gray-700 dark:text-white text-sm"
                      placeholder="Add trade notes..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tags
                    </label>
                    <input
                      type="text"
                      value={editData.tags}
                      onChange={(e) => setEditData(prev => ({ ...prev, tags: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 dark:bg-gray-700 dark:text-white text-sm"
                      placeholder="tag1, tag2, tag3"
                    />
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={handleEdit}
                      disabled={isLoading}
                      className="flex-1 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditData({
                          notes: trade.notes || '',
                          tags: trade.tags?.join(', ') || '',
                        });
                      }}
                      className="px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9998]"
          onClick={() => {
            setIsOpen(false);
            setIsEditing(false);
          }}
        />
      )}
    </div>
  );
}
