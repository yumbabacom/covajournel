'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import TradingCalculator from '../components/TradingCalculator';
import TradingPairSelector from '../components/TradingPairSelector';
import IntelligentDirectionSelector from '../components/IntelligentDirectionSelector';
import { useAuth } from '../components/AuthProvider';
import { useAccount } from '../components/AccountProvider';

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
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-950 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Stunning Enhanced Header */}
        <div className="text-center mb-16">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/30 to-teal-500/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="relative inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl shadow-2xl shadow-emerald-500/30 transform hover:scale-105 transition-all duration-300">
              <div className="absolute inset-2 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl opacity-50"></div>
              <svg className="relative w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>

          <div className="space-y-6">
            <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-white via-emerald-200 to-teal-200 bg-clip-text text-transparent leading-tight">
              Add New
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Trade
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Professional trade planning with
              <span className="text-emerald-400 font-semibold"> intelligent calculations</span>,
              <span className="text-teal-400 font-semibold"> risk management</span>, and
              <span className="text-cyan-400 font-semibold"> comprehensive documentation</span>
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-3 p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-bold text-white">Auto-Calculations</p>
                <p className="text-sm text-white/60">Smart lot sizing & P&L</p>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-3 p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-bold text-white">Risk Management</p>
                <p className="text-sm text-white/60">Professional risk control</p>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-3 p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-bold text-white">Image Upload</p>
                <p className="text-sm text-white/60">Visual trade documentation</p>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {submitSuccess && (
          <div className="mb-8 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">Trade Added Successfully!</h3>
                <p className="text-green-600 dark:text-green-400">Redirecting to your journal...</p>
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

  const handleInputChange = (field: keyof TradeFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

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
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50 p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Input Fields */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <svg className="w-6 h-6 mr-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Trading Parameters
              </h3>
            </div>

            {/* Enhanced Account Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account Size */}
              <div className="relative">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
                  Account Size
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  </div>
                  <span className="absolute inset-y-0 left-12 flex items-center text-gray-500 dark:text-gray-400 font-bold">
                    $
                  </span>
                  <input
                    type="number"
                    value={formData.accountSize}
                    onChange={(e) => handleInputChange('accountSize', e.target.value)}
                    className="w-full pl-16 pr-4 py-5 bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 dark:text-white text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                    placeholder="10,000"
                  />
                </div>
              </div>

              {/* Risk Percentage */}
              <div className="relative">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
                  Risk Per Trade
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.riskPercentage}
                    onChange={(e) => handleInputChange('riskPercentage', e.target.value)}
                    className="w-full pl-14 pr-12 py-5 bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 dark:text-white text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                    placeholder="2.0"
                  />
                  <span className="absolute inset-y-0 right-4 flex items-center text-gray-500 dark:text-gray-400 font-bold">
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

            {/* Enhanced Price Levels */}
            <div className="space-y-6">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                <svg className="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                Price Levels
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Entry Price */}
                <div className="relative">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
                    Entry Price
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <input
                      type="number"
                      step="0.00001"
                      value={formData.entryPrice}
                      onChange={(e) => handleInputChange('entryPrice', e.target.value)}
                      className="w-full pl-14 pr-4 py-5 bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:text-white text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                      placeholder="1.10000"
                    />
                  </div>
                </div>

                {/* Take Profit */}
                <div className="relative">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
                    Take Profit
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                        </svg>
                      </div>
                    </div>
                    <input
                      type="number"
                      step="0.00001"
                      value={formData.exitPrice}
                      onChange={(e) => handleInputChange('exitPrice', e.target.value)}
                      className="w-full pl-14 pr-4 py-5 bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 dark:text-white text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                      placeholder="1.11000"
                    />
                  </div>
                </div>

                {/* Stop Loss */}
                <div className="relative">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
                    Stop Loss
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-rose-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                        </svg>
                      </div>
                    </div>
                    <input
                      type="number"
                      step="0.00001"
                      value={formData.stopLoss}
                      onChange={(e) => handleInputChange('stopLoss', e.target.value)}
                      className="w-full pl-14 pr-4 py-5 bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 dark:text-white text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
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
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wider">
                Trade Status
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleInputChange('status', 'PLANNING')}
                  className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                    formData.status === 'PLANNING'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-lg shadow-blue-500/25'
                      : 'border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 hover:border-blue-300 dark:hover:border-blue-600'
                  }`}
                >
                  <div className="text-center">
                    <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center ${
                      formData.status === 'PLANNING'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      📋
                    </div>
                    <p className={`font-bold ${
                      formData.status === 'PLANNING'
                        ? 'text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      Planning
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleInputChange('status', 'OPEN')}
                  className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                    formData.status === 'OPEN'
                      ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30 shadow-lg shadow-yellow-500/25'
                      : 'border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 hover:border-yellow-300 dark:hover:border-yellow-600'
                  }`}
                >
                  <div className="text-center">
                    <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center ${
                      formData.status === 'OPEN'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      📈
                    </div>
                    <p className={`font-bold ${
                      formData.status === 'OPEN'
                        ? 'text-yellow-700 dark:text-yellow-300'
                        : 'text-gray-700 dark:text-gray-300'
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
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <svg className="w-6 h-6 mr-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Auto-Calculated Results
              </h3>
            </div>

            {/* Risk Management Results */}
            <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-200/50 dark:border-emerald-700/50">
              <h4 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200 mb-4">
                Risk Management
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Risk Amount</p>
                  <p className="text-xl font-bold text-red-600 dark:text-red-400">
                    ${riskAmount.toFixed(2)}
                  </p>
                </div>
                <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Lot Size</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {lotSize.toFixed(4)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formData.symbol.includes('/') ? 'Lots' : 'Units'}
                  </p>
                </div>
              </div>
            </div>

            {/* Profit/Loss Potential */}
            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-700/50">
              <h4 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4">
                Profit/Loss Potential
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                  <p className="text-sm text-green-600 dark:text-green-400 mb-2">Potential Profit</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    ${profitDollars.toFixed(2)}
                  </p>
                  <p className="text-sm text-green-500 dark:text-green-400 mt-1">
                    {profitPips.toFixed(1)} pips
                  </p>
                </div>
                <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                  <p className="text-sm text-red-600 dark:text-red-400 mb-2">Potential Loss</p>
                  <p className="text-xl font-bold text-red-600 dark:text-red-400">
                    ${lossDollars.toFixed(2)}
                  </p>
                  <p className="text-sm text-red-500 dark:text-red-400 mt-1">
                    {lossPips.toFixed(1)} pips
                  </p>
                </div>
              </div>
            </div>

            {/* Risk:Reward Ratio */}
            <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-200/50 dark:border-purple-700/50">
              <h4 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-4">
                Risk:Reward Analysis
              </h4>
              <div className="text-center">
                <p className="text-sm text-purple-600 dark:text-purple-400 mb-2">Risk:Reward Ratio</p>
                <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                  1:{riskRewardRatio.toFixed(2)}
                </p>
                <div className="mt-4 p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
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
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50 p-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <svg className="w-6 h-6 mr-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
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
          className="border-2 border-dashed border-emerald-300 dark:border-emerald-700 rounded-2xl p-12 text-center hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors duration-200 bg-emerald-50/50 dark:bg-emerald-900/10 mb-6"
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Upload Trade Images
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Drag and drop your screenshots, charts, or analysis images here
              </p>
              <label className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-semibold cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Supports: JPG, PNG, GIF, WebP (Max 5MB each)
            </p>
          </div>
        </div>

        {/* Uploaded Images Preview */}
        {formData.images.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Uploaded Images ({formData.images.length})
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {formData.images.map((file, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden">
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
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50 p-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <svg className="w-6 h-6 mr-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Trade Analysis & Notes
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Trade Analysis & Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={8}
              className="w-full px-4 py-4 bg-white/70 dark:bg-gray-700/70 border border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 dark:text-white text-lg transition-all duration-200 resize-none"
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
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
                className="w-full px-4 py-4 bg-white/70 dark:bg-gray-700/70 border border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 dark:text-white text-lg transition-all duration-200"
                placeholder="scalping, breakout, trend-following, news-event"
              />
            </div>

            {/* Popular Tags */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Popular Tags
              </label>
              <div className="flex flex-wrap gap-2">
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
                    className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-lg text-sm font-medium hover:bg-emerald-200 dark:hover:bg-emerald-900/40 transition-colors duration-200"
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
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50 p-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => router.push('/journal')}
            className="flex-1 px-8 py-4 bg-gray-500 hover:bg-gray-600 text-white rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting || !formData.symbol || !formData.entryPrice}
            className="flex-1 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Adding Trade...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add Trade</span>
              </div>
            )}
          </button>
        </div>

        {/* Success Message */}
        {submitSuccess && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-green-800 dark:text-green-200 font-medium">
                Trade added successfully!
                <button
                  onClick={() => router.push('/journal')}
                  className="ml-2 text-green-600 dark:text-green-400 underline hover:text-green-700 dark:hover:text-green-300"
                >
                  View in Journal
                </button>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

