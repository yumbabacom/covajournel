'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TradingCalculator from '../components/TradingCalculator';
import TradingPairSelector from '../components/TradingPairSelector';
import IntelligentDirectionSelector from '../components/IntelligentDirectionSelector';
import { useAuth } from '../components/AuthProvider';
import { useAccount } from '../components/AccountProvider';
import CreateStrategyModal from '../components/CreateStrategyModal';

interface TradeFormData {
  symbol: string;
  category: string;
  entryPrice: string;
  exitPrice: string;
  stopLoss: string;
  accountSize: string;
  riskPercentage: string;
  tradeDirection: 'LONG' | 'SHORT';
  status: 'PLANNING' | 'OPEN' | 'WIN' | 'LOSS';
  notes: string;
  tags: string;
  images: File[];
  strategyId: string;
}

export default function AddTradePage() {
  const { user, logout, isLoading } = useAuth();
  const { selectedAccount } = useAccount();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'calculator' | 'manual' | 'images'>('calculator');
  const [formData, setFormData] = useState<TradeFormData>({
    symbol: 'EUR/USD',
    category: 'Forex',
    entryPrice: '',
    exitPrice: '',
    stopLoss: '',
    accountSize: selectedAccount?.currentBalance.toString() || '10000',
    riskPercentage: '2',
    tradeDirection: 'LONG',
    status: 'PLANNING',
    notes: '',
    tags: '',
    images: [],
    strategyId: '',
  });
  const [calculatedData, setCalculatedData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Auto-calculation states for the unified form
  const [riskAmount, setRiskAmount] = useState(0);
  const [lotSize, setLotSize] = useState(0);
  const [profitPips, setProfitPips] = useState(0);
  const [lossPips, setLossPips] = useState(0);
  const [profitDollars, setProfitDollars] = useState(0);
  const [lossDollars, setLossDollars] = useState(0);
  const [riskRewardRatio, setRiskRewardRatio] = useState(0);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
      return;
    }
  }, [user, isLoading, router]);

  // Update account size when selected account changes
  useEffect(() => {
    if (selectedAccount) {
      setFormData(prev => ({
        ...prev,
        accountSize: selectedAccount.currentBalance.toString()
      }));
    }
  }, [selectedAccount]);

  // Auto-calculation effect for the unified form
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
    const stopLossPips = Math.abs(entry - stop) * 10000; // Simplified for forex
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
      let lotSizeCalc = 0;
      let profitDollarsCalc = 0;
      let lossDollarsCalc = 0;

      // Calculate lot size based on risk amount and stop loss pips
      // For forex: Lot size = Risk Amount / (Stop Loss Pips × Pip Value)
      // Standard lot pip value for major pairs = $10 per pip
      const pipValue = 10; // $10 per pip for standard lot
      lotSizeCalc = riskAmt / (stopLossPips * pipValue);

      // Calculate P&L in dollars
      profitDollarsCalc = profitPipsCalc * pipValue * lotSizeCalc;
      lossDollarsCalc = stopLossPips * pipValue * lotSizeCalc;

      setLotSize(lotSizeCalc);
      setProfitDollars(profitDollarsCalc);
      setLossDollars(lossDollarsCalc);
    } else {
      setLotSize(0);
      setProfitDollars(0);
      setLossDollars(0);
    }
  }, [formData.symbol, formData.entryPrice, formData.exitPrice, formData.stopLoss, formData.accountSize, formData.riskPercentage]);

  const handleCalculatorData = (data: any) => {
    setCalculatedData(data);
    setFormData(prev => ({
      ...prev,
      symbol: data.symbol,
      category: data.category,
      entryPrice: data.entryPrice.toString(),
      exitPrice: data.exitPrice.toString(),
      stopLoss: data.stopLoss.toString(),
      accountSize: data.accountSize.toString(),
      riskPercentage: data.riskPercentage.toString(),
      tradeDirection: data.tradeDirection,
    }));
  };

  const handleImageUpload = (files: File[]) => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files],
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    // Validate that we have calculated values
    if (lotSize <= 0) {
      alert('Please enter valid trade parameters to calculate lot size.');
      return;
    }

    // Validate that an account is selected
    if (!selectedAccount) {
      alert('Please select a trading account.');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token');
      }

      // Upload images first if any
      let imageUrls: string[] = [];
      if (formData.images.length > 0) {
        const imageFormData = new FormData();
        formData.images.forEach((file, index) => {
          imageFormData.append(`image_${index}`, file);
        });

        const imageResponse = await fetch('/api/upload-images', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: imageFormData,
        });

        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          imageUrls = imageData.urls;
        }
      }

      // Prepare trade data with calculated values
      const tradeData = {
        ...formData,
        accountId: selectedAccount.id,
        entryPrice: parseFloat(formData.entryPrice),
        exitPrice: parseFloat(formData.exitPrice),
        stopLoss: parseFloat(formData.stopLoss),
        accountSize: parseFloat(formData.accountSize),
        riskPercentage: parseFloat(formData.riskPercentage),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
        images: imageUrls,
        // Include calculated values
        riskAmount: riskAmount,
        lotSize: lotSize,
        profitPips: profitPips,
        lossPips: lossPips,
        profitDollars: profitDollars,
        lossDollars: lossDollars,
        riskRewardRatio: riskRewardRatio,
      };

      console.log('Submitting trade data:', tradeData);
      console.log('Lot size value:', lotSize, typeof lotSize);

      const response = await fetch('/api/trades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(tradeData),
      });

      if (response.ok) {
        setSubmitSuccess(true);
        setTimeout(() => {
          router.push('/journal');
        }, 2000);
      } else {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.message || 'Failed to save trade');
      }
    } catch (error) {
      console.error('Error saving trade:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-6 py-8">
        {/* Page Content */}
        <div className="space-y-8">

          {/* Success Message */}
          {submitSuccess && (
            <div className="p-6 bg-green-50 border border-green-200 rounded-2xl shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-green-800">Trade Added Successfully!</h3>
                  <p className="text-green-600">Redirecting to your journal...</p>
                </div>
              </div>
            </div>
          )}

          {/* Unified Add Trade Form - Calculator + Images in One Page */}
          <UnifiedAddTradeForm
            formData={formData}
            setFormData={setFormData}
            onImageUpload={handleImageUpload}
            onRemoveImage={removeImage}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitSuccess={submitSuccess}
          />

        </div>
      </div>
    </div>
  );
}

