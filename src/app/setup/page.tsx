'use client';

import { useState } from 'react';

export default function SetupPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const createAdmin = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.message || 'Failed to create admin user');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Setup error:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkAdmin = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/admin/setup', {
        method: 'GET',
      });

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError('Network error occurred');
      console.error('Check error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 dark:border-gray-700/30 p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-red-800 to-orange-800 dark:from-white dark:via-red-200 dark:to-orange-200 bg-clip-text text-transparent mb-2">
            Admin Setup
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create the initial admin user for the trading journal
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-4 mb-6">
          <button
            onClick={checkAdmin}
            disabled={loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                <span>Check Admin Status</span>
              </>
            )}
          </button>

          <button
            onClick={createAdmin}
            disabled={loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span>Create Admin User</span>
              </>
            )}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className={`p-4 rounded-xl border ${
            result.adminExists === false || result.email 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
          }`}>
            <div className="flex items-start space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                result.adminExists === false || result.email
                  ? 'bg-green-500'
                  : 'bg-blue-500'
              }`}>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold ${
                  result.adminExists === false || result.email
                    ? 'text-green-800 dark:text-green-300'
                    : 'text-blue-800 dark:text-blue-300'
                }`}>
                  {result.message}
                </h3>
                {result.email && (
                  <div className="mt-2 space-y-1 text-sm">
                    <p><strong>Email:</strong> {result.email}</p>
                    {result.password && <p><strong>Password:</strong> {result.password}</p>}
                    {result.userId && <p><strong>User ID:</strong> {result.userId}</p>}
                    {result.warning && (
                      <p className="text-orange-600 dark:text-orange-400 font-medium">
                        ⚠️ {result.warning}
                      </p>
                    )}
                    {result.note && (
                      <p className="text-blue-600 dark:text-blue-400 font-medium">
                        ℹ️ {result.note}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl border bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-800 dark:text-red-300">Error</h3>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Instructions:</h3>
          <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>1. Click "Check Admin Status" to see if an admin user exists</li>
            <li>2. Click "Create Admin User" to create the initial admin</li>
            <li>3. Use the provided credentials to login</li>
            <li>4. Change the password after first login</li>
          </ol>
        </div>

        {/* Navigation */}
        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-medium"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
