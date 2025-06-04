'use client';

import { useState, useEffect } from 'react';

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

interface StrategyEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (strategy: Strategy) => Promise<void>;
  strategy?: Strategy | null;
}

export default function StrategyEditModal({ isOpen, onClose, onSave, strategy }: StrategyEditModalProps) {
  console.log('StrategyEditModal rendered with:', { isOpen, strategy: strategy?.name });
  console.log('Modal should render:', isOpen);
  
  const [formData, setFormData] = useState<Partial<Strategy>>({
    name: '',
    description: '',
    type: 'scalping',
    symbols: [],
    rules: [''],
    riskManagement: {
      maxRiskPerTrade: 2,
      stopLoss: 1,
      takeProfit: 2,
      maxDrawdown: 10,
    },
    isActive: true,
    isPublic: false,
    tags: [],
  });
  const [isLoading, setSaveLoading] = useState(false);
  const [symbolInput, setSymbolInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (strategy) {
      setFormData(strategy);
    } else {
      setFormData({
        name: '',
        description: '',
        type: 'scalping',
        symbols: [],
        rules: [''],
        riskManagement: {
          maxRiskPerTrade: 2,
          stopLoss: 1,
          takeProfit: 2,
          maxDrawdown: 10,
        },
        isActive: true,
        isPublic: false,
        tags: [],
      });
    }
  }, [strategy]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);

    try {
      const strategyData = {
        ...formData,
        id: strategy?.id || `strategy-${Date.now()}`,
        createdAt: strategy?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        rules: formData.rules?.filter(rule => rule.trim() !== '') || [],
        type: formData.type || 'scalping',
        symbols: formData.symbols || [],
        tags: formData.tags || [],
        riskManagement: formData.riskManagement || {
          maxRiskPerTrade: 2,
          stopLoss: 1,
          takeProfit: 2,
          maxDrawdown: 10
        },
        isActive: formData.isActive !== undefined ? formData.isActive : true,
        isPublic: formData.isPublic !== undefined ? formData.isPublic : false,
      } as Strategy;

      await onSave(strategyData);
      onClose();
    } catch (error) {
      console.error('Error saving strategy:', error);
    } finally {
      setSaveLoading(false);
    }
  };

  const addSymbol = () => {
    if (symbolInput.trim() && !formData.symbols?.includes(symbolInput.trim())) {
      setFormData(prev => ({
        ...prev,
        symbols: [...(prev.symbols || []), symbolInput.trim().toUpperCase()]
      }));
      setSymbolInput('');
    }
  };

  const removeSymbol = (symbol: string) => {
    setFormData(prev => ({
      ...prev,
      symbols: prev.symbols?.filter(s => s !== symbol) || []
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag) || []
    }));
  };

  const addRule = () => {
    setFormData(prev => ({
      ...prev,
      rules: [...(prev.rules || []), '']
    }));
  };

  const updateRule = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules?.map((rule, i) => i === index ? value : rule) || []
    }));
  };

  const removeRule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules?.filter((_, i) => i !== index) || []
    }));
  };

  if (!isOpen) return null;

  console.log('Modal is rendering with isOpen:', isOpen);

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      {/* Background overlay */}
      <div 
        className="absolute inset-0 bg-gray-900 bg-opacity-75" 
        onClick={onClose}
      ></div>

      {/* Modal content */}
      <div className="relative w-full max-w-4xl min-h-[600px] max-h-[90vh] bg-white shadow-2xl rounded-2xl overflow-hidden z-10 border-4 border-blue-500">
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-white">
              {strategy ? 'Edit Strategy' : 'Create New Strategy'}
            </h3>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Strategy Name</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter strategy name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Strategy Type</label>
                <select
                  value={formData.type || 'scalping'}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Strategy['type'] }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="scalping">Scalping</option>
                  <option value="swing">Swing Trading</option>
                  <option value="position">Position Trading</option>
                  <option value="day">Day Trading</option>
                  <option value="algorithmic">Algorithmic</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your trading strategy..."
                required
              />
            </div>

            {/* Trading Symbols */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trading Symbols</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={symbolInput}
                  onChange={(e) => setSymbolInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSymbol())}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add trading symbol (e.g., EURUSD)"
                />
                <button
                  type="button"
                  onClick={addSymbol}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.symbols?.map((symbol) => (
                  <span key={symbol} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2">
                    {symbol}
                    <button
                      type="button"
                      onClick={() => removeSymbol(symbol)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Trading Rules */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trading Rules</label>
              <div className="space-y-3">
                {formData.rules?.map((rule, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={rule}
                      onChange={(e) => updateRule(index, e.target.value)}
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={`Rule ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeRule(index)}
                      className="px-3 py-2 text-red-600 hover:text-red-800 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addRule}
                  className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
                >
                  + Add Rule
                </button>
              </div>
            </div>

            {/* Risk Management */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Risk Management</label>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Max Risk Per Trade (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.riskManagement?.maxRiskPerTrade || 2}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      riskManagement: {
                        ...prev.riskManagement!,
                        maxRiskPerTrade: parseFloat(e.target.value)
                      }
                    }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Stop Loss (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.riskManagement?.stopLoss || 1}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      riskManagement: {
                        ...prev.riskManagement!,
                        stopLoss: parseFloat(e.target.value)
                      }
                    }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Take Profit (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.riskManagement?.takeProfit || 2}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      riskManagement: {
                        ...prev.riskManagement!,
                        takeProfit: parseFloat(e.target.value)
                      }
                    }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Max Drawdown (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.riskManagement?.maxDrawdown || 10}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      riskManagement: {
                        ...prev.riskManagement!,
                        maxDrawdown: parseFloat(e.target.value)
                      }
                    }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add tag"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags?.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-2">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div className="flex gap-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive || false}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Active Strategy</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isPublic || false}
                  onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Public Strategy</span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-xl hover:from-blue-700 hover:to-purple-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : (strategy ? 'Update Strategy' : 'Create Strategy')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 