'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { usePathname } from 'next/navigation';

export default function SharedHeader() {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="relative z-20 bg-white/90 backdrop-blur-2xl border-b border-gray-200/50 shadow-xl">
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          {/* Enhanced Logo */}
          <Link href="/" className="flex items-center space-x-4 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-all duration-500"></div>
              <div className="relative w-14 h-14 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="group-hover:translate-x-1 transition-transform duration-300">
              <h1 className="text-2xl font-black bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent tracking-tight">
                CovaJournal
              </h1>
              <p className="text-sm text-blue-600 font-semibold tracking-wide">Professional Trading Platform</p>
            </div>
          </Link>

          {/* Enhanced Navigation Menu */}
          <div className="hidden md:flex items-center space-x-2">
            <Link href="/" className={`group relative px-6 py-3 font-semibold transition-all duration-300 flex items-center space-x-3 ${
              isActive('/')
                ? 'text-blue-600'
                : 'text-gray-700 hover:text-blue-600'
            }`}>
              <div className={`absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl transition-all duration-300 scale-95 group-hover:scale-100 ${
                isActive('/') ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}></div>
              <div className="relative flex items-center space-x-3">
                <div className={`w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center transition-transform duration-300 ${
                  isActive('/') ? 'scale-110' : 'group-hover:scale-110'
                }`}>
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <span>Home</span>
              </div>
            </Link>

            <Link href="/calculator" className={`group relative px-6 py-3 font-semibold transition-all duration-300 flex items-center space-x-3 ${
              isActive('/calculator')
                ? 'text-purple-600'
                : 'text-gray-700 hover:text-purple-600'
            }`}>
              <div className={`absolute inset-0 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl transition-all duration-300 scale-95 group-hover:scale-100 ${
                isActive('/calculator') ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}></div>
              <div className="relative flex items-center space-x-3">
                <div className={`w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center transition-transform duration-300 ${
                  isActive('/calculator') ? 'scale-110' : 'group-hover:scale-110'
                }`}>
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <span>Calculator</span>
              </div>
            </Link>

            <Link href="/market-hours" className={`group relative px-6 py-3 font-semibold transition-all duration-300 flex items-center space-x-3 ${
              isActive('/market-hours')
                ? 'text-green-600'
                : 'text-gray-700 hover:text-green-600'
            }`}>
              <div className={`absolute inset-0 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl transition-all duration-300 scale-95 group-hover:scale-100 ${
                isActive('/market-hours') ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}></div>
              <div className="relative flex items-center space-x-3">
                <div className={`w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center transition-transform duration-300 ${
                  isActive('/market-hours') ? 'scale-110' : 'group-hover:scale-110'
                }`}>
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span>Market Hours</span>
              </div>
            </Link>

            <Link href="/forex-news" className={`group relative px-6 py-3 font-semibold transition-all duration-300 flex items-center space-x-3 ${
              isActive('/forex-news')
                ? 'text-orange-600'
                : 'text-gray-700 hover:text-orange-600'
            }`}>
              <div className={`absolute inset-0 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl transition-all duration-300 scale-95 group-hover:scale-100 ${
                isActive('/forex-news') ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}></div>
              <div className="relative flex items-center space-x-3">
                <div className={`w-10 h-10 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center transition-transform duration-300 ${
                  isActive('/forex-news') ? 'scale-110' : 'group-hover:scale-110'
                }`}>
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <span>Forex News</span>
              </div>
            </Link>

            <Link href="/login" className="group relative px-6 py-3 text-gray-700 hover:text-emerald-600 font-semibold transition-all duration-300 flex items-center space-x-3">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100"></div>
              <div className="relative flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                </div>
                <span>Login</span>
              </div>
            </Link>

            {user ? (
              <Link href="/dashboard" className="group relative px-8 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white rounded-2xl transition-all duration-300 font-semibold shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 flex items-center space-x-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <span>Dashboard</span>
                </div>
              </Link>
            ) : (
              <Link href="/login" className="group relative px-8 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white rounded-2xl transition-all duration-300 font-semibold shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 flex items-center space-x-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <span>Get Started</span>
                </div>
              </Link>
            )}
          </div>

          {/* Enhanced Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-12 h-12 bg-white/80 hover:bg-white rounded-2xl flex items-center justify-center transition-all duration-300 border border-gray-200/50 shadow-lg hover:shadow-xl"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Enhanced Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-6 py-6 border-t border-gray-200/50 bg-white/50 backdrop-blur-xl rounded-2xl">
            <nav className="flex flex-col space-y-4">
              <Link href="/" className={`flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 font-semibold ${
                isActive('/')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
              }`}>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <span>Home</span>
              </Link>

              <Link href="/calculator" className={`flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 font-semibold ${
                isActive('/calculator')
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
              }`}>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <span>Calculator</span>
              </Link>

              <Link href="/market-hours" className={`flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 font-semibold ${
                isActive('/market-hours')
                  ? 'text-green-600 bg-green-50'
                  : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
              }`}>
                <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span>Market Hours</span>
              </Link>

              <Link href="/forex-news" className={`flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 font-semibold ${
                isActive('/forex-news')
                  ? 'text-orange-600 bg-orange-50'
                  : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50'
              }`}>
                <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <span>Forex News</span>
              </Link>

              <Link href="/login" className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all duration-300 font-semibold">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                </div>
                <span>Login</span>
              </Link>

              {user ? (
                <Link href="/dashboard" className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl transition-all duration-300 font-semibold shadow-lg shadow-blue-500/30">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <span>Dashboard</span>
                </Link>
              ) : (
                <Link href="/login" className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl transition-all duration-300 font-semibold shadow-lg shadow-blue-500/30">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <span>Get Started</span>
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </nav>
  );
}