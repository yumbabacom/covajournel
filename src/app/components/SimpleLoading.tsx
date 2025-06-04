'use client';

import React from 'react';

interface SimpleLoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  type?: 'spinner' | 'dots' | 'pulse' | 'bars' | 'skeleton';
  className?: string;
}

interface SkeletonProps {
  className?: string;
  count?: number;
  height?: string;
  width?: string;
}

export function Skeleton({ className = '', count = 1, height = 'h-4', width = 'w-full' }: SkeletonProps) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`skeleton rounded-md ${height} ${width} ${className}`}
          style={{ animationDelay: `${index * 0.1}s` }}
        />
      ))}
    </div>
  );
}

export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white rounded-xl p-6 border border-gray-200 ${className}`}>
      <div className="flex items-center space-x-4 mb-4">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1">
          <Skeleton height="h-4" width="w-3/4" />
          <Skeleton height="h-3" width="w-1/2" className="mt-2" />
        </div>
      </div>
      <Skeleton count={3} className="mb-2" />
      <div className="flex space-x-2 mt-4">
        <Skeleton height="h-8" width="w-20" />
        <Skeleton height="h-8" width="w-24" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="overflow-hidden border border-gray-200 rounded-lg">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
        <div className="flex space-x-4">
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton key={index} height="h-4" width="w-20" />
          ))}
        </div>
      </div>
      
      {/* Rows */}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4">
            <div className="flex space-x-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton 
                  key={colIndex} 
                  height="h-4" 
                  width={colIndex === 0 ? "w-32" : "w-24"} 
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChartSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white rounded-xl p-6 border border-gray-200 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <Skeleton height="h-6" width="w-32" />
        <Skeleton height="h-8" width="w-24" />
      </div>
      
      <div className="relative h-64 bg-gray-50 rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-end justify-between px-4 pb-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="skeleton w-8 rounded-sm"
              style={{
                height: `${Math.random() * 70 + 30}%`,
                animationDelay: `${index * 0.1}s`
              }}
            />
          ))}
        </div>
      </div>
      
      <div className="flex justify-between mt-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="text-center">
            <Skeleton height="h-3" width="w-12" className="mb-1" />
            <Skeleton height="h-4" width="w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SimpleLoading({ 
  size = 'md', 
  text = 'Loading...', 
  type = 'spinner',
  className = ''
}: SimpleLoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  if (type === 'skeleton') {
    return <Skeleton className={className} />;
  }

  const renderSpinner = () => (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-500 ${sizeClasses[size]}`} />
  );

  const renderDots = () => (
    <div className="flex space-x-1">
      {[0, 150, 300].map((delay, index) => (
        <div 
          key={index}
          className={`bg-blue-500 rounded-full animate-bounce ${
            size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4'
          }`} 
          style={{ animationDelay: `${delay}ms` }} 
        />
      ))}
    </div>
  );

  const renderPulse = () => (
    <div className={`bg-blue-500 rounded-full animate-pulse ${sizeClasses[size]}`} />
  );

  const renderBars = () => (
    <div className="flex space-x-1 items-end">
      {[0, 150, 300, 450].map((delay, index) => (
        <div 
          key={index}
          className={`bg-blue-500 animate-pulse ${
            size === 'sm' 
              ? `w-1 ${index % 2 === 0 ? 'h-4' : 'h-6'}` 
              : size === 'md' 
                ? `w-2 ${index % 2 === 0 ? 'h-6' : 'h-8'}` 
                : `w-3 ${index % 2 === 0 ? 'h-8' : 'h-10'}`
          }`} 
          style={{ animationDelay: `${delay}ms` }} 
        />
      ))}
    </div>
  );

  const renderLoader = () => {
    switch (type) {
      case 'dots': return renderDots();
      case 'pulse': return renderPulse();
      case 'bars': return renderBars();
      default: return renderSpinner();
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      {renderLoader()}
      {text && (
        <p className={`text-gray-600 dark:text-gray-400 font-medium ${textSizeClasses[size]} text-center`}>
          {text}
        </p>
      )}
    </div>
  );
}

// Enhanced full page loading overlay
interface SimpleLoadingOverlayProps {
  isVisible: boolean;
  text?: string;
  type?: 'spinner' | 'dots' | 'pulse' | 'bars';
  backdrop?: boolean;
}

