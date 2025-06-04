'use client';

import { useState, useEffect } from 'react';
import { useAccount } from './AccountProvider';

interface Trade {
  id: string;
  symbol: string;
  status: string;
  notes: string;
  tags: string[];
  images?: string[];
  [key: string]: any;
}

interface UpdateTradeModalProps {
  trade: Trade;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (tradeId: string, updateData: any) => void;
}

export default function UpdateTradeModal({
  trade,
  isOpen,
  onClose,
  onUpdate
}: UpdateTradeModalProps) {
  const { refreshAccounts, updateAccount, selectedAccount } = useAccount();
  const [updateData, setUpdateData] = useState({
    status: trade.status,
    notes: trade.notes || '',
    tags: trade.tags?.join(', ') || '',
    profitDollars: 0, // Will be set automatically based on WIN/LOSS selection
  });
  const [closingImages, setClosingImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Automatically set profit/loss amount based on status selection
  useEffect(() => {
    if (updateData.status === 'WIN') {
      // Use potential profit dollars from the original trade
      setUpdateData(prev => ({
        ...prev,
        profitDollars: trade.profitDollars || 0
      }));
    } else if (updateData.status === 'LOSS') {
      // Use potential loss dollars from the original trade (as positive value, will be made negative in API)
      setUpdateData(prev => ({
        ...prev,
        profitDollars: trade.lossDollars || 0
      }));
    }
  }, [updateData.status, trade.profitDollars, trade.lossDollars]);

  if (!isOpen) return null;

  const handleImageUpload = (files: File[]) => {
    setClosingImages(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setClosingImages(prev => prev.filter((_, i) => i !== index));
  };

  const updateAccountBalance = async (updateData: any) => {
    if (!selectedAccount) return false;
    
    try {
      let balanceChange = 0;
      
      // Calculate balance change based on trade status
      if (updateData.status === 'WIN' && updateData.profitDollars) {
        balanceChange = updateData.profitDollars;
      } else if (updateData.status === 'LOSS' && updateData.profitDollars) {
        // For LOSS trades, profitDollars contains the loss amount as positive value
        balanceChange = -Math.abs(updateData.profitDollars);
      } else {
        console.log('No profit/loss amount found, skipping balance update');
        return false;
      }
      
      const newBalance = selectedAccount.currentBalance + balanceChange;
      
      console.log('Updating account balance:', {
        status: updateData.status,
        currentBalance: selectedAccount.currentBalance,
        balanceChange,
        newBalance,
        profitDollars: updateData.profitDollars
      });
      
      await updateAccount(selectedAccount.id, { currentBalance: newBalance });
      
      // ✅ NOTIFY ACCOUNT BALANCE UPDATE
      window.dispatchEvent(new CustomEvent('accountBalanceUpdated', { 
        detail: { accountId: selectedAccount.id, newBalance } 
      }));
      
      return true;
    } catch (error) {
      console.error('Failed to update account balance:', error);
      return false;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let imageUrls: string[] = [];

      // Upload closing images if any
      if (closingImages.length > 0) {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token');

        const imageFormData = new FormData();
        closingImages.forEach((file, index) => {
          imageFormData.append(`image_${index}`, file);
        });

        const imageResponse = await fetch('/api/upload-images', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: imageFormData,
        });

        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          imageUrls = imageData.urls;
        }
      }

      // Prepare update data
      const finalUpdateData = {
        status: updateData.status,
        notes: updateData.notes,
        tags: updateData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
        // Add closing images to existing images
        images: [...(trade.images || []), ...imageUrls],
        // Include profit/loss if trade is WIN or LOSS
        ...((updateData.status === 'WIN' || updateData.status === 'LOSS') && {
          profitDollars: parseFloat(updateData.profitDollars.toString()) || 0
        })
      };

      // Update the trade
      await onUpdate(trade.id, finalUpdateData);

      // ✅ BALANCE IS NOW UPDATED AUTOMATICALLY BY BACKEND
      // No need for duplicate frontend balance updates

      onClose();
    } catch (error) {
      console.error('Error updating trade:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper functions for status styling
  const getStatusButtonStyle = (status: string) => {
    switch (status) {
      case 'PLANNED':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg';
      case 'ACTIVE':
        return 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg';
      case 'WIN':
        return 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg';
      case 'LOSS':
        return 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PLANNED':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'ACTIVE':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'WIN':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'LOSS':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border-b border-gray-200 p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-xl">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                  Update Trade
                </h2>
                <p className="text-xl text-gray-600 mt-2">
                  Update {trade.symbol} status and add closing details
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-12 h-12 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto max-h-[calc(95vh-200px)]">
          <div className="space-y-8">
            {/* Trade Status */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
                <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Trade Status</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['PLANNED', 'ACTIVE', 'WIN', 'LOSS'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setUpdateData(prev => ({ ...prev, status }))}
                    className={`px-6 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                      updateData.status === status
                        ? getStatusButtonStyle(status)
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {getStatusIcon(status)}
                    <span>{status}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Profit/Loss Display */}
            {(updateData.status === 'WIN' || updateData.status === 'LOSS') && (
              <div className="bg-gradient-to-r from-gray-50 via-blue-50 to-purple-50 rounded-3xl p-8 border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <span>Financial Impact</span>
                </h3>
                <div className="text-center">
                  <div className={`text-6xl font-bold mb-4 ${updateData.status === 'WIN' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {updateData.status === 'WIN' ? '+' : '-'}${Math.abs(updateData.profitDollars).toFixed(2)}
                  </div>
                  <div className={`text-xl font-semibold ${updateData.status === 'WIN' ? 'text-emerald-700' : 'text-red-700'}`}>
                    {updateData.status === 'WIN' ? 'Profit' : 'Loss'}
                  </div>
                  <div className="text-gray-600 mt-2">
                    This amount will be automatically {updateData.status === 'WIN' ? 'added to' : 'deducted from'} your account balance
                  </div>
                </div>
              </div>
            )}

            {/* Notes Section */}
            <div className="space-y-4">
              <label className="flex items-center space-x-2 text-2xl font-bold text-gray-900">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z" />
                </svg>
                <span>Update Notes</span>
              </label>
              <textarea
                value={updateData.notes}
                onChange={(e) => setUpdateData(prev => ({ ...prev, notes: e.target.value }))}
                rows={6}
                className="w-full px-6 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/80 backdrop-blur-sm font-medium text-gray-700 shadow-lg transition-all duration-300 resize-none"
                placeholder={`Add your ${updateData.status.toLowerCase()} notes, market analysis, lessons learned, or closing thoughts...`}
              />
            </div>

            {/* Tags Section */}
            <div className="space-y-4">
              <label className="flex items-center space-x-2 text-2xl font-bold text-gray-900">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span>Tags</span>
              </label>
              <input
                type="text"
                value={updateData.tags}
                onChange={(e) => setUpdateData(prev => ({ ...prev, tags: e.target.value }))}
                className="w-full px-6 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm font-medium text-gray-700 shadow-lg transition-all duration-300"
                placeholder="Add tags separated by commas (e.g., breakout, news-event, scalp)"
              />
            </div>

            {/* Image Upload Section */}
            <div className="space-y-4">
              <label className="flex items-center space-x-2 text-2xl font-bold text-gray-900">
                <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Closing Images</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-purple-400 transition-colors duration-300 bg-gradient-to-br from-purple-50/50 to-indigo-50/50">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <p className="text-xl font-semibold text-gray-700 mb-2">Upload Closing Screenshots</p>
                <p className="text-gray-500 mb-4">Add charts, execution screenshots, or analysis images</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => e.target.files && handleImageUpload(Array.from(e.target.files))}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Choose Images</span>
                </label>
              </div>

              {/* Image Preview */}
              {closingImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                  {closingImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-32 object-cover rounded-xl border border-gray-200 shadow-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-6 pt-8 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Cancel</span>
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                <span>{isSubmitting ? 'Updating...' : 'Update Trade'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
