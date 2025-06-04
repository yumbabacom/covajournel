'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './components/AuthProvider';
import Link from 'next/link';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section - Full Page */}
      <section className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Enhanced Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-gradient-to-l from-purple-400/15 to-pink-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/3 right-10 w-72 h-72 bg-gradient-to-br from-cyan-400/10 to-blue-600/10 rounded-full blur-2xl animate-pulse delay-500"></div>
          
          {/* Floating Particles */}
          <div className="absolute top-20 left-20 w-3 h-3 bg-blue-400/60 rounded-full animate-bounce"></div>
          <div className="absolute top-40 right-32 w-2 h-2 bg-purple-400/60 rounded-full animate-bounce delay-300"></div>
          <div className="absolute bottom-40 left-32 w-4 h-4 bg-indigo-400/60 rounded-full animate-bounce delay-700"></div>
          <div className="absolute bottom-32 right-20 w-2 h-2 bg-pink-400/60 rounded-full animate-bounce delay-1000"></div>
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* Floating Badge */}
            <div className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-xl rounded-full border border-blue-200/50 shadow-lg mb-8 hover:scale-105 transition-transform duration-300">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></div>
              <span className="text-sm font-semibold text-gray-700">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                  <span>Trusted by 10,000+ Professional Traders</span>
              </div>
              </span>
            </div>

            {/* Main Heading - Larger and More Impactful */}
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black leading-[0.9] text-gray-900 mb-8 tracking-tight">
                    Master Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 animate-gradient">
                    Trading Journey
                  </span>
                </h1>

            {/* Enhanced Subtitle */}
            <p className="text-2xl md:text-3xl lg:text-4xl text-gray-600 mb-12 max-w-5xl mx-auto leading-relaxed font-light">
              The most <span className="font-semibold text-blue-600">comprehensive trading platform</span> designed for 
              <span className="font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"> serious traders</span> who demand excellence.
            </p>

            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Link
                href="/login"
                className="group relative inline-flex items-center px-12 py-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white text-xl font-bold rounded-2xl shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-500 transform hover:scale-110 hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative flex items-center">
                  <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center mr-4 group-hover:rotate-12 transition-transform duration-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div>Start Your Journey</div>
                    <div className="text-sm opacity-90 font-normal">Free • No Credit Card</div>
                  </div>
                </div>
              </Link>

              <Link
                href="/calculator"
                className="group relative inline-flex items-center px-12 py-5 bg-white/90 backdrop-blur-2xl text-gray-700 text-xl font-bold rounded-2xl border-2 border-gray-200/50 hover:border-purple-300/50 shadow-2xl shadow-gray-500/20 hover:shadow-purple-500/30 transition-all duration-500 transform hover:scale-110 hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center mr-4 group-hover:rotate-12 transition-transform duration-300">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div>Try Calculator</div>
                    <div className="text-sm opacity-70 font-normal">Free Position Sizing Tool</div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Enhanced Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-8 text-sm">
              <div className="flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-xl rounded-full border border-green-200/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <div className="w-3 h-3 bg-green-400 rounded-full group-hover:scale-125 transition-transform duration-300"></div>
                <span className="font-semibold text-gray-700">10,000+ Active Traders</span>
              </div>
              <div className="flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-xl rounded-full border border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <div className="w-3 h-3 bg-blue-400 rounded-full group-hover:scale-125 transition-transform duration-300"></div>
                <span className="font-semibold text-gray-700">1M+ Trades Tracked</span>
              </div>
              <div className="flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-xl rounded-full border border-purple-200/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <div className="w-3 h-3 bg-purple-400 rounded-full group-hover:scale-125 transition-transform duration-300"></div>
                <span className="font-semibold text-gray-700">99.9% Uptime</span>
              </div>
              <div className="flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-xl rounded-full border border-emerald-200/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <div className="w-3 h-3 bg-emerald-400 rounded-full group-hover:scale-125 transition-transform duration-300"></div>
                <span className="font-semibold text-gray-700">24/7 Support</span>
              </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
              <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
                <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Enhanced */}
      <section className="py-32 bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 relative">
        {/* Background Decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-tr from-purple-500/5 to-pink-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24">
            <div className="inline-flex items-center px-6 py-3 bg-blue-50 rounded-full border border-blue-200/50 mb-8">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-blue-600 font-semibold">Powerful Features</span>
            </div>
            
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-8 leading-tight">
              Everything You Need to
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Trade Better
              </span>
            </h2>
            
            <p className="text-2xl md:text-3xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light">
              Comprehensive tools and analytics to help you become a 
              <span className="font-semibold text-blue-600"> consistently profitable trader</span>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
            {/* Feature 1 - Enhanced */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-white/90 backdrop-blur-2xl rounded-3xl p-10 shadow-2xl shadow-blue-500/20 group-hover:shadow-blue-500/30 border border-blue-200/50 group-hover:border-blue-300/50 transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-2">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-all duration-500"></div>
                  <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/40 group-hover:shadow-blue-500/60 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-6 group-hover:text-blue-700 transition-colors duration-300">
                  Advanced Analytics
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed mb-8">
                  Deep insights into your trading performance with real-time metrics, advanced statistics, and comprehensive performance reports.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
                    <span className="text-gray-700 font-medium">Real-time P&L tracking</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
                    <span className="text-gray-700 font-medium">Performance metrics dashboard</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
                    <span className="text-gray-700 font-medium">Strategy comparison tools</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 2 - Enhanced */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-white/90 backdrop-blur-2xl rounded-3xl p-10 shadow-2xl shadow-indigo-500/20 group-hover:shadow-indigo-500/30 border border-indigo-200/50 group-hover:border-indigo-300/50 transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-2">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-all duration-500"></div>
                  <div className="relative w-20 h-20 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/40 group-hover:shadow-indigo-500/60 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-6 group-hover:text-indigo-700 transition-colors duration-300">
                  Professional Journal
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed mb-8">
                  Professional trade logging with screenshots, detailed notes, and comprehensive entry/exit analysis for every trade.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"></div>
                    <span className="text-gray-700 font-medium">Trade screenshots & notes</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"></div>
                    <span className="text-gray-700 font-medium">Detailed entry/exit analysis</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"></div>
                    <span className="text-gray-700 font-medium">Trade pattern recognition</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 3 - Enhanced */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-white/90 backdrop-blur-2xl rounded-3xl p-10 shadow-2xl shadow-purple-500/20 group-hover:shadow-purple-500/30 border border-purple-200/50 group-hover:border-purple-300/50 transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-2">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-all duration-500"></div>
                  <div className="relative w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/40 group-hover:shadow-purple-500/60 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-6 group-hover:text-purple-700 transition-colors duration-300">
                  Smart Calculator
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed mb-8">
                  Advanced position sizing and risk management calculator with real-time calculations and profit projections.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full"></div>
                    <span className="text-gray-700 font-medium">Instant position sizing</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full"></div>
                    <span className="text-gray-700 font-medium">Risk management tools</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full"></div>
                    <span className="text-gray-700 font-medium">P&L projections</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 4 - Enhanced */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-white/90 backdrop-blur-2xl rounded-3xl p-10 shadow-2xl shadow-emerald-500/20 group-hover:shadow-emerald-500/30 border border-emerald-200/50 group-hover:border-emerald-300/50 transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-2">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-all duration-500"></div>
                  <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/40 group-hover:shadow-emerald-500/60 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-6 group-hover:text-emerald-700 transition-colors duration-300">
                  AI Trading Insights
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed mb-8">
                  Advanced AI-powered market analysis and personalized trading recommendations based on your unique strategy.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"></div>
                    <span className="text-gray-700 font-medium">AI market analysis</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"></div>
                    <span className="text-gray-700 font-medium">Personalized recommendations</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"></div>
                    <span className="text-gray-700 font-medium">Strategy optimization</span>
                  </li>
                </ul>
          </div>
        </div>

            {/* Feature 5 - Enhanced */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-white/90 backdrop-blur-2xl rounded-3xl p-10 shadow-2xl shadow-orange-500/20 group-hover:shadow-orange-500/30 border border-orange-200/50 group-hover:border-orange-300/50 transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-2">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-all duration-500"></div>
                  <div className="relative w-20 h-20 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/40 group-hover:shadow-orange-500/60 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-6 group-hover:text-orange-700 transition-colors duration-300">
                  Global Market Hours
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed mb-8">
                  Real-time global market session tracking and optimal trading time identification across all major markets.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-full"></div>
                    <span className="text-gray-700 font-medium">Real-time session tracking</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-full"></div>
                    <span className="text-gray-700 font-medium">Optimal trading times</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-full"></div>
                    <span className="text-gray-700 font-medium">Market volatility insights</span>
                  </li>
                </ul>
              </div>
              </div>

            {/* Feature 6 - Enhanced */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-rose-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-white/90 backdrop-blur-2xl rounded-3xl p-10 shadow-2xl shadow-pink-500/20 group-hover:shadow-pink-500/30 border border-pink-200/50 group-hover:border-pink-300/50 transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-2">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-all duration-500"></div>
                  <div className="relative w-20 h-20 bg-gradient-to-br from-pink-500 via-rose-500 to-red-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-pink-500/40 group-hover:shadow-pink-500/60 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3v8m0 0V9a2 2 0 012-2h2M7 3a2 2 0 012-2h6a2 2 0 012 2v2H7V3z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-6 group-hover:text-pink-700 transition-colors duration-300">
                  News & Events
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed mb-8">
                  Real-time economic news, market-moving events, and AI-powered analysis of their potential impact on your trades.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full"></div>
                    <span className="text-gray-700 font-medium">Real-time news feed</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full"></div>
                    <span className="text-gray-700 font-medium">Economic calendar</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full"></div>
                    <span className="text-gray-700 font-medium">AI impact analysis</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get started in minutes and transform your trading in days.
            </p>
              </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto shadow-xl">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <div className="absolute top-10 left-1/2 w-full h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 transform -translate-x-1/2 hidden md:block"></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Sign Up & Setup</h3>
              <p className="text-gray-600 leading-relaxed">
                Create your account in under 2 minutes. Connect your trading accounts and configure your preferences.
              </p>
                  </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-xl">
                  <span className="text-2xl font-bold text-white">2</span>
                  </div>
                <div className="absolute top-10 left-1/2 w-full h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 transform -translate-x-1/2 hidden md:block"></div>
                  </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Log Your Trades</h3>
              <p className="text-gray-600 leading-relaxed">
                Record your trades with our intuitive interface. Add screenshots, notes, and detailed analysis.
              </p>
                  </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto shadow-xl">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Analyze & Improve</h3>
              <p className="text-gray-600 leading-relaxed">
                Get detailed analytics and AI-powered insights to identify patterns and improve your trading performance.
              </p>
            </div>
          </div>
        </div>
      </section>

        {/* Testimonials Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Trusted by Professional Traders
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See what our users say about their trading transformation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Testimonial 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
              <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
              <p className="text-gray-700 leading-relaxed mb-6">
                "This platform completely transformed my trading. The analytics helped me identify my weaknesses and improve my win rate by 40%."
                  </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">MJ</span>
                    </div>
                <div className="ml-4">
                  <div className="font-semibold text-gray-900">Michael Johnson</div>
                  <div className="text-gray-600 text-sm">Forex Trader</div>
                </div>
                </div>
              </div>

              {/* Testimonial 2 */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-100">
              <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
              <p className="text-gray-700 leading-relaxed mb-6">
                "The AI insights are incredible. It's like having a trading mentor available 24/7. My consistency improved dramatically."
                  </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">SC</span>
                    </div>
                <div className="ml-4">
                  <div className="font-semibold text-gray-900">Sarah Chen</div>
                  <div className="text-gray-600 text-sm">Day Trader</div>
                </div>
                </div>
              </div>

              {/* Testimonial 3 */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100">
              <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
              <p className="text-gray-700 leading-relaxed mb-6">
                "Best trading journal I've ever used. The interface is intuitive and the analytics are professional-grade."
                  </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">DR</span>
                    </div>
                <div className="ml-4">
                  <div className="font-semibold text-gray-900">David Rodriguez</div>
                  <div className="text-gray-600 text-sm">Swing Trader</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
            Ready to Transform Your Trading?
                  </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
            Join thousands of successful traders who use our platform to achieve consistent profitability.
                  </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/login"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
              Start Free Trial
                  </Link>
                  <Link
                    href="/calculator"
              className="inline-flex items-center px-8 py-4 bg-transparent text-white font-semibold rounded-xl border-2 border-white/30 hover:border-white/50 hover:bg-white/10 transition-all duration-300"
                  >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
              Try Calculator
                  </Link>
          </div>
        </div>
      </section>

        {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <span className="text-2xl font-bold">TradingJournal</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                The professional trading platform trusted by thousands of traders worldwide to improve their performance and achieve consistent profitability.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/login" className="text-gray-400 hover:text-white transition-colors">Login</Link></li>
                <li><Link href="/calculator" className="text-gray-400 hover:text-white transition-colors">Calculator</Link></li>
                <li><Link href="/market-hours" className="text-gray-400 hover:text-white transition-colors">Market Hours</Link></li>
                <li><Link href="/forex-news" className="text-gray-400 hover:text-white transition-colors">Forex News</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 TradingJournal. All rights reserved. Built for professional traders.
            </p>
            </div>
          </div>
        </footer>
    </div>
  );
}
