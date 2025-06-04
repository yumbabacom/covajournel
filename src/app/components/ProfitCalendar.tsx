'use client';

import { useState, useEffect } from 'react';

interface Trade {
  id: string;
  symbol: string;
  status: string;
  profitDollars: number;
  lossDollars: number;
  createdAt: string;
  [key: string]: any;
}

interface CalendarDay {
  date: Date;
  trades: Trade[];
  totalPnL: number;
  tradeCount: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

interface ProfitCalendarProps {
  trades: Trade[];
  className?: string;
  onDateClick?: (date: Date, trades: Trade[]) => void;
}

// Trade Details Modal Component
interface TradeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  trades: Trade[];
}

// Individual Trade Detail Modal Component
interface IndividualTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  trade: Trade;
}

function IndividualTradeModal({ isOpen, onClose, trade }: IndividualTradeModalProps) {
  if (!isOpen) return null;

  const formatAmount = (amount: number) => {
    if (amount === 0) return '$0.00';
    const sign = amount > 0 ? '+' : '';
    return `${sign}$${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-4xl w-full max-h-[90vh] overflow-hidden relative">
        {/* Close Button - Absolute positioned */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 hover:bg-white/90 rounded-full transition-all duration-200 hover:scale-110 bg-white/80 backdrop-blur-sm border-2 border-white/50 shadow-lg"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className={`px-6 py-6 pr-16 text-white ${
          trade.status === 'WIN' 
            ? 'bg-gradient-to-r from-green-600 via-green-500 to-emerald-600'
            : trade.status === 'LOSS'
            ? 'bg-gradient-to-r from-red-600 via-red-500 to-rose-600'
            : 'bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600'
        }`}>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
              {trade.status === 'WIN' ? (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : trade.status === 'LOSS' ? (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{trade.symbol} Trade Details</h2>
              <p className="text-white/80 text-sm">{formatDate(trade.createdAt)} at {formatTime(trade.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[calc(90vh-140px)] overflow-y-auto">
          {/* P&L Summary */}
          <div className="px-8 py-6 bg-gradient-to-r from-gray-50 via-white to-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className={`text-4xl font-black mb-2 ${
                  trade.status === 'WIN' ? 'text-green-600' : 
                  trade.status === 'LOSS' ? 'text-red-600' : 'text-blue-600'
                }`}>
                  {trade.status === 'WIN' && `+$${trade.profitDollars?.toFixed(2) || '0.00'}`}
                  {trade.status === 'LOSS' && `-$${trade.lossDollars?.toFixed(2) || '0.00'}`}
                  {(trade.status === 'PLANNED' || trade.status === 'ACTIVE') && 'Pending'}
                </div>
                <div className="text-sm text-gray-600 font-medium">Profit & Loss</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-gray-900 mb-2">{trade.riskRewardRatio?.toFixed(2) || '0.00'}</div>
                <div className="text-sm text-gray-600 font-medium">Risk : Reward Ratio</div>
              </div>
              <div className="text-center">
                <div className={`px-4 py-2 rounded-full text-lg font-bold ${
                  trade.status === 'WIN' 
                    ? 'bg-green-100 text-green-700'
                    : trade.status === 'LOSS'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {trade.status}
                </div>
                <div className="text-sm text-gray-600 font-medium mt-2">Trade Status</div>
              </div>
            </div>
          </div>

          {/* Trade Information */}
          <div className="px-8 py-6 space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Trade Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Symbol:</span>
                    <span className="font-bold text-gray-900">{trade.symbol}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Direction:</span>
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d={trade.tradeDirection === 'LONG' ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"} />
                      </svg>
                      <span className="font-bold text-gray-900">{trade.tradeDirection || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-bold text-gray-900">{trade.category || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Lot Size:</span>
                    <span className="font-bold text-gray-900">{trade.lotSize?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  Price Levels
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Entry Price:</span>
                    <span className="font-bold text-gray-900">${trade.entryPrice?.toFixed(5) || '0.00000'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Exit Price:</span>
                    <span className="font-bold text-gray-900">${trade.exitPrice?.toFixed(5) || '0.00000'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Stop Loss:</span>
                    <span className="font-bold text-red-600">${trade.stopLoss?.toFixed(5) || '0.00000'}</span>
                  </div>
                  {trade.takeProfit && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Take Profit:</span>
                      <span className="font-bold text-green-600">${trade.takeProfit.toFixed(5)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Risk Management */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Risk Management
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">${trade.accountSize?.toLocaleString() || '0'}</div>
                  <div className="text-sm text-gray-600">Account Size</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{trade.riskPercentage?.toFixed(1) || '0.0'}%</div>
                  <div className="text-sm text-gray-600">Risk Percentage</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">${trade.riskAmount?.toFixed(2) || '0.00'}</div>
                  <div className="text-sm text-gray-600">Risk Amount</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {(() => {
                      const pips = trade.profitPips || trade.lossPips || 0;
                      return Number(pips).toFixed(1);
                    })()}
                  </div>
                  <div className="text-sm text-gray-600">Pips {trade.status === 'WIN' ? 'Gained' : 'Lost'}</div>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            {trade.notes && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Trade Notes
                </h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-700 leading-relaxed">{trade.notes}</p>
                </div>
              </div>
            )}

            {/* Tags */}
            {trade.tags && trade.tags.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {trade.tags.map((tag: string, index: number) => (
                    <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-end">
            {/* Close button removed */}
          </div>
        </div>
      </div>
    </div>
  );
}

function TradeDetailsModal({ isOpen, onClose, date, trades }: TradeDetailsModalProps) {
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [isIndividualModalOpen, setIsIndividualModalOpen] = useState(false);

  if (!isOpen) return null;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatAmount = (amount: number) => {
    if (amount === 0) return '$0.00';
    const sign = amount > 0 ? '+' : '';
    return `${sign}$${amount.toFixed(2)}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'WIN':
        return (
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'LOSS':
        return (
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      case 'PLANNED':
      case 'ACTIVE':
        return (
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const handleViewTrade = (trade: Trade) => {
    setSelectedTrade(trade);
    setIsIndividualModalOpen(true);
  };

  const totalPnL = trades.reduce((sum, trade) => {
    if (trade.status === 'WIN') return sum + (trade.profitDollars || 0);
    if (trade.status === 'LOSS') return sum - (trade.lossDollars || 0);
    return sum;
  }, 0);

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-4xl w-full max-h-[90vh] overflow-hidden relative">
          {/* Close Button - Absolute positioned */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2.5 hover:bg-white/90 rounded-full transition-all duration-200 hover:scale-110 bg-white/80 backdrop-blur-sm border-2 border-white/50 shadow-lg"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header */}
          <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white px-6 py-6 pr-16">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Trading Activity</h2>
                <p className="text-slate-300 text-sm">{formatDate(date)}</p>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="px-8 py-6 bg-gradient-to-r from-gray-50 via-white to-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">{trades.length}</div>
                <div className="text-sm text-gray-600 font-medium">Total Trades</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold mb-1 ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatAmount(totalPnL)}
                </div>
                <div className="text-sm text-gray-600 font-medium">Net P&L</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {trades.filter(t => t.status === 'WIN').length}/{trades.filter(t => t.status === 'WIN' || t.status === 'LOSS').length}
                </div>
                <div className="text-sm text-gray-600 font-medium">Win/Total</div>
              </div>
            </div>
          </div>

          {/* Trades List */}
          <div className="max-h-96 overflow-y-auto">
            {trades.map((trade, index) => (
              <div key={trade.id} className="px-8 py-6 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(trade.status)}
                    <div>
                      <div className="flex items-center space-x-3 mb-1">
                        <span className="text-lg font-bold text-gray-900">{trade.symbol}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          trade.status === 'WIN' 
                            ? 'bg-green-100 text-green-700'
                            : trade.status === 'LOSS'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {trade.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        {trade.tradeDirection && (
                          <div className="flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d={trade.tradeDirection === 'LONG' ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"} />
                            </svg>
                            <span>{trade.tradeDirection}</span>
                          </div>
                        )}
                        {trade.category && (
                          <span className="bg-gray-100 px-2 py-1 rounded text-xs">{trade.category}</span>
                        )}
                        <span>{new Date(trade.createdAt).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      {trade.status === 'WIN' && (
                        <div className="text-2xl font-bold text-green-600">
                          +${trade.profitDollars.toFixed(2)}
                        </div>
                      )}
                      {trade.status === 'LOSS' && (
                        <div className="text-2xl font-bold text-red-600">
                          -${trade.lossDollars.toFixed(2)}
                        </div>
                      )}
                      {(trade.status === 'PLANNED' || trade.status === 'ACTIVE') && (
                        <div className="text-2xl font-bold text-blue-600">
                          Pending
                        </div>
                      )}
                      {trade.riskRewardRatio && (
                        <div className="text-sm text-gray-500 mt-1">
                          R:R {(trade.riskRewardRatio || 0).toFixed(2)}
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => handleViewTrade(trade)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      View
                    </button>
                  </div>
                </div>
                
                {trade.notes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-700">{trade.notes}</div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-end">
              {/* Close button removed */}
            </div>
          </div>
        </div>
      </div>

      {/* Individual Trade Modal */}
      {selectedTrade && (
        <IndividualTradeModal
          isOpen={isIndividualModalOpen}
          onClose={() => setIsIndividualModalOpen(false)}
          trade={selectedTrade}
        />
      )}
    </>
  );
}

export default function ProfitCalendar({ trades, className = '', onDateClick }: ProfitCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTrades, setSelectedTrades] = useState<Trade[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    generateCalendarDays();
  }, [currentMonth, trades]);

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Get first day of the month
    const firstDay = new Date(year, month, 1);
    
    // Get the starting date for the calendar (previous month's days)
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: CalendarDay[] = [];
    const currentDate = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      const dayTrades = trades.filter(trade => {
        const tradeDate = new Date(trade.createdAt);
        tradeDate.setHours(0, 0, 0, 0);
        return tradeDate.getTime() === currentDate.getTime();
      });

      const totalPnL = dayTrades.reduce((sum, trade) => {
        if (trade.status === 'WIN') return sum + (trade.profitDollars || 0);
        if (trade.status === 'LOSS') return sum - (trade.lossDollars || 0);
        return sum;
      }, 0);

      days.push({
        date: new Date(currentDate),
        trades: dayTrades,
        totalPnL,
        tradeCount: dayTrades.length,
        isCurrentMonth: currentDate.getMonth() === month,
        isToday: currentDate.getTime() === today.getTime()
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    setCalendarDays(days);
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const handleDateClick = (day: CalendarDay) => {
    if (day.tradeCount > 0 && day.isCurrentMonth) {
      setSelectedDate(day.date);
      setSelectedTrades(day.trades);
      setIsModalOpen(true);
      
      // Call the optional onDateClick callback
      if (onDateClick) {
        onDateClick(day.date, day.trades);
      }
    }
  };

  const getCellStyle = (day: CalendarDay) => {
    let baseClasses = "relative h-28 p-3 text-center border-r border-b border-gray-200 transition-all duration-300 hover:shadow-lg";
    
    // Add cursor pointer for clickable cells
    if (day.tradeCount > 0 && day.isCurrentMonth) {
      baseClasses += " cursor-pointer hover:scale-[1.02] hover:z-10";
    }
    
    if (!day.isCurrentMonth) {
      return `${baseClasses} bg-gray-50 opacity-60`;
    }
    
    if (day.tradeCount === 0) {
      return `${baseClasses} bg-white hover:bg-gray-50`;
    }
    
    if (day.totalPnL > 0) {
      return `${baseClasses} bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:from-green-100 hover:to-emerald-100`;
    }
    
    if (day.totalPnL < 0) {
      return `${baseClasses} bg-gradient-to-br from-red-50 to-rose-50 border-red-200 hover:from-red-100 hover:to-rose-100`;
    }
    
    return `${baseClasses} bg-white hover:bg-gray-50`;
  };

  const formatAmount = (amount: number) => {
    if (amount === 0) return '$0.00';
    const sign = amount > 0 ? '+' : '';
    return `${sign}$${amount.toFixed(2)}`;
  };

  return (
    <>
      <div className={`bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden ${className}`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold">Profit Calendar</h2>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={goToPreviousMonth}
                className="p-3 hover:bg-white/10 rounded-xl transition-all duration-200 hover:scale-110"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="text-center min-w-[200px]">
                <span className="text-xl font-bold">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </span>
              </div>
              
              <button
                onClick={goToNextMonth}
                className="p-3 hover:bg-white/10 rounded-xl transition-all duration-200 hover:scale-110"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              <button
                onClick={goToToday}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Today
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="overflow-hidden">
          <table className="w-full border-collapse">
            {/* Days of week header */}
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                  <th key={day} className="p-4 text-sm font-bold text-gray-700 border-r border-b border-gray-200 min-w-[140px] last:border-r-0">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            
            {/* Calendar body */}
            <tbody>
              {Array.from({ length: 6 }, (_, weekIndex) => (
                <tr key={weekIndex}>
                  {Array.from({ length: 7 }, (_, dayIndex) => {
                    const dayData = calendarDays[weekIndex * 7 + dayIndex];
                    if (!dayData) return <td key={dayIndex} className="border-r border-b border-gray-200 h-28"></td>;
                    
                    return (
                      <td 
                        key={dayIndex} 
                        className={getCellStyle(dayData)}
                        onClick={() => handleDateClick(dayData)}
                        title={dayData.tradeCount > 0 ? `Click to view ${dayData.tradeCount} trade${dayData.tradeCount !== 1 ? 's' : ''}` : ''}
                      >
                        {/* Day number */}
                        <div className="flex justify-between items-start mb-2">
                          <span className={`text-sm font-bold ${
                            dayData.isCurrentMonth ? 'text-gray-800' : 'text-gray-400'
                          } ${dayData.isToday ? 'bg-blue-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs shadow-lg' : ''}`}>
                            {dayData.date.getDate()}
                          </span>
                          {dayData.tradeCount > 0 && (
                            <div className={`w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-white shadow-md ${
                              dayData.totalPnL > 0 ? 'bg-green-500' : 'bg-red-500'
                            }`}>
                              {dayData.tradeCount}
                            </div>
                          )}
                        </div>

                        {/* Trade data */}
                        <div className="flex flex-col items-center justify-center space-y-1">
                          {dayData.tradeCount === 0 ? (
                            <div className="text-xs text-gray-400 font-medium opacity-75">
                              No Trades
                            </div>
                          ) : (
                            <>
                              <div className={`text-base font-bold ${
                                dayData.totalPnL > 0 ? 'text-green-700' : 'text-red-700'
                              }`}>
                                {formatAmount(dayData.totalPnL)}
                              </div>
                              <div className="text-xs text-gray-600 font-medium">
                                {dayData.tradeCount} trade{dayData.tradeCount !== 1 ? 's' : ''}
                              </div>
                              {dayData.tradeCount > 0 && dayData.isCurrentMonth && (
                                <div className="text-xs text-blue-600 font-medium opacity-75">
                                  Click to view
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Enhanced Footer */}
        <div className="bg-gradient-to-r from-gray-50 via-white to-gray-50 px-8 py-6 border-t border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Legend */}
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg shadow-sm"></div>
                <span className="text-gray-700 font-semibold">Profitable Days</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200 rounded-lg shadow-sm"></div>
                <span className="text-gray-700 font-semibold">Loss Days</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-white border-2 border-gray-300 rounded-lg shadow-sm"></div>
                <span className="text-gray-700 font-semibold">No Trading</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-blue-500 rounded-full shadow-md"></div>
                <span className="text-gray-700 font-semibold">Today</span>
              </div>
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
                <span className="text-gray-700 font-semibold">Click dates to view trades</span>
              </div>
            </div>
            
            {/* Monthly Summary */}
            <div className="text-sm text-gray-600">
              {(() => {
                const monthTrades = calendarDays.filter(day => day.isCurrentMonth && day.tradeCount > 0);
                const monthlyPnL = monthTrades.reduce((sum, day) => sum + day.totalPnL, 0);
                const profitableDays = monthTrades.filter(day => day.totalPnL > 0).length;
                const lossDays = monthTrades.filter(day => day.totalPnL < 0).length;
                
                return (
                  <div className="bg-white rounded-xl px-4 py-3 border border-gray-200 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-2 sm:space-y-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-800">Monthly Total:</span>
                        <span className={`font-bold text-lg ${monthlyPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatAmount(monthlyPnL)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm">
                        <span className="text-green-600 font-semibold">{profitableDays}</span>
                        <span className="text-gray-500">profitable,</span>
                        <span className="text-red-600 font-semibold">{lossDays}</span>
                        <span className="text-gray-500">loss days</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Trade Details Modal */}
      {selectedDate && (
        <TradeDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          date={selectedDate}
          trades={selectedTrades}
        />
      )}
    </>
  );
} 