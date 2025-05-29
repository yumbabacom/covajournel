'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TradingCalculator from './components/TradingCalculator';
import SaveTradeModal from './components/SaveTradeModal';
import { useAuth } from './components/AuthProvider';

export default function Home() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isSaveTradeModalOpen, setIsSaveTradeModalOpen] = useState(false);
  const [currentTradeData, setCurrentTradeData] = useState<any>(null);

  // Redirect logged-in users - admins to admin panel, regular users to dashboard
  useEffect(() => {
    if (user) {
      if (user.isAdmin) {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, router]);

  const handleSaveTrade = (tradeData: any) => {
    setCurrentTradeData(tradeData);
    setIsSaveTradeModalOpen(true);
  };

  const handleSaveSuccess = () => {
    // You can add a success notification here
    console.log('Trade saved successfully!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 py-8">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-indigo-500/30 rounded-full blur-2xl animate-pulse"></div>
              <div className="relative inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-3xl shadow-2xl shadow-blue-500/30 transform hover:scale-105 transition-all duration-300">
                <div className="absolute inset-2 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl opacity-50"></div>
                <svg className="relative w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            <div className="space-y-6">
              <h1 className="text-7xl md:text-8xl font-black bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent leading-tight">
                Trading
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  Calculator
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed font-medium">
                Master your trades with precision. Calculate position sizes, manage risk, and analyze potential profits with our
                <span className="text-blue-600 dark:text-blue-400 font-semibold"> professional-grade </span>
                trading calculator.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <div className="flex items-center space-x-3 px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-full border border-blue-200/50 dark:border-blue-700/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full group-hover:scale-110 transition-transform duration-300"></div>
                <span className="text-gray-700 dark:text-gray-300 font-semibold">Position Sizing</span>
              </div>
              <div className="flex items-center space-x-3 px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-full border border-indigo-200/50 dark:border-indigo-700/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <div className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full group-hover:scale-110 transition-transform duration-300"></div>
                <span className="text-gray-700 dark:text-gray-300 font-semibold">Risk Management</span>
              </div>
              <div className="flex items-center space-x-3 px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-full border border-purple-200/50 dark:border-purple-700/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full group-hover:scale-110 transition-transform duration-300"></div>
                <span className="text-gray-700 dark:text-gray-300 font-semibold">P&L Analysis</span>
              </div>
              <div className="flex items-center space-x-3 px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-full border border-emerald-200/50 dark:border-emerald-700/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full group-hover:scale-110 transition-transform duration-300"></div>
                <span className="text-gray-700 dark:text-gray-300 font-semibold">Real-time Results</span>
              </div>
            </div>

            {/* Stats Row */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg shadow-blue-500/25 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Precise</h3>
                <p className="text-gray-600 dark:text-gray-400">Accurate calculations for optimal trading decisions</p>
              </div>

              <div className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/25 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Secure</h3>
                <p className="text-gray-600 dark:text-gray-400">Safe and reliable risk management tools</p>
              </div>

              <div className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg shadow-purple-500/25 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Fast</h3>
                <p className="text-gray-600 dark:text-gray-400">Instant calculations for quick trading decisions</p>
              </div>
            </div>
          </div>

          {/* Calculator Component */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-3xl blur-xl"></div>
            <TradingCalculator
              user={user}
              onSaveTrade={handleSaveTrade}
            />
          </div>
        </div>
      </div>

      {/* Save Trade Modal */}
      {currentTradeData && (
        <SaveTradeModal
          isOpen={isSaveTradeModalOpen}
          onClose={() => setIsSaveTradeModalOpen(false)}
          tradeData={currentTradeData}
          onSaveSuccess={handleSaveSuccess}
        />
      )}
    </div>
  );
}
