'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import AddAccountModal from './AddAccountModal';
import { useAuth } from './AuthProvider';
import { useAccount } from './AccountProvider';

export default function Header() {
  const { user, logout } = useAuth();
  const { selectedAccount, accounts, selectAccount } = useAccount();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogin = () => {
    setIsLoginModalOpen(true);
    setIsMenuOpen(false);
  };

  const handleRegister = () => {
    setIsRegisterModalOpen(true);
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    setShowUserDropdown(false);
    router.push('/');
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      // Check if click is outside account dropdown
      if (showAccountDropdown && !target.closest('[data-account-dropdown]')) {
        console.log('Closing account dropdown due to outside click');
        setShowAccountDropdown(false);
      }

      // Check if click is outside user dropdown
      if (showUserDropdown && !target.closest('[data-user-dropdown]')) {
        console.log('Closing user dropdown due to outside click');
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAccountDropdown, showUserDropdown]);

  // Helper function to get greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Helper function to get page title
  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname === '/add-trade') return 'Add Trade';
    if (pathname === '/journal') return 'Trade Journal';
    if (pathname === '/admin') return 'Admin Panel';
    return 'TradingJournal';
  };

  // Debug logging
  console.log('Header render - user:', user?.name, 'selectedAccount:', selectedAccount?.name, 'accounts:', accounts.length, 'showAccountDropdown:', showAccountDropdown);

  return (
    <>
      <header className="relative bg-gradient-to-r from-slate-50/95 via-white/95 to-blue-50/95 backdrop-blur-3xl border-b border-slate-200/50 sticky top-0 z-50 shadow-xl shadow-slate-200/20">
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5"></div>

        <div className="relative container mx-auto px-6">
          {/* Guest Header */}
          {!user && (
            <div className="flex items-center justify-between h-24">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-4 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition-all duration-500"></div>
                  <div className="relative w-14 h-14 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/30 group-hover:shadow-emerald-500/50 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <div className="group-hover:translate-x-1 transition-transform duration-300">
                  <h1 className="text-3xl font-black bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent tracking-tight">
                    TradingJournal
                  </h1>
                  <p className="text-sm text-emerald-600 font-semibold tracking-wide">Professional Trading Platform</p>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-3">
                <Link href="/" className="group relative px-6 py-3 text-slate-700 hover:text-emerald-600 font-semibold transition-all duration-300 flex items-center space-x-3">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100"></div>
                  <div className="relative flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span>Calculator</span>
                  </div>
                </Link>
              </nav>

              {/* User Actions */}
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-4">
                  <button
                    onClick={handleLogin}
                    className="group relative px-8 py-3 text-slate-700 hover:text-emerald-600 font-semibold transition-all duration-300 flex items-center space-x-3"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-100 to-slate-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100"></div>
                    <div className="relative flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                      </div>
                      <span>Login</span>
                    </div>
                  </button>
                  <button
                    onClick={handleRegister}
                    className="group relative px-8 py-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white rounded-2xl transition-all duration-300 font-semibold shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 flex items-center space-x-3"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                      </div>
                      <span>Sign Up</span>
                    </div>
                  </button>
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="md:hidden p-4 rounded-2xl hover:bg-slate-100 transition-all duration-300 border border-slate-200 shadow-lg"
                >
                  <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Beautiful Header for Logged-in Users */}
          {user && (
            <div className="py-8">
              <div className="flex items-center justify-between">
                {/* Left Side - Page Title & Greeting */}
                <div className="flex items-center space-x-6">
                  {/* Page Title with Icon */}
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/30">
                      {pathname === '/dashboard' && (
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      )}
                      {pathname === '/add-trade' && (
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      )}
                      {pathname === '/journal' && (
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      )}
                      {pathname === '/admin' && (
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h1 className="text-4xl font-black bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent tracking-tight">
                        {getPageTitle()}
                      </h1>
                      <p className="text-lg text-slate-600 mt-1 font-medium">
                        {getGreeting()}, <span className="text-blue-600 font-semibold">{user.name}</span>!
                        {pathname === '/dashboard' && " Ready to analyze your trading performance?"}
                        {pathname === '/add-trade' && " Let's record your next trade."}
                        {pathname === '/journal' && " Review your trading history."}
                        {pathname === '/admin' && " Monitor platform activity."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Side - Controls */}
                <div className="flex items-center space-x-6">
                  {/* Account Selector - Enhanced Design */}
                  {(() => {
                    console.log('Account selector condition check:', {
                      selectedAccount: selectedAccount?.name,
                      isAdmin: user.isAdmin,
                      shouldShow: selectedAccount && !user.isAdmin
                    });
                    return selectedAccount && !user.isAdmin;
                  })() && (
                    <div className="relative" data-account-dropdown>
                      <button
                        onClick={() => {
                          console.log('Account dropdown clicked, current state:', showAccountDropdown);
                          setShowAccountDropdown(!showAccountDropdown);
                        }}
                        className="group flex items-center space-x-4 px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-2xl border border-blue-200/50 transition-all duration-300 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 hover:scale-105"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-slate-800 text-lg">{selectedAccount.name}</p>
                          <p className="text-sm text-blue-600 font-semibold">${selectedAccount.currentBalance.toLocaleString()}</p>
                        </div>
                        <svg className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* Beautiful Account Dropdown Menu */}
                      {showAccountDropdown && (
                        <div className="absolute right-0 top-full mt-4 w-96 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-200/50 z-50 overflow-hidden">
                          {/* Header */}
                          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200/50">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-slate-800">Portfolio Accounts</h3>
                                <p className="text-sm text-slate-600">Switch between your trading accounts</p>
                              </div>
                            </div>
                          </div>

                          {/* Account List */}
                          <div className="p-4 max-h-80 overflow-y-auto">
                            {accounts.map((account) => (
                              <button
                                key={account.id}
                                onClick={() => {
                                  selectAccount(account.id);
                                  setShowAccountDropdown(false);
                                }}
                                className={`w-full flex items-center space-x-4 p-4 rounded-2xl transition-all duration-300 mb-2 group ${
                                  selectedAccount?.id === account.id
                                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-lg'
                                    : 'hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 border-2 border-transparent hover:border-slate-200'
                                }`}
                              >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 ${
                                  selectedAccount?.id === account.id
                                    ? 'bg-gradient-to-br from-blue-500 to-indigo-500'
                                    : account.isDefault
                                    ? 'bg-gradient-to-br from-emerald-500 to-teal-500'
                                    : 'bg-gradient-to-br from-slate-400 to-slate-500'
                                }`}>
                                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                  </svg>
                                </div>
                                <div className="flex-1 text-left">
                                  <div className="flex items-center space-x-2">
                                    <p className="font-bold text-slate-800 text-lg">{account.name}</p>
                                    {account.isDefault && (
                                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-semibold">
                                        Default
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-blue-600 font-semibold">
                                    ${account.currentBalance.toLocaleString()}
                                  </p>
                                </div>
                                {selectedAccount?.id === account.id && (
                                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>

                          {/* Add Account Button */}
                          <div className="p-6 border-t border-slate-200/50 bg-gradient-to-r from-slate-50 to-slate-100">
                            <button
                              onClick={() => {
                                console.log('Add account button clicked');
                                setIsAddAccountModalOpen(true);
                                setShowAccountDropdown(false);
                              }}
                              className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-2xl font-bold transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 flex items-center justify-center space-x-3"
                            >
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                              <span>Add New Account</span>
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
                      className="group flex items-center space-x-3 px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 rounded-2xl border border-slate-200/50 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <span className="text-white text-lg font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-slate-800">{user.name}</p>
                        <p className="text-sm text-slate-600">{user.email}</p>
                      </div>
                      <svg className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* User Dropdown Menu */}
                    {showUserDropdown && (
                      <div className="absolute right-0 top-full mt-4 w-72 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-200/50 z-50 overflow-hidden">
                        <div className="p-6">
                          <div className="flex items-center space-x-4 mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-xl">
                              <span className="text-white text-2xl font-bold">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 text-lg">{user.name}</p>
                              <p className="text-sm text-slate-600">{user.email}</p>
                              {user.isAdmin && (
                                <span className="inline-block px-3 py-1 bg-red-100 text-red-700 text-xs rounded-full font-semibold mt-1">
                                  Administrator
                                </span>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={handleLogout}
                            className="w-full px-6 py-4 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-2xl font-bold transition-all duration-300 shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:scale-105 flex items-center justify-center space-x-3"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          )}

          {/* Beautiful Mobile Menu - Only show for guests */}
          {!user && isMenuOpen && (
            <div className="md:hidden py-6 border-t border-slate-200/50 bg-gradient-to-r from-slate-50/50 to-blue-50/50">
              <nav className="flex flex-col space-y-4">
                <Link href="/" className="flex items-center space-x-3 px-4 py-3 text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all duration-300 font-semibold">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span>Calculator</span>
                </Link>
                <button
                  onClick={handleLogin}
                  className="flex items-center space-x-3 px-4 py-3 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all duration-300 font-semibold text-left"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                  </div>
                  <span>Login</span>
                </button>
                <button
                  onClick={handleRegister}
                  className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl transition-all duration-300 font-semibold shadow-lg shadow-emerald-500/30"
                >
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <span>Sign Up</span>
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Login Modal */}
      {isLoginModalOpen && (
        <LoginModal
          onClose={() => setIsLoginModalOpen(false)}
          onSwitchToRegister={() => {
            setIsLoginModalOpen(false);
            setIsRegisterModalOpen(true);
          }}
        />
      )}

      {/* Register Modal */}
      {isRegisterModalOpen && (
        <RegisterModal
          onClose={() => setIsRegisterModalOpen(false)}
          onSwitchToLogin={() => {
            setIsRegisterModalOpen(false);
            setIsLoginModalOpen(true);
          }}
        />
      )}

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
