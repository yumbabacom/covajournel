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

interface Trade {
  id: string;
  symbol: string;
  category: string;
  entryPrice: number;
  exitPrice: number;
  stopLoss: number;
  accountSize: number;
  riskPercentage: number;
  tradeDirection: 'LONG' | 'SHORT';
  status: string;
  notes: string;
  tags: string[];
  strategyId?: string;
  [key: string]: any;
}

interface EditTradeModalProps {
  trade: Trade;
  onClose: () => void;
  onSave: (tradeId: string, data: any) => void;
}

const popularPairs = [
  'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD', 'NZD/USD',
  'EUR/GBP', 'EUR/JPY', 'GBP/JPY', 'XAUUSD', 'XAGUSD', 'BTCUSD', 'ETHUSD'
];

export default function EditTradeModal({ trade, onClose, onSave }: EditTradeModalProps) {
  const { user } = useAuth();
  const { selectedAccount, updateAccount } = useAccount();

  // Debug: Log the trade object to verify ID format
  console.log('EditTradeModal opened with trade:', trade);
  console.log('Trade ID:', trade.id, 'Type:', typeof trade.id);

  const [formData, setFormData] = useState<TradeFormData>({
    symbol: trade.symbol || 'EUR/USD',
    category: trade.category || 'Forex',
    entryPrice: trade.entryPrice?.toString() || '',
    exitPrice: trade.exitPrice?.toString() || '',
    stopLoss: trade.stopLoss?.toString() || '',
    accountSize: trade.accountSize?.toString() || selectedAccount?.currentBalance.toString() || '10000',
    riskPercentage: trade.riskPercentage?.toString() || '2',
    tradeDirection: trade.tradeDirection || 'LONG',
    status: trade.status as 'PLANNED' | 'ACTIVE' | 'WIN' | 'LOSS' || 'PLANNED',
    notes: trade.notes || '',
    tags: trade.tags?.join(', ') || '',
    strategyId: trade.strategyId || '',
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

  const updateAccountBalance = async (updateData: any) => {
    if (!selectedAccount) return false;
    
    try {
      let balanceChange = 0;
      
      // Calculate balance change based on trade status
      if (updateData.status === 'WIN' && updateData.profitDollars) {
        balanceChange = updateData.profitDollars;
      } else if (updateData.status === 'LOSS' && updateData.lossDollars) {
        balanceChange = -Math.abs(updateData.lossDollars);
      } else {
        console.log('No profit/loss amount found, skipping balance update');
        return false;
      }
      
      const newBalance = selectedAccount.currentBalance + balanceChange;
      
      console.log('Updating account balance from EditTradeModal:', {
        status: updateData.status,
        currentBalance: selectedAccount.currentBalance,
        balanceChange,
        newBalance,
        profitDollars: updateData.profitDollars,
        lossDollars: updateData.lossDollars
      });
      
      await updateAccount(selectedAccount.id, { currentBalance: newBalance });
      
      // ✅ NOTIFY ACCOUNT BALANCE UPDATE
      window.dispatchEvent(new CustomEvent('accountBalanceUpdated', { 
        detail: { accountId: selectedAccount.id, newBalance } 
      }));
      
      return true;
    } catch (error) {
      console.error('Failed to update account balance:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAccount || !user) {
      alert('Please select an account');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare update data
      const updateData = {
        symbol: formData.symbol,
        category: formData.category,
        entryPrice: parseFloat(formData.entryPrice),
        exitPrice: parseFloat(formData.exitPrice),
        stopLoss: parseFloat(formData.stopLoss),
        accountSize: parseFloat(formData.accountSize),
        riskPercentage: parseFloat(formData.riskPercentage),
        riskAmount: riskAmount,
        lotSize: lotSize,
        profitPips: profitPips,
        lossPips: lossPips,
        profitDollars: profitDollars,
        lossDollars: lossDollars,
        riskRewardRatio: riskRewardRatio,
        tradeDirection: formData.tradeDirection,
        status: formData.status,
        notes: formData.notes,
        strategyId: formData.strategyId,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      };

      console.log('=== EditTradeModal Debug ===');
      console.log('Full trade object received:', trade);
      console.log('Trade ID to update:', trade.id);
      console.log('Trade ID type:', typeof trade.id);
      console.log('Trade ID length:', trade.id?.length);
      console.log('Update data to send:', updateData);
      console.log('=== End Debug ===');

      await onSave(trade.id, updateData);

      // ✅ BALANCE IS NOW UPDATED AUTOMATICALLY BY BACKEND
      // No need for duplicate frontend balance updates

      onClose();
    } catch (error: any) {
      console.error('Error updating trade:', error);
      const errorMessage = error?.message || 'Unknown error occurred';
      alert('Failed to update trade: ' + errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof TradeFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200 p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Edit Trade
                </h2>
                <p className="text-xl text-gray-600 mt-2">
                  Modify your {trade.symbol} trade details
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-12 h-12 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto max-h-[calc(95vh-200px)]">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Trading Pair and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="flex items-center space-x-2 text-lg font-semibold text-gray-700">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <span>Trading Pair</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.symbol}
                    onChange={(e) => handleInputChange('symbol', e.target.value)}
                    className="w-full pl-4 pr-12 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm font-medium text-gray-700 shadow-lg transition-all duration-300"
                  >
                    {popularPairs.map((pair) => (
                      <option key={pair} value={pair}>
                        {pair}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center space-x-2 text-lg font-semibold text-gray-700">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span>Category</span>
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white/80 backdrop-blur-sm font-medium text-gray-700 shadow-lg transition-all duration-300"
                  placeholder="e.g., Forex, Crypto, Stocks"
                />
              </div>
            </div>

            {/* Direction and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="flex items-center space-x-2 text-lg font-semibold text-gray-700">
                  <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Direction</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleInputChange('tradeDirection', 'LONG')}
                    className={`px-6 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                      formData.tradeDirection === 'LONG'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span>LONG</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange('tradeDirection', 'SHORT')}
                    className={`px-6 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                      formData.tradeDirection === 'SHORT'
                        ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                    </svg>
                    <span>SHORT</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center space-x-2 text-lg font-semibold text-gray-700">
                  <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Status</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value as 'PLANNED' | 'ACTIVE' | 'WIN' | 'LOSS')}
                    className="w-full pl-4 pr-12 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/80 backdrop-blur-sm font-medium text-gray-700 shadow-lg transition-all duration-300"
                  >
                    <option value="PLANNED">Planned</option>
                    <option value="ACTIVE">Active</option>
                    <option value="WIN">Win</option>
                    <option value="LOSS">Loss</option>
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Levels */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
                <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span>Price Levels</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <label className="flex items-center space-x-2 text-lg font-semibold text-gray-700">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Entry Price</span>
                  </label>
                  <input
                    type="number"
                    step="0.00001"
                    value={formData.entryPrice}
                    onChange={(e) => handleInputChange('entryPrice', e.target.value)}
                    className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white/80 backdrop-blur-sm font-medium text-gray-700 shadow-lg transition-all duration-300"
                    placeholder="1.08500"
                  />
                </div>

                <div className="space-y-3">
                  <label className="flex items-center space-x-2 text-lg font-semibold text-gray-700">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Exit Price</span>
                  </label>
                  <input
                    type="number"
                    step="0.00001"
                    value={formData.exitPrice}
                    onChange={(e) => handleInputChange('exitPrice', e.target.value)}
                    className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm font-medium text-gray-700 shadow-lg transition-all duration-300"
                    placeholder="1.09000"
                  />
                </div>

                <div className="space-y-3">
                  <label className="flex items-center space-x-2 text-lg font-semibold text-gray-700">
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span>Stop Loss</span>
                  </label>
                  <input
                    type="number"
                    step="0.00001"
                    value={formData.stopLoss}
                    onChange={(e) => handleInputChange('stopLoss', e.target.value)}
                    className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white/80 backdrop-blur-sm font-medium text-gray-700 shadow-lg transition-all duration-300"
                    placeholder="1.08000"
                  />
                </div>
              </div>
            </div>

            {/* Risk Management */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
                <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Risk Management</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="flex items-center space-x-2 text-lg font-semibold text-gray-700">
                    <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <span>Account Size</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.accountSize}
                    onChange={(e) => handleInputChange('accountSize', e.target.value)}
                    className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/80 backdrop-blur-sm font-medium text-gray-700 shadow-lg transition-all duration-300"
                    placeholder="10000"
                  />
                </div>

                <div className="space-y-3">
                  <label className="flex items-center space-x-2 text-lg font-semibold text-gray-700">
                    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    <span>Risk %</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.riskPercentage}
                    onChange={(e) => handleInputChange('riskPercentage', e.target.value)}
                    className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/80 backdrop-blur-sm font-medium text-gray-700 shadow-lg transition-all duration-300"
                    placeholder="2.0"
                  />
                </div>
              </div>
            </div>

            {/* Calculations Display */}
            {(riskAmount > 0 || lotSize > 0) && (
              <div className="bg-gradient-to-r from-gray-50 via-blue-50 to-purple-50 rounded-3xl p-8 border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span>Auto Calculations</span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="bg-white/80 rounded-2xl p-4 text-center border border-gray-200 shadow-lg">
                    <div className="text-2xl font-bold text-indigo-600">${riskAmount.toFixed(2)}</div>
                    <div className="text-sm text-gray-600 mt-1">Risk Amount</div>
                  </div>
                  <div className="bg-white/80 rounded-2xl p-4 text-center border border-gray-200 shadow-lg">
                    <div className="text-2xl font-bold text-purple-600">{lotSize.toFixed(2)}</div>
                    <div className="text-sm text-gray-600 mt-1">Lot Size</div>
                  </div>
                  <div className="bg-white/80 rounded-2xl p-4 text-center border border-gray-200 shadow-lg">
                    <div className="text-2xl font-bold text-green-600">${profitDollars.toFixed(2)}</div>
                    <div className="text-sm text-gray-600 mt-1">Profit Target</div>
                  </div>
                  <div className="bg-white/80 rounded-2xl p-4 text-center border border-gray-200 shadow-lg">
                    <div className="text-2xl font-bold text-blue-600">{riskRewardRatio.toFixed(2)}:1</div>
                    <div className="text-sm text-gray-600 mt-1">Risk:Reward</div>
                  </div>
                </div>
              </div>
            )}

            {/* Notes and Tags */}
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="flex items-center space-x-2 text-lg font-semibold text-gray-700">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z" />
                  </svg>
                  <span>Notes</span>
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white/80 backdrop-blur-sm font-medium text-gray-700 shadow-lg transition-all duration-300 resize-none"
                  placeholder="Add your trade notes, analysis, or thoughts..."
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center space-x-2 text-lg font-semibold text-gray-700">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span>Tags (comma separated)</span>
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => handleInputChange('tags', e.target.value)}
                  className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm font-medium text-gray-700 shadow-lg transition-all duration-300"
                  placeholder="scalping, breakout, support, etc."
                />
              </div>
            </div>

            {/* Strategy Selection */}
            {strategies.length > 0 && (
              <div className="space-y-3">
                <label className="flex items-center space-x-2 text-lg font-semibold text-gray-700">
                  <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  <span>Strategy</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.strategyId}
                    onChange={(e) => handleInputChange('strategyId', e.target.value)}
                    className="w-full pl-4 pr-12 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/80 backdrop-blur-sm font-medium text-gray-700 shadow-lg transition-all duration-300"
                  >
                    <option value="">Select a strategy (optional)</option>
                    {strategies.map((strategy) => (
                      <option key={strategy.id} value={strategy.id}>
                        {strategy.name} - {strategy.marketType} ({strategy.timeframe})
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-6 pt-8 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Cancel</span>
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 