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
  const { refreshAccounts } = useAccount();
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

      const result = await onUpdate(trade.id, finalUpdateData);

      // If balance was updated, refresh accounts to show new balance
      if (result?.balanceUpdated) {
        await refreshAccounts();
      }

      onClose();
    } catch (error) {
      console.error('Error updating trade:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-5xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">
                  {trade.symbol.split('/')[0].charAt(0)}
                </span>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  Update Trade: {trade.symbol}
                </h2>
                <p className="text-lg text-gray-600 mt-1">
                  Modify trade details and upload closing images
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white hover:bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center transition-colors duration-200 shadow-sm"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 max-h-[calc(95vh-200px)] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Trade Update Form */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Update Trade Details
                </h3>
              </div>

              {/* Status Update */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Trade Status
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setUpdateData(prev => ({ ...prev, status: 'WIN' }))}
                    className={`p-5 rounded-xl border-2 transition-all duration-300 ${
                      updateData.status === 'WIN'
                        ? 'border-green-500 bg-green-50 shadow-lg'
                        : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center ${
                        updateData.status === 'WIN'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        🏆
                      </div>
                      <p className={`font-bold ${
                        updateData.status === 'WIN'
                          ? 'text-green-700'
                          : 'text-gray-700'
                      }`}>
                        Win
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUpdateData(prev => ({ ...prev, status: 'LOSS' }))}
                    className={`p-5 rounded-xl border-2 transition-all duration-300 ${
                      updateData.status === 'LOSS'
                        ? 'border-red-500 bg-red-50 shadow-lg'
                        : 'border-gray-200 bg-white hover:border-red-300 hover:bg-red-50'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center ${
                        updateData.status === 'LOSS'
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        📉
                      </div>
                      <p className={`font-bold ${
                        updateData.status === 'LOSS'
                          ? 'text-red-700'
                          : 'text-gray-700'
                      }`}>
                        Loss
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Profit/Loss Input - Only show when WIN or LOSS is selected */}
              {(updateData.status === 'WIN' || updateData.status === 'LOSS') && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      {updateData.status === 'WIN' ? 'Profit Amount ($)' : 'Loss Amount ($)'}
                      <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        Auto-calculated
                      </span>
                    </span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-lg">$</span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      value={updateData.profitDollars}
                      readOnly
                      className={`w-full pl-8 pr-4 py-4 border rounded-xl text-lg transition-all duration-200 cursor-not-allowed ${
                        updateData.status === 'WIN'
                          ? 'bg-green-50 border-green-300 text-green-800'
                          : 'bg-red-50 border-red-300 text-red-800'
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="mt-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-start space-x-2">
                      <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-sm">
                        <p className="text-blue-800 font-medium mb-1">
                          {updateData.status === 'WIN' ? 'Profit Auto-Calculated' : 'Loss Auto-Calculated'}
                        </p>
                        <p className="text-blue-700 text-xs">
                          {updateData.status === 'WIN'
                            ? `Using potential profit of $${(trade.profitDollars || 0).toFixed(2)} from original trade calculation. This amount will be added to your account balance.`
                            : `Using potential loss of $${(trade.lossDollars || 0).toFixed(2)} from original trade calculation. This amount will be subtracted from your account balance.`
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes Update */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Trade Notes & Analysis
                </label>
                <textarea
                  value={updateData.notes}
                  onChange={(e) => setUpdateData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={6}
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:bg-white text-gray-900 transition-all duration-200 resize-none"
                  placeholder="Update your trade analysis, add closing notes, lessons learned..."
                />
              </div>

              {/* Tags Update */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={updateData.tags}
                  onChange={(e) => setUpdateData(prev => ({ ...prev, tags: e.target.value }))}
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:bg-white text-gray-900 transition-all duration-200"
                  placeholder="closed, profitable, lesson-learned, breakout"
                />
              </div>
            </div>

            {/* Right Column - Closing Images Upload */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Closing Images & Screenshots
                </h3>
              </div>

              {/* Upload Area */}
              <div
                onDrop={(e) => {
                  e.preventDefault();
                  const files = Array.from(e.dataTransfer.files);
                  const imageFiles = files.filter(file => file.type.startsWith('image/'));
                  if (imageFiles.length > 0) {
                    handleImageUpload(imageFiles);
                  }
                }}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-emerald-300 rounded-xl p-8 text-center hover:border-emerald-500 transition-colors duration-200 bg-emerald-50"
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Upload Closing Images
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Add screenshots of your trade closure, P&L, or analysis
                    </p>
                    <label className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-semibold cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Choose Files
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          if (files.length > 0) {
                            handleImageUpload(files);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    JPG, PNG, GIF, WebP (Max 5MB each)
                  </p>
                </div>
              </div>

              {/* Uploaded Images Preview */}
              {closingImages.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Closing Images ({closingImages.length})
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {closingImages.map((file, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Closing ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all duration-200 border border-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Updating...</span>
                </div>
              ) : (
                'Update Trade'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
