'use client';

import React, { useState, useMemo } from 'react';
import { FlagIcon } from './FlagIcon';

interface NewsEvent {
  impact: 'high' | 'medium' | 'low';
  currency: string;
  title?: string;
}

interface CalendarDay {
  day: number;
  events: NewsEvent[];
  isCurrentMonth: boolean;
  isToday: boolean;
}

interface NewsCalendarProps {
  currentDate: Date;
  onDateClick: (date: Date) => void;
  onMonthChange: (date: Date) => void;
}

export default function NewsCalendar({ currentDate, onDateClick, onMonthChange }: NewsCalendarProps) {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getCurrencyFlag = (currency: string) => {
    const currencyMap: { [key: string]: string } = {
      'USD': 'US', 'EUR': 'EU', 'GBP': 'GB', 'JPY': 'JP',
      'CHF': 'CH', 'CAD': 'CA', 'AUD': 'AU', 'NZD': 'NZ'
    };
    return currencyMap[currency] || 'US';
  };

  // Generate calendar days with mock news events
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: (CalendarDay | null)[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      if (date.getMonth() !== month && (i < 7 || i >= 35)) {
        days.push(null);
        continue;
      }

      // Mock events for each day
      const mockEvents: NewsEvent[] = [];
      const eventCount = Math.floor(Math.random() * 4); // 0-3 events per day
      
      const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD'];
      const impacts: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low'];
      
      for (let j = 0; j < eventCount; j++) {
        mockEvents.push({
          impact: impacts[Math.floor(Math.random() * impacts.length)],
          currency: currencies[Math.floor(Math.random() * currencies.length)],
          title: `Economic Event ${j + 1}`
        });
      }

      const dayData: CalendarDay = {
        day: date.getDate(),
        events: mockEvents,
        isCurrentMonth: date.getMonth() === month,
        isToday: date.getTime() === today.getTime()
      };

      days.push(dayData);
    }

    return days;
  }, [currentDate]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else {
      newDate.setMonth(currentDate.getMonth() + 1);
    }
    onMonthChange(newDate);
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    onDateClick(clickedDate);
  };

  const goToToday = () => {
    const today = new Date();
    onMonthChange(today);
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
      {/* Calendar Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-50 via-red-50 to-pink-50"></div>
        <div className="relative p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">📅</span>
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-800">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <p className="text-gray-600 text-sm font-medium">AI News Calendar</p>
              </div>
              <button
                onClick={goToToday}
                className="px-4 py-2 bg-white/80 hover:bg-white rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Today
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateMonth('prev')}
                className="w-10 h-10 bg-white/80 hover:bg-white rounded-xl flex items-center justify-center transition-all duration-200 border border-gray-200 text-gray-700 hover:text-gray-900 shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => navigateMonth('next')}
                className="w-10 h-10 bg-white/80 hover:bg-white rounded-xl flex items-center justify-center transition-all duration-200 border border-gray-200 text-gray-700 hover:text-gray-900 shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {dayNames.map(day => (
            <div key={day} className="text-center py-2">
              <div className="bg-gray-100 rounded-lg py-2 shadow-sm">
                <span className="text-sm font-bold text-gray-700">{day}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((dayData, index) => (
            <div key={index} className="aspect-square">
              {dayData ? (
                <button
                  onClick={() => handleDateClick(dayData.day)}
                  className={`
                    group relative w-full h-full rounded-lg transition-all duration-300 shadow-sm hover:shadow-md
                    ${dayData.isCurrentMonth
                      ? 'bg-white border border-gray-200 hover:border-orange-300'
                      : 'bg-gray-50 border border-gray-100'
                    }
                    ${dayData.isToday ? 'ring-2 ring-orange-500 bg-orange-50 border-orange-300' : ''}
                    ${dayData.events.length > 0 ? 'hover:bg-orange-50 hover:scale-105' : ''}
                  `}
                >
                  {/* Date Number */}
                  <div className="absolute top-2 left-2">
                    <div className={`
                      w-6 h-6 rounded-lg flex items-center justify-center text-sm font-bold
                      ${dayData.isToday
                        ? 'bg-orange-500 text-white'
                        : dayData.isCurrentMonth
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-gray-50 text-gray-400'
                      }
                    `}>
                      {dayData.day}
                    </div>
                  </div>

                  {/* Events Indicators */}
                  {dayData.events.length > 0 && dayData.isCurrentMonth && (
                    <div className="absolute bottom-2 left-2 right-2">
                      {/* Impact dots */}
                      <div className="flex justify-center space-x-1 mb-1">
                        {dayData.events.slice(0, 3).map((event, eventIndex) => (
                          <div
                            key={eventIndex}
                            className={`w-1.5 h-1.5 rounded-full ${
                              event.impact === 'high' ? 'bg-red-500' :
                              event.impact === 'medium' ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                          />
                        ))}
                        {dayData.events.length > 3 && (
                          <span className="text-xs text-gray-500 font-bold">+</span>
                        )}
                      </div>

                      {/* Currency flags */}
                      <div className="flex justify-center space-x-1">
                        {dayData.events.slice(0, 2).map((event, eventIndex) => (
                          <FlagIcon
                            key={eventIndex}
                            countryCode={getCurrencyFlag(event.currency)}
                            className="w-3 h-2 rounded-sm shadow-sm"
                          />
                        ))}
                        {dayData.events.length > 2 && (
                          <span className="text-xs text-gray-500 font-bold">+{dayData.events.length - 2}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Click indicator */}
                  {dayData.events.length > 0 && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                        <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </button>
              ) : (
                <div className="w-full h-full"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
