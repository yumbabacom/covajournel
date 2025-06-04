'use client';

import React, { useState, useEffect } from 'react';
import { FlagIcon } from '../components/FlagIcon';
import ForexFactoryAPI from '../services/forexFactoryAPI';
import TradingSignalModal from '../components/TradingSignalModal';
// Removed theme imports - using consistent light theme like home page

// Add custom animations
const customStyles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }

  .shadow-3xl {
    box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = customStyles;
  document.head.appendChild(styleSheet);
}

interface EconomicEvent {
  id: string;
  time: Date;
  currency: string;
  importance: 'low' | 'medium' | 'high';
  title: string;
  country: string;
  actual?: string;
  forecast?: string;
  previous?: string;
  impact: 'positive' | 'negative' | 'neutral' | 'pending';
  category: string;
  status?: 'upcoming' | 'live' | 'released';
  description: string;
}

export default function EconomicCalendar() {
  // State management
  const [allEvents, setAllEvents] = useState<EconomicEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EconomicEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('today');
  const [selectedImportance, setSelectedImportance] = useState('all');
  const [selectedCurrency, setSelectedCurrency] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter dropdown states
  const [showTimeframeDropdown, setShowTimeframeDropdown] = useState(false);
  const [showImportanceDropdown, setShowImportanceDropdown] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  // Temporary filter states for dropdowns
  const [tempTimeframe, setTempTimeframe] = useState(selectedTimeframe);
  const [tempImportance, setTempImportance] = useState(selectedImportance);
  const [tempCurrency, setTempCurrency] = useState(selectedCurrency);
  const [tempStatus, setTempStatus] = useState(selectedStatus);


  // Fetch data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const api = new ForexFactoryAPI();
      const events = await api.generateEconomicCalendar('all');
      setAllEvents(events);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter events
  useEffect(() => {
    let filtered = [...allEvents];

    // Filter by timeframe
    if (selectedTimeframe !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      switch (selectedTimeframe) {
        case 'today':
          filtered = filtered.filter(event => {
            const eventDate = new Date(event.time.getFullYear(), event.time.getMonth(), event.time.getDate());
            return eventDate.getTime() === today.getTime();
          });
          break;
        case 'tomorrow':
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          filtered = filtered.filter(event => {
            const eventDate = new Date(event.time.getFullYear(), event.time.getMonth(), event.time.getDate());
            return eventDate.getTime() === tomorrow.getTime();
          });
          break;
        case 'week':
          const weekFromNow = new Date(today);
          weekFromNow.setDate(weekFromNow.getDate() + 7);
          filtered = filtered.filter(event => event.time >= today && event.time <= weekFromNow);
          break;
      }
    }

    // Filter by importance
    if (selectedImportance !== 'all') {
      filtered = filtered.filter(event => event.importance === selectedImportance);
    }

    // Filter by currency
    if (selectedCurrency !== 'all') {
      filtered = filtered.filter(event => event.currency === selectedCurrency);
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(event => getEventStatus(event) === selectedStatus);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.currency.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  }, [allEvents, selectedTimeframe, selectedImportance, selectedCurrency, selectedStatus, searchQuery]);

  // Handle trading signal modal
  const handleViewTradingSignal = (event: EconomicEvent) => {
    // Redirect to login page instead of showing modal
    window.location.href = '/login';
  };

  // Filter application functions
  const applyTimeframeFilter = () => {
    setSelectedTimeframe(tempTimeframe);
    setShowTimeframeDropdown(false);
  };

  const applyImportanceFilter = () => {
    setSelectedImportance(tempImportance);
    setShowImportanceDropdown(false);
  };

  const applyCurrencyFilter = () => {
    setSelectedCurrency(tempCurrency);
    setShowCurrencyDropdown(false);
  };

  const applyStatusFilter = () => {
    setSelectedStatus(tempStatus);
    setShowStatusDropdown(false);
  };

  // Reset temp values when opening dropdowns
  const openTimeframeDropdown = () => {
    setTempTimeframe(selectedTimeframe);
    setShowTimeframeDropdown(true);
  };

  const openImportanceDropdown = () => {
    setTempImportance(selectedImportance);
    setShowImportanceDropdown(true);
  };

  const openCurrencyDropdown = () => {
    setTempCurrency(selectedCurrency);
    setShowCurrencyDropdown(true);
  };

  const openStatusDropdown = () => {
    setTempStatus(selectedStatus);
    setShowStatusDropdown(true);
  };

  // Helper functions
  const getEventStatus = (event: EconomicEvent): 'upcoming' | 'live' | 'released' => {
    const now = Date.now();
    const eventTime = event.time.getTime();
    const timeDiff = eventTime - now;

    // If event has actual data, it's released
    if (event.actual) {
      return 'released';
    }

    // If event is within 1 hour (before or after), it's live
    if (Math.abs(timeDiff) <= 60 * 60 * 1000) {
      return 'live';
    }

    // If event is in the future, it's upcoming
    if (timeDiff > 0) {
      return 'upcoming';
    }

    // If event is in the past without actual data, consider it released
    return 'released';
  };

  const getStatusTagStyle = (status: 'upcoming' | 'live' | 'released') => {
    switch (status) {
      case 'live':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800 animate-pulse';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
      case 'released':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800';
    }
  };

  const getStatusIcon = (status: 'upcoming' | 'live' | 'released') => {
    switch (status) {
      case 'live':
        return (
          <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
      case 'upcoming':
        return (
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'released':
        return (
          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
      case 'low': return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800';
    }
  };

  const getImpactColor = (impact?: string) => {
    switch (impact) {
      case 'positive': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'negative': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  // Calculate event counts by status for today
  const getTodaysEvents = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return allEvents.filter(event => {
      const eventDate = new Date(event.time.getFullYear(), event.time.getMonth(), event.time.getDate());
      return eventDate.getTime() === today.getTime();
    });
  };

  const todaysEvents = getTodaysEvents();
  const liveEvents = todaysEvents.filter(event => getEventStatus(event) === 'live');
  const upcomingEvents = todaysEvents.filter(event => getEventStatus(event) === 'upcoming');
  const releasedEvents = todaysEvents.filter(event => getEventStatus(event) === 'released');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 relative overflow-hidden">
      {/* Enhanced Background Elements - matching home page */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-indigo-600/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-purple-400/30 to-pink-600/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-gradient-to-r from-cyan-400/20 to-blue-600/20 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Main Content - matching home page structure */}
      <div className="relative z-10">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-md border-b border-blue-100 shadow-sm">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="text-center">
              <div className="inline-flex items-center space-x-3 mb-4">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
                  <div className="relative w-16 h-16 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-2xl shadow-blue-500/25 flex items-center justify-center group-hover:scale-105 transition-all duration-300">
                    <div className="absolute inset-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl opacity-60"></div>
                    <svg className="relative w-8 h-8 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Economic Calendar
                  </span>
                </h1>
              </div>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                Today's economic events and market-moving news - Live, Upcoming & Released
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Total Events */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Today's Events</p>
                  <p className="text-3xl font-black text-gray-900">{todaysEvents.length}</p>
                </div>
              </div>
            </div>

            {/* Live Events */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-pink-100 rounded-xl flex items-center justify-center mr-4">
                  <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Live Events</p>
                  <p className="text-3xl font-black text-gray-900">{liveEvents.length}</p>
                </div>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Upcoming</p>
                  <p className="text-3xl font-black text-gray-900">{upcomingEvents.length}</p>
                </div>
              </div>
            </div>

            {/* Released Events */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Released</p>
                  <p className="text-3xl font-black text-gray-900">{releasedEvents.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Status Summary */}
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 mb-8">
            <h2 className="text-2xl font-black text-gray-900 mb-6">Today's Event Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Live Events Summary */}
              <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6 border border-red-100 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-bold text-red-800">Live Events</span>
                  </div>
                  <span className="text-2xl font-black text-red-800">{liveEvents.length}</span>
                </div>
                <p className="text-xs text-red-600 mt-2 font-semibold">Happening now</p>
              </div>

              {/* Upcoming Events Summary */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-blue-600 text-lg">⏰</span>
                    <span className="text-sm font-bold text-blue-800">Upcoming</span>
                  </div>
                  <span className="text-2xl font-black text-blue-800">{upcomingEvents.length}</span>
                </div>
                <p className="text-xs text-blue-600 mt-2 font-semibold">Scheduled today</p>
              </div>

              {/* Released Events Summary */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-green-600 text-lg">✅</span>
                    <span className="text-sm font-bold text-green-800">Released</span>
                  </div>
                  <span className="text-2xl font-black text-green-800">{releasedEvents.length}</span>
                </div>
                <p className="text-xs text-green-600 mt-2 font-semibold">Data published</p>
              </div>
            </div>
          </div>



          {/* Events List */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-2xl font-black text-gray-900">
                Economic Events ({filteredEvents.length})
              </h2>

              {/* Filter Buttons */}
              <div className="flex items-center space-x-3">
                {/* Timeframe Filter */}
                <div className="relative">
                  <button
                    onClick={openTimeframeDropdown}
                    className="bg-white/80 backdrop-blur-sm px-3 py-2 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 flex items-center space-x-2"
                  >
                    <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      {selectedTimeframe === 'all' ? 'All Time' : selectedTimeframe === 'today' ? 'Today' : selectedTimeframe === 'tomorrow' ? 'Tomorrow' : 'This Week'}
                    </span>
                    <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showTimeframeDropdown && (
                    <div className="absolute top-full mt-2 right-0 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-50 min-w-48">
                      <div className="space-y-2 mb-4">
                        {['all', 'today', 'tomorrow', 'week'].map((option) => (
                          <label key={option} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              name="timeframe"
                              value={option}
                              checked={tempTimeframe === option}
                              onChange={(e) => setTempTimeframe(e.target.value)}
                              className="text-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">
                              {option === 'all' ? 'All Events' : option === 'today' ? 'Today' : option === 'tomorrow' ? 'Tomorrow' : 'This Week'}
                            </span>
                          </label>
                        ))}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={applyTimeframeFilter}
                          className="bg-blue-500 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-blue-600 transition-colors"
                        >
                          OK
                        </button>
                        <button
                          onClick={() => setShowTimeframeDropdown(false)}
                          className="bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-xs font-semibold hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Importance Filter */}
                <div className="relative">
                  <button
                    onClick={openImportanceDropdown}
                    className="bg-white/80 backdrop-blur-sm px-3 py-2 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 flex items-center space-x-2"
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      selectedImportance === 'high' ? 'bg-red-500' :
                      selectedImportance === 'medium' ? 'bg-yellow-500' :
                      selectedImportance === 'low' ? 'bg-green-500' : 'bg-gray-500'
                    }`}></div>
                    <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      {selectedImportance === 'all' ? 'All Impact' : selectedImportance}
                    </span>
                    <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showImportanceDropdown && (
                    <div className="absolute top-full mt-2 right-0 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-50 min-w-48">
                      <div className="space-y-2 mb-4">
                        {['all', 'high', 'medium', 'low'].map((option) => (
                          <label key={option} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              name="importance"
                              value={option}
                              checked={tempImportance === option}
                              onChange={(e) => setTempImportance(e.target.value)}
                              className="text-blue-500"
                            />
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${
                                option === 'high' ? 'bg-red-500' :
                                option === 'medium' ? 'bg-yellow-500' :
                                option === 'low' ? 'bg-green-500' : 'bg-gray-500'
                              }`}></div>
                              <span className="text-sm font-medium text-gray-700">
                                {option === 'all' ? 'All Levels' : option.charAt(0).toUpperCase() + option.slice(1) + ' Impact'}
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={applyImportanceFilter}
                          className="bg-blue-500 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-blue-600 transition-colors"
                        >
                          OK
                        </button>
                        <button
                          onClick={() => setShowImportanceDropdown(false)}
                          className="bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-xs font-semibold hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Currency Filter */}
                <div className="relative">
                  <button
                    onClick={openCurrencyDropdown}
                    className="bg-white/80 backdrop-blur-sm px-3 py-2 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 flex items-center space-x-2"
                  >
                    <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      {selectedCurrency === 'all' ? 'All Currencies' : selectedCurrency}
                    </span>
                    <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showCurrencyDropdown && (
                    <div className="absolute top-full mt-2 right-0 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-50 min-w-48">
                      <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                        {['all', 'USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'NZD'].map((option) => (
                          <label key={option} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              name="currency"
                              value={option}
                              checked={tempCurrency === option}
                              onChange={(e) => setTempCurrency(e.target.value)}
                              className="text-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">
                              {option === 'all' ? 'All Currencies' : option}
                            </span>
                          </label>
                        ))}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={applyCurrencyFilter}
                          className="bg-blue-500 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-blue-600 transition-colors"
                        >
                          OK
                        </button>
                        <button
                          onClick={() => setShowCurrencyDropdown(false)}
                          className="bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-xs font-semibold hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Status Filter */}
                <div className="relative">
                  <button
                    onClick={openStatusDropdown}
                    className="bg-white/80 backdrop-blur-sm px-3 py-2 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 flex items-center space-x-2"
                  >
                    <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      {selectedStatus === 'all' ? 'All Status' : 
                       selectedStatus === 'live' ? (
                         <span className="flex items-center space-x-1">
                           <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                             <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                           </svg>
                           <span>Live</span>
                         </span>
                       ) : 
                       selectedStatus === 'upcoming' ? (
                         <span className="flex items-center space-x-1">
                           <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                           </svg>
                           <span>Upcoming</span>
                         </span>
                       ) : (
                         <span className="flex items-center space-x-1">
                           <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                             <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                           </svg>
                           <span>Released</span>
                         </span>
                       )}
                    </span>
                  </button>

                  {showStatusDropdown && (
                    <div className="absolute top-full mt-2 right-0 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-50 min-w-48">
                      <div className="space-y-2 mb-4">
                        {['all', 'live', 'upcoming', 'released'].map((option) => (
                          <label key={option} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              name="status"
                              value={option}
                              checked={tempStatus === option}
                              onChange={(e) => setTempStatus(e.target.value)}
                              className="text-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">
                              {option === 'all' ? 'All Status' : 
                               option === 'live' ? (
                                 <span className="flex items-center space-x-2">
                                   <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                   </svg>
                                   <span>Live</span>
                                 </span>
                               ) : 
                               option === 'upcoming' ? (
                                 <span className="flex items-center space-x-2">
                                   <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                   </svg>
                                   <span>Upcoming</span>
                                 </span>
                               ) : (
                                 <span className="flex items-center space-x-2">
                                   <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                   </svg>
                                   <span>Released</span>
                                 </span>
                               )}
                            </span>
                          </label>
                        ))}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={applyStatusFilter}
                          className="bg-blue-500 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-blue-600 transition-colors"
                        >
                          OK
                        </button>
                        <button
                          onClick={() => setShowStatusDropdown(false)}
                          className="bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-xs font-semibold hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mx-auto mb-6"></div>
                <p className="text-gray-600 font-semibold">Loading events...</p>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-gray-400 text-6xl mb-6">
                  <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-4">No Events Found</h3>
                <p className="text-gray-600 text-lg">Try adjusting your filters to see more events.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredEvents.map((event, index) => {
                  const eventStatus = getEventStatus(event);
                  const isLive = eventStatus === 'live';
                  const isUpcoming = eventStatus === 'upcoming';
                  const isReleased = eventStatus === 'released';

                  return (
                    <div
                      key={event.id}
                      className={`group relative overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-lg ${
                        isLive
                          ? 'bg-white border-2 border-red-200 shadow-lg'
                          : 'bg-white border border-gray-200 shadow-lg hover:border-blue-200'
                      }`}
                      style={{
                        animationDelay: `${index * 100}ms`,
                        animation: 'fadeInUp 0.6s ease-out forwards'
                      }}
                    >
                      {/* Simple Live Event Indicator */}
                      {isLive && (
                        <div className="absolute top-4 right-4 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      )}

                      <div className="relative p-8">
                        {/* Luxury Header Row */}
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center space-x-6">
                            {/* Simple Time Badge */}
                            <div className="bg-white/80 backdrop-blur-sm px-4 py-3 rounded-xl border border-gray-200 shadow-sm">
                              <div className="flex items-center space-x-3">
                                {isLive && (
                                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                )}
                                <span className="font-semibold text-gray-700 text-sm">
                                  {event.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <div className="w-1 h-4 bg-gray-300 rounded-full"></div>
                                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                  {isLive ? 'LIVE' : isUpcoming ? 'UPCOMING' : 'RELEASED'}
                                </span>
                              </div>
                            </div>

                            {/* Event Title with Flag Badge */}
                            <div className="bg-white/80 backdrop-blur-sm px-4 py-3 rounded-xl border border-gray-200 shadow-sm flex-1">
                              <div className="flex items-center space-x-3">
                                <FlagIcon
                                  countryCode={
                                    event.currency === 'USD' ? 'US' :
                                    event.currency === 'EUR' ? 'EU' :
                                    event.currency === 'GBP' ? 'GB' :
                                    event.currency === 'JPY' ? 'JP' :
                                    event.currency === 'CHF' ? 'CH' :
                                    event.currency === 'CAD' ? 'CA' :
                                    event.currency === 'AUD' ? 'AU' :
                                    event.currency === 'NZD' ? 'NZ' : 'US'
                                  }
                                  className="w-4 h-3 rounded shadow-sm"
                                />
                                <span className="font-semibold text-gray-700 text-xs uppercase tracking-wide">
                                  {event.currency}
                                </span>
                                <div className="w-1 h-4 bg-gray-300 rounded-full"></div>
                                <h3 className="text-sm font-bold text-gray-900 leading-tight">
                                  {event.title}
                                </h3>
                              </div>
                            </div>
                          </div>

                          {/* Right Side Tags */}
                          <div className="flex items-center space-x-3">
                            {/* Impact Tag */}
                            <div className="bg-white/80 backdrop-blur-sm px-3 py-2 rounded-xl border border-gray-200 shadow-sm">
                              <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${
                                  event.importance === 'high' ? 'bg-red-500' :
                                  event.importance === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                                }`}></div>
                                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                  {event.importance}
                                </span>
                              </div>
                            </div>

                            {/* Small AI Button */}
                            <button
                              onClick={() => handleViewTradingSignal(event)}
                              className="bg-white/80 backdrop-blur-sm px-3 py-2 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
                            >
                              <div className="flex items-center space-x-2">
                                <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                  AI Signal
                                </span>
                              </div>
                            </button>
                          </div>
                        </div>

                        {/* Country and Economic Data Section */}
                        <div className="mb-6">

                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 border border-gray-200 shadow-sm">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="font-semibold text-gray-700">{event.country}</span>
                              <div className="w-1 h-3 bg-gray-300 rounded-full"></div>
                              <span className="font-medium text-gray-600">{event.category}</span>
                            </div>

                            {/* Economic Data Tags */}
                            {(event.actual || event.forecast || event.previous) && (
                              <div className="flex items-center space-x-2">
                                {event.actual && (
                                  <div className="bg-white/80 backdrop-blur-sm px-3 py-2 rounded-xl border border-gray-200 shadow-sm">
                                    <div className="flex items-center space-x-2">
                                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                      <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                        A: {event.actual}
                                      </span>
                                    </div>
                                  </div>
                                )}
                                {event.forecast && (
                                  <div className="bg-white/80 backdrop-blur-sm px-3 py-2 rounded-xl border border-gray-200 shadow-sm">
                                    <div className="flex items-center space-x-2">
                                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                      <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                        F: {event.forecast}
                                      </span>
                                    </div>
                                  </div>
                                )}
                                {event.previous && (
                                  <div className="bg-white/80 backdrop-blur-sm px-3 py-2 rounded-xl border border-gray-200 shadow-sm">
                                    <div className="flex items-center space-x-2">
                                      <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                                      <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                        P: {event.previous}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>




                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>


      </div>
    </div>
  );
}