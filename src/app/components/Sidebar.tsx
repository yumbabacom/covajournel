'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import AccountSelector from './AccountSelector';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const isActive = (path: string) => pathname === path;

  const navigationItems = user.isAdmin ? [
    {
      name: 'Admin Panel',
      href: '/admin',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      gradient: 'from-red-500 to-pink-500',
      hoverGradient: 'from-red-600 to-pink-600',
    }
  ] : [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      gradient: 'from-blue-500 to-indigo-500',
      hoverGradient: 'from-blue-600 to-indigo-600',
    },
    {
      name: 'Add Trade',
      href: '/add-trade',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      gradient: 'from-emerald-500 to-teal-500',
      hoverGradient: 'from-emerald-600 to-teal-600',
    },
    {
      name: 'Journal',
      href: '/journal',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      gradient: 'from-purple-500 to-violet-500',
      hoverGradient: 'from-purple-600 to-violet-600',
    }
  ];

  return (
    <div className={`fixed left-0 top-0 h-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border-r border-gray-200/30 dark:border-gray-700/30 shadow-2xl shadow-gray-200/20 dark:shadow-gray-900/20 z-50 transition-all duration-300 ${
      isCollapsed ? 'w-20' : 'w-72'
    } lg:${isCollapsed ? 'w-20' : 'w-72'} md:w-20 sm:w-20`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200/30 dark:border-gray-700/30">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 transition-all duration-300 group-hover:scale-105">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  TradingJournal
                </h1>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Professional Platform</p>
              </div>
            </Link>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isCollapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4 space-y-2">
        {navigationItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              isActive(item.href)
                ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg shadow-${item.gradient.split('-')[1]}-500/25`
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50'
            }`}
          >
            <div className={`flex-shrink-0 ${isActive(item.href) ? 'text-white' : `text-gray-500 dark:text-gray-400 group-hover:text-${item.gradient.split('-')[1]}-500`}`}>
              {item.icon}
            </div>
            {!isCollapsed && (
              <span className="font-medium">{item.name}</span>
            )}
          </Link>
        ))}
      </div>

      {/* Account Selector - Only for regular users */}
      {!user.isAdmin && !isCollapsed && (
        <div className="p-4 border-t border-gray-200/30 dark:border-gray-700/30">
          <AccountSelector />
        </div>
      )}

      {/* User Profile */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200/30 dark:border-gray-700/30 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        {!isCollapsed ? (
          <div className="space-y-4">
            {/* User Info */}
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                user.isAdmin
                  ? 'bg-gradient-to-br from-red-500 to-pink-500'
                  : 'bg-gradient-to-br from-emerald-500 to-teal-500'
              }`}>
                <span className="text-white text-sm font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
                  {user.isAdmin && (
                    <span className="px-2 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-medium rounded-lg">
                      Admin
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all duration-200 font-medium shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:scale-105"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Collapsed User Avatar */}
            <div className="flex justify-center">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                user.isAdmin
                  ? 'bg-gradient-to-br from-red-500 to-pink-500'
                  : 'bg-gradient-to-br from-emerald-500 to-teal-500'
              }`}>
                <span className="text-white text-sm font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Collapsed Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center p-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all duration-200 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:scale-105"
              title="Logout"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
