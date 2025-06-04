'use client';

import { useAuth } from './AuthProvider';
import { useEffect, useState } from 'react';

export default function AuthDebug() {
  const { user, loading, isHydrated } = useAuth();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setToken(localStorage.getItem('token'));
    }
  }, []);

  if (!isHydrated) {
    return <div className="p-4 bg-gray-100 rounded">🔄 Hydrating...</div>;
  }

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-white border rounded-lg shadow-lg text-xs max-w-md z-50">
      <h3 className="font-bold mb-2">🔧 Auth Debug</h3>
      
      <div className="space-y-1">
        <div>
          <strong>Loading:</strong> {loading ? '✅' : '❌'}
        </div>
        <div>
          <strong>User:</strong> {user ? '✅ ' + user.name : '❌ No user'}
        </div>
        <div>
          <strong>Token:</strong> {token ? '✅ Present' : '❌ Missing'}
        </div>
        <div>
          <strong>Token Preview:</strong> {token ? `${token.substring(0, 20)}...` : 'N/A'}
        </div>
      </div>

      <div className="mt-3 space-y-1">
        <button
          onClick={() => {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('token');
              window.location.reload();
            }
          }}
          className="px-2 py-1 bg-red-500 text-white rounded text-xs mr-2"
        >
          Clear Token
        </button>
        
        <button
          onClick={() => window.location.reload()}
          className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
        >
          Reload
        </button>
      </div>
    </div>
  );
} 