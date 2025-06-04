'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/AuthProvider';
import Link from 'next/link';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [error, setError] = useState('');
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render login form if user is authenticated
  if (user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Login logic
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        });

        const data = await response.json();
        if (response.ok) {
          login(data.token, data.user);
          router.push('/dashboard');
        } else {
          setError(data.error || 'Login failed');
        }
      } else {
        // Signup logic
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return;
        }

        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password
          })
        });

        const data = await response.json();
        if (response.ok) {
          login(data.token, data.user);
          router.push('/dashboard');
        } else {
          setError(data.error || 'Registration failed');
        }
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-indigo-600/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-purple-400/30 to-pink-600/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-gradient-to-r from-cyan-400/20 to-blue-600/20 rounded-full blur-2xl animate-pulse delay-500"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-l from-emerald-400/20 to-teal-600/20 rounded-full blur-3xl animate-pulse delay-700"></div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-4 h-4 bg-blue-400/40 rounded-full animate-bounce"></div>
        <div className="absolute top-40 right-20 w-6 h-6 bg-purple-400/40 rounded-full animate-bounce delay-300"></div>
        <div className="absolute bottom-40 left-20 w-5 h-5 bg-indigo-400/40 rounded-full animate-bounce delay-700"></div>
        <div className="absolute bottom-20 right-10 w-3 h-3 bg-pink-400/40 rounded-full animate-bounce delay-1000"></div>
      </div>



      <div className="relative z-10 flex items-center justify-center min-h-screen pt-16 sm:pt-20 pb-6 sm:pb-8">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
              {/* Left Side - Professional Marketing Content */}
              <div className="text-center lg:text-left order-2 lg:order-1">
                {/* Professional Hero Icon */}
                <div className="relative mb-6 sm:mb-8">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full blur-2xl"></div>
                  <div className="relative inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl sm:rounded-2xl shadow-xl shadow-blue-500/25 transform hover:scale-105 transition-all duration-300">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>

                {/* Professional Typography */}
                <div className="space-y-4 sm:space-y-6">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                    <span className="block text-gray-900 mb-1 sm:mb-2">
                      {isLogin ? 'Welcome Back to' : 'Join the Future of'}
                    </span>
                    <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Professional Trading
                    </span>
                  </h1>

                  <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-lg mx-auto lg:mx-0">
                    {isLogin
                      ? 'Continue your journey to trading mastery with our comprehensive analytics and professional tools.'
                      : 'Join over 10,000+ successful traders who trust CovaJournal for their trading analytics and performance tracking.'
                    }
                  </p>

                  {/* Professional Stats */}
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-4 mt-6 sm:mt-8">
                    <div className="flex items-center space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 shadow-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-700 font-medium text-xs sm:text-sm">10,000+ Traders</span>
                    </div>
                    <div className="flex items-center space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 shadow-sm">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      <span className="text-gray-700 font-medium text-xs sm:text-sm">1M+ Trades</span>
                    </div>
                    <div className="flex items-center space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 shadow-sm">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-gray-700 font-medium text-xs sm:text-sm">99.9% Uptime</span>
                    </div>
                  </div>
                </div>

                {/* Simple Features List */}
                <div className="space-y-3 sm:space-y-4 mt-6 sm:mt-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-gray-700 font-medium text-sm sm:text-base">Advanced Trade Analytics</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <span className="text-gray-700 font-medium text-sm sm:text-base">Bank-Level Security</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <span className="text-gray-700 font-medium text-sm sm:text-base">Real-Time Calculations</span>
                  </div>
                </div>

                {/* Trust Indicators */}
                <div className="flex items-center justify-center lg:justify-start space-x-6 mt-8 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span>4.9/5 Rating</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Trusted</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>SSL Secured</span>
                  </div>
                </div>
              </div>

              {/* Right Side - Beautiful Unique Form */}
              <div className="relative order-1 lg:order-2">
                {/* Enhanced Background Effects */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl sm:rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/50 rounded-2xl sm:rounded-3xl"></div>

                {/* Unique Form Container */}
                <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                  {/* Artistic Header */}
                  <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 px-6 sm:px-8 py-8 sm:py-10 text-center overflow-hidden">
                    {/* Floating Elements */}
                    <div className="absolute top-4 left-4 w-16 h-16 sm:w-20 sm:h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
                    <div className="absolute bottom-4 right-4 w-12 h-12 sm:w-16 sm:h-16 bg-white/10 rounded-full blur-lg animate-pulse delay-700"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 sm:w-32 sm:h-32 bg-white/5 rounded-full blur-2xl"></div>

                    {/* Icon with Animation */}
                    <div className="relative mb-4 sm:mb-6">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto transform hover:scale-110 transition-all duration-500 group">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-white/10 rounded-xl sm:rounded-2xl"></div>
                        <svg className="relative w-8 h-8 sm:w-10 sm:h-10 text-white group-hover:rotate-12 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>

                    {/* Dynamic Title */}
                    <div className="relative">
                      <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 sm:mb-3 tracking-tight">
                        {isLogin ? (
                          <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                            Welcome Back!
                          </span>
                        ) : (
                          <span className="bg-gradient-to-r from-white via-purple-100 to-white bg-clip-text text-transparent">
                            Join CovaJournal
                          </span>
                        )}
                      </h2>
                      <p className="text-white/90 text-sm sm:text-base font-medium">
                        {isLogin
                          ? 'Continue your trading journey with us'
                          : 'Start your professional trading journey'
                        }
                      </p>

                      {/* Decorative Line */}
                      <div className="flex items-center justify-center space-x-2 mt-3 sm:mt-4">
                        <div className="h-0.5 w-6 sm:w-8 bg-white/40 rounded-full"></div>
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/60 rounded-full animate-pulse"></div>
                        <div className="h-0.5 w-6 sm:w-8 bg-white/40 rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  {/* Beautiful Form Content */}
                  <div className="p-6 sm:p-8">
                    {/* Elegant Tab Switcher */}
                    <div className="relative mb-6 sm:mb-8">
                      <div className="flex bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl sm:rounded-2xl p-1 sm:p-1.5 shadow-inner">
                        <button
                          type="button"
                          onClick={() => {
                            setIsLogin(true);
                            setError('');
                            setFormData({ email: '', password: '', confirmPassword: '', name: '' });
                          }}
                          className={`flex-1 py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 transform ${
                            isLogin
                              ? 'bg-white text-blue-600 shadow-lg scale-105 border border-blue-100'
                              : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                          }`}
                        >
                          <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            </svg>
                            <span className="text-sm sm:text-base">Sign In</span>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsLogin(false);
                            setError('');
                            setFormData({ email: '', password: '', confirmPassword: '', name: '' });
                          }}
                          className={`flex-1 py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 transform ${
                            !isLogin
                              ? 'bg-white text-purple-600 shadow-lg scale-105 border border-purple-100'
                              : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                          }`}
                        >
                          <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            <span className="text-sm sm:text-base">Sign Up</span>
                          </div>
                        </button>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                      {error && (
                        <div className="relative bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-400 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <p className="ml-3 text-red-700 font-medium text-sm sm:text-base">{error}</p>
                          </div>
                        </div>
                      )}

                      {!isLogin && (
                        <div className="group">
                          <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-purple-600 transition-colors duration-200">
                            Full Name
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white transition-all duration-300 placeholder-gray-400 font-medium shadow-sm hover:shadow-md text-base"
                              placeholder="Enter your full name"
                              required={!isLogin}
                            />
                          </div>
                        </div>
                      )}

                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors duration-200">
                          Email Address
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                            </svg>
                          </div>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-300 placeholder-gray-400 font-medium shadow-sm hover:shadow-md text-base"
                            placeholder="Enter your email address"
                            required
                          />
                        </div>
                      </div>

                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-indigo-600 transition-colors duration-200">
                          Password
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </div>
                          <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all duration-300 placeholder-gray-400 font-medium shadow-sm hover:shadow-md text-base"
                            placeholder="Enter your password"
                            required
                          />
                        </div>
                      </div>

                      {!isLogin && (
                        <div className="group">
                          <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-green-600 transition-colors duration-200">
                            Confirm Password
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <svg className="w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <input
                              type="password"
                              name="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={handleInputChange}
                              className="w-full pl-12 pr-4 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-all duration-300 placeholder-gray-400 font-medium shadow-sm hover:shadow-md"
                              placeholder="Confirm your password"
                              required={!isLogin}
                            />
                          </div>
                        </div>
                      )}

                      {isLogin && (
                        <div className="flex items-center justify-between">
                          <label className="flex items-center group cursor-pointer">
                            <div className="relative">
                              <input type="checkbox" className="sr-only" />
                              <div className="w-5 h-5 bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300 rounded-md group-hover:border-blue-400 transition-all duration-200"></div>
                              <svg className="absolute inset-0 w-5 h-5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <span className="ml-3 text-gray-600 font-medium group-hover:text-gray-800 transition-colors duration-200">Remember me</span>
                          </label>
                          <button type="button" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-all duration-200">
                            Forgot password?
                          </button>
                        </div>
                      )}

                      {/* Beautiful Submit Button */}
                      <div className="pt-4">
                        <button
                          type="submit"
                          disabled={isLoading}
                          className={`group relative w-full py-4 px-6 overflow-hidden rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                            isLogin
                              ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40'
                              : 'bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40'
                          } text-white`}
                        >
                          {/* Button Background Animation */}
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                          {/* Button Content */}
                          <div className="relative flex items-center justify-center space-x-3">
                            {isLoading ? (
                              <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>{isLogin ? 'Signing In...' : 'Creating Account...'}</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  {isLogin ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                  ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                  )}
                                </svg>
                                <span>{isLogin ? 'Sign In to Dashboard' : 'Create Account & Start Trading'}</span>
                              </>
                            )}
                          </div>
                        </button>
                      </div>
                    </form>

                    {/* Beautiful Footer */}
                    <div className="mt-8 text-center space-y-4">
                      {/* Divider */}
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-4 bg-white text-gray-500 font-medium">Secure & Trusted</span>
                        </div>
                      </div>

                      {/* Security Badges */}
                      <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          <span>SSL Encrypted</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.5-1.5a11 11 0 11-22 0 11 11 0 0122 0z" />
                          </svg>
                          <span>GDPR Compliant</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          <span>Trusted Platform</span>
                        </div>
                      </div>

                      {/* Terms */}
                      <p className="text-xs text-gray-500 leading-relaxed max-w-sm mx-auto">
                        By {isLogin ? 'signing in' : 'creating an account'}, you agree to our{' '}
                        <a href="#" className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-all duration-200">Terms of Service</a>{' '}
                        and{' '}
                        <a href="#" className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-all duration-200">Privacy Policy</a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
