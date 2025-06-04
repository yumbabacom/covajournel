'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { useAccount } from './AccountProvider';
import AddAccountModal from './AddAccountModal';

export default function SecondaryHeader() {
  const { user, logout } = useAuth();
  const { selectedAccount, accounts, selectAccount } = useAccount();
  const router = useRouter();
  const pathname = usePathname();
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showAccountDropdown && !target.closest('[data-account-dropdown]')) {
        setShowAccountDropdown(false);
      }
      if (showUserDropdown && !target.closest('[data-user-dropdown]')) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAccountDropdown, showUserDropdown]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const isActive = (path: string) => pathname === path;

  const navigationTabs = user.isAdmin ? [
    {
      name: 'Admin Panel',
      href: '/admin',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      color: 'red',
      description: 'System Administration'
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
      color: 'blue',
      description: 'Trading Overview'
    },
    {
      name: 'Add Trade',
      href: '/add-trade',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      color: 'emerald',
      description: 'New Position'
    },
    {
      name: 'Journal',
      href: '/journal',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      color: 'purple',
      description: 'Trade History'
    },
    {
      name: 'Strategy',
      href: '/strategies',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      color: 'indigo',
      description: 'Trading Plans'
    },
    {
      name: 'AI News',
      href: '/ai-forex-news',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
      color: 'orange',
      description: 'Market Intelligence'
    }
  ];

  return (
    <div className="border-b border-gray-200 shadow-lg sticky top-0 z-50 bg-transparent backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Navigation with Account Switcher */}
        <div className="hidden lg:block">
          <div className="relative flex items-center justify-between py-4">
            {/* Account Switcher - Left side */}
            <div className="flex items-center">
              {selectedAccount && !user.isAdmin && (
                <div className="relative mr-6" data-account-dropdown>
                  <button
                    onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                    className="flex items-center space-x-2 px-3 py-2 bg-white/80 hover:bg-white rounded-xl border border-gray-200 transition-all duration-300 shadow-md hover:shadow-lg backdrop-blur-sm"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div className="text-left min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">{selectedAccount.name}</p>
                      <p className="text-xs text-blue-600 font-medium">${selectedAccount.currentBalance.toLocaleString()}</p>
                    </div>
                    <svg className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${showAccountDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Account Dropdown */}
                  {showAccountDropdown && (
                    <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl border border-gray-200 shadow-xl z-50 max-h-80 overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-100">
                        <h3 className="text-sm font-bold text-gray-900">Trading Accounts</h3>
                        <p className="text-xs text-gray-600">Switch between accounts</p>
                      </div>
                      <div className="p-3 max-h-64 overflow-y-auto">
                        <div className="space-y-2">
                          {accounts.map((account) => (
                            <button
                              key={account.id}
                              onClick={() => {
                                selectAccount(account.id);
                                setShowAccountDropdown(false);
                              }}
                              className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 group ${
                                selectedAccount?.id === account.id
                                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200'
                                  : 'hover:bg-gray-50 border border-transparent hover:border-gray-200'
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm transition-all duration-200 ${
                                selectedAccount?.id === account.id
                                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                                  : 'bg-gradient-to-br from-gray-400 to-gray-500 group-hover:from-blue-400 group-hover:to-indigo-500'
                              }`}>
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                              </div>
                              <div className="flex-1 text-left min-w-0">
                                <div className="flex items-center space-x-2">
                                  <p className="text-sm font-semibold text-gray-900 truncate">{account.name}</p>
                                  {selectedAccount?.id === account.id && (
                                    <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                                      Active
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm font-semibold text-emerald-600">${account.currentBalance.toLocaleString()}</p>
                              </div>
                              <div className="flex items-center">
                                {selectedAccount?.id === account.id && (
                                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-200">
                          <button
                            onClick={() => {
                              setIsAddAccountModalOpen(true);
                              setShowAccountDropdown(false);
                            }}
                            className="w-full flex items-center space-x-3 p-3 bg-gradient-to-r from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 text-emerald-700 rounded-lg transition-all duration-200 border border-emerald-200 hover:border-emerald-300 group"
                          >
                            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </div>
                            <div className="flex-1 text-left">
                              <p className="text-sm font-semibold text-emerald-800">Add Account</p>
                              <p className="text-xs text-emerald-600">Create new account</p>
                            </div>
                            <svg className="w-4 h-4 text-emerald-500 group-hover:translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Centered Navigation */}
            <div className="flex items-center bg-gray-50 rounded-2xl p-2 shadow-inner border border-gray-200">
              {navigationTabs.map((tab, index) => {
                const active = isActive(tab.href);
                const colorClasses = {
                  blue: {
                    active: 'bg-blue-500 text-white shadow-lg shadow-blue-500/25',
                    inactive: 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  },
                  emerald: {
                    active: 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25',
                    inactive: 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                  },
                  purple: {
                    active: 'bg-purple-500 text-white shadow-lg shadow-purple-500/25',
                    inactive: 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                  },
                  indigo: {
                    active: 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25',
                    inactive: 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                  },
                  red: {
                    active: 'bg-red-500 text-white shadow-lg shadow-red-500/25',
                    inactive: 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                  },
                  orange: {
                    active: 'bg-orange-500 text-white shadow-lg shadow-orange-500/25',
                    inactive: 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                  }
                };

                const colors = colorClasses[tab.color as keyof typeof colorClasses];

                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={`relative flex items-center space-x-3 px-6 py-3 rounded-xl transition-all duration-300 font-medium group ${
                      active ? colors.active : colors.inactive
                    } ${index !== navigationTabs.length - 1 ? 'mr-2' : ''}`}
                  >
                    <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-105'}`}>
                      {tab.icon}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">{tab.name}</span>
                      <span className={`text-xs ${active ? 'text-white/80' : 'text-gray-500'} transition-colors duration-300`}>
                        {tab.description}
                      </span>
                    </div>

                    {/* Active indicator */}
                    {active && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-lg"></div>
                    )}
                  </Link>
                );
              })}
            </div>



            {/* User Profile & Logout - Right side */}
            <div className="flex items-center">
              <div className="relative" data-user-dropdown>
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center space-x-2 p-2 hover:bg-white/80 rounded-xl transition-all duration-200"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${
                    user.isAdmin
                      ? 'bg-gradient-to-br from-red-500 to-red-600'
                      : 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                  }`}>
                    <span className="text-white text-xs font-bold">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                  <div className="text-left min-w-0 hidden lg:block">
                    <p className="text-xs font-semibold text-gray-900 truncate">{user.name || 'User'}</p>
                    {user.isAdmin && (
                      <span className="text-xs text-red-600 font-medium">Admin</span>
                    )}
                  </div>
                  <svg className={`w-3 h-3 text-gray-400 transition-transform duration-200 hidden lg:block ${showUserDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* User Dropdown */}
                {showUserDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl border border-gray-200 shadow-xl z-50">
                    <div className="p-4">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg mb-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-sm ${
                          user.isAdmin
                            ? 'bg-gradient-to-br from-red-500 to-red-600'
                            : 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                        }`}>
                          <span className="text-white font-bold">
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-semibold text-gray-900 truncate">{user.name || 'User'}</p>
                            {user.isAdmin && (
                              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                                Admin
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate">{user.email || 'No email'}</p>
                        </div>
                      </div>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-all duration-200 font-medium border border-red-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden">
          <div className="flex items-center justify-center py-3">
            <div className="flex items-center space-x-1 bg-gray-50 rounded-xl p-1 shadow-inner border border-gray-200 overflow-x-auto">
              {navigationTabs.map((tab) => {
                const active = isActive(tab.href);
                const colorClasses = {
                  blue: {
                    active: 'bg-blue-500 text-white shadow-md',
                    inactive: 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  },
                  emerald: {
                    active: 'bg-emerald-500 text-white shadow-md',
                    inactive: 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                  },
                  purple: {
                    active: 'bg-purple-500 text-white shadow-md',
                    inactive: 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                  },
                  indigo: {
                    active: 'bg-indigo-500 text-white shadow-md',
                    inactive: 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                  },
                  red: {
                    active: 'bg-red-500 text-white shadow-md',
                    inactive: 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                  },
                  orange: {
                    active: 'bg-orange-500 text-white shadow-md',
                    inactive: 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                  }
                };

                const colors = colorClasses[tab.color as keyof typeof colorClasses];

                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all duration-200 min-w-[70px] ${
                      active ? colors.active : colors.inactive
                    }`}
                  >
                    <div className="mb-1">
                      {tab.icon}
                    </div>
                    <span className="text-xs font-medium whitespace-nowrap">
                      {tab.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Add Account Modal */}
      {isAddAccountModalOpen && (
        <AddAccountModal
          onClose={() => setIsAddAccountModalOpen(false)}
          onAccountCreated={() => {
            setIsAddAccountModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
