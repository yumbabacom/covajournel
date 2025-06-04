'use client';

import React from 'react';

interface SimpleCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'sm' | 'md' | 'lg' | 'xl';
  border?: boolean;
  onClick?: () => void;
}

export default function SimpleCard({
  children,
  className = '',
  hover = true,
  padding = 'md',
  shadow = 'sm',
  rounded = 'xl',
  border = true,
  onClick
}: SimpleCardProps) {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const shadowClasses = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };

  const roundedClasses = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl'
  };

  const baseClasses = `
    bg-white dark:bg-slate-800 
    ${paddingClasses[padding]} 
    ${shadowClasses[shadow]} 
    ${roundedClasses[rounded]}
    ${border ? 'border border-gray-200 dark:border-slate-700' : ''}
    ${hover ? 'hover:shadow-md transition-shadow duration-200' : ''}
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={baseClasses} onClick={onClick}>
      {children}
    </div>
  );
}

// Stat Card Component
interface SimpleStatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'purple' | 'red' | 'yellow' | 'gray';
  onClick?: () => void;
}

export function SimpleStatCard({
  title,
  value,
  icon,
  trend,
  color = 'blue',
  onClick
}: SimpleStatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
    gray: 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400'
  };

  return (
    <SimpleCard hover={!!onClick} onClick={onClick}>
      <div className="flex items-center">
        {icon && (
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${colorClasses[color]}`}>
            {icon}
          </div>
        )}
        <div className="flex-1">
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <div className="flex items-center space-x-2">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            {trend && (
              <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
              </span>
            )}
          </div>
        </div>
      </div>
    </SimpleCard>
  );
}

// Feature Card Component
interface SimpleFeatureCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  color?: 'blue' | 'green' | 'purple' | 'red' | 'yellow';
}

export function SimpleFeatureCard({
  title,
  description,
  icon,
  action,
  color = 'blue'
}: SimpleFeatureCardProps) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
    purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
    red: 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
    yellow: 'from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700'
  };

  const iconColorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
  };

  return (
    <SimpleCard>
      <div className="text-center">
        {icon && (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${iconColorClasses[color]}`}>
            {icon}
          </div>
        )}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{description}</p>
        {action && (
          <button
            onClick={action.onClick}
            className={`w-full bg-gradient-to-r ${colorClasses[color]} text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg`}
          >
            {action.label}
          </button>
        )}
      </div>
    </SimpleCard>
  );
}

// Event Card Component
interface SimpleEventCardProps {
  time: string;
  title: string;
  description?: string;
  currency?: string;
  importance?: 'low' | 'medium' | 'high';
  isLive?: boolean;
  flag?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function SimpleEventCard({
  time,
  title,
  description,
  currency,
  importance = 'low',
  isLive = false,
  flag,
  action
}: SimpleEventCardProps) {
  const importanceColors = {
    low: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-red-100 text-red-800 border-red-200'
  };

  return (
    <SimpleCard className={isLive ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500' : ''}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-4 mb-2">
            <div className="flex items-center space-x-2">
              {isLive && <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>}
              <span className="text-sm font-medium text-gray-900 dark:text-white">{time}</span>
            </div>
            {currency && flag && (
              <div className="flex items-center space-x-2">
                {flag}
                <span className="text-sm font-bold text-gray-900 dark:text-white">{currency}</span>
              </div>
            )}
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${importanceColors[importance]}`}>
              {importance.toUpperCase()}
            </span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">{title}</h3>
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
          )}
        </div>
        {action && (
          <button
            onClick={action.onClick}
            className="ml-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span>{action.label}</span>
          </button>
        )}
      </div>
    </SimpleCard>
  );
}

// Empty State Card
interface SimpleEmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function SimpleEmptyState({
  icon,
  title,
  description,
  action
}: SimpleEmptyStateProps) {
  return (
    <SimpleCard padding="lg">
      <div className="text-center">
        {icon && (
          <div className="text-gray-400 text-4xl mb-4">
            {icon}
          </div>
        )}
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{description}</p>
        {action && (
          <button
            onClick={action.onClick}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
          >
            {action.label}
          </button>
        )}
      </div>
    </SimpleCard>
  );
}
