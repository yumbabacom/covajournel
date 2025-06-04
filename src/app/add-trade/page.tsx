'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/AuthProvider';
import TradingPairSelector from '../components/TradingPairSelector';
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
  status: 'PLANNED' | 'ACTIVE' | 'WIN' | 'LOSS';
  notes: string;
  tags: string;
  images: File[];
  strategyId: string;
}

export default function AddTradePage() {
  const { user, loading } = useAuth();
  const { selectedAccount } = useAccount();
  const router = useRouter();
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
    images: [],
    strategyId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [strategies, setStrategies] = useState<any[]>([]);

  // Auto-calculation states for the unified form
  const [riskAmount, setRiskAmount] = useState(0);
  const [lotSize, setLotSize] = useState(0);
  const [profitPips, setProfitPips] = useState(0);
  const [lossPips, setLossPips] = useState(0);
  const [profitDollars, setProfitDollars] = useState(0);
  const [lossDollars, setLossDollars] = useState(0);
  const [riskRewardRatio, setRiskRewardRatio] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
      return;
    }
  }, [user, loading, router]);

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
      formDataToSubmit.append('tradeDirection', formData.tradeDirection);
      formDataToSubmit.append('status', formData.status);
      formDataToSubmit.append('notes', formData.notes);
      formDataToSubmit.append('tags', formData.tags);
      formDataToSubmit.append('accountId', selectedAccount.id);
      formDataToSubmit.append('strategyId', formData.strategyId);
      
      // Add calculated values
      formDataToSubmit.append('riskAmount', riskAmount.toString());
      formDataToSubmit.append('positionSize', lotSize.toString());
      formDataToSubmit.append('profitDollars', profitDollars.toString());
      formDataToSubmit.append('lossDollars', lossDollars.toString());
      formDataToSubmit.append('riskRewardRatio', riskRewardRatio.toString());
      
      // Add images
      formData.images.forEach((image) => {
        formDataToSubmit.append(`images`, image);
      });

      const response = await fetch('/api/trades', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        body: formDataToSubmit,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Failed to create trade');
      }

      const result = await response.json();
      console.log('Trade created successfully:', result);
      
      setSubmitSuccess(true);
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
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
          images: [],
          strategyId: '',
        });
        setSubmitSuccess(false);
        
        // Redirect to trades page
          router.push('/journal');
        }, 2000);

    } catch (error: any) {
      console.error('Error creating trade:', error);
      alert(`Error creating trade: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-lg font-semibold text-gray-700">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Professional Header */}
      <div className="relative bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 shadow-2xl overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-white opacity-5" style={{
            backgroundImage: 'radial-gradient(circle at 20px 20px, white 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        <div className="relative max-w-full px-8 lg:px-16 py-16">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-8 lg:space-y-0">
            {/* Left Side - Main Header Content */}
            <div className="flex items-center space-x-8">
              {/* Enhanced Logo/Icon */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 rounded-3xl blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-6 transition-all duration-500">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
              </div>
            </div>

              {/* Header Text */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <h1 className="text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-purple-100 leading-tight">
                    Create New Trade
                  </h1>
                  <div className="h-1 w-32 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full"></div>
                  </div>
                
                <p className="text-xl lg:text-2xl text-blue-100 font-medium max-w-2xl leading-relaxed">
                  Professional Trading Journal & Advanced Risk Management Platform
                </p>
                
                {/* Feature Badges */}
                <div className="flex flex-wrap items-center gap-4 mt-6">
                  <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-lg rounded-full px-4 py-2 border border-white/20">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-white font-medium text-sm">Live Calculations</span>
                </div>
                  <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-lg rounded-full px-4 py-2 border border-white/20">
                    <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="text-white font-medium text-sm">Smart Risk Management</span>
            </div>
                  <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-lg rounded-full px-4 py-2 border border-white/20">
                    <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
                    <span className="text-white font-medium text-sm">Auto Analytics</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-lg rounded-full px-4 py-2 border border-white/20">
                    <div className="w-3 h-3 bg-pink-400 rounded-full animate-pulse"></div>
                    <span className="text-white font-medium text-sm">Professional Grade</span>
                  </div>
          </div>
        </div>
      </div>

            {/* Right Side - Account Info Cards */}
            <div className="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-6">
              {selectedAccount && (
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                  <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                        </svg>
                    </div>
                      <div>
                        <div className="text-white/80 text-sm font-medium">Active Trading Account</div>
                        <div className="text-white text-xl font-bold">{selectedAccount.name}</div>
                        <div className="text-emerald-200 text-lg font-semibold">${selectedAccount.currentBalance.toLocaleString()}</div>
                        </div>
                    </div>
            </div>
                </div>
              )}

              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300">
            <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-white/80 text-sm font-medium">System Status</div>
                      <div className="text-green-400 text-xl font-bold">All Systems Ready</div>
                      <div className="text-blue-200 text-sm">Trading enabled</div>
                    </div>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Bottom Border Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500"></div>
      </div>

      {/* Main Content - Full Width */}
      <div className="max-w-full px-8 lg:px-16 py-16">
        <ProfessionalTradeForm
          formData={formData}
          setFormData={setFormData}
          onImageUpload={handleImageUpload}
          onRemoveImage={removeImage}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitSuccess={submitSuccess}
          riskAmount={riskAmount}
          lotSize={lotSize}
          profitPips={profitPips}
          lossPips={lossPips}
          profitDollars={profitDollars}
          lossDollars={lossDollars}
          riskRewardRatio={riskRewardRatio}
          strategies={strategies}
        />
      </div>
    </div>
  );
}

function ProfessionalTradeForm({
  formData,
  setFormData,
  onImageUpload,
  onRemoveImage,
  onSubmit,
  isSubmitting,
  submitSuccess,
  riskAmount,
  lotSize,
  profitPips,
  lossPips,
  profitDollars,
  lossDollars,
  riskRewardRatio,
  strategies,
}: {
  formData: TradeFormData;
  setFormData: (data: TradeFormData | ((prev: TradeFormData) => TradeFormData)) => void;
  onImageUpload: (files: File[]) => void;
  onRemoveImage: (index: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  submitSuccess: boolean;
  riskAmount: number;
  lotSize: number;
  profitPips: number;
  lossPips: number;
  profitDollars: number;
  lossDollars: number;
  riskRewardRatio: number;
  strategies: any[];
}) {
  const handleInputChange = (field: keyof TradeFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const tradingPairs = [
    { symbol: 'EUR/USD', category: 'Forex' },
    { symbol: 'GBP/USD', category: 'Forex' },
    { symbol: 'USD/JPY', category: 'Forex' },
    { symbol: 'BTC/USD', category: 'Crypto' },
    { symbol: 'ETH/USD', category: 'Crypto' },
    { symbol: 'AAPL', category: 'Stocks' },
    { symbol: 'TSLA', category: 'Stocks' },
    { symbol: 'XAU/USD', category: 'Commodities' },
  ];

  return (
    <div className="space-y-12">
      {/* Success Message */}
      {submitSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-2xl shadow-2xl border border-green-400">
          <div className="flex items-center space-x-3">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                <div>
              <div className="font-bold text-xl">Trade Created Successfully!</div>
              <div className="text-green-100">Redirecting to journal...</div>
                  </div>
                </div>
              </div>
      )}

      {/* Step 1: Market Selection & Direction */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
        <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-10 border border-white/40 shadow-2xl hover:shadow-3xl transition-all duration-500">
          <div className="flex items-center space-x-6 mb-10">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-xl">
                <span className="text-white text-sm font-bold">1</span>
              </div>
                    </div>
                    <div>
              <h3 className="text-4xl font-black text-gray-900 mb-2">Market Selection & Direction</h3>
              <p className="text-gray-600 text-xl font-medium">Choose your trading instrument and position type</p>
              <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mt-3"></div>
                    </div>
                  </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Trading Pair */}
            <div>
              <label className="flex items-center space-x-3 text-lg font-bold text-gray-700 mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span>Trading Pair</span>
                <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">Required</div>
              </label>
                  <TradingPairSelector
                    selectedPair={formData.symbol}
                    onPairSelect={(pair) => {
                      handleInputChange('symbol', pair);
                      const pairData = tradingPairs.find(p => p.symbol === pair);
                      if (pairData) {
                        handleInputChange('category', pairData.category);
                      }
                    }}
                  />
              <div className="mt-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-blue-700">Category</div>
                    <div className="text-xl font-bold text-blue-900">{formData.category}</div>
                    </div>
                  <div className="text-3xl">{
                    formData.category === 'Forex' ? '💱' :
                    formData.category === 'Crypto' ? '₿' :
                    formData.category === 'Stocks' ? '📈' :
                    formData.category === 'Commodities' ? '🥇' : '📊'
                  }</div>
                  </div>
                </div>
              </div>

            {/* Trade Direction */}
            <div>
              <label className="flex items-center space-x-3 text-lg font-bold text-gray-700 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </div>
                <span>Trade Direction</span>
                <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">Required</div>
              </label>
              
              <div className="space-y-4">
                {/* LONG Button */}
                <div className="relative group">
                  <div className={`absolute inset-0 rounded-2xl blur-lg transition-all duration-500 ${
                    formData.tradeDirection === 'LONG' 
                      ? 'bg-gradient-to-r from-green-400 to-emerald-500 opacity-40 scale-105' 
                      : 'bg-gradient-to-r from-green-400 to-emerald-500 opacity-0 group-hover:opacity-20'
                  }`}></div>
                    <button
                      type="button"
                      onClick={() => handleInputChange('tradeDirection', 'LONG')}
                    className={`relative w-full p-6 rounded-2xl border-2 transition-all duration-500 transform group-hover:scale-102 ${
                        formData.tradeDirection === 'LONG'
                        ? 'border-green-400 bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 shadow-2xl scale-105 ring-4 ring-green-200'
                        : 'border-gray-200 bg-white/80 backdrop-blur-sm hover:border-green-300 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:shadow-xl'
                      }`}
                    >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                          formData.tradeDirection === 'LONG'
                            ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-xl scale-110' 
                            : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 group-hover:from-green-400 group-hover:to-emerald-500 group-hover:text-white'
                        }`}>
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                          </svg>
                          {formData.tradeDirection === 'LONG' && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                          )}
                        </div>
                        <div className="text-left">
                          <div className={`text-2xl font-black transition-colors duration-300 ${
                            formData.tradeDirection === 'LONG' ? 'text-green-700' : 'text-gray-700 group-hover:text-green-700'
                          }`}>
                            LONG POSITION
                          </div>
                          <div className={`text-lg font-semibold transition-colors duration-300 ${
                            formData.tradeDirection === 'LONG' ? 'text-green-600' : 'text-gray-600 group-hover:text-green-600'
                          }`}>
                            Buy • Expecting price to rise
                          </div>
                          <div className={`text-sm font-medium mt-1 transition-colors duration-300 ${
                            formData.tradeDirection === 'LONG' ? 'text-green-500' : 'text-gray-500 group-hover:text-green-500'
                          }`}>
                            Profit when market goes UP ↗️
                          </div>
                        </div>
                      </div>
                      <div className={`text-4xl transition-all duration-300 ${
                        formData.tradeDirection === 'LONG' ? 'scale-125 rotate-12' : 'group-hover:scale-110'
                      }`}>
                        📈
                      </div>
                      </div>
                    </button>
                </div>
                
                {/* SHORT Button */}
                <div className="relative group">
                  <div className={`absolute inset-0 rounded-2xl blur-lg transition-all duration-500 ${
                    formData.tradeDirection === 'SHORT' 
                      ? 'bg-gradient-to-r from-red-400 to-pink-500 opacity-40 scale-105' 
                      : 'bg-gradient-to-r from-red-400 to-pink-500 opacity-0 group-hover:opacity-20'
                  }`}></div>
                    <button
                      type="button"
                      onClick={() => handleInputChange('tradeDirection', 'SHORT')}
                    className={`relative w-full p-6 rounded-2xl border-2 transition-all duration-500 transform group-hover:scale-102 ${
                        formData.tradeDirection === 'SHORT'
                        ? 'border-red-400 bg-gradient-to-r from-red-50 via-pink-50 to-red-50 shadow-2xl scale-105 ring-4 ring-red-200'
                        : 'border-gray-200 bg-white/80 backdrop-blur-sm hover:border-red-300 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:shadow-xl'
                      }`}
                    >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                          formData.tradeDirection === 'SHORT'
                            ? 'bg-gradient-to-br from-red-500 to-pink-600 shadow-xl scale-110' 
                            : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 group-hover:from-red-400 group-hover:to-pink-500 group-hover:text-white'
                        }`}>
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                          </svg>
                          {formData.tradeDirection === 'SHORT' && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                          )}
                        </div>
                        <div className="text-left">
                          <div className={`text-2xl font-black transition-colors duration-300 ${
                            formData.tradeDirection === 'SHORT' ? 'text-red-700' : 'text-gray-700 group-hover:text-red-700'
                          }`}>
                            SHORT POSITION
                          </div>
                          <div className={`text-lg font-semibold transition-colors duration-300 ${
                            formData.tradeDirection === 'SHORT' ? 'text-red-600' : 'text-gray-600 group-hover:text-red-600'
                          }`}>
                            Sell • Expecting price to fall
                          </div>
                          <div className={`text-sm font-medium mt-1 transition-colors duration-300 ${
                            formData.tradeDirection === 'SHORT' ? 'text-red-500' : 'text-gray-500 group-hover:text-red-500'
                          }`}>
                            Profit when market goes DOWN ↘️
                          </div>
                        </div>
                      </div>
                      <div className={`text-4xl transition-all duration-300 ${
                        formData.tradeDirection === 'SHORT' ? 'scale-125 rotate-12' : 'group-hover:scale-110'
                      }`}>
                        📉
                      </div>
                      </div>
                    </button>
                </div>
              </div>
                  </div>
                </div>
              </div>
            </div>

      {/* Step 2: Price Levels */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 to-teal-400/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
        <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-10 border border-white/40 shadow-2xl hover:shadow-3xl transition-all duration-500">
          <div className="flex items-center space-x-6 mb-10">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-xl">
                <span className="text-white text-sm font-bold">2</span>
              </div>
                    </div>
                    <div>
              <h3 className="text-4xl font-black text-gray-900 mb-2">Price Levels</h3>
              <p className="text-gray-600 text-xl font-medium">Set your entry, exit, and stop loss prices</p>
              <div className="h-1 w-24 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mt-3"></div>
                    </div>
                  </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Entry Price */}
            <div className="relative group">
              <label className="flex items-center space-x-3 text-lg font-bold text-gray-700 mb-6">
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        </div>
                        <span>Entry Price</span>
                <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">Required</div>
                      </label>
                      <div className="relative">
                        <input
                  type="text"
                          value={formData.entryPrice}
                          onChange={(e) => handleInputChange('entryPrice', e.target.value)}
                  placeholder="1.2500"
                  className="w-full p-5 text-xl font-semibold border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-lg"
                        />
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    </div>

            {/* Exit Price */}
            <div className="relative group">
              <label className="flex items-center space-x-3 text-lg font-bold text-gray-700 mb-6">
                <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        </div>
                        <span>Take Profit</span>
                <div className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">Required</div>
                      </label>
                      <div className="relative">
                        <input
                  type="text"
                          value={formData.exitPrice}
                          onChange={(e) => handleInputChange('exitPrice', e.target.value)}
                  placeholder="1.2600"
                  className="w-full p-5 text-xl font-semibold border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-yellow-500 focus:ring-4 focus:ring-yellow-100 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-lg"
                        />
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-transparent rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    </div>

                    {/* Stop Loss */}
            <div className="relative group">
              <label className="flex items-center space-x-3 text-lg font-bold text-gray-700 mb-6">
                <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                          </svg>
                        </div>
                        <span>Stop Loss</span>
                <div className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">Required</div>
                      </label>
                      <div className="relative">
                        <input
                  type="text"
                          value={formData.stopLoss}
                          onChange={(e) => handleInputChange('stopLoss', e.target.value)}
                  placeholder="1.2450"
                  className="w-full p-5 text-xl font-semibold border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-lg"
                        />
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

      {/* Step 3: Risk Management */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-indigo-400/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
        <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-10 border border-white/40 shadow-2xl hover:shadow-3xl transition-all duration-500">
          <div className="flex items-center space-x-6 mb-10">
                    <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5-2a8.001 8.001 0 00-14.95 0" />
                </svg>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center shadow-xl">
                <span className="text-white text-sm font-bold">3</span>
                  </div>
                </div>
                <div>
              <h3 className="text-4xl font-black text-gray-900 mb-2">Risk Management</h3>
              <p className="text-gray-600 text-xl font-medium">Configure your risk parameters and account settings</p>
              <div className="h-1 w-24 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full mt-3"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Account Size */}
            <div>
              <label className="flex items-center space-x-3 text-lg font-bold text-gray-700 mb-4">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                        </div>
                        <span>Account Size</span>
                <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">Required</div>
                      </label>
                        <input
                type="text"
                          value={formData.accountSize}
                          onChange={(e) => handleInputChange('accountSize', e.target.value)}
                placeholder="10000"
                className="w-full p-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                        />
                    </div>

                    {/* Risk Percentage */}
            <div>
              <label className="flex items-center space-x-3 text-lg font-bold text-gray-700 mb-4">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12-9a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <span>Risk Percentage</span>
                <div className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">Required</div>
                      </label>
                        <input
                type="text"
                          value={formData.riskPercentage}
                          onChange={(e) => handleInputChange('riskPercentage', e.target.value)}
                placeholder="2"
                className="w-full p-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              />
                    </div>
                  </div>
                </div>
              </div>

      {/* Step 4: Strategy & Documentation */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-400/10 to-cyan-400/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
        <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-10 border border-white/40 shadow-2xl hover:shadow-3xl transition-all duration-500">
          <div className="flex items-center space-x-6 mb-10">
                <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-violet-500 rounded-full flex items-center justify-center shadow-xl">
                <span className="text-white text-sm font-bold">4</span>
                  </div>
                </div>
                <div>
              <h3 className="text-4xl font-black text-gray-900 mb-2">Strategy & Documentation</h3>
              <p className="text-gray-600 text-xl font-medium">Select strategy and add trade documentation</p>
              <div className="h-1 w-24 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full mt-3"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Strategy Selection */}
                    <div>
              <label className="flex items-center space-x-3 text-lg font-bold text-gray-700 mb-4">
                <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                <span>Trading Strategy</span>
                <div className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium">Optional</div>
              </label>
                      <select
                        value={formData.strategyId}
                        onChange={(e) => handleInputChange('strategyId', e.target.value)}
                className="w-full p-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                      >
                <option value="">Select a strategy</option>
                        {strategies.map((strategy) => (
                  <option key={strategy.id} value={strategy.id}>{strategy.name}</option>
                        ))}
                      </select>
                    </div>

            {/* Tags */}
                    <div>
              <label className="flex items-center space-x-3 text-lg font-bold text-gray-700 mb-4">
                <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                <span>Tags</span>
                <div className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">Optional</div>
              </label>
                      <input
                        type="text"
                        value={formData.tags}
                        onChange={(e) => handleInputChange('tags', e.target.value)}
                placeholder="breakout, support, resistance"
                className="w-full p-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
              />
                      </div>
                    </div>

          {/* Notes */}
          <div className="mt-6">
            <label className="flex items-center space-x-3 text-lg font-bold text-gray-700 mb-4">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                        </div>
              <span>Trade Notes & Analysis</span>
              <div className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">Optional</div>
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Describe your trade setup, analysis, and reasoning..."
              rows={4}
              className="w-full p-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
            </div>

              {/* Image Upload */}
          <div className="mt-6">
            <label className="flex items-center space-x-3 text-lg font-bold text-gray-700 mb-4">
              <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
              <span>Trade Images</span>
              <div className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-sm font-medium">Optional</div>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 transition-colors">
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => {
                  if (e.target.files) {
                    const files = Array.from(e.target.files);
                                onImageUpload(files);
                              }
                            }}
                            className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div className="text-lg font-semibold text-gray-700">Click to upload images</div>
                <div className="text-gray-500">PNG, JPG up to 10MB each</div>
                        </label>
                  </div>

            {/* Display uploaded images */}
                  {formData.images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                        {formData.images.map((file, index) => (
                  <div key={index} className="relative group">
                              <img
                                src={URL.createObjectURL(file)}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                              />
                            <button
                              onClick={() => onRemoveImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                    </div>
                  )}
          </div>
                </div>
              </div>

      {/* Step 5: Calculated Results */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-400/10 to-gray-400/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
        <div className="relative bg-gradient-to-br from-slate-50 to-blue-50 backdrop-blur-xl rounded-3xl p-10 border border-white/40 shadow-2xl hover:shadow-3xl transition-all duration-500">
          <div className="flex items-center space-x-6 mb-10">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-600 to-gray-800 rounded-2xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-slate-600 to-gray-800 rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center shadow-xl">
                <span className="text-white text-sm font-bold">5</span>
              </div>
                    </div>
                    <div>
              <h3 className="text-4xl font-black text-gray-900 mb-2">Calculated Results</h3>
              <p className="text-gray-600 text-xl font-medium">Auto-calculated trade metrics and analysis</p>
              <div className="h-1 w-24 bg-gradient-to-r from-slate-500 to-gray-500 rounded-full mt-3"></div>
                    </div>
                  </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl blur-md opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-sm font-medium text-gray-600 mb-2">Risk Amount</div>
                <div className="text-3xl font-black text-purple-600">${riskAmount.toFixed(0)}</div>
                <div className="w-8 h-1 bg-purple-500 rounded-full mx-auto mt-2"></div>
                    </div>
                    </div>
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl blur-md opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-sm font-medium text-gray-600 mb-2">Lot Size</div>
                <div className="text-3xl font-black text-blue-600">{lotSize.toFixed(2)}</div>
                <div className="w-8 h-1 bg-blue-500 rounded-full mx-auto mt-2"></div>
                    </div>
                    </div>
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 rounded-xl blur-md opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-sm font-medium text-gray-600 mb-2">Profit Pips</div>
                <div className="text-3xl font-black text-green-600">{profitPips.toFixed(0)}</div>
                <div className="w-8 h-1 bg-green-500 rounded-full mx-auto mt-2"></div>
                  </div>
                    </div>
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-600 rounded-xl blur-md opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-sm font-medium text-gray-600 mb-2">Loss Pips</div>
                <div className="text-3xl font-black text-red-600">{lossPips.toFixed(0)}</div>
                <div className="w-8 h-1 bg-red-500 rounded-full mx-auto mt-2"></div>
                    </div>
                  </div>
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-xl blur-md opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-sm font-medium text-gray-600 mb-2">Profit $</div>
                <div className="text-3xl font-black text-emerald-600">${profitDollars.toFixed(0)}</div>
                <div className="w-8 h-1 bg-emerald-500 rounded-full mx-auto mt-2"></div>
                </div>
              </div>
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 rounded-xl blur-md opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-sm font-medium text-gray-600 mb-2">Loss $</div>
                <div className="text-3xl font-black text-orange-600">${lossDollars.toFixed(0)}</div>
                <div className="w-8 h-1 bg-orange-500 rounded-full mx-auto mt-2"></div>
            </div>
          </div>
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-xl blur-md opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-sm font-medium text-gray-600 mb-2">R:R Ratio</div>
                <div className="text-3xl font-black text-indigo-600">{riskRewardRatio.toFixed(2)}</div>
                <div className="w-8 h-1 bg-indigo-500 rounded-full mx-auto mt-2"></div>
              </div>
            </div>
          </div>
        </div>
              </div>
              
      {/* Submit Button */}
      <div className="flex justify-center">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl blur-lg opacity-70 group-hover:opacity-100 transition-opacity duration-500"></div>
              <button
            type="button"
                onClick={onSubmit}
                disabled={isSubmitting}
            className="relative px-16 py-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white text-2xl font-black rounded-2xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 disabled:transform-none transition-all duration-500 border border-white/20"
              >
                    {isSubmitting ? (
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating Trade...</span>
              </div>
                    ) : (
              <div className="flex items-center space-x-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                <span>Create Professional Trade</span>
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  </div>
            )}
              </button>
            </div>
          </div>
    </div>
  );
}

