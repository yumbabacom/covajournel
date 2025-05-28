'use client';

import { useState } from 'react';

interface ImageUploadProps {
  onImageUpload: (files: File[]) => void;
  maxFiles?: number;
  maxSizePerFile?: number; // in bytes
  acceptedTypes?: string[];
}

export default function ImageUpload({ 
  onImageUpload, 
  maxFiles = 10, 
  maxSizePerFile = 5 * 1024 * 1024, // 5MB
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
}: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFiles = (files: File[]): File[] => {
    const validFiles: File[] = [];
    let errorMessage = '';

    for (const file of files) {
      // Check file type
      if (!acceptedTypes.includes(file.type)) {
        errorMessage = `File type ${file.type} is not supported. Please use JPG, PNG, GIF, or WebP.`;
        continue;
      }

      // Check file size
      if (file.size > maxSizePerFile) {
        errorMessage = `File ${file.name} is too large. Maximum size is ${maxSizePerFile / (1024 * 1024)}MB.`;
        continue;
      }

      validFiles.push(file);
    }

    // Check total number of files
    if (validFiles.length > maxFiles) {
      errorMessage = `Too many files. Maximum ${maxFiles} files allowed.`;
      return validFiles.slice(0, maxFiles);
    }

    if (errorMessage) {
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
    } else {
      setError(null);
    }

    return validFiles;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = validateFiles(files);
    
    if (validFiles.length > 0) {
      onImageUpload(validFiles);
    }

    // Reset input value to allow selecting the same file again
    event.target.value = '';
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);

    const files = Array.from(event.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    const validFiles = validateFiles(imageFiles);
    
    if (validFiles.length > 0) {
      onImageUpload(validFiles);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  return (
    <div className="w-full">
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-800 dark:text-red-200 text-sm font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer ${
          isDragOver
            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
            : 'border-emerald-300 dark:border-emerald-700 hover:border-emerald-500 dark:hover:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10'
        }`}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-200 ${
            isDragOver ? 'bg-emerald-500/20' : 'bg-emerald-500/10'
          }`}>
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          
          <div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {isDragOver ? 'Drop images here' : 'Upload Trade Images'}
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Drag and drop your screenshots, charts, or analysis images here
            </p>
            
            <label className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-semibold cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Choose Files
              <input
                type="file"
                multiple
                accept={acceptedTypes.join(',')}
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Supports: JPG, PNG, GIF, WebP
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Max {maxFiles} files, {maxSizePerFile / (1024 * 1024)}MB each
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
