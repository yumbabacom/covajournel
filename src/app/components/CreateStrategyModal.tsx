'use client';

import { useState, useEffect } from 'react';

interface CreateStrategyModalProps {
  onClose: () => void;
  onSubmit: (strategyData: any) => void;
  editStrategy?: any;
  isEditMode?: boolean;
}

export default function CreateStrategyModal({ onClose, onSubmit, editStrategy, isEditMode = false }: CreateStrategyModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: editStrategy?.name || '',
    description: editStrategy?.description || '',
    marketType: editStrategy?.marketType || '',
    setupConditions: editStrategy?.setupConditions || '',
    entryRules: editStrategy?.entryRules || '',
    exitRules: editStrategy?.exitRules || '',
    riskManagement: editStrategy?.riskManagement || '',
    timeframe: editStrategy?.timeframe || '',
    tradingStyle: editStrategy?.tradingStyle || '',
    complexity: editStrategy?.complexity || 'Intermediate',
    expectedDrawdown: editStrategy?.expectedDrawdown || '',
    minCapital: editStrategy?.minCapital || '',
    sessionTiming: editStrategy?.sessionTiming || '',
    indicators: editStrategy?.indicators ? editStrategy.indicators.join(', ') : '',
    tags: editStrategy?.tags ? editStrategy.tags.join(', ') : '',
    winRate: editStrategy?.winRate || '',
    maxRisk: editStrategy?.maxRisk || '2',
    profitTarget: editStrategy?.profitTarget || '',
    avgHoldTime: editStrategy?.avgHoldTime || '',
    monthlyTarget: editStrategy?.monthlyTarget || '',
    backtestPeriod: editStrategy?.backtestPeriod || '',
    sharpeRatio: editStrategy?.sharpeRatio || '',
    maxConsecutiveLosses: editStrategy?.maxConsecutiveLosses || '',
  });
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = [
    { id: 1, title: 'Strategy Overview', icon: '🎯', description: 'Basic info & fundamentals', color: 'blue' },
    { id: 2, title: 'Trading Rules', icon: '⚡', description: 'Entry, exit & conditions', color: 'orange' },
    { id: 3, title: 'Risk & Performance', icon: '📊', description: 'Risk params & metrics', color: 'purple' },
    { id: 4, title: 'Analytics & Media', icon: '📈', description: 'Backtest & documentation', color: 'green' },
    { id: 5, title: 'Finalization', icon: '✅', description: 'Review & create', color: 'emerald' }
  ];

  const marketTypes = ['Forex', 'Stocks', 'Crypto', 'Options', 'Futures', 'Commodities', 'Indices', 'Bonds', 'ETFs', 'CFDs'];
  const timeframes = ['1min', '5min', '15min', '30min', '1H', '2H', '4H', '6H', '8H', '12H', '1D', '1W', '1M'];
  const tradingStyles = ['Scalping', 'Day Trading', 'Swing Trading', 'Position Trading', 'News Trading', 'Algorithmic', 'High Frequency'];
  const complexityLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
  const sessionTimings = ['Asian Session', 'European Session', 'New York Session', 'London Session', 'Overlap Sessions', '24/7', 'Custom'];

  const popularIndicators = [
    'RSI', 'MACD', 'Moving Average', 'Bollinger Bands', 'Stochastic', 'ATR', 'Volume',
    'Support/Resistance', 'Fibonacci', 'Ichimoku', 'CCI', 'Williams %R', 'Parabolic SAR',
    'ADX', 'Momentum', 'OBV', 'VWAP', 'Pivot Points', 'Keltner Channels', 'Donchian Channels'
  ];

  const popularTags = [
    'Breakout', 'Scalping', 'Swing Trading', 'Trend Following', 'Mean Reversion', 'Momentum',
    'Counter Trend', 'News Trading', 'High Frequency', 'Position Trading', 'Support/Resistance',
    'Pattern Trading', 'Reversal', 'Channel Trading', 'Grid Trading', 'Arbitrage', 'Carry Trade'
  ];

  const validateCurrentStep = () => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.name.trim()) {
        newErrors.name = 'Strategy name is required';
      } else if (formData.name.length < 3) {
        newErrors.name = 'Strategy name must be at least 3 characters';
      }
      if (!formData.marketType) {
        newErrors.marketType = 'Market type is required';
      }
      if (!formData.timeframe) {
        newErrors.timeframe = 'Timeframe is required';
      }
      if (!formData.tradingStyle) {
        newErrors.tradingStyle = 'Trading style is required';
      }
    }

    if (currentStep === 2) {
      if (!formData.setupConditions.trim()) {
        newErrors.setupConditions = 'Setup conditions are required';
      } else if (formData.setupConditions.length < 20) {
        newErrors.setupConditions = 'Please provide more detailed setup conditions (at least 20 characters)';
      }
      if (!formData.entryRules.trim()) {
        newErrors.entryRules = 'Entry rules are required';
      } else if (formData.entryRules.length < 20) {
        newErrors.entryRules = 'Please provide more detailed entry rules (at least 20 characters)';
      }
      if (!formData.exitRules.trim()) {
        newErrors.exitRules = 'Exit rules are required';
      } else if (formData.exitRules.length < 20) {
        newErrors.exitRules = 'Please provide more detailed exit rules (at least 20 characters)';
      }
    }

    if (currentStep === 3) {
      if (!formData.maxRisk || parseFloat(formData.maxRisk) <= 0) {
        newErrors.maxRisk = 'Max risk per trade is required and must be greater than 0';
      }
      if (!formData.winRate || parseFloat(formData.winRate) <= 0 || parseFloat(formData.winRate) > 100) {
        newErrors.winRate = 'Win rate must be between 1-100%';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const addSuggestion = (field: 'indicators' | 'tags', suggestion: string) => {
    const currentValue = formData[field];
    const items = currentValue ? currentValue.split(',').map((item: string) => item.trim()) : [];
    if (!items.includes(suggestion)) {
      const newValue = items.length > 0 ? `${currentValue}, ${suggestion}` : suggestion;
      setFormData(prev => ({ ...prev, [field]: newValue }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_: File, i: number) => i !== index));
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);
    try {
      const imagePromises = images.map((image: File) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(image);
        });
      });

      const imageUrls = await Promise.all(imagePromises);
      const strategyData = {
        ...formData,
        indicators: formData.indicators.split(',').map((i: string) => i.trim()).filter((i: string) => i),
        tags: formData.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t),
        images: imageUrls,
        ...(isEditMode && editStrategy && { id: editStrategy._id || editStrategy.id }),
      };

      await onSubmit(strategyData);
    } catch (error) {
      console.error('Error creating strategy:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-indigo-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-purple-400/15 to-pink-400/15 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-emerald-400/15 to-teal-400/15 rounded-full blur-3xl animate-pulse delay-1500"></div>
      </div>

      <div className="relative bg-white/98 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/60 w-full max-w-7xl max-h-[98vh] overflow-hidden mx-auto">
        {/* Premium Header */}
        <div className="relative px-10 py-8 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 border-b border-gray-200/60">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
          
          {/* Floating Elements */}
          <div className="absolute top-4 left-4 w-3 h-3 bg-blue-400/60 rounded-full animate-ping"></div>
          <div className="absolute top-6 right-8 w-2 h-2 bg-purple-400/60 rounded-full animate-pulse delay-700"></div>
          <div className="absolute bottom-4 left-8 w-2 h-2 bg-emerald-400/60 rounded-full animate-bounce delay-300"></div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl border-4 border-white/80 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✨</span>
                </div>
              </div>
              <div>
                <h2 className="text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  {isEditMode ? 'Edit Strategy' : 'Strategy Creator'}
                </h2>
                <p className="text-xl text-gray-600 mt-3 font-medium leading-relaxed">
                  Design and build professional trading strategies with our advanced wizard
                </p>
                <div className="flex items-center mt-4 space-x-6">
                  <div className="flex items-center space-x-3 px-4 py-2 bg-white/80 rounded-full shadow-lg">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold text-gray-700">Step {currentStep} of 5</span>
                  </div>
                  <div className="flex items-center space-x-3 px-4 py-2 bg-white/80 rounded-full shadow-lg">
                    <div className={`w-3 h-3 rounded-full ${
                      steps[currentStep - 1]?.color === 'blue' ? 'bg-blue-500' :
                      steps[currentStep - 1]?.color === 'orange' ? 'bg-orange-500' :
                      steps[currentStep - 1]?.color === 'purple' ? 'bg-purple-500' :
                      steps[currentStep - 1]?.color === 'green' ? 'bg-green-500' : 'bg-emerald-500'
                    }`}></div>
                    <span className="text-sm font-semibold text-gray-700">{steps[currentStep - 1]?.title}</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="group relative w-16 h-16 bg-white/90 hover:bg-red-500 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl hover:shadow-2xl border border-gray-200/50 hover:scale-110 hover:rotate-12"
            >
              <svg className="w-8 h-8 text-gray-600 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-ping"></div>
            </button>
          </div>
        </div>

        {/* Enhanced Progress Steps */}
        <div className="px-10 py-8 bg-gradient-to-r from-gray-50 via-white to-gray-50 border-b border-gray-100">
          <div className="flex items-center justify-center space-x-6">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div 
                  className={`relative flex flex-col items-center cursor-pointer transition-all duration-500 ${
                    currentStep >= step.id ? 'scale-110' : 'scale-95 opacity-60'
                  } hover:scale-105`} 
                  onClick={() => currentStep > step.id && setCurrentStep(step.id)}
                >
                  <div className={`relative w-20 h-20 rounded-3xl flex items-center justify-center text-3xl shadow-xl transition-all duration-500 border-4 ${
                    currentStep >= step.id 
                      ? `bg-gradient-to-br ${
                          step.color === 'blue' ? 'from-blue-500 to-blue-600 border-blue-200' :
                          step.color === 'orange' ? 'from-orange-500 to-red-500 border-orange-200' :
                          step.color === 'purple' ? 'from-purple-500 to-purple-600 border-purple-200' :
                          step.color === 'green' ? 'from-green-500 to-green-600 border-green-200' : 
                          'from-emerald-500 to-emerald-600 border-emerald-200'
                        } text-white shadow-lg` 
                      : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
                  }`}>
                    {step.icon}
                    {currentStep === step.id && (
                      <div className="absolute inset-0 rounded-3xl bg-white/20 animate-pulse"></div>
                    )}
                  </div>
                  <div className="mt-4 text-center">
                    <p className={`font-bold transition-colors duration-300 text-sm ${
                      currentStep >= step.id ? 'text-gray-800' : 'text-gray-400'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 max-w-24 leading-tight">{step.description}</p>
                  </div>
                  {currentStep === step.id && (
                    <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full animate-ping"></div>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-20 h-2 mx-6 rounded-full transition-all duration-500 ${
                    currentStep > step.id 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg' 
                      : 'bg-gray-200'
                  }`}>
                    {currentStep > step.id && (
                      <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-10 max-h-[calc(98vh-400px)] overflow-y-auto bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30">
          <form onSubmit={handleSubmit} className="space-y-10">
            
            {/* Step 1: Strategy Overview */}
            {currentStep === 1 && (
              <div className="space-y-10 animate-fade-in">
                <div className="text-center mb-12">
                  <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-full font-bold text-lg shadow-xl mb-6">
                    <span className="text-2xl">🎯</span>
                    <span>Strategy Overview</span>
                  </div>
                  <h3 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                    Foundation & Fundamentals
                  </h3>
                  <p className="text-gray-600 text-xl leading-relaxed max-w-3xl mx-auto">
                    Define the core characteristics and market focus of your trading strategy
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  {/* Left Column - Primary Details */}
                  <div className="lg:col-span-2 space-y-8">
                    {/* Strategy Name */}
                    <div className="group">
                      <label className="block text-sm font-black text-gray-700 mb-4 uppercase tracking-wider flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                        Strategy Name *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                          </div>
                        </div>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className={`w-full pl-20 pr-6 py-5 bg-white border-3 ${
                            errors.name ? 'border-red-400 focus:border-red-500 focus:ring-red-500/30' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/30'
                          } rounded-2xl focus:outline-none focus:ring-6 transition-all duration-300 text-gray-900 text-lg font-medium shadow-lg hover:shadow-xl group-hover:border-blue-300`}
                          placeholder="e.g., Momentum Breakout Pro, RSI Reversal Elite, Trend Following Master"
                        />
                      </div>
                      {errors.name && <p className="mt-3 text-red-600 flex items-center font-medium"><span className="mr-2">⚠️</span>{errors.name}</p>}
                    </div>

                    {/* Strategy Description */}
                    <div className="group">
                      <label className="block text-sm font-black text-gray-700 mb-4 uppercase tracking-wider flex items-center">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                        Strategy Description
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-6 py-5 bg-white border-3 border-gray-200 focus:border-purple-500 focus:ring-purple-500/30 rounded-2xl focus:outline-none focus:ring-6 transition-all duration-300 text-gray-900 text-lg font-medium shadow-lg hover:shadow-xl resize-none"
                        placeholder="Provide a detailed description of your trading strategy, its philosophy, and approach..."
                      />
                    </div>

                    {/* Market & Style Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Market Type */}
                      <div className="group">
                        <label className="block text-sm font-black text-gray-700 mb-4 uppercase tracking-wider flex items-center">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></span>
                          Market Type *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16l-3-3m3 3l3-3" />
                              </svg>
                            </div>
                          </div>
                          <select
                            name="marketType"
                            value={formData.marketType}
                            onChange={handleInputChange}
                            required
                            className={`w-full pl-16 pr-12 py-4 bg-white border-3 ${
                              errors.marketType ? 'border-red-400 focus:border-red-500 focus:ring-red-500/30' : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/30'
                            } rounded-2xl focus:outline-none focus:ring-6 transition-all duration-300 text-gray-900 text-lg font-medium shadow-lg hover:shadow-xl appearance-none cursor-pointer`}
                          >
                            <option value="">Select Market Type</option>
                            {marketTypes.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
                        {errors.marketType && <p className="mt-3 text-red-600 flex items-center font-medium"><span className="mr-2">⚠️</span>{errors.marketType}</p>}
                      </div>

                      {/* Trading Style */}
                      <div className="group">
                        <label className="block text-sm font-black text-gray-700 mb-4 uppercase tracking-wider flex items-center">
                          <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                          Trading Style *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            </div>
                          </div>
                          <select
                            name="tradingStyle"
                            value={formData.tradingStyle}
                            onChange={handleInputChange}
                            required
                            className={`w-full pl-16 pr-12 py-4 bg-white border-3 ${
                              errors.tradingStyle ? 'border-red-400 focus:border-red-500 focus:ring-red-500/30' : 'border-gray-200 focus:border-orange-500 focus:ring-orange-500/30'
                            } rounded-2xl focus:outline-none focus:ring-6 transition-all duration-300 text-gray-900 text-lg font-medium shadow-lg hover:shadow-xl appearance-none cursor-pointer`}
                          >
                            <option value="">Select Trading Style</option>
                            {tradingStyles.map(style => (
                              <option key={style} value={style}>{style}</option>
                            ))}
                          </select>
                        </div>
                        {errors.tradingStyle && <p className="mt-3 text-red-600 flex items-center font-medium"><span className="mr-2">⚠️</span>{errors.tradingStyle}</p>}
                      </div>
                    </div>

                    {/* Advanced Settings Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Timeframe */}
                      <div className="group">
                        <label className="block text-sm font-black text-gray-700 mb-4 uppercase tracking-wider">
                          Timeframe *
                        </label>
                        <select
                          name="timeframe"
                          value={formData.timeframe}
                          onChange={handleInputChange}
                          required
                          className={`w-full px-4 py-4 bg-white border-3 ${
                            errors.timeframe ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-purple-500'
                          } rounded-2xl focus:outline-none transition-all duration-300 text-gray-900 font-medium shadow-lg`}
                        >
                          <option value="">Select Timeframe</option>
                          {timeframes.map(tf => (
                            <option key={tf} value={tf}>{tf}</option>
                          ))}
                        </select>
                        {errors.timeframe && <p className="mt-2 text-red-600 text-sm">⚠️ {errors.timeframe}</p>}
                      </div>

                      {/* Complexity */}
                      <div className="group">
                        <label className="block text-sm font-black text-gray-700 mb-4 uppercase tracking-wider">
                          Complexity Level
                        </label>
                        <select
                          name="complexity"
                          value={formData.complexity}
                          onChange={handleInputChange}
                          className="w-full px-4 py-4 bg-white border-3 border-gray-200 focus:border-blue-500 rounded-2xl focus:outline-none transition-all duration-300 text-gray-900 font-medium shadow-lg"
                        >
                          {complexityLevels.map(level => (
                            <option key={level} value={level}>{level}</option>
                          ))}
                        </select>
                      </div>

                      {/* Session Timing */}
                      <div className="group">
                        <label className="block text-sm font-black text-gray-700 mb-4 uppercase tracking-wider">
                          Session Timing
                        </label>
                        <select
                          name="sessionTiming"
                          value={formData.sessionTiming}
                          onChange={handleInputChange}
                          className="w-full px-4 py-4 bg-white border-3 border-gray-200 focus:border-emerald-500 rounded-2xl focus:outline-none transition-all duration-300 text-gray-900 font-medium shadow-lg"
                        >
                          <option value="">Select Session</option>
                          {sessionTimings.map(session => (
                            <option key={session} value={session}>{session}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Preview Card */}
                  <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 rounded-3xl p-8 border-3 border-blue-200 shadow-2xl">
                    <div className="flex items-center space-x-3 mb-8">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                      <h4 className="text-2xl font-black text-blue-900">Live Preview</h4>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                        <p className="text-sm font-bold text-gray-600 mb-2">Strategy Name</p>
                        <p className="font-black text-xl text-gray-900 break-words">
                          {formData.name || 'Enter strategy name...'}
                        </p>
                      </div>
                      
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                        <p className="text-sm font-bold text-gray-600 mb-3">Market & Style</p>
                        <div className="flex flex-wrap gap-2">
                          {formData.marketType && (
                            <span className="px-3 py-2 bg-emerald-100 text-emerald-800 text-sm font-bold rounded-xl">
                              {formData.marketType}
                            </span>
                          )}
                          {formData.tradingStyle && (
                            <span className="px-3 py-2 bg-orange-100 text-orange-800 text-sm font-bold rounded-xl">
                              {formData.tradingStyle}
                            </span>
                          )}
                          {formData.timeframe && (
                            <span className="px-3 py-2 bg-purple-100 text-purple-800 text-sm font-bold rounded-xl">
                              {formData.timeframe}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                        <p className="text-sm font-bold text-gray-600 mb-3">Strategy Metrics</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-2"></div>
                            <p className="text-xs font-bold text-gray-600">Complexity</p>
                            <p className="text-sm font-black text-gray-900">{formData.complexity}</p>
                          </div>
                          <div className="text-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
                            <p className="text-xs font-bold text-gray-600">Session</p>
                            <p className="text-sm font-black text-gray-900">{formData.sessionTiming || 'TBD'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Trading Rules */}
            {currentStep === 2 && (
              <div className="space-y-10 animate-fade-in">
                <div className="text-center mb-12">
                  <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full font-bold text-lg shadow-xl mb-6">
                    <span className="text-2xl">⚡</span>
                    <span>Trading Rules</span>
                  </div>
                  <h3 className="text-4xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-4">
                    Strategy Logic & Conditions
                  </h3>
                  <p className="text-gray-600 text-xl leading-relaxed max-w-3xl mx-auto">
                    Define your trading setup, entry triggers, and exit conditions
                  </p>
                </div>

                <div className="space-y-10">
                  {/* Setup Conditions */}
                  <div className="bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 rounded-3xl p-10 border-3 border-orange-200 shadow-2xl">
                    <div className="flex items-center space-x-4 mb-8">
                      <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl flex items-center justify-center shadow-xl">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-3xl font-black text-orange-900">Market Setup Conditions *</h4>
                        <p className="text-orange-700 text-lg font-medium">What market conditions must be present for this strategy?</p>
                      </div>
                    </div>
                    <textarea
                      name="setupConditions"
                      value={formData.setupConditions}
                      onChange={handleInputChange}
                      rows={6}
                      className={`w-full px-8 py-6 bg-white border-3 ${
                        errors.setupConditions ? 'border-red-400 focus:border-red-500 focus:ring-red-500/30' : 'border-orange-200 focus:border-orange-500 focus:ring-orange-500/30'
                      } rounded-3xl focus:outline-none focus:ring-6 transition-all duration-300 text-gray-900 text-lg font-medium shadow-xl hover:shadow-2xl resize-none`}
                      placeholder="e.g., Price must be above 20 EMA on daily chart, RSI between 30-70, clear trend direction confirmed on higher timeframe, volume spike above average, no major news events expected..."
                    />
                    {errors.setupConditions && <p className="mt-4 text-red-600 flex items-center font-bold text-lg"><span className="mr-2">⚠️</span>{errors.setupConditions}</p>}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Entry Rules */}
                    <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-3xl p-8 border-3 border-green-200 shadow-2xl">
                      <div className="flex items-center space-x-4 mb-6">
                        <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-xl">
                          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-2xl font-black text-green-900">Entry Rules *</h4>
                          <p className="text-green-700 font-medium">Precise entry triggers and timing</p>
                        </div>
                      </div>
                      <textarea
                        name="entryRules"
                        value={formData.entryRules}
                        onChange={handleInputChange}
                        rows={8}
                        className={`w-full px-6 py-4 bg-white border-3 ${
                          errors.entryRules ? 'border-red-400 focus:border-red-500 focus:ring-red-500/30' : 'border-green-200 focus:border-green-500 focus:ring-green-500/30'
                        } rounded-2xl focus:outline-none focus:ring-6 transition-all duration-300 text-gray-900 font-medium resize-none shadow-lg`}
                        placeholder="e.g., Enter long when price breaks above resistance level with volume confirmation, RSI > 50, MACD crosses above signal line, wait for pullback to 50% Fibonacci level..."
                      />
                      {errors.entryRules && <p className="mt-3 text-red-600 flex items-center font-medium"><span className="mr-2">⚠️</span>{errors.entryRules}</p>}
                    </div>

                    {/* Exit Rules */}
                    <div className="bg-gradient-to-br from-red-50 via-pink-50 to-purple-50 rounded-3xl p-8 border-3 border-red-200 shadow-2xl">
                      <div className="flex items-center space-x-4 mb-6">
                        <div className="w-14 h-14 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl">
                          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-2xl font-black text-red-900">Exit Rules *</h4>
                          <p className="text-red-700 font-medium">Stop loss & take profit strategies</p>
                        </div>
                      </div>
                      <textarea
                        name="exitRules"
                        value={formData.exitRules}
                        onChange={handleInputChange}
                        rows={8}
                        className={`w-full px-6 py-4 bg-white border-3 ${
                          errors.exitRules ? 'border-red-400 focus:border-red-500 focus:ring-red-500/30' : 'border-red-200 focus:border-red-500 focus:ring-red-500/30'
                        } rounded-2xl focus:outline-none focus:ring-6 transition-all duration-300 text-gray-900 font-medium resize-none shadow-lg`}
                        placeholder="e.g., Take profit at 2:1 risk-reward ratio, Stop loss below support level, Use trailing stop when 1:1 R:R achieved, Exit if momentum indicators turn negative..."
                      />
                      {errors.exitRules && <p className="mt-3 text-red-600 flex items-center font-medium"><span className="mr-2">⚠️</span>{errors.exitRules}</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Risk & Performance */}
            {currentStep === 3 && (
              <div className="space-y-10 animate-fade-in">
                <div className="text-center mb-12">
                  <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-bold text-lg shadow-xl mb-6">
                    <span className="text-2xl">📊</span>
                    <span>Risk & Performance</span>
                  </div>
                  <h3 className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                    Risk Parameters & Metrics
                  </h3>
                  <p className="text-gray-600 text-xl leading-relaxed max-w-3xl mx-auto">
                    Set your risk management rules and performance expectations
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  {/* Risk Management */}
                  <div className="space-y-8">
                    <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 rounded-3xl p-8 border-3 border-purple-200 shadow-2xl">
                      <h4 className="text-2xl font-black text-purple-900 mb-8 flex items-center">
                        <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        Risk Management
                      </h4>

                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-wider">Max Risk Per Trade (%) *</label>
                            <input
                              type="number"
                              name="maxRisk"
                              value={formData.maxRisk}
                              onChange={handleInputChange}
                              step="0.1"
                              min="0.1"
                              max="10"
                              className={`w-full px-5 py-4 bg-white border-3 ${
                                errors.maxRisk ? 'border-red-400 focus:border-red-500' : 'border-purple-200 focus:border-purple-500'
                              } rounded-2xl focus:outline-none focus:ring-6 focus:ring-purple-500/30 text-gray-900 font-bold text-lg shadow-lg`}
                              placeholder="2.0"
                            />
                            {errors.maxRisk && <p className="mt-2 text-red-600 text-sm font-medium">⚠️ {errors.maxRisk}</p>}
                          </div>

                          <div>
                            <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-wider">Expected Win Rate (%) *</label>
                            <input
                              type="number"
                              name="winRate"
                              value={formData.winRate}
                              onChange={handleInputChange}
                              step="1"
                              min="10"
                              max="95"
                              className={`w-full px-5 py-4 bg-white border-3 ${
                                errors.winRate ? 'border-red-400 focus:border-red-500' : 'border-purple-200 focus:border-purple-500'
                              } rounded-2xl focus:outline-none focus:ring-6 focus:ring-purple-500/30 text-gray-900 font-bold text-lg shadow-lg`}
                              placeholder="65"
                            />
                            {errors.winRate && <p className="mt-2 text-red-600 text-sm font-medium">⚠️ {errors.winRate}</p>}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-wider">Profit Target (R:R)</label>
                            <input
                              type="text"
                              name="profitTarget"
                              value={formData.profitTarget}
                              onChange={handleInputChange}
                              className="w-full px-5 py-4 bg-white border-3 border-purple-200 focus:border-purple-500 rounded-2xl focus:outline-none focus:ring-6 focus:ring-purple-500/30 text-gray-900 font-bold text-lg shadow-lg"
                              placeholder="1:2, 1:3"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-wider">Max Consecutive Losses</label>
                            <input
                              type="number"
                              name="maxConsecutiveLosses"
                              value={formData.maxConsecutiveLosses}
                              onChange={handleInputChange}
                              min="1"
                              max="10"
                              className="w-full px-5 py-4 bg-white border-3 border-purple-200 focus:border-purple-500 rounded-2xl focus:outline-none focus:ring-6 focus:ring-purple-500/30 text-gray-900 font-bold text-lg shadow-lg"
                              placeholder="3"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-wider">Risk Management Rules</label>
                          <textarea
                            name="riskManagement"
                            value={formData.riskManagement}
                            onChange={handleInputChange}
                            rows={4}
                            className="w-full px-5 py-4 bg-white border-3 border-purple-200 focus:border-purple-500 rounded-2xl focus:outline-none focus:ring-6 focus:ring-purple-500/30 text-gray-900 font-medium resize-none shadow-lg"
                            placeholder="e.g., Never risk more than 2% per trade, Use position sizing calculator, Maximum 3 trades per day, Stop trading after 2 consecutive losses..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="space-y-8">
                    <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 rounded-3xl p-8 border-3 border-indigo-200 shadow-2xl">
                      <h4 className="text-2xl font-black text-indigo-900 mb-8 flex items-center">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        Performance Targets
                      </h4>

                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-wider">Monthly Target (%)</label>
                            <input
                              type="number"
                              name="monthlyTarget"
                              value={formData.monthlyTarget}
                              onChange={handleInputChange}
                              step="0.1"
                              min="0.1"
                              className="w-full px-5 py-4 bg-white border-3 border-indigo-200 focus:border-indigo-500 rounded-2xl focus:outline-none focus:ring-6 focus:ring-indigo-500/30 text-gray-900 font-bold text-lg shadow-lg"
                              placeholder="5.0"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-wider">Average Hold Time</label>
                            <input
                              type="text"
                              name="avgHoldTime"
                              value={formData.avgHoldTime}
                              onChange={handleInputChange}
                              className="w-full px-5 py-4 bg-white border-3 border-indigo-200 focus:border-indigo-500 rounded-2xl focus:outline-none focus:ring-6 focus:ring-indigo-500/30 text-gray-900 font-bold text-lg shadow-lg"
                              placeholder="2-4 hours"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-wider">Expected Drawdown (%)</label>
                            <input
                              type="number"
                              name="expectedDrawdown"
                              value={formData.expectedDrawdown}
                              onChange={handleInputChange}
                              step="0.1"
                              min="0.1"
                              className="w-full px-5 py-4 bg-white border-3 border-indigo-200 focus:border-indigo-500 rounded-2xl focus:outline-none focus:ring-6 focus:ring-indigo-500/30 text-gray-900 font-bold text-lg shadow-lg"
                              placeholder="10.0"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-wider">Minimum Capital ($)</label>
                            <input
                              type="number"
                              name="minCapital"
                              value={formData.minCapital}
                              onChange={handleInputChange}
                              min="100"
                              className="w-full px-5 py-4 bg-white border-3 border-indigo-200 focus:border-indigo-500 rounded-2xl focus:outline-none focus:ring-6 focus:ring-indigo-500/30 text-gray-900 font-bold text-lg shadow-lg"
                              placeholder="10000"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-wider">Technical Indicators</label>
                          <input
                            type="text"
                            name="indicators"
                            value={formData.indicators}
                            onChange={handleInputChange}
                            className="w-full px-5 py-4 bg-white border-3 border-indigo-200 focus:border-indigo-500 rounded-2xl focus:outline-none focus:ring-6 focus:ring-indigo-500/30 text-gray-900 font-medium shadow-lg"
                            placeholder="RSI, MACD, Moving Average, etc."
                          />
                          <div className="mt-4">
                            <p className="text-sm font-bold text-gray-700 mb-3">Popular Indicators:</p>
                            <div className="flex flex-wrap gap-2">
                              {popularIndicators.slice(0, 12).map((indicator) => (
                                <button
                                  key={indicator}
                                  type="button"
                                  onClick={() => addSuggestion('indicators', indicator)}
                                  className="px-3 py-2 bg-indigo-100 text-indigo-700 rounded-xl text-sm font-bold hover:bg-indigo-200 transition-all duration-200 shadow-md hover:shadow-lg"
                                >
                                  {indicator}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Analytics & Media */}
            {currentStep === 4 && (
              <div className="space-y-10 animate-fade-in">
                <div className="text-center mb-12">
                  <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-full font-bold text-lg shadow-xl mb-6">
                    <span className="text-2xl">📈</span>
                    <span>Analytics & Media</span>
                  </div>
                  <h3 className="text-4xl font-black bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
                    Backtest Data & Documentation
                  </h3>
                  <p className="text-gray-600 text-xl leading-relaxed max-w-3xl mx-auto">
                    Add backtest results, performance analytics, and visual examples
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  {/* Backtest & Analytics */}
                  <div className="space-y-8">
                    <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-3xl p-8 border-3 border-green-200 shadow-2xl">
                      <h4 className="text-2xl font-black text-green-900 mb-8 flex items-center">
                        <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                          </svg>
                        </div>
                        Backtest Analytics
                      </h4>

                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-wider">Backtest Period</label>
                            <input
                              type="text"
                              name="backtestPeriod"
                              value={formData.backtestPeriod}
                              onChange={handleInputChange}
                              className="w-full px-5 py-4 bg-white border-3 border-green-200 focus:border-green-500 rounded-2xl focus:outline-none focus:ring-6 focus:ring-green-500/30 text-gray-900 font-bold text-lg shadow-lg"
                              placeholder="2020-2023"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-wider">Sharpe Ratio</label>
                            <input
                              type="number"
                              name="sharpeRatio"
                              value={formData.sharpeRatio}
                              onChange={handleInputChange}
                              step="0.01"
                              className="w-full px-5 py-4 bg-white border-3 border-green-200 focus:border-green-500 rounded-2xl focus:outline-none focus:ring-6 focus:ring-green-500/30 text-gray-900 font-bold text-lg shadow-lg"
                              placeholder="1.25"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-wider">Strategy Tags</label>
                          <input
                            type="text"
                            name="tags"
                            value={formData.tags}
                            onChange={handleInputChange}
                            className="w-full px-5 py-4 bg-white border-3 border-green-200 focus:border-green-500 rounded-2xl focus:outline-none focus:ring-6 focus:ring-green-500/30 text-gray-900 font-medium shadow-lg"
                            placeholder="breakout, momentum, scalping, etc."
                          />
                          <div className="mt-4">
                            <p className="text-sm font-bold text-gray-700 mb-3">Popular Tags:</p>
                            <div className="flex flex-wrap gap-2">
                              {popularTags.slice(0, 12).map((tag) => (
                                <button
                                  key={tag}
                                  type="button"
                                  onClick={() => addSuggestion('tags', tag)}
                                  className="px-3 py-2 bg-green-100 text-green-700 rounded-xl text-sm font-bold hover:bg-green-200 transition-all duration-200 shadow-md hover:shadow-lg"
                                >
                                  {tag}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-8">
                    <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 rounded-3xl p-8 border-3 border-purple-200 shadow-2xl">
                      <h4 className="text-2xl font-black text-purple-900 mb-8 flex items-center">
                        <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        Chart Examples
                      </h4>

                      <div
                        onDrop={(e) => {
                          e.preventDefault();
                          const files = Array.from(e.dataTransfer.files);
                          const imageFiles = files.filter(file => file.type.startsWith('image/'));
                          if (imageFiles.length > 0) {
                            setImages(prev => [...prev, ...imageFiles]);
                          }
                        }}
                        onDragOver={(e) => e.preventDefault()}
                        className="border-3 border-dashed border-purple-300 rounded-3xl p-8 text-center hover:border-purple-500 transition-all duration-300 bg-white mb-6 shadow-lg hover:shadow-xl"
                      >
                        <div className="space-y-4">
                          <div className="w-16 h-16 bg-purple-500 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-gray-700 font-black text-xl mb-2">Upload Strategy Charts</p>
                            <p className="text-gray-500 text-lg mb-4">Drag & drop or click to select images</p>
                            <label className="inline-flex items-center px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-2xl cursor-pointer transition-all duration-200 font-bold text-lg shadow-lg hover:shadow-xl">
                              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                              Choose Files
                              <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                      </div>

                      {images.length > 0 && (
                        <div>
                          <p className="text-lg font-black text-gray-700 mb-4">
                            Uploaded Images ({images.length})
                          </p>
                          <div className="grid grid-cols-2 gap-4">
                            {images.map((file, index) => (
                              <div key={index} className="relative group">
                                <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden shadow-lg">
                                  <img
                                    src={URL.createObjectURL(file)}
                                    alt={`Upload ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 font-bold shadow-lg"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Finalization */}
            {currentStep === 5 && (
              <div className="space-y-10 animate-fade-in">
                <div className="text-center mb-12">
                  <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white px-6 py-3 rounded-full font-bold text-lg shadow-xl mb-6">
                    <span className="text-2xl">✅</span>
                    <span>Finalization</span>
                  </div>
                  <h3 className="text-4xl font-black bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-4">
                    Review & Create Strategy
                  </h3>
                  <p className="text-gray-600 text-xl leading-relaxed max-w-3xl mx-auto">
                    Review your strategy details and create your professional trading plan
                  </p>
                </div>

                {/* Comprehensive Review */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  {/* Strategy Summary */}
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 rounded-3xl p-8 border-3 border-emerald-200 shadow-2xl">
                      <h4 className="text-2xl font-black text-emerald-900 mb-6 flex items-center">
                        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        Strategy Overview
                      </h4>
                      <div className="space-y-4">
                        <div className="bg-white rounded-2xl p-4 shadow-md">
                          <p className="text-sm font-bold text-gray-600">Strategy Name</p>
                          <p className="font-black text-xl text-gray-900">{formData.name}</p>
                        </div>
                        <div className="bg-white rounded-2xl p-4 shadow-md">
                          <p className="text-sm font-bold text-gray-600">Market & Style</p>
                          <p className="font-bold text-gray-900">{formData.marketType} • {formData.tradingStyle} • {formData.timeframe}</p>
                        </div>
                        <div className="bg-white rounded-2xl p-4 shadow-md">
                          <p className="text-sm font-bold text-gray-600">Risk Management</p>
                          <p className="font-bold text-gray-900">Max Risk: {formData.maxRisk}% • Win Rate: {formData.winRate}%</p>
                        </div>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-8 border-3 border-blue-200 shadow-2xl">
                      <h4 className="text-2xl font-black text-blue-900 mb-6">Performance Metrics</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {formData.monthlyTarget && (
                          <div className="bg-white rounded-xl p-4 text-center shadow-md">
                            <p className="text-sm font-bold text-gray-600">Monthly Target</p>
                            <p className="font-black text-2xl text-blue-600">{formData.monthlyTarget}%</p>
                          </div>
                        )}
                        {formData.profitTarget && (
                          <div className="bg-white rounded-xl p-4 text-center shadow-md">
                            <p className="text-sm font-bold text-gray-600">Profit Target</p>
                            <p className="font-black text-2xl text-emerald-600">{formData.profitTarget}</p>
                          </div>
                        )}
                        {formData.sharpeRatio && (
                          <div className="bg-white rounded-xl p-4 text-center shadow-md">
                            <p className="text-sm font-bold text-gray-600">Sharpe Ratio</p>
                            <p className="font-black text-2xl text-purple-600">{formData.sharpeRatio}</p>
                          </div>
                        )}
                        {formData.expectedDrawdown && (
                          <div className="bg-white rounded-xl p-4 text-center shadow-md">
                            <p className="text-sm font-bold text-gray-600">Max Drawdown</p>
                            <p className="font-black text-2xl text-red-600">{formData.expectedDrawdown}%</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tags & Images */}
                  <div className="space-y-6">
                    {formData.tags && (
                      <div className="bg-white rounded-3xl p-8 border-3 border-gray-200 shadow-2xl">
                        <h4 className="text-2xl font-black text-gray-900 mb-6">Strategy Tags</h4>
                        <div className="flex flex-wrap gap-3">
                          {formData.tags.split(',').map((tag: string, index: number) => (
                            <span key={index} className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-sm font-bold rounded-xl shadow-md">
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {images.length > 0 && (
                      <div className="bg-white rounded-3xl p-8 border-3 border-gray-200 shadow-2xl">
                        <h4 className="text-2xl font-black text-gray-900 mb-6">Strategy Examples ({images.length})</h4>
                        <div className="grid grid-cols-2 gap-4">
                          {images.slice(0, 4).map((file, index) => (
                            <div key={index} className="aspect-square bg-gray-100 rounded-2xl overflow-hidden shadow-lg">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Example ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                        {images.length > 4 && (
                          <p className="text-center text-gray-600 mt-4 font-medium">
                            +{images.length - 4} more images
                          </p>
                        )}
                      </div>
                    )}

                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl p-8 border-3 border-yellow-200 shadow-2xl">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-yellow-500 rounded-xl flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h4 className="text-xl font-black text-yellow-900">Ready to Create!</h4>
                      </div>
                      <p className="text-yellow-800 font-medium leading-relaxed">
                        Your strategy is complete and ready to be created. Click "Create Strategy" to add it to your trading arsenal.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center pt-10 border-t border-gray-200 bg-gradient-to-r from-gray-50 via-white to-gray-50 rounded-3xl p-8 mt-12 shadow-xl">
              <button
                type="button"
                onClick={currentStep === 1 ? onClose : handlePrev}
                className="group flex items-center space-x-3 px-8 py-4 bg-white hover:bg-gray-100 text-gray-700 rounded-2xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl border-2 border-gray-200 hover:border-gray-300"
              >
                <svg className="w-6 h-6 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>{currentStep === 1 ? 'Cancel' : 'Previous'}</span>
              </button>

              <div className="flex items-center space-x-4">
                <span className="text-sm font-bold text-gray-600">Step {currentStep} of 5</span>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((step) => (
                    <div
                      key={step}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        step <= currentStep ? 'bg-blue-500 shadow-lg' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="group flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-2xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <span>Next Step</span>
                  <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-2xl font-bold transition-all duration-300 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>{isEditMode ? 'Updating...' : 'Creating...'}</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{isEditMode ? 'Update Strategy' : 'Create Strategy'}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
