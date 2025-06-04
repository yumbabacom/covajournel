'use client';

import React, { useState, useEffect } from 'react';
import { FlagIcon } from '../components/FlagIcon';
import ForexFactoryAPI from '../services/forexFactoryAPI';
import TradingSignalModal from '../components/TradingSignalModal';
// Removed theme imports - using consistent light theme like home page

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
  impact?: 'positive' | 'negative' | 'neutral';
  category: string;
  status?: 'upcoming' | 'live' | 'released';
}

export default function SimpleEconomicCalendar() {
  // State management
  const [allEvents, setAllEvents] = useState<EconomicEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EconomicEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('today');
  const [selectedImportance, setSelectedImportance] = useState('all');
  const [selectedCurrency, setSelectedCurrency] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<EconomicEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.currency.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  }, [allEvents, selectedTimeframe, selectedImportance, selectedCurrency, searchQuery]);

  // Handle trading signal modal
  const handleViewTradingSignal = (event: EconomicEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
    setIsModalOpen(false);
  };

  // Helper functions
  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getImpactColor = (impact?: string) => {
    switch (impact) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const liveEvents = allEvents.filter(event =>
    Math.abs(event.time.getTime() - Date.now()) < 60 * 60 * 1000
  );

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:to-slate-800 transition-all duration-500">
        {/* Theme Toggle */}
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>

        {/* Header */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="text-center">
              <div className="inline-flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Economic Calendar</h1>
              </div>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Stay updated with the latest economic events and market-moving news
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Total Events */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Events</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{allEvents.length}</p>
                </div>
              </div>
            </div>

            {/* Live Events */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mr-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Live Events</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{liveEvents.length}</p>
                </div>
              </div>
            </div>

            {/* Filtered Events */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Filtered</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredEvents.length}</p>
                </div>
              </div>
            </div>

            {/* High Impact */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">High Impact</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{allEvents.filter(e => e.importance === 'high').length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Simple Filters */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filter Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Timeframe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Timeframe</label>
                <select
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Events</option>
                  <option value="today">Today</option>
                  <option value="tomorrow">Tomorrow</option>
                  <option value="week">This Week</option>
                </select>
              </div>

              {/* Importance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Importance</label>
                <select
                  value={selectedImportance}
                  onChange={(e) => setSelectedImportance(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Levels</option>
                  <option value="high">High Impact</option>
                  <option value="medium">Medium Impact</option>
                  <option value="low">Low Impact</option>
                </select>
              </div>

              {/* Currency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Currency</label>
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Currencies</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="JPY">JPY</option>
                  <option value="CHF">CHF</option>
                  <option value="CAD">CAD</option>
                  <option value="AUD">AUD</option>
                  <option value="NZD">NZD</option>
                </select>
              </div>

              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search events..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Events List */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Economic Events ({filteredEvents.length})
              </h2>
            </div>

            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading events...</p>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-400 text-4xl mb-4">📊</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Events Found</h3>
                <p className="text-gray-600 dark:text-gray-400">Try adjusting your filters to see more events.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-slate-700">
                {filteredEvents.map((event) => {
                  const isLive = Math.abs(event.time.getTime() - Date.now()) < 60 * 60 * 1000;
                  return (
                    <div key={event.id} className={`p-6 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors ${isLive ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500' : ''}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <div className="flex items-center space-x-2">
                              {isLive && <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>}
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {event.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
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
                                className="w-5 h-4"
                              />
                              <span className="text-sm font-bold text-gray-900 dark:text-white">{event.currency}</span>
                            </div>
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getImportanceColor(event.importance)}`}>
                              {event.importance.toUpperCase()}
                            </span>
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">{event.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{event.country} • {event.category}</p>
                          {(event.actual || event.forecast || event.previous) && (
                            <div className="flex items-center space-x-4 mt-2">
                              {event.actual && (
                                <span className={`text-sm px-2 py-1 rounded ${getImpactColor(event.impact)}`}>
                                  Actual: {event.actual}
                                </span>
                              )}
                              {event.forecast && (
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  Forecast: {event.forecast}
                                </span>
                              )}
                              {event.previous && (
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  Previous: {event.previous}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleViewTradingSignal(event)}
                          className="ml-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          <span>AI Signal</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Trading Signal Modal */}
        <TradingSignalModal
          event={selectedEvent}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </div>
    </ThemeProvider>
  );
}