// Unified Add Trade Form - Calculator + Images in One Page
function UnifiedAddTradeForm({
  formData,
  setFormData,
  onImageUpload,
  onRemoveImage,
  onSubmit,
  isSubmitting,
  submitSuccess
}: {
  formData: TradeFormData;
  setFormData: (data: TradeFormData | ((prev: TradeFormData) => TradeFormData)) => void;
  onImageUpload: (files: File[]) => void;
  onRemoveImage: (index: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  submitSuccess: boolean;
}) {
  const router = useRouter();

  const tradingPairs = [
    // Major Forex Pairs
    { symbol: 'EUR/USD', category: 'Forex' },
    { symbol: 'GBP/USD', category: 'Forex' },
    { symbol: 'USD/JPY', category: 'Forex' },
    { symbol: 'USD/CHF', category: 'Forex' },
    { symbol: 'AUD/USD', category: 'Forex' },
    { symbol: 'USD/CAD', category: 'Forex' },
    { symbol: 'NZD/USD', category: 'Forex' },

    // Commodities
    { symbol: 'XAU/USD', category: 'Commodities' },
    { symbol: 'XAG/USD', category: 'Commodities' },
    { symbol: 'WTI/USD', category: 'Commodities' },

    // Stocks
    { symbol: 'AAPL', category: 'Stocks' },
    { symbol: 'MSFT', category: 'Stocks' },
    { symbol: 'GOOGL', category: 'Stocks' },
    { symbol: 'TSLA', category: 'Stocks' },

    // Crypto
    { symbol: 'BTC/USD', category: 'Crypto' },
    { symbol: 'ETH/USD', category: 'Crypto' },
  ];

  // Auto-calculation states
  const [riskAmount, setRiskAmount] = useState(0);
  const [lotSize, setLotSize] = useState(0);
  const [profitPips, setProfitPips] = useState(0);
  const [lossPips, setLossPips] = useState(0);
  const [profitDollars, setProfitDollars] = useState(0);
  const [lossDollars, setLossDollars] = useState(0);
  const [riskRewardRatio, setRiskRewardRatio] = useState(0);

  // Strategy selection states
  const [strategies, setStrategies] = useState<any[]>([]);
  const [loadingStrategies, setLoadingStrategies] = useState(false);
  const [selectedStrategyForDetails, setSelectedStrategyForDetails] = useState<any>(null);
  const [isStrategyDetailsOpen, setIsStrategyDetailsOpen] = useState(false);
  const [isEditStrategyOpen, setIsEditStrategyOpen] = useState(false);
  const [strategyToEdit, setStrategyToEdit] = useState<any>(null);
  const { selectedAccount } = useAccount();

  const handleInputChange = (field: keyof TradeFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleViewStrategyDetails = (strategy: any) => {
    setSelectedStrategyForDetails(strategy);
    setIsStrategyDetailsOpen(true);
  };

  const handleCloseStrategyDetails = () => {
    setIsStrategyDetailsOpen(false);
    setSelectedStrategyForDetails(null);
  };

  const handleEditStrategy = (strategy: any) => {
    setStrategyToEdit(strategy);
    setIsEditStrategyOpen(true);
    setIsStrategyDetailsOpen(false); // Close details modal
  };

  const handleCloseEditStrategy = () => {
    setIsEditStrategyOpen(false);
    setStrategyToEdit(null);
  };

  const handleUpdateStrategy = async (strategyData: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/strategies/${strategyData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(strategyData),
      });

      if (response.ok) {
        await fetchStrategies(); // Refresh strategies list
        setIsEditStrategyOpen(false);
        setStrategyToEdit(null);
        alert('Strategy updated successfully!');
      } else {
        const errorData = await response.json();
        console.error('Failed to update strategy:', errorData);
        alert(`Failed to update strategy: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating strategy:', error);
      alert('Failed to update strategy. Please try again.');
    }
  };

  // Fetch strategies
  useEffect(() => {
    const fetchStrategies = async () => {
      if (!selectedAccount) return;

      setLoadingStrategies(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/strategies', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setStrategies(data || []);
        } else {
          console.error('Failed to fetch strategies:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error fetching strategies:', error);
      } finally {
        setLoadingStrategies(false);
      }
    };

    fetchStrategies();
  }, [selectedAccount]);

  // Auto-calculation effect
  useEffect(() => {
    calculateValues();
  }, [formData.symbol, formData.entryPrice, formData.exitPrice, formData.stopLoss, formData.accountSize, formData.riskPercentage]);

  const calculateValues = () => {
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

    // Get selected pair data
    const selectedPairData = tradingPairs.find(pair => pair.symbol === formData.symbol);
    if (!selectedPairData) {
      setLotSize(0);
      setRiskRewardRatio(0);
      setProfitPips(0);
      setLossPips(0);
      setProfitDollars(0);
      setLossDollars(0);
      return;
    }

    // Calculate pips
    const stopLossPips = Math.abs(entry - stop) * 10000; // Simplified for forex
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
      let lotSizeCalc = 0;
      let profitDollarsCalc = 0;
      let lossDollarsCalc = 0;

      if (selectedPairData.category === 'Forex') {
        // Forex lot size calculation
        // Lot size = Risk Amount / (Stop Loss Pips × Pip Value)
        const pipValue = 10; // $10 per pip for standard lot
        lotSizeCalc = riskAmt / (stopLossPips * pipValue);
        profitDollarsCalc = profitPipsCalc * pipValue * lotSizeCalc;
        lossDollarsCalc = stopLossPips * pipValue * lotSizeCalc;
      } else if (selectedPairData.category === 'Stocks') {
        // Stocks calculation (shares)
        const stopLossDistance = Math.abs(entry - stop);
        lotSizeCalc = riskAmt / stopLossDistance; // Number of shares
        profitDollarsCalc = Math.abs(exit - entry) * lotSizeCalc;
        lossDollarsCalc = stopLossDistance * lotSizeCalc;
      } else if (selectedPairData.category === 'Crypto') {
        // Crypto calculation (units)
        const stopLossDistance = Math.abs(entry - stop);
        lotSizeCalc = riskAmt / stopLossDistance; // Number of units
        profitDollarsCalc = Math.abs(exit - entry) * lotSizeCalc;
        lossDollarsCalc = stopLossDistance * lotSizeCalc;
      } else if (selectedPairData.category === 'Commodities') {
        // Commodities calculation (ounces/barrels)
        const stopLossDistance = Math.abs(entry - stop);
        lotSizeCalc = riskAmt / stopLossDistance; // Number of units
        profitDollarsCalc = Math.abs(exit - entry) * lotSizeCalc;
        lossDollarsCalc = stopLossDistance * lotSizeCalc;
      }

      setLotSize(lotSizeCalc);
      setProfitDollars(profitDollarsCalc);
      setLossDollars(lossDollarsCalc);
    } else {
      setLotSize(0);
      setProfitDollars(0);
      setLossDollars(0);
    }
  };

  return (
    <div className="space-y-8">
      {/* Trading Calculator Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-all duration-300">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Input Fields */}
          <div className="space-y-6">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                Trading Parameters
              </h3>
            </div>

            {/* Enhanced Account Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account Size */}
              <div className="relative">
                <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
                  Account Size
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  </div>
                  <span className="absolute inset-y-0 left-14 flex items-center text-gray-500 font-bold text-lg">
                    $
                  </span>
                  <input
                    type="number"
                    value={formData.accountSize}
                    onChange={(e) => handleInputChange('accountSize', e.target.value)}
                    className="w-full pl-20 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-gray-900 text-lg transition-all duration-200 shadow-sm hover:shadow-md"
                    placeholder="10,000"
                  />
                </div>
              </div>

              {/* Risk Percentage */}
              <div className="relative">
                <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
                  Risk Per Trade
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.riskPercentage}
                    onChange={(e) => handleInputChange('riskPercentage', e.target.value)}
                    className="w-full pl-16 pr-12 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 text-gray-900 text-lg transition-all duration-200 shadow-sm hover:shadow-md"
                    placeholder="2.0"
                  />
                  <span className="absolute inset-y-0 right-4 flex items-center text-gray-500 font-bold text-lg">
                    %
                  </span>
                </div>
              </div>
            </div>

            {/* Beautiful Trading Pair Selector */}
            <TradingPairSelector
              selectedPair={formData.symbol}
              onPairSelect={(pair) => {
                handleInputChange('symbol', pair);
                // Auto-detect category based on the pair
                const tradingPairData = [
                  { symbol: 'EUR/USD', category: 'Forex' },
                  { symbol: 'GBP/USD', category: 'Forex' },
                  { symbol: 'USD/JPY', category: 'Forex' },
                  { symbol: 'BTC/USD', category: 'Crypto' },
                  { symbol: 'ETH/USD', category: 'Crypto' },
                  { symbol: 'AAPL', category: 'Stocks' },
                  { symbol: 'TSLA', category: 'Stocks' },
                  { symbol: 'XAU/USD', category: 'Commodities' },
                ].find(p => p.symbol === pair);
                if (tradingPairData) {
                  handleInputChange('category', tradingPairData.category);
                }
              }}
            />

            {/* Enhanced Strategy Selection */}
            <div className="relative">
              <label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider flex items-center">
                <svg className="w-4 h-4 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Trading Strategy
                <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full font-normal">Optional</span>
              </label>

              {/* Strategy Selection Container */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform duration-200">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 8l2 2 4-4" />
                    </svg>
                  </div>
                </div>

                <select
                  value={formData.strategyId}
                  onChange={(e) => handleInputChange('strategyId', e.target.value)}
                  className="w-full pl-18 pr-12 py-5 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 text-gray-900 text-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:border-indigo-300 appearance-none cursor-pointer group-hover:bg-gradient-to-r group-hover:from-indigo-50 group-hover:to-purple-50"
                  disabled={loadingStrategies}
                  style={{
                    backgroundImage: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)'
                  }}
                >
                  <option value="" className="text-gray-600 bg-white">
                    {loadingStrategies ? 'Loading strategies...' : 'Choose your trading strategy'}
                  </option>
                  {strategies.map((strategy) => (
                    <option
                      key={strategy._id || strategy.id}
                      value={strategy._id || strategy.id}
                      className="text-gray-900 bg-white py-3"
                    >
                      🎯 {strategy.name} • {strategy.marketType} • {strategy.timeframe}
                    </option>
                  ))}
                </select>

                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <div className="flex items-center space-x-2">
                    {loadingStrategies ? (
                      <div className="w-5 h-5 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-6 h-6 text-indigo-400 group-hover:text-indigo-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Decorative gradient border */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none -z-10 blur-xl"></div>
              </div>

              {/* Loading State */}
              {loadingStrategies && (
                <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl">
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-6 h-6 border-3 border-indigo-300 border-t-indigo-600 rounded-full animate-spin"></div>
                    <div className="text-indigo-700 font-medium">
                      Fetching your trading strategies...
                    </div>
                  </div>
                  <div className="mt-2 w-full bg-indigo-200 rounded-full h-1">
                    <div className="bg-indigo-600 h-1 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                  </div>
                </div>
              )}

              {/* No Strategies State */}
              {!loadingStrategies && strategies.length === 0 && (
                <div className="mt-4 p-6 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-2xl text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">No Strategies Found</h4>
                  <p className="text-gray-500 mb-4">Create your first trading strategy to get started</p>
                  <button
                    type="button"
                    onClick={() => window.open('/strategies', '_blank')}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors duration-200"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Strategy
                  </button>
                </div>
              )}

              {/* Selected Strategy Preview */}
              {formData.strategyId && !loadingStrategies && (
                <div className="mt-4 transform transition-all duration-300 ease-out">
                  {(() => {
                    const selectedStrategy = strategies.find(s => (s._id || s.id) === formData.strategyId);
                    return selectedStrategy ? (
                      <div className="relative overflow-hidden">
                        {/* Background gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl"></div>

                        {/* Content */}
                        <div className="relative p-6 bg-white/80 backdrop-blur-sm border-2 border-indigo-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                          <div className="flex items-start space-x-4">
                            {/* Strategy Icon */}
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                            </div>

                            {/* Strategy Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-lg font-bold text-gray-900 truncate">
                                  {selectedStrategy.name}
                                </h4>
                                <div className="flex items-center space-x-1">
                                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span className="text-sm font-medium text-green-600">Selected</span>
                                </div>
                              </div>

                              {/* Strategy Badges */}
                              <div className="flex flex-wrap gap-2 mb-3">
                                <span className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full">
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16l-3-3m3 3l3-3" />
                                  </svg>
                                  {selectedStrategy.marketType}
                                </span>
                                <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {selectedStrategy.timeframe}
                                </span>
                                {selectedStrategy.winRate && (
                                  <span className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-800 text-sm font-medium rounded-full">
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                    {selectedStrategy.winRate.toFixed(1)}% Win Rate
                                  </span>
                                )}
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center space-x-3">
                                <button
                                  type="button"
                                  onClick={() => handleViewStrategyDetails(selectedStrategy)}
                                  className="inline-flex items-center px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                                >
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  View Details
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleInputChange('strategyId', '')}
                                  className="inline-flex items-center px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors duration-200"
                                >
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Decorative elements */}
                        <div className="absolute top-2 right-2 w-20 h-20 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-xl"></div>
                        <div className="absolute bottom-2 left-2 w-16 h-16 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl"></div>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </div>

            {/* Enhanced Price Levels */}
            <div className="space-y-6">
              <h4 className="text-xl font-bold text-gray-900 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                Price Levels
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Entry Price */}
                <div className="relative">
                  <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
                    Entry Price
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <input
                      type="number"
                      step="0.00001"
                      value={formData.entryPrice}
                      onChange={(e) => handleInputChange('entryPrice', e.target.value)}
                      className="w-full pl-16 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-gray-900 text-lg transition-all duration-200 shadow-sm hover:shadow-md"
                      placeholder="1.10000"
                    />
                  </div>
                </div>

                {/* Take Profit */}
                <div className="relative">
                  <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
                    Take Profit
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                        </svg>
                      </div>
                    </div>
                    <input
                      type="number"
                      step="0.00001"
                      value={formData.exitPrice}
                      onChange={(e) => handleInputChange('exitPrice', e.target.value)}
                      className="w-full pl-16 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 text-gray-900 text-lg transition-all duration-200 shadow-sm hover:shadow-md"
                      placeholder="1.11000"
                    />
                  </div>
                </div>

                {/* Stop Loss */}
                <div className="relative">
                  <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
                    Stop Loss
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                        </svg>
                      </div>
                    </div>
                    <input
                      type="number"
                      step="0.00001"
                      value={formData.stopLoss}
                      onChange={(e) => handleInputChange('stopLoss', e.target.value)}
                      className="w-full pl-16 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 text-gray-900 text-lg transition-all duration-200 shadow-sm hover:shadow-md"
                      placeholder="1.09500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Intelligent Direction Selector */}
            <IntelligentDirectionSelector
              entryPrice={formData.entryPrice}
              exitPrice={formData.exitPrice}
              stopLoss={formData.stopLoss}
              selectedDirection={formData.tradeDirection}
              onDirectionChange={(direction) => handleInputChange('tradeDirection', direction)}
            />

            {/* Enhanced Trade Status */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">
                Trade Status
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleInputChange('status', 'PLANNING')}
                  className={`p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                    formData.status === 'PLANNING'
                      ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/25'
                      : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="text-center">
                    <div className={`w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center shadow-lg ${
                      formData.status === 'PLANNING'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      📋
                    </div>
                    <p className={`font-bold text-lg ${
                      formData.status === 'PLANNING'
                        ? 'text-blue-700'
                        : 'text-gray-700'
                    }`}>
                      Planning
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleInputChange('status', 'OPEN')}
                  className={`p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                    formData.status === 'OPEN'
                      ? 'border-yellow-500 bg-yellow-50 shadow-lg shadow-yellow-500/25'
                      : 'border-gray-200 bg-gray-50 hover:border-yellow-300 hover:bg-yellow-50'
                  }`}
                >
                  <div className="text-center">
                    <div className={`w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center shadow-lg ${
                      formData.status === 'OPEN'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      📈
                    </div>
                    <p className={`font-bold text-lg ${
                      formData.status === 'OPEN'
                        ? 'text-yellow-700'
                        : 'text-gray-700'
                    }`}>
                      Open
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Auto-Calculation Results */}
          <div className="space-y-6">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                Auto-Calculated Results
              </h3>
            </div>

            {/* Risk Management Results */}
            <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <h4 className="text-xl font-bold text-emerald-800 mb-4 flex items-center">
                <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                Risk Management
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-600 mb-2 font-semibold">Risk Amount</p>
                  <p className="text-2xl font-bold text-red-600">
                    ${riskAmount.toFixed(2)}
                  </p>
                </div>
                <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-600 mb-2 font-semibold">Lot Size</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {lotSize.toFixed(4)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 font-medium">
                    {formData.symbol.includes('/') ? 'Lots' : 'Units'}
                  </p>
                </div>
              </div>
            </div>

            {/* Profit/Loss Potential */}
            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <h4 className="text-xl font-bold text-blue-800 mb-4 flex items-center">
                <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                Profit/Loss Potential
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                  <p className="text-sm text-green-600 mb-2 font-semibold">Potential Profit</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${profitDollars.toFixed(2)}
                  </p>
                  <p className="text-sm text-green-500 mt-1 font-medium">
                    {profitPips.toFixed(1)} pips
                  </p>
                </div>
                <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                  <p className="text-sm text-red-600 mb-2 font-semibold">Potential Loss</p>
                  <p className="text-2xl font-bold text-red-600">
                    ${lossDollars.toFixed(2)}
                  </p>
                  <p className="text-sm text-red-500 mt-1 font-medium">
                    {lossPips.toFixed(1)} pips
                  </p>
                </div>
              </div>
            </div>

            {/* Risk:Reward Ratio */}
            <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <h4 className="text-xl font-bold text-purple-800 mb-4 flex items-center">
                <div className="w-8 h-8 bg-purple-500 rounded-xl flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                Risk:Reward Analysis
              </h4>
              <div className="text-center">
                <p className="text-sm text-purple-600 mb-2 font-semibold">Risk:Reward Ratio</p>
                <p className="text-4xl font-bold text-purple-700">
                  1:{riskRewardRatio.toFixed(2)}
                </p>
                <div className="mt-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-600 font-medium">
                    {riskRewardRatio >= 3 ? '🎯 Excellent R:R ratio!' :
                     riskRewardRatio >= 2 ? '✅ Good R:R ratio' :
                     riskRewardRatio >= 1 ? '⚠️ Acceptable R:R ratio' :
                     riskRewardRatio > 0 ? '🚨 Poor R:R ratio' :
                     'Enter trade details to see R:R ratio'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Upload Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-all duration-300">
        <h3 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          Trade Screenshots & Charts
        </h3>

        {/* Upload Area */}
        <div
          onDrop={(e) => {
            e.preventDefault();
            const files = Array.from(e.dataTransfer.files);
            const imageFiles = files.filter(file => file.type.startsWith('image/'));
            if (imageFiles.length > 0) {
              onImageUpload(imageFiles);
            }
          }}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-indigo-300 rounded-2xl p-12 text-center hover:border-indigo-500 transition-all duration-300 bg-gradient-to-br from-indigo-50 to-purple-50 mb-6 hover:shadow-lg"
        >
          <div className="flex flex-col items-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-3xl flex items-center justify-center shadow-xl">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 mb-3">
                Upload Trade Images
              </p>
              <p className="text-gray-600 mb-6 text-lg">
                Drag and drop your screenshots, charts, or analysis images here
              </p>
              <label className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-2xl font-bold cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Choose Files
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 0) {
                      onImageUpload(files);
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-sm text-gray-500 font-medium">
              Supports: JPG, PNG, GIF, WebP (Max 5MB each)
            </p>
          </div>
        </div>

        {/* Uploaded Images Preview */}
        {formData.images.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Uploaded Images ({formData.images.length})
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {formData.images.map((file, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => onRemoveImage(index)}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="absolute bottom-2 left-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {file.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Notes and Tags Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-all duration-300">
        <h3 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          Trade Analysis & Notes
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Notes */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
              Trade Analysis & Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={8}
              className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 text-gray-900 text-lg transition-all duration-200 resize-none shadow-sm hover:shadow-md"
              placeholder="Enter your comprehensive trade analysis here...

• Market conditions and setup
• Technical analysis and indicators used
• Fundamental factors considered
• Entry and exit strategy
• Risk management approach
• Lessons learned or observations"
            />
          </div>

          {/* Tags and Quick Actions */}
          <div className="space-y-6">
            {/* Tags */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
                className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 text-gray-900 text-lg transition-all duration-200 shadow-sm hover:shadow-md"
                placeholder="scalping, breakout, trend-following, news-event"
              />
            </div>

            {/* Popular Tags */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
                Popular Tags
              </label>
              <div className="flex flex-wrap gap-3">
                {[
                  'scalping', 'swing-trade', 'day-trade', 'breakout', 'trend-following',
                  'support-resistance', 'news-event', 'technical-analysis', 'momentum'
                ].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      const currentTags = formData.tags.split(',').map(t => t.trim()).filter(t => t);
                      if (!currentTags.includes(tag)) {
                        const newTags = [...currentTags, tag].join(', ');
                        handleInputChange('tags', newTags);
                      }
                    }}
                    className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl text-sm font-semibold hover:bg-emerald-200 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-all duration-300">
        <div className="flex flex-col sm:flex-row gap-6">
          <button
            onClick={() => router.push('/journal')}
            className="flex-1 px-8 py-4 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 text-lg"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting || !formData.symbol || !formData.entryPrice}
            className="flex-1 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:cursor-not-allowed text-lg"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-3">
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Adding Trade...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add Trade to Journal</span>
              </div>
            )}
          </button>
        </div>

        {/* Success Message */}
        {submitSuccess && (
          <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-xl shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-green-800 font-bold text-lg">
                  Trade added successfully!
                </p>
                <button
                  onClick={() => router.push('/journal')}
                  className="mt-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all duration-200 hover:scale-105"
                >
                  View in Journal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Strategy Details Popup Modal */}
      {isStrategyDetailsOpen && selectedStrategyForDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-xl"></div>

            {/* Modal Content */}
            <div className="relative bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
              {/* Header */}
              <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 8l2 2 4-4" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-2">
                        {selectedStrategyForDetails.name}
                      </h2>
                      <div className="flex items-center space-x-3">
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-full">
                          {selectedStrategyForDetails.marketType}
                        </span>
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-full">
                          {selectedStrategyForDetails.timeframe}
                        </span>
                        {selectedStrategyForDetails.winRate && (
                          <span className="px-3 py-1 bg-emerald-500/80 text-white text-sm font-medium rounded-full">
                            {selectedStrategyForDetails.winRate.toFixed(1)}% Win Rate
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseStrategyDetails}
                    className="w-12 h-12 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl flex items-center justify-center transition-all duration-200 group"
                  >
                    <svg className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-4 right-20 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-4 left-20 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
              </div>

              {/* Content */}
              <div className="p-8 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column - Strategy Rules */}
                  <div className="space-y-6">
                    {/* Setup Conditions */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-3">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-blue-900">Setup Conditions</h3>
                      </div>
                      <div className="bg-white/80 rounded-xl p-4 border border-blue-100">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {selectedStrategyForDetails.setupConditions}
                        </p>
                      </div>
                    </div>

                    {/* Entry Rules */}
                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-200">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center mr-3">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-emerald-900">Entry Rules</h3>
                      </div>
                      <div className="bg-white/80 rounded-xl p-4 border border-emerald-100">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {selectedStrategyForDetails.entryRules}
                        </p>
                      </div>
                    </div>

                    {/* Exit Rules */}
                    <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-6 border border-red-200">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center mr-3">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-red-900">Exit Rules</h3>
                      </div>
                      <div className="bg-white/80 rounded-xl p-4 border border-red-100">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {selectedStrategyForDetails.exitRules}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Strategy Details */}
                  <div className="space-y-6">
                    {/* Performance Stats */}
                    {(selectedStrategyForDetails.winRate || selectedStrategyForDetails.totalPnL || selectedStrategyForDetails.usageCount) && (
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </div>
                          <h3 className="text-xl font-bold text-purple-900">Performance Stats</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {selectedStrategyForDetails.usageCount !== undefined && (
                            <div className="bg-white/80 rounded-xl p-4 text-center border border-purple-100">
                              <p className="text-2xl font-bold text-purple-600">{selectedStrategyForDetails.usageCount}</p>
                              <p className="text-sm text-purple-700 font-medium">Total Trades</p>
                            </div>
                          )}
                          {selectedStrategyForDetails.winRate && (
                            <div className="bg-white/80 rounded-xl p-4 text-center border border-purple-100">
                              <p className="text-2xl font-bold text-emerald-600">{selectedStrategyForDetails.winRate.toFixed(1)}%</p>
                              <p className="text-sm text-purple-700 font-medium">Win Rate</p>
                            </div>
                          )}
                          {selectedStrategyForDetails.totalPnL !== undefined && (
                            <div className="bg-white/80 rounded-xl p-4 text-center border border-purple-100">
                              <p className={`text-2xl font-bold ${selectedStrategyForDetails.totalPnL >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                ${selectedStrategyForDetails.totalPnL.toFixed(2)}
                              </p>
                              <p className="text-sm text-purple-700 font-medium">Total P&L</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Technical Indicators */}
                    {selectedStrategyForDetails.indicators && selectedStrategyForDetails.indicators.length > 0 && (
                      <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-200">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </div>
                          <h3 className="text-xl font-bold text-orange-900">Technical Indicators</h3>
                        </div>
                        <div className="bg-white/80 rounded-xl p-4 border border-orange-100">
                          <div className="flex flex-wrap gap-2">
                            {selectedStrategyForDetails.indicators.map((indicator: string, index: number) => (
                              <span key={index} className="px-3 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded-full">
                                {indicator}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Strategy Tags */}
                    {selectedStrategyForDetails.tags && selectedStrategyForDetails.tags.length > 0 && (
                      <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-6 border border-teal-200">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                          </div>
                          <h3 className="text-xl font-bold text-teal-900">Strategy Tags</h3>
                        </div>
                        <div className="bg-white/80 rounded-xl p-4 border border-teal-100">
                          <div className="flex flex-wrap gap-2">
                            {selectedStrategyForDetails.tags.map((tag: string, index: number) => (
                              <span key={index} className="px-3 py-1 bg-teal-100 text-teal-800 text-sm font-medium rounded-full">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Strategy Metadata */}
                    <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-200">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-slate-600 rounded-xl flex items-center justify-center mr-3">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Strategy Info</h3>
                      </div>
                      <div className="bg-white/80 rounded-xl p-4 border border-gray-100 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-medium">Created:</span>
                          <span className="text-gray-900 font-semibold">
                            {new Date(selectedStrategyForDetails.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-medium">Last Updated:</span>
                          <span className="text-gray-900 font-semibold">
                            {new Date(selectedStrategyForDetails.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-medium">Market Type:</span>
                          <span className="text-gray-900 font-semibold">{selectedStrategyForDetails.marketType}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-medium">Timeframe:</span>
                          <span className="text-gray-900 font-semibold">{selectedStrategyForDetails.timeframe}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-gray-600 text-sm">
                      Strategy ID: {selectedStrategyForDetails._id || selectedStrategyForDetails.id}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleEditStrategy(selectedStrategyForDetails)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors duration-200"
                    >
                      Edit Strategy
                    </button>
                    <button
                      onClick={handleCloseStrategyDetails}
                      className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors duration-200"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Strategy Modal */}
      {isEditStrategyOpen && strategyToEdit && (
        <CreateStrategyModal
          onClose={handleCloseEditStrategy}
          onSubmit={handleUpdateStrategy}
          editStrategy={strategyToEdit}
          isEditMode={true}
        />
      )}
    </div>
  );
}

