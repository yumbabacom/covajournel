'use client';

import React, { useEffect } from 'react';
import { FlagIcon } from './FlagIcon';

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  publishedAt: string;
  source: string;
  category: string;
  impact: 'low' | 'medium' | 'high';
  currency: string;
  tags: string[];
  status: 'live' | 'upcoming' | 'released';
  aiSignal?: {
    direction: 'bullish' | 'bearish' | 'neutral';
    confidence: number;
    recommendation: string;
    targetPrice?: string;
    stopLoss?: string;
  };
}

interface NewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  news: NewsArticle[];
}

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: NewsArticle | null;
}

// Detailed Article Modal Component
function DetailModal({ isOpen, onClose, article }: DetailModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !article) return null;

  const getCurrencyFlag = (currency: string) => {
    const currencyMap: { [key: string]: string } = {
      'USD': 'US', 'EUR': 'EU', 'GBP': 'GB', 'JPY': 'JP',
      'CHF': 'CH', 'CAD': 'CA', 'AUD': 'AU', 'NZD': 'NZ'
    };
    return currencyMap[currency] || 'US';
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSignalColor = (direction: string) => {
    switch (direction) {
      case 'bullish':
        return 'bg-green-500 text-white';
      case 'bearish':
        return 'bg-red-500 text-white';
      case 'neutral':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'released':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <FlagIcon
                  countryCode={getCurrencyFlag(article.currency)}
                  className="w-8 h-6 rounded shadow-lg"
                />
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    Full Article Details
                  </h3>
                  <p className="text-white/90 mt-1">
                    {article.currency} • {article.category}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors duration-200"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {/* Article Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`px-3 py-1 rounded-lg text-sm font-bold border ${getImpactColor(article.impact)}`}>
                  {article.impact.toUpperCase()} IMPACT
                </div>
                <div className={`px-3 py-1 rounded-lg text-sm font-bold border ${getStatusColor(article.status)} flex items-center space-x-1`}>
                  {article.status === 'live' && <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>}
                  {article.status === 'upcoming' && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                  {article.status === 'released' && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                  <span>{article.status.toUpperCase()}</span>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(article.publishedAt).toLocaleString()}
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-600">{article.source}</span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
              {article.title}
            </h1>

            <p className="text-lg text-gray-700 leading-relaxed mb-6 font-medium">
              {article.summary}
            </p>
          </div>

          {/* AI Signal Section */}
          {article.aiSignal && (
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    AI Trading Signal
                  </h3>
                  <div className={`px-3 py-1 rounded-full text-sm font-bold ${getSignalColor(article.aiSignal.direction)}`}>
                    {article.aiSignal.direction.toUpperCase()}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <p className="text-sm font-medium text-gray-600 mb-1">Confidence Level</p>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${article.aiSignal.confidence}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-blue-600">{article.aiSignal.confidence}%</span>
                    </div>
                  </div>

                  {article.aiSignal.targetPrice && (
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <p className="text-sm font-medium text-gray-600 mb-1">Target Price</p>
                      <p className="text-lg font-bold text-green-600">{article.aiSignal.targetPrice}</p>
                    </div>
                  )}

                  {article.aiSignal.stopLoss && (
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <p className="text-sm font-medium text-gray-600 mb-1">Stop Loss</p>
                      <p className="text-lg font-bold text-red-600">{article.aiSignal.stopLoss}</p>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <p className="text-sm font-medium text-gray-600 mb-2">AI Recommendation</p>
                  <p className="text-gray-800 leading-relaxed">{article.aiSignal.recommendation}</p>
                </div>
              </div>
            </div>
          )}

          {/* Full Content */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Full Analysis</h3>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {article.content}
              </p>
            </div>
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Related Topics</h4>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Published by <span className="font-semibold text-gray-700">{article.source}</span>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewsModal({ isOpen, onClose, date, news }: NewsModalProps) {
  const [selectedArticle, setSelectedArticle] = React.useState<NewsArticle | null>(null);
  const [showDetailModal, setShowDetailModal] = React.useState(false);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const getCurrencyFlag = (currency: string) => {
    const currencyMap: { [key: string]: string } = {
      'USD': 'US', 'EUR': 'EU', 'GBP': 'GB', 'JPY': 'JP',
      'CHF': 'CH', 'CAD': 'CA', 'AUD': 'AU', 'NZD': 'NZ'
    };
    return currencyMap[currency] || 'US';
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'released':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleArticleClick = (article: NewsArticle) => {
    setSelectedArticle(article);
    setShowDetailModal(true);
  };

  const handleDetailModalClose = () => {
    setShowDetailModal(false);
    setSelectedArticle(null);
  };

  if (!isOpen || !date) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">
                  News & Events for {date.toLocaleDateString()}
                </h3>
                <p className="text-white/90 mt-1">
                  AI-powered market analysis and economic insights
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors duration-200"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {news.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📰</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No News Available</h3>
              <p className="text-gray-600">No news articles found for this date.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {news.map((article, index) => (
                <div
                  key={article.id}
                  onClick={() => handleArticleClick(article)}
                  className="group bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-[1.02] overflow-hidden"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeInUp 0.6s ease-out forwards'
                  }}
                >
                  <div className="p-5">
                    {/* Article Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2 flex-wrap">
                        <FlagIcon
                          countryCode={getCurrencyFlag(article.currency)}
                          className="w-6 h-4 rounded shadow-sm"
                        />
                        <span className="text-sm font-semibold text-gray-600">{article.currency}</span>
                        <div className={`px-2 py-1 rounded-lg text-xs font-bold border ${getImpactColor(article.impact)}`}>
                          {article.impact.toUpperCase()}
                        </div>
                        <div className={`px-2 py-1 rounded-lg text-xs font-bold border ${getStatusColor(article.status)} flex items-center space-x-1`}>
                          {article.status === 'live' && <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>}
                          {article.status === 'upcoming' && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>}
                          {article.status === 'released' && <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>}
                          <span>{article.status.toUpperCase()}</span>
                        </div>
                        {article.aiSignal && (
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-bold text-blue-600">AI SIGNAL</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {new Date(article.publishedAt).toLocaleTimeString()}
                        </span>
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>

                    {/* Article Title */}
                    <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors duration-200 line-clamp-2">
                      {article.title}
                    </h4>

                    {/* Article Summary */}
                    <p className="text-sm text-gray-600 mb-3 leading-relaxed line-clamp-2">
                      {article.summary}
                    </p>

                    {/* AI Signal Preview */}
                    {article.aiSignal && (
                      <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            </div>
                            <span className="text-sm font-semibold text-blue-800">
                              {article.aiSignal.direction.toUpperCase()} Signal
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-1.5">
                              <div
                                className="bg-blue-500 h-1.5 rounded-full"
                                style={{ width: `${article.aiSignal.confidence}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-bold text-blue-600">{article.aiSignal.confidence}%</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tags Preview */}
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {article.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                        {article.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md font-medium">
                            +{article.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Article Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <span className="text-xs font-medium text-gray-500">Source:</span>
                          <span className="text-xs font-semibold text-gray-700">{article.source}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-xs font-medium text-gray-500">Category:</span>
                          <span className="text-xs font-semibold text-orange-600">{article.category}</span>
                        </div>
                      </div>
                      <button className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors duration-200">
                        Read Full Article →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail Modal */}
        <DetailModal
          isOpen={showDetailModal}
          onClose={handleDetailModalClose}
          article={selectedArticle}
        />
      </div>

      {/* CSS Animation Keyframes */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
