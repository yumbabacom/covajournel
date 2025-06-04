'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { useAccount } from './AccountProvider';
import AddAccountModal from './AddAccountModal';

export default function UserHeader() {
  const { user, logout } = useAuth();
  const { selectedAccount, accounts, selectAccount } = useAccount();
  const router = useRouter();
  const pathname = usePathname();
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
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
      if (showMobileMenu && !target.closest('[data-mobile-menu]')) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAccountDropdown, showUserDropdown, showMobileMenu]);

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
      color: 'red',
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
    },
    {
      name: 'Strategies',
      href: '/strategies',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      color: 'indigo',
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
    }
  ];

  return (
    <>
      <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-all duration-300">
                <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                  CovaJournal
                </h1>
                <p className="text-xs lg:text-sm text-emerald-600 font-medium">Professional Trading Platform</p>
              </div>
            </Link>

            {/* Spacer for centered layout */}
            <div className="flex-1"></div>

            {/* Right Side - Account & User */}
            <div className="flex items-center space-x-3">
              {/* Account Selector - Desktop */}
              {selectedAccount && !user.isAdmin && (
                <div className="hidden lg:block relative" data-account-dropdown>
                  <button
                    onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                    className="flex items-center space-x-3 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-all duration-200"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div className="text-left min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{selectedAccount.name}</p>
                      <p className="text-xs text-blue-600 font-medium">${selectedAccount.currentBalance.toLocaleString()}</p>
                    </div>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Account Dropdown */}
                  {showAccountDropdown && (
                    <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl border border-gray-200 shadow-2xl z-50 max-h-96 overflow-y-auto">
                      <div className="p-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Switch Account</h3>
                        {accounts.map((account) => (
                          <button
                            key={account.id}
                            onClick={() => {
                              selectAccount(account.id);
                              setShowAccountDropdown(false);
                            }}
                            className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 mb-2 ${
                              selectedAccount?.id === account.id
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              selectedAccount?.id === account.id
                                ? 'bg-blue-100'
                                : 'bg-gray-100'
                            }`}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                              </svg>
                            </div>
                            <div className="flex-1 text-left min-w-0">
                              <p className="text-sm font-medium truncate">{account.name}</p>
                              <p className="text-xs opacity-75">${account.currentBalance.toLocaleString()}</p>
                            </div>
                          </button>
                        ))}

                        <button
                          onClick={() => {
                            setIsAddAccountModalOpen(true);
                            setShowAccountDropdown(false);
                          }}
                          className="w-full flex items-center space-x-3 p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-all duration-200 mt-2 border border-emerald-200"
                        >
                          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </div>
                          <span className="text-sm font-medium">Add Account</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* User Profile Dropdown */}
              <div className="relative" data-user-dropdown>
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-xl transition-all duration-200"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                    user.isAdmin
                      ? 'bg-gradient-to-br from-red-500 to-red-600'
                      : 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                  }`}>
                    <span className="text-white text-sm font-bold">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                  <div className="hidden lg:block text-left min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user.name || 'User'}</p>
                      {user.isAdmin && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-lg">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{user.email || 'No email'}</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 hidden lg:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* User Dropdown */}
                {showUserDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl border border-gray-200 shadow-2xl z-50">
                    <div className="p-4">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
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
                            <p className="font-semibold text-gray-900 truncate">{user.name || 'User'}</p>
                            {user.isAdmin && (
                              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-lg">
                                Admin
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 truncate">{user.email || 'No email'}</p>
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


      </header>

      {/* Add Account Modal */}
      {isAddAccountModalOpen && (
        <AddAccountModal
          onClose={() => setIsAddAccountModalOpen(false)}
          onAccountCreated={() => {
            setIsAddAccountModalOpen(false);
          }}
        />
      )}
    </>
  );
}
