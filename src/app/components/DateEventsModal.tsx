import React from 'react';
import { FlagIcon } from './FlagIcon';

interface EconomicEvent {
  id: string;
  title: string;
  country: string;
  currency: string;
  time: Date;
  importance: 'low' | 'medium' | 'high';
  forecast?: string;
  previous?: string;
  actual?: string;
  description: string;
  category: string;
  impact: 'positive' | 'negative' | 'neutral' | 'pending';
  source: string;
  unit?: string;
  frequency: string;
  volatility: 'low' | 'medium' | 'high';
  isLive?: boolean;
  timeUntil?: string;
}

interface DateEventsModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  events: EconomicEvent[];
  onEventClick: (event: EconomicEvent) => void;
}

export default function DateEventsModal({ isOpen, onClose, date, events, onEventClick }: DateEventsModalProps) {
  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !date) return null;

  // Sort events by time
  const sortedEvents = [...events].sort((a, b) => a.time.getTime() - b.time.getTime());

  // Get importance color
  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get impact color
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return 'text-green-600 bg-green-50';
      case 'negative': return 'text-red-600 bg-red-50';
      case 'neutral': return 'text-gray-600 bg-gray-50';
      default: return 'text-yellow-600 bg-yellow-50';
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Check if event has actual data (for AI signal eligibility)
  const hasActualData = (event: EconomicEvent) => {
    return event.actual && event.actual !== '' && event.actual !== '-';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xl flex items-center justify-center z-50 p-4">
      <div className="relative group max-w-6xl w-full max-h-[95vh] overflow-hidden">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
        <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl border border-gray-200 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50"></div>
            <div className="relative p-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-8">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl hover:scale-105 transition-transform duration-300">
                    <span className="text-4xl">📅</span>
                  </div>
                  <div>
                    <h2 className="text-5xl font-black text-gray-800 mb-3">Economic Events</h2>
                    <p className="text-gray-600 text-2xl font-bold">{formatDate(date)}</p>
                    <p className="text-gray-500 text-lg mt-3 flex items-center space-x-3">
                      <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                      <span>{events.length} events scheduled</span>
                    </p>
                  </div>
                </div>
                <div className="group relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-red-400 to-pink-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                  <button
                    onClick={onClose}
                    className="relative w-14 h-14 bg-white/80 backdrop-blur-xl hover:bg-white rounded-2xl flex items-center justify-center transition-all duration-300 border border-red-200 text-gray-700 hover:text-gray-900 shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Events List */}
          <div className="overflow-y-auto max-h-[calc(95vh-250px)] p-8">
            {sortedEvents.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-blue-300 text-8xl mb-6">📅</div>
                <h3 className="text-2xl font-bold text-white mb-3">No Events Scheduled</h3>
                <p className="text-blue-200">No economic events are scheduled for this date.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {sortedEvents.map((event) => {
                  const isLive = Math.abs(event.time.getTime() - Date.now()) < 60 * 60 * 1000;
                  const canShowAISignal = hasActualData(event);

                  return (
                    <div
                      key={event.id}
                      className={`group relative transition-all duration-300 ${
                        isLive ? 'animate-pulse' : ''
                      }`}
                    >
                      <div className={`absolute -inset-0.5 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300 ${
                        isLive
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600'
                          : 'bg-gradient-to-r from-slate-600 to-slate-700'
                      }`}></div>
                      <div className={`relative backdrop-blur-xl rounded-2xl p-6 border transition-all duration-300 ${
                        isLive
                          ? 'bg-green-500/10 border-green-500/30 shadow-green-500/20'
                          : 'bg-slate-800/50 border-white/10 hover:bg-slate-700/50 hover:border-white/20'
                      }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            {/* Event Header */}
                            <div className="flex items-center space-x-4 mb-4">
                              <div className="w-10 h-8 rounded-xl bg-slate-600/50 flex items-center justify-center border border-white/10">
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
                                  className="w-6 h-5"
                                />
                              </div>
                              <span className="font-bold text-white text-lg">{event.currency}</span>
                              <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getImportanceColor(event.importance)}`}>
                                {event.importance === 'high' ? '🔴 HIGH' :
                                 event.importance === 'medium' ? '🟡 MEDIUM' : '🟢 LOW'}
                              </span>
                              {isLive && (
                                <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full animate-pulse shadow-lg">
                                  🔴 LIVE
                                </span>
                              )}
                            </div>

                            {/* Event Details */}
                            <div className="mb-6">
                              <h3 className="text-xl font-bold text-white mb-3">{event.title}</h3>
                              <p className="text-blue-200 text-sm mb-3">{event.description}</p>
                              <div className="flex items-center space-x-6 text-sm">
                                <span className="flex items-center space-x-2 text-blue-300">
                                  <span>🕒</span>
                                  <span>{event.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </span>
                                <span className="flex items-center space-x-2 text-blue-300">
                                  <span>🏛️</span>
                                  <span>{event.country}</span>
                                </span>
                                <span className="flex items-center space-x-2 text-blue-300 capitalize">
                                  <span>📊</span>
                                  <span>{event.category}</span>
                                </span>
                              </div>
                            </div>

                            {/* Data Values */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                              <div className="bg-slate-700/50 rounded-xl p-4 border border-white/10">
                                <span className="text-xs font-medium text-blue-200 block mb-2">✅ Actual</span>
                                <span className={`text-lg font-bold px-3 py-2 rounded-lg ${getImpactColor(event.impact)}`}>
                                  {event.actual || '—'}
                                </span>
                              </div>
                              <div className="bg-slate-700/50 rounded-xl p-4 border border-white/10">
                                <span className="text-xs font-medium text-blue-200 block mb-2">🎯 Forecast</span>
                                <span className="text-lg font-bold text-white">
                                  {event.forecast || '—'}
                                </span>
                              </div>
                              <div className="bg-slate-700/50 rounded-xl p-4 border border-white/10">
                                <span className="text-xs font-medium text-blue-200 block mb-2">📈 Previous</span>
                                <span className="text-lg font-bold text-gray-300">
                                  {event.previous || '—'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="ml-6">
                            <div className="group relative">
                              <div className={`absolute -inset-0.5 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300 ${
                                canShowAISignal
                                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600'
                                  : 'bg-gradient-to-r from-gray-600 to-gray-700'
                              }`}></div>
                              <button
                                onClick={() => onEventClick(event)}
                                disabled={!canShowAISignal}
                                className={`relative px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-3 ${
                                  canShowAISignal
                                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border border-indigo-400/30'
                                    : 'bg-slate-600/50 text-gray-400 cursor-not-allowed border border-gray-600/30'
                                }`}
                                title={canShowAISignal ? 'Get AI Trading Signal' : 'AI signals only available for events with actual data'}
                              >
                                <span className="text-lg">🤖</span>
                                <span>{canShowAISignal ? 'Get AI Signal' : 'No Signal'}</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Additional Info */}
                        <div className="mt-6 pt-4 border-t border-white/10">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-blue-300">Source: {event.source}</span>
                            <span className="text-blue-300">Frequency: {event.frequency}</span>
                            {event.unit && <span className="text-blue-300">Unit: {event.unit}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                );
              })}
            </div>
          )}
        </div>

          {/* Footer */}
          <div className="bg-slate-700/30 backdrop-blur-xl border-t border-white/10 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="text-blue-200 flex items-center space-x-2">
                <span className="text-lg">🤖</span>
                <span>Click on any event to view detailed AI trading analysis</span>
              </div>
              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-600 to-slate-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <button
                  onClick={onClose}
                  className="relative bg-slate-600/50 hover:bg-slate-500/50 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 border border-white/10"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
