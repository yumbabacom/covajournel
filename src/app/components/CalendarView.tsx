import React, { useState, useMemo } from 'react';
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

interface CalendarViewProps {
  events: EconomicEvent[];
  onEventClick: (event: EconomicEvent) => void;
  onDateClick: (date: Date, events: EconomicEvent[]) => void;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: EconomicEvent[];
}

export default function CalendarView({ events, onEventClick, onDateClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get the first day of the current month
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  // Get the first day of the calendar grid (might be from previous month)
  const firstDayOfCalendar = new Date(firstDayOfMonth);
  firstDayOfCalendar.setDate(firstDayOfCalendar.getDate() - firstDayOfMonth.getDay());

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      const date = new Date(firstDayOfCalendar);
      date.setDate(date.getDate() + i);

      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.time);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate.getTime() === date.getTime();
      });

      days.push({
        date: new Date(date),
        isCurrentMonth: date.getMonth() === currentDate.getMonth(),
        isToday: date.getTime() === today.getTime(),
        events: dayEvents
      });
    }

    return days;
  }, [firstDayOfCalendar, currentDate, events]);

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get event importance counts for a day
  const getEventCounts = (dayEvents: EconomicEvent[]) => {
    return {
      high: dayEvents.filter(e => e.importance === 'high').length,
      medium: dayEvents.filter(e => e.importance === 'medium').length,
      low: dayEvents.filter(e => e.importance === 'low').length,
      total: dayEvents.length
    };
  };

  // Render event indicators
  const renderEventIndicators = (dayEvents: EconomicEvent[]) => {
    const counts = getEventCounts(dayEvents);

    if (counts.total === 0) return null;

    if (counts.total <= 3) {
      // Show individual dots for 3 or fewer events
      return (
        <div className="flex flex-wrap gap-1 mt-1">
          {dayEvents.slice(0, 3).map((event, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                event.importance === 'high' ? 'bg-red-500' :
                event.importance === 'medium' ? 'bg-yellow-500' :
                'bg-green-500'
              }`}
              title={event.title}
            />
          ))}
        </div>
      );
    } else {
      // Show count badge for more than 3 events
      return (
        <div className="mt-1 flex items-center justify-center">
          <div className="bg-indigo-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {counts.total}
          </div>
        </div>
      );
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="max-w-7xl mx-auto relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
      <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl border border-gray-200 overflow-hidden shadow-2xl">
        {/* Calendar Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50"></div>
          <div className="relative p-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl hover:scale-105 transition-transform duration-300">
                    <span className="text-4xl">📅</span>
                  </div>
                  <div>
                    <h2 className="text-5xl font-black text-gray-800 mb-2">
                      {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h2>
                    <p className="text-gray-600 text-xl font-medium">Economic Calendar View</p>
                  </div>
                </div>
                <div className="group relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                  <button
                    onClick={goToToday}
                    className="relative bg-white/80 backdrop-blur-xl hover:bg-white px-8 py-4 rounded-2xl text-gray-800 font-bold transition-all duration-300 border border-cyan-200 shadow-lg hover:shadow-xl text-lg"
                  >
                    📍 Today
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="group relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                  <button
                    onClick={goToPreviousMonth}
                    className="relative w-14 h-14 bg-white/80 backdrop-blur-xl hover:bg-white rounded-2xl flex items-center justify-center transition-all duration-300 border border-purple-200 text-gray-700 hover:text-gray-900 shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                </div>
                <div className="group relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                  <button
                    onClick={goToNextMonth}
                    className="relative w-14 h-14 bg-white/80 backdrop-blur-xl hover:bg-white rounded-2xl flex items-center justify-center transition-all duration-300 border border-purple-200 text-gray-700 hover:text-gray-900 shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-10">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-3 mb-8">
            {dayNames.map(day => (
              <div key={day} className="text-center py-4">
                <div className="bg-gray-100 backdrop-blur-xl rounded-2xl border border-gray-200 py-4 shadow-md hover:shadow-lg transition-shadow duration-300">
                  <span className="text-xl font-black text-gray-700">{day}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-3">
            {calendarDays.map((day, index) => {
              const counts = getEventCounts(day.events);
              const hasHighImpact = counts.high > 0;
              const hasMediumImpact = counts.medium > 0;
              const hasLowImpact = counts.low > 0;

              return (
                <div
                  key={index}
                  onClick={() => day.events.length > 0 && onDateClick(day.date, day.events)}
                  className={`
                    group relative min-h-[140px] sm:min-h-[160px] p-6 rounded-3xl transition-all duration-300 shadow-lg hover:shadow-xl
                    ${day.isCurrentMonth
                      ? 'bg-white/80 backdrop-blur-xl border border-gray-200'
                      : 'bg-gray-50/50 backdrop-blur-xl border border-gray-100'
                    }
                    ${day.isToday ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-300' : ''}
                    ${day.events.length > 0 ? 'cursor-pointer hover:bg-white hover:scale-105 hover:border-gray-300' : ''}
                    ${!day.isCurrentMonth ? 'text-gray-400' : 'text-gray-800'}
                    ${hasHighImpact ? 'border-red-300 shadow-red-200' :
                      hasMediumImpact ? 'border-yellow-300 shadow-yellow-200' :
                      hasLowImpact ? 'border-green-300 shadow-green-200' : ''}
                  `}
                >
                  {/* Date Number */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`
                      w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg
                      ${day.isToday
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                        : day.isCurrentMonth
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-gray-50 text-gray-400'
                      }
                    `}>
                      {day.date.getDate()}
                    </div>

                    {/* Event Count Badge */}
                    {counts.total > 0 && (
                      <div className={`
                        w-10 h-10 rounded-2xl text-sm font-black flex items-center justify-center text-white shadow-lg
                        ${hasHighImpact
                          ? 'bg-gradient-to-r from-red-500 to-red-600'
                          : hasMediumImpact
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                            : 'bg-gradient-to-r from-green-500 to-emerald-500'
                        }
                      `}>
                        {counts.total}
                      </div>
                    )}
                  </div>

                  {/* Event Indicators */}
                  {counts.total > 0 && (
                    <div className="space-y-3 mb-4">
                      {/* High Impact Events */}
                      {counts.high > 0 && (
                        <div className="flex items-center space-x-3 bg-red-50 rounded-xl px-3 py-2 border border-red-200">
                          <div className="w-4 h-4 bg-red-500 rounded-full shadow-lg"></div>
                          <span className="text-sm text-red-700 font-bold">{counts.high} High</span>
                        </div>
                      )}

                      {/* Medium Impact Events */}
                      {counts.medium > 0 && (
                        <div className="flex items-center space-x-3 bg-yellow-50 rounded-xl px-3 py-2 border border-yellow-200">
                          <div className="w-4 h-4 bg-yellow-500 rounded-full shadow-lg"></div>
                          <span className="text-sm text-yellow-700 font-bold">{counts.medium} Med</span>
                        </div>
                      )}

                      {/* Low Impact Events */}
                      {counts.low > 0 && (
                        <div className="flex items-center space-x-3 bg-green-50 rounded-xl px-3 py-2 border border-green-200">
                          <div className="w-4 h-4 bg-green-500 rounded-full shadow-lg"></div>
                          <span className="text-sm text-green-700 font-bold">{counts.low} Low</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* First Event Preview */}
                  {day.events.length > 0 && day.isCurrentMonth && (
                    <div className="mt-auto">
                      <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 shadow-sm">
                        <div className="text-sm text-gray-800 truncate font-bold mb-2" title={day.events[0].title}>
                          {day.events[0].title.length > 18 ? day.events[0].title.substring(0, 18) + '...' : day.events[0].title}
                        </div>
                        <div className="text-xs text-gray-600 flex items-center space-x-2">
                          <span className="font-bold bg-gray-200 px-2 py-1 rounded-lg">{day.events[0].currency}</span>
                          <span>•</span>
                          <span className="font-medium">{day.events[0].time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Click Indicator */}
                  {day.events.length > 0 && (
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
            );
          })}
        </div>
      </div>

        {/* Legend */}
        <div className="bg-gray-50 backdrop-blur-xl border-t border-gray-200 px-10 py-8">
          <div className="flex flex-wrap items-center justify-center gap-8">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-lg"></div>
              <span className="text-gray-700 font-bold text-lg">High Impact</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full shadow-lg"></div>
              <span className="text-gray-700 font-bold text-lg">Medium Impact</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-lg"></div>
              <span className="text-gray-700 font-bold text-lg">Low Impact</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg"></div>
              <span className="text-gray-700 font-bold text-lg">Today</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <span className="text-gray-700 font-bold text-lg">Click to View</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
