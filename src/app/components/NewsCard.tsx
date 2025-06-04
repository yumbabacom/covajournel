'use client';

import React from 'react';
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

interface NewsCardProps {
  article: NewsArticle;
  onClick?: () => void;
}

export default function NewsCard({ article, onClick }: NewsCardProps) {
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

  const getCurrencyFlag = (currency: string) => {
    const currencyMap: { [key: string]: string } = {
      'USD': 'US',
      'EUR': 'EU',
      'GBP': 'GB',
      'JPY': 'JP',
      'CHF': 'CH',
      'CAD': 'CA',
      'AUD': 'AU',
      'NZD': 'NZ',
      'CNY': 'CN',
      'SEK': 'SE',
      'NOK': 'NO',
      'DKK': 'DK'
    };
    return currencyMap[currency] || 'US';
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div 
      className={`group relative bg-white/90 backdrop-blur-xl rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${
        onClick ? 'cursor-pointer hover:scale-[1.02]' : ''
      }`}
      onClick={onClick}
    >
      {/* Glassmorphic overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative p-4">
        {/* Header with currency, impact, and status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 flex-wrap">
            <FlagIcon
              countryCode={getCurrencyFlag(article.currency)}
              className="w-5 h-4 rounded shadow-sm"
            />
            <span className="text-sm font-semibold text-gray-700">{article.currency}</span>
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
                <span className="text-xs font-bold text-blue-600">AI</span>
              </div>
            )}
          </div>
          <span className="text-xs text-gray-500 font-medium">
            {formatTime(article.publishedAt)}
          </span>
        </div>

        {/* Title */}
        <h4 className="text-sm font-bold text-gray-900 mb-2 line-clamp-2 leading-tight">
          {article.title}
        </h4>

        {/* Summary */}
        <p className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed">
          {article.summary}
        </p>

        {/* AI Signal Preview */}
        {article.aiSignal && (
          <div className="mb-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-2 h-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-blue-800">
                  {article.aiSignal.direction.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-12 bg-gray-200 rounded-full h-1">
                  <div
                    className="bg-blue-500 h-1 rounded-full"
                    style={{ width: `${article.aiSignal.confidence}%` }}
                  ></div>
                </div>
                <span className="text-xs font-bold text-blue-600">{article.aiSignal.confidence}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-gray-500">Source:</span>
            <span className="text-xs font-semibold text-gray-700 truncate">{article.source}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-xs font-medium text-orange-600">{article.category}</span>
            {onClick && (
              <svg className="w-3 h-3 text-gray-400 group-hover:text-orange-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </div>
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {article.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
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
      </div>
    </div>
  );
}