export function SimpleLoadingOverlay({ 
  isVisible, 
  text = 'Loading...', 
  type = 'spinner',
  backdrop = true
}: SimpleLoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${
      backdrop ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm' : ''
    }`}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-2xl border border-gray-200 dark:border-slate-700 max-w-sm w-full mx-4">
        <SimpleLoading size="lg" text={text} type={type} />
      </div>
    </div>
  );
}

// Enhanced button loading state
interface SimpleButtonLoadingProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  size?: 'sm' | 'md' | 'lg';
}

export function SimpleButtonLoading({ 
  isLoading, 
  children, 
  loadingText = 'Loading...', 
  className = '',
  onClick,
  disabled = false,
  type = 'button',
  size = 'md'
}: SimpleButtonLoadingProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const spinnerSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        relative inline-flex items-center justify-center font-semibold rounded-lg
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${className}
      `}
    >
      <div className={`flex items-center justify-center space-x-2 ${isLoading ? 'opacity-100' : 'opacity-100'}`}>
        {isLoading && (
          <div className={`animate-spin rounded-full border-2 border-current border-t-transparent ${spinnerSizes[size]}`} />
        )}
        <span>{isLoading ? loadingText : children}</span>
      </div>
    </button>
  );
}

// Page loading component for route transitions
export function PageLoading({ text = 'Loading page...' }: { text?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">{text}</p>
      </div>
    </div>
  );
}

// Dashboard skeleton loading component
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="mb-8">
        <Skeleton height="h-8" width="w-80" className="mb-2" />
        <Skeleton height="h-6" width="w-96" />
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="w-12 h-12 rounded-xl" />
            </div>
            <Skeleton height="h-4" width="w-20" className="mb-2" />
            <Skeleton height="h-6" width="w-16" />
          </div>
        ))}
      </div>

      {/* Calendar and content grid skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Calendar skeleton */}
        <div className="xl:col-span-2 bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <Skeleton height="h-6" width="w-32" />
            <Skeleton height="h-6" width="w-24" />
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, index) => (
              <Skeleton key={index} className="w-10 h-10 rounded-lg" />
            ))}
          </div>
        </div>

        {/* Sidebar content skeleton */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <Skeleton height="h-6" width="w-32" className="mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="flex-1">
                    <Skeleton height="h-4" width="w-20" />
                    <Skeleton height="h-3" width="w-16" className="mt-1" />
                  </div>
                  <Skeleton height="h-4" width="w-12" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <Skeleton height="h-6" width="w-28" className="mb-4" />
            <ChartSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}

// Strategy library skeleton
export function StrategyLibrarySkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <Skeleton height="h-8" width="w-64" className="mb-2" />
        <Skeleton height="h-6" width="w-96" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
        <div className="flex flex-wrap gap-4">
          <Skeleton height="h-10" width="w-32" />
          <Skeleton height="h-10" width="w-28" />
          <Skeleton height="h-10" width="w-24" />
          <Skeleton height="h-10" width="w-20" />
        </div>
      </div>

      {/* Strategy cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

// Trading journal skeleton
export function TradingJournalSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <Skeleton height="h-8" width="w-64" className="mb-2" />
        <Skeleton height="h-6" width="w-96" />
      </div>

      {/* Filters and search */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
          <Skeleton height="h-10" width="w-64" />
          <div className="flex space-x-2">
            <Skeleton height="h-10" width="w-24" />
            <Skeleton height="h-10" width="w-28" />
            <Skeleton height="h-10" width="w-32" />
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <Skeleton height="h-6" width="w-16" />
            </div>
            <Skeleton height="h-4" width="w-20" className="mb-2" />
            <Skeleton height="h-8" width="w-24" />
          </div>
        ))}
      </div>

      {/* Trades table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <Skeleton height="h-6" width="w-32" />
        </div>
        <TableSkeleton rows={8} columns={7} />
      </div>
    </div>
  );
}

// Inline loading for small components
export function InlineLoading({ size = 'sm' }: { size?: 'xs' | 'sm' | 'md' }) {
  const spinnerSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5'
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-500 ${spinnerSizes[size]}`} />
  );
}
