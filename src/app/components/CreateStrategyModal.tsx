'use client';

import { useState } from 'react';

interface CreateStrategyModalProps {
  onClose: () => void;
  onSubmit: (strategyData: any) => void;
  editStrategy?: any; // Strategy to edit (if provided, modal is in edit mode)
  isEditMode?: boolean;
}

export default function CreateStrategyModal({ onClose, onSubmit, editStrategy, isEditMode = false }: CreateStrategyModalProps) {
  const [formData, setFormData] = useState({
    name: editStrategy?.name || '',
    marketType: editStrategy?.marketType || '',
    setupConditions: editStrategy?.setupConditions || '',
    entryRules: editStrategy?.entryRules || '',
    exitRules: editStrategy?.exitRules || '',
    timeframe: editStrategy?.timeframe || '',
    indicators: editStrategy?.indicators ? editStrategy.indicators.join(', ') : '',
    tags: editStrategy?.tags ? editStrategy.tags.join(', ') : '',
  });
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const marketTypes = ['Forex', 'Stocks', 'Crypto', 'Options', 'Futures', 'Commodities', 'Indices', 'Bonds'];
  const timeframes = ['1min', '5min', '15min', '30min', '1H', '4H', '1D', '1W', '1M'];

  // Popular indicators for suggestions
  const popularIndicators = [
    'RSI', 'MACD', 'Moving Average', 'Bollinger Bands', 'Stochastic',
    'ATR', 'Volume', 'Support/Resistance', 'Fibonacci', 'Ichimoku'
  ];

  // Popular tags for suggestions
  const popularTags = [
    'Breakout', 'Scalping', 'Swing Trading', 'Trend Following', 'Mean Reversion',
    'Momentum', 'Counter Trend', 'News Trading', 'High Frequency', 'Position Trading'
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const addSuggestion = (field: 'indicators' | 'tags', suggestion: string) => {
    const currentValue = formData[field];
    const items = currentValue ? currentValue.split(',').map(item => item.trim()) : [];

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
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert images to base64 for storage
      const imagePromises = images.map(image => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(image);
        });
      });

      const imageUrls = await Promise.all(imagePromises);

      const strategyData = {
        ...formData,
        indicators: formData.indicators.split(',').map(i => i.trim()).filter(i => i),
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-lg flex items-center justify-center z-50 p-4">
      <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-5xl max-h-[90vh] overflow-hidden mx-auto">
        {/* Beautiful Header */}
        <div className="relative px-8 py-6 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-b border-gray-200">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h2 className="text-3xl font-black text-gray-900">
                  {isEditMode ? 'Edit Strategy' : 'Create New Strategy'}
                </h2>
                <p className="text-lg text-gray-600 mt-1">
                  {isEditMode
                    ? 'Update your trading strategy rules, conditions, and details'
                    : 'Define your trading strategy with detailed rules, conditions, and performance tracking'
                  }
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="group w-12 h-12 bg-white/80 hover:bg-red-500 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-200"
            >
              <svg className="w-6 h-6 text-gray-600 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Beautiful Content */}
        <div className="p-8 max-h-[calc(95vh-160px)] overflow-y-auto bg-gradient-to-br from-gray-50/50 to-white">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Basic Information */}
              <div className="relative bg-gradient-to-br from-blue-50 to-white rounded-3xl border border-blue-200 p-8 shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl"></div>
                <div className="relative">
                  <div className="flex items-center space-x-3 mb-8">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Basic Information</h3>
                  </div>

                {/* Strategy Name */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
                    Strategy Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      className={`w-full pl-16 pr-4 py-4 bg-gray-50 border-2 ${
                        errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500/50' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/50'
                      } rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 text-gray-900 text-lg shadow-sm hover:shadow-md`}
                      placeholder="e.g., Breakout Momentum Strategy, RSI Reversal Setup"
                    />
                  </div>
                  {errors.name && (
                    <div className="mt-2 flex items-center text-red-600 text-sm">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {errors.name}
                    </div>
                  )}
                  <div className="mt-2 text-xs text-gray-500">
                    Choose a descriptive name that clearly identifies your strategy
                  </div>
                </div>

                {/* Market Type */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
                    Market Type *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16l-3-3m3 3l3-3" />
                        </svg>
                      </div>
                    </div>
                    <select
                      name="marketType"
                      value={formData.marketType}
                      onChange={handleInputChange}
                      required
                      className={`w-full pl-16 pr-12 py-4 bg-gray-50 border-2 ${
                        errors.marketType ? 'border-red-300 focus:border-red-500 focus:ring-red-500/50' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/50'
                      } rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 text-gray-900 text-lg shadow-sm hover:shadow-md appearance-none cursor-pointer`}
                    >
                      <option value="" className="text-gray-900">Select Market Type</option>
                      {marketTypes.map(type => (
                        <option key={type} value={type} className="text-gray-900">{type}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {errors.marketType && (
                    <div className="mt-2 flex items-center text-red-600 text-sm">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {errors.marketType}
                    </div>
                  )}
                </div>

                {/* Timeframe */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
                    Trading Timeframe *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <select
                      name="timeframe"
                      value={formData.timeframe}
                      onChange={handleInputChange}
                      required
                      className={`w-full pl-16 pr-12 py-4 bg-gray-50 border-2 ${
                        errors.timeframe ? 'border-red-300 focus:border-red-500 focus:ring-red-500/50' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/50'
                      } rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 text-gray-900 text-lg shadow-sm hover:shadow-md appearance-none cursor-pointer`}
                    >
                      <option value="" className="text-gray-900">Select Timeframe</option>
                      {timeframes.map(tf => (
                        <option key={tf} value={tf} className="text-gray-900">{tf}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {errors.timeframe && (
                    <div className="mt-2 flex items-center text-red-600 text-sm">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {errors.timeframe}
                    </div>
                  )}
                </div>

                {/* Indicators */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
                    Technical Indicators
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                    </div>
                    <input
                      type="text"
                      name="indicators"
                      value={formData.indicators}
                      onChange={handleInputChange}
                      className="w-full pl-16 pr-4 py-4 bg-gray-50 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/50 rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 text-gray-900 text-lg shadow-sm hover:shadow-md"
                      placeholder="e.g., RSI, MACD, Moving Average (comma separated)"
                    />
                  </div>
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-2">Popular indicators (click to add):</p>
                    <div className="flex flex-wrap gap-2">
                      {popularIndicators.map((indicator) => (
                        <button
                          key={indicator}
                          type="button"
                          onClick={() => addSuggestion('indicators', indicator)}
                          className="px-3 py-1 bg-orange-100 hover:bg-orange-200 text-orange-700 text-xs rounded-lg font-medium transition-colors duration-200 border border-orange-200 hover:border-orange-300"
                        >
                          + {indicator}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
                    Strategy Tags
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                    </div>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      className="w-full pl-16 pr-4 py-4 bg-gray-50 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/50 rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 text-gray-900 text-lg shadow-sm hover:shadow-md"
                      placeholder="e.g., Breakout, Scalping, Trend Following (comma separated)"
                    />
                  </div>
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-2">Popular tags (click to add):</p>
                    <div className="flex flex-wrap gap-2">
                      {popularTags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => addSuggestion('tags', tag)}
                          className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 text-xs rounded-lg font-medium transition-colors duration-200 border border-purple-200 hover:border-purple-300"
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                </div>
              </div>

              {/* Right Column - Strategy Rules */}
              <div className="relative bg-gradient-to-br from-purple-50 to-white rounded-3xl border border-purple-200 p-8 shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-3xl"></div>
                <div className="relative">
                  <div className="flex items-center space-x-3 mb-8">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Strategy Rules</h3>
                  </div>

                {/* Setup Conditions */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
                    Setup Conditions *
                  </label>
                  <textarea
                    name="setupConditions"
                    value={formData.setupConditions}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className={`w-full px-4 py-4 bg-gray-50 border-2 ${
                      errors.setupConditions ? 'border-red-300 focus:border-red-500 focus:ring-red-500/50' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/50'
                    } rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 text-gray-900 resize-none shadow-sm hover:shadow-md`}
                    placeholder="Describe the market conditions required for this strategy...

Example:
• Market must be in a clear uptrend
• Price above 20 EMA
• RSI between 30-70
• Volume above average"
                  />
                  {errors.setupConditions && (
                    <div className="mt-2 flex items-center text-red-600 text-sm">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {errors.setupConditions}
                    </div>
                  )}
                  <div className="mt-2 text-xs text-gray-500">
                    {formData.setupConditions.length}/500 characters
                  </div>
                </div>

                {/* Entry Rules */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
                    Entry Rules *
                  </label>
                  <textarea
                    name="entryRules"
                    value={formData.entryRules}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className={`w-full px-4 py-4 bg-gray-50 border-2 ${
                      errors.entryRules ? 'border-red-300 focus:border-red-500 focus:ring-red-500/50' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/50'
                    } rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 text-gray-900 resize-none shadow-sm hover:shadow-md`}
                    placeholder="Define when and how to enter trades...

Example:
• Wait for pullback to 20 EMA
• Enter on bullish engulfing candle
• Stop loss below recent swing low
• Risk 1-2% of account"
                  />
                  {errors.entryRules && (
                    <div className="mt-2 flex items-center text-red-600 text-sm">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {errors.entryRules}
                    </div>
                  )}
                  <div className="mt-2 text-xs text-gray-500">
                    {formData.entryRules.length}/500 characters
                  </div>
                </div>

                {/* Exit Rules */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
                    Exit Rules *
                  </label>
                  <textarea
                    name="exitRules"
                    value={formData.exitRules}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className={`w-full px-4 py-4 bg-gray-50 border-2 ${
                      errors.exitRules ? 'border-red-300 focus:border-red-500 focus:ring-red-500/50' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/50'
                    } rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 text-gray-900 resize-none shadow-sm hover:shadow-md`}
                    placeholder="Define when and how to exit trades...

Example:
• Take profit at 2:1 risk/reward
• Trail stop loss after 1:1 R/R
• Exit if RSI reaches overbought
• Close before major news events"
                  />
                  {errors.exitRules && (
                    <div className="mt-2 flex items-center text-red-600 text-sm">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {errors.exitRules}
                    </div>
                  )}
                  <div className="mt-2 text-xs text-gray-500">
                    {formData.exitRules.length}/500 characters
                  </div>
                </div>
                </div>
              </div>
            </div>

            {/* Beautiful Image Upload Section */}
            <div className="relative bg-gradient-to-br from-emerald-50 to-white rounded-3xl border border-emerald-200 p-8 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-blue-500/5 rounded-3xl"></div>
              <div className="relative">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Screenshots & Images</h3>
                </div>

                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  <div className="relative border-2 border-dashed border-emerald-300 rounded-2xl p-12 text-center hover:border-emerald-400 transition-colors bg-white/80 backdrop-blur-sm">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 mb-3">Upload Strategy Screenshots</p>
                      <p className="text-lg text-gray-600 mb-2">Drag & drop images here or click to browse</p>
                      <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                    </label>
                  </div>
                </div>

              {/* Image Preview */}
              {images.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Uploaded Images ({images.length})
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-32 object-cover rounded-xl border border-gray-200 group-hover:scale-105 transition-transform duration-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-lg">
                          Image {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            </div>

            {/* Beautiful Action Buttons */}
            <div className="relative bg-gradient-to-r from-gray-50 to-white rounded-3xl border border-gray-200 p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600">By creating this strategy, you can track its performance across all your trades</p>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-2xl font-bold transition-all duration-300 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl hover:scale-105 flex items-center space-x-3"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                    {isSubmitting ? (
                      <>
                        <div className="relative w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span className="relative">{isEditMode ? 'Updating Strategy...' : 'Creating Strategy...'}</span>
                      </>
                    ) : (
                      <>
                        <svg className="relative w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isEditMode ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" : "M12 6v6m0 0v6m0-6h6m-6 0H6"} />
                        </svg>
                        <span className="relative">{isEditMode ? 'Update Strategy' : 'Create Strategy'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
