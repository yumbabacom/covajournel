'use client';

import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-blue-600 dark:to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
      <button
        onClick={toggleTheme}
        className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl p-4 border border-gray-200 dark:border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
        aria-label="Toggle theme"
      >
        <div className="flex items-center space-x-3">
          {/* Sun Icon */}
          <div className={`transition-all duration-300 ${theme === 'light' ? 'scale-110 text-yellow-500' : 'scale-90 text-gray-400 dark:text-gray-600'}`}>
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
            </svg>
          </div>

          {/* Toggle Switch */}
          <div className="relative w-14 h-7 bg-gray-200 dark:bg-gray-700 rounded-full transition-colors duration-300">
            <div className={`absolute top-0.5 w-6 h-6 bg-white dark:bg-slate-800 rounded-full shadow-lg transform transition-transform duration-300 ${
              theme === 'dark' ? 'translate-x-7' : 'translate-x-0.5'
            }`}>
              <div className="w-full h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600 opacity-80"></div>
            </div>
          </div>

          {/* Moon Icon */}
          <div className={`transition-all duration-300 ${theme === 'dark' ? 'scale-110 text-blue-400' : 'scale-90 text-gray-400 dark:text-gray-600'}`}>
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Theme Label */}
        <div className="mt-2 text-center">
          <span className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
            {theme === 'light' ? '☀️ Light' : '🌙 Dark'}
          </span>
        </div>
      </button>
    </div>
  );
}
