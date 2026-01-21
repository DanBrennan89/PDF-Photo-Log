import React, { useCallback, useState } from 'react';
import { Upload, X } from 'lucide-react';

interface PhotoUploaderProps {
  imageSrc: string | null;
  onImageSelect: (base64: string) => void;
  onClear: () => void;
  label?: string;
  heightClass?: string;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({ 
  imageSrc, 
  onImageSelect, 
  onClear, 
  label = "Click or drag to upload photo",
  heightClass = "h-64"
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const processFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelect(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please upload an image file.");
    }
  };

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) processFile(file);
  }, [onImageSelect]);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  if (imageSrc) {
    return (
      <div className={`relative w-full ${heightClass} bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner group`}>
        <img 
          src={imageSrc} 
          alt="Preview" 
          className="w-full h-full object-contain" 
        />
        <button
          onClick={onClear}
          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-md z-10"
          title="Remove photo"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <label 
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`flex flex-col items-center justify-center w-full ${heightClass} border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 
          ${isDragging 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 scale-[1.02] shadow-lg' 
            : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 pointer-events-none">
          <Upload className={`w-8 h-8 mb-2 transition-colors ${isDragging ? 'text-blue-500' : 'text-slate-400 dark:text-slate-500'}`} />
          <p className={`mb-1 text-sm font-medium text-center px-2 transition-colors ${isDragging ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>
            {isDragging ? "Drop to upload" : label}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">JPG, PNG or GIF (Max 5MB)</p>
        </div>
        <input 
          type="file" 
          className="hidden" 
          accept="image/*"
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
};