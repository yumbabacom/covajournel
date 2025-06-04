'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { useAccount } from './AccountProvider';
import { useSidebar } from '../contexts/SidebarContext';
import { useAMTrader } from '../contexts/AMTraderContext';

export default function AMTraderSidebar() {
  const { user, logout } = useAuth();
  const { selectedAccount, accounts, selectAccount } = useAccount();
  const { sidebarOpen, setSidebarOpen } = useSidebar();
  const { toggleAMTraderMode } = useAMTrader();
  const router = useRouter();
  const pathname = usePathname();
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);

  // Close account dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showAccountDropdown && !target.closest('[data-account-dropdown]')) {
        setShowAccountDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAccountDropdown]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    setSidebarOpen(false);
    router.push('/');
  };

  const isActive = (path: string) => {
    const normalizedCurrentPath = pathname.replace(/\/$/, '').toLowerCase() || '/';
    const normalizedTargetPath = path.replace(/\/$/, '').toLowerCase();
    return normalizedCurrentPath === normalizedTargetPath;
  };

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/am-trader/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      color: 'emerald',
      description: 'AM Trading Overview'
    },
    {
      name: 'Add AM Trade',
      href: '/am-trader/add-trade',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      color: 'blue',
      description: 'New AM Position'
    },
    {
      name: 'mTrader Journal',
      href: '/am-trader/journal',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      color: 'purple',
      description: 'Trading Journal Form'
    },
  ];

  const colorClasses = {
    blue: {
      active: 'bg-gradient-to-r from-blue-50 to-blue-100/50 text-blue-700 border-blue-200',
      hover: 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100/50 hover:text-blue-700',
      icon: 'text-blue-600',
      iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600'
    },
    emerald: {
      active: 'bg-gradient-to-r from-emerald-50 to-emerald-100/50 text-emerald-700 border-emerald-200',
      hover: 'hover:bg-gradient-to-r hover:from-emerald-50 hover:to-emerald-100/50 hover:text-emerald-700',
      icon: 'text-emerald-600',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-emerald-600'
    },
    purple: {
      active: 'bg-gradient-to-r from-purple-50 to-purple-100/50 text-purple-700 border-purple-200',
      hover: 'hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100/50 hover:text-purple-700',
      icon: 'text-purple-600',
      iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600'
    },
    green: {
      active: 'bg-gradient-to-r from-green-50 to-green-100/50 text-green-700 border-green-200',
      hover: 'hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100/50 hover:text-green-700',
      icon: 'text-green-600',
      iconBg: 'bg-gradient-to-br from-green-500 to-green-600'
    }
  };

  return (
    <div className="h-full bg-white/90 backdrop-blur-xl border-r border-gray-200/50 shadow-xl flex flex-col relative z-20 pointer-events-auto">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-gray-200/50">
        <Link href="/am-trader/dashboard" className="flex items-center space-x-4 group">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-all duration-500"></div>
            <div className="relative w-12 h-12 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-emerald-800 to-green-800 bg-clip-text text-transparent">
              AM Trader
            </h1>
            <p className="text-sm text-emerald-600 font-medium">Asset Management</p>
          </div>
        </Link>
      </div>

      {/* Toggle back to main dashboard */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200/50">
        <button
          onClick={toggleAMTraderMode}
          className="w-full flex items-center justify-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100/50 hover:from-gray-100 hover:to-gray-200/50 rounded-xl border border-gray-200/50 transition-all duration-300 shadow-sm hover:shadow-md text-gray-700 hover:text-gray-900"
        >
          <div className="flex items-center justify-center w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <span className="text-sm font-medium">Switch to Main Dashboard</span>
        </button>
      </div>

      {/* Account Switcher - Only for non-admin users */}
      {selectedAccount && !user.isAdmin && (
        <div className="flex-shrink-0 p-4 border-b border-gray-200/50">
          <div className="relative" data-account-dropdown>
            <button
              onClick={() => setShowAccountDropdown(!showAccountDropdown)}
              className="w-full flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100/50 hover:from-gray-100 hover:to-gray-200/50 rounded-xl border border-gray-200/50 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{selectedAccount.name}</p>
                <p className="text-xs text-emerald-600 font-medium">${selectedAccount.currentBalance.toLocaleString()}</p>
              </div>
              <svg className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${showAccountDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Account Dropdown */}
            {showAccountDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200/50 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">Switch Account</p>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {accounts.map((account) => (
                    <button
                      key={account.id}
                      onClick={() => {
                        selectAccount(account.id);
                        setShowAccountDropdown(false);
                      }}
                      className={`w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-50 transition-colors ${
                        account.id === selectedAccount.id ? 'bg-emerald-50' : ''
                      }`}
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-gray-900">{account.name}</p>
                        <p className="text-xs text-emerald-600">${account.currentBalance.toLocaleString()}</p>
                      </div>
                      {account.id === selectedAccount.id && (
                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation - Scrollable */}
      <div className="flex-1 p-4 space-y-2 overflow-y-auto min-h-0">
        {navigationItems.map((item) => {
          const active = isActive(item.href);
          const colors = colorClasses[item.color as keyof typeof colorClasses];
          
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              onClick={(e) => {
                setSidebarOpen(false);
                if (active) {
                  e.preventDefault();
                  router.push(item.href);
                }
              }}
              className={`group flex items-center px-4 py-3 rounded-xl transition-all duration-300 space-x-4 cursor-pointer ${
                active
                  ? `${colors.active} border shadow-sm`
                  : `text-gray-600 ${colors.hover} border border-transparent hover:shadow-sm`
              }`}
            >
              <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                active ? colors.iconBg + ' text-white shadow-md' : colors.icon
              }`}>
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium">{item.name}</div>
                <div className="text-xs text-gray-500 truncate">{item.description}</div>
              </div>
              {active && (
                <div className="flex-shrink-0 w-1 h-8 bg-current rounded-full"></div>
              )}
            </Link>
          );
        })}
      </div>

      {/* AM Trader Toggle Section */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200/50">
        <div className="mb-3 p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200/50 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-emerald-900">AM Trader Mode</p>
              <p className="text-xs text-emerald-600">Asset Management Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* User Section & Logout - Fixed at bottom */}
      <div className="flex-shrink-0 p-4 bg-gradient-to-t from-white via-white to-white/90 backdrop-blur-sm border-t border-gray-200/50">
        {/* Complete user info component */}
        <div className="mb-3 p-3 bg-white rounded-xl border border-gray-200/50 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
              user.isAdmin
                ? 'bg-gradient-to-br from-red-500 to-red-600'
                : 'bg-gradient-to-br from-emerald-500 to-green-600'
            }`}>
              <span className="text-white text-sm font-bold">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium text-gray-900 truncate">{user.name || 'User'}</p>
                {user.isAdmin && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 truncate">{user.email || 'No email'}</p>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-red-50 to-red-100/50 hover:from-red-100 hover:to-red-200/50 text-red-700 rounded-xl transition-all duration-300 font-medium border border-red-200/50 shadow-sm hover:shadow-md"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
} 