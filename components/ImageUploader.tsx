import React, { useState, useCallback } from 'react';
import { Upload } from "lucide-react";

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  imageUrl: string | null;
  accentColor: string;
}

const Card: React.FC<{children: React.ReactNode, className?: string}> = ({ children, className }) => (
  <div className={`bg-gray-950 rounded-xl shadow-lg border border-gray-800 p-4 sm:p-6 ${className}`}>
    {children}
  </div>
);

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, imageUrl, accentColor }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        onImageUpload(file);
      } else {
        alert('Please upload a valid image file (JPG, PNG).');
      }
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  }, [onImageUpload]);

  return (
    <Card className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="order-2 md:order-1">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept="image/png, image/jpeg"
            onChange={(e) => handleFileChange(e.target.files)}
          />
          <label
            htmlFor="file-upload"
            className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300 ${isDragging ? 'border-sky-500 bg-sky-900/30' : 'border-gray-700 bg-black/50 hover:bg-gray-900/50'}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className={`w-10 h-10 mb-3 ${isDragging ? 'text-sky-400' : 'text-gray-500'}`} />
              <p className={`mb-2 text-sm text-center ${isDragging ? 'text-sky-400' : 'text-gray-400'}`}>
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">PNG or JPG</p>
            </div>
          </label>
        </div>
        <div className="order-1 md:order-2 flex items-center justify-center h-64 bg-gray-900/50 rounded-lg overflow-hidden">
          {imageUrl ? (
            <img src={imageUrl} alt="Uploaded preview" className="w-full h-full object-contain" />
          ) : (
            <div className="text-gray-500 text-sm">Image Preview</div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ImageUploader;