'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { useAccount } from './AccountProvider';

interface TradeFormData {
  symbol: string;
  category: string;
  entryPrice: string;
  exitPrice: string;
  stopLoss: string;
  accountSize: string;
  riskPercentage: string;
  tradeDirection: 'LONG' | 'SHORT';
  status: 'PLANNED' | 'ACTIVE' | 'WIN' | 'LOSS';
  notes: string;
  tags: string;
  strategyId: string;
}

interface AddTradeModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const popularPairs = [
  'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD', 'NZD/USD',
  'EUR/GBP', 'EUR/JPY', 'GBP/JPY', 'XAUUSD', 'XAGUSD', 'BTCUSD', 'ETHUSD'
];

export default function AddTradeModal({ onClose, onSuccess }: AddTradeModalProps) {
  const { user } = useAuth();
  const { selectedAccount } = useAccount();
  const [formData, setFormData] = useState<TradeFormData>({
    symbol: 'EUR/USD',
    category: 'Forex',
    entryPrice: '',
    exitPrice: '',
    stopLoss: '',
    accountSize: selectedAccount?.currentBalance.toString() || '10000',
    riskPercentage: '2',
    tradeDirection: 'LONG',
    status: 'PLANNED',
    notes: '',
    tags: '',
    strategyId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [strategies, setStrategies] = useState<any[]>([]);

  // Auto-calculation states
  const [riskAmount, setRiskAmount] = useState(0);
  const [lotSize, setLotSize] = useState(0);
  const [profitPips, setProfitPips] = useState(0);
  const [lossPips, setLossPips] = useState(0);
  const [profitDollars, setProfitDollars] = useState(0);
  const [lossDollars, setLossDollars] = useState(0);
  const [riskRewardRatio, setRiskRewardRatio] = useState(0);

  // Update account size when selected account changes
  useEffect(() => {
    if (selectedAccount) {
      setFormData(prev => ({
        ...prev,
        accountSize: selectedAccount.currentBalance.toString()
      }));
    }
  }, [selectedAccount]);

  // Fetch strategies
  useEffect(() => {
    const fetchStrategies = async () => {
      if (!user || !selectedAccount) return;
      
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/strategies', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          const strategiesArray = data.strategies || data || [];
          setStrategies(strategiesArray);
        }
      } catch (error) {
        console.error('Error fetching strategies:', error);
      }
    };

    fetchStrategies();
  }, [user, selectedAccount]);

  // Auto-calculation effect
  useEffect(() => {
    const entry = parseFloat(formData.entryPrice);
    const exit = parseFloat(formData.exitPrice);
    const stop = parseFloat(formData.stopLoss);
    const account = parseFloat(formData.accountSize);
    const risk = parseFloat(formData.riskPercentage);

    // Calculate risk amount
    if (account > 0 && risk > 0) {
      const riskAmt = (account * risk) / 100;
      setRiskAmount(riskAmt);
    } else {
      setRiskAmount(0);
    }

    // If any price inputs are missing or invalid, reset calculations
    if (entry <= 0 || exit <= 0 || stop <= 0) {
      setLotSize(0);
      setRiskRewardRatio(0);
      setProfitPips(0);
      setLossPips(0);
      setProfitDollars(0);
      setLossDollars(0);
      return;
    }

    // Calculate pips
    const stopLossPips = Math.abs(entry - stop) * 10000;
    const profitPipsCalc = Math.abs(exit - entry) * 10000;

    setProfitPips(profitPipsCalc);
    setLossPips(stopLossPips);

    // Calculate risk:reward ratio
    if (stopLossPips > 0) {
      const rrRatio = profitPipsCalc / stopLossPips;
      setRiskRewardRatio(rrRatio);
    } else {
      setRiskRewardRatio(0);
    }

    // Calculate lot size and P&L based on risk amount
    const riskAmt = (account * risk) / 100;
    if (stopLossPips > 0 && riskAmt > 0) {
      const pipValue = 10; // $10 per pip for standard lot
      const lotSizeCalc = riskAmt / (stopLossPips * pipValue);
      const profitDollarsCalc = profitPipsCalc * pipValue * lotSizeCalc;
      const lossDollarsCalc = stopLossPips * pipValue * lotSizeCalc;

      setLotSize(lotSizeCalc);
      setProfitDollars(profitDollarsCalc);
      setLossDollars(lossDollarsCalc);
    } else {
      setLotSize(0);
      setProfitDollars(0);
      setLossDollars(0);
    }
  }, [formData.symbol, formData.entryPrice, formData.exitPrice, formData.stopLoss, formData.accountSize, formData.riskPercentage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAccount || !user) {
      alert('Please select an account');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Prepare form data for submission
      const formDataToSubmit = new FormData();
      
      // Add all form fields
      formDataToSubmit.append('symbol', formData.symbol);
      formDataToSubmit.append('category', formData.category);
      formDataToSubmit.append('entryPrice', formData.entryPrice);
      formDataToSubmit.append('exitPrice', formData.exitPrice);
      formDataToSubmit.append('stopLoss', formData.stopLoss);
      formDataToSubmit.append('accountSize', formData.accountSize);
      formDataToSubmit.append('riskPercentage', formData.riskPercentage);
      formDataToSubmit.append('riskAmount', riskAmount.toString());
      formDataToSubmit.append('lotSize', lotSize.toString());
      formDataToSubmit.append('profitPips', profitPips.toString());
      formDataToSubmit.append('lossPips', lossPips.toString());
      formDataToSubmit.append('profitDollars', profitDollars.toString());
      formDataToSubmit.append('lossDollars', lossDollars.toString());
      formDataToSubmit.append('riskRewardRatio', riskRewardRatio.toString());
      formDataToSubmit.append('tradeDirection', formData.tradeDirection);
      formDataToSubmit.append('status', formData.status);
      formDataToSubmit.append('notes', formData.notes);
      formDataToSubmit.append('strategyId', formData.strategyId);
      formDataToSubmit.append('accountId', selectedAccount.id);
      formDataToSubmit.append('context', 'main');

      // Process tags
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      tagsArray.forEach(tag => {
        formDataToSubmit.append('tags', tag);
      });

      const response = await fetch('/api/trades', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSubmit,
      });

      if (response.ok) {
        onSuccess();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save trade');
      }
    } catch (error) {
      console.error('Error saving trade:', error);
      alert('Failed to save trade. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof TradeFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Add New Trade</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Trading Pair and Direction */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trading Pair</label>
              <select
                value={formData.symbol}
                onChange={(e) => handleInputChange('symbol', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {popularPairs.map(pair => (
                  <option key={pair} value={pair}>{pair}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Direction</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleInputChange('tradeDirection', 'LONG')}
                  className={`px-4 py-3 rounded-xl font-medium transition-all ${
                    formData.tradeDirection === 'LONG'
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  LONG
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('tradeDirection', 'SHORT')}
                  className={`px-4 py-3 rounded-xl font-medium transition-all ${
                    formData.tradeDirection === 'SHORT'
                      ? 'bg-red-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  SHORT
                </button>
              </div>
            </div>
          </div>

          {/* Price Levels */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Entry Price</label>
              <input
                type="number"
                step="0.00001"
                value={formData.entryPrice}
                onChange={(e) => handleInputChange('entryPrice', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="1.08500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Exit Price</label>
              <input
                type="number"
                step="0.00001"
                value={formData.exitPrice}
                onChange={(e) => handleInputChange('exitPrice', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="1.09500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stop Loss</label>
              <input
                type="number"
                step="0.00001"
                value={formData.stopLoss}
                onChange={(e) => handleInputChange('stopLoss', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="1.08000"
                required
              />
            </div>
          </div>

          {/* Risk Management */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Size ($)</label>
              <input
                type="number"
                value={formData.accountSize}
                onChange={(e) => handleInputChange('accountSize', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Risk Percentage (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.riskPercentage}
                onChange={(e) => handleInputChange('riskPercentage', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Trade Status and Strategy */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value as any)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="PLANNED">Planned</option>
                <option value="ACTIVE">Active</option>
                <option value="WIN">Win</option>
                <option value="LOSS">Loss</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Strategy (Optional)</label>
              <select
                value={formData.strategyId}
                onChange={(e) => handleInputChange('strategyId', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">No Strategy</option>
                {strategies.map(strategy => (
                  <option key={strategy.id} value={strategy.id}>{strategy.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Calculated Metrics */}
          {(profitDollars > 0 || lossDollars > 0) && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Calculated Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Risk Amount</span>
                  <p className="font-semibold text-red-600">${riskAmount.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Lot Size</span>
                  <p className="font-semibold">{lotSize.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Profit Potential</span>
                  <p className="font-semibold text-green-600">${profitDollars.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Risk:Reward</span>
                  <p className="font-semibold text-blue-600">1:{riskRewardRatio.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Notes and Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Trade notes, analysis, market conditions..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
              <textarea
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="breakout, support, resistance, news..."
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Add Trade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 