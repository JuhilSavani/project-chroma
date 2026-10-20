import React, { useState, useEffect, useCallback } from 'react';
import type { ExtractionResult } from './types';
import { extractAndRecolorImage } from './utils/colorExtractor';
import ImageUploader from './components/ImageUploader';
import ResultsDisplay from './components/ResultsDisplay';
import { ChevronLeft, ChevronRight, Heart, Coffee, Cookie } from "lucide-react";

const Hero: React.FC = () => (
  <header className="text-center py-12 md:py-16">
    <h1 className="text-4xl md:text-5xl font-bold text-gray-100 tracking-tight">
      Project Chroma
    </h1>
    <p className="mt-4 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
      Extract a compact color palette from an image.
    </p>
    <p className="mt-3 text-base text-gray-500 max-w-xl mx-auto">
      A browser-based local image color quantization tool using unsupervised k-means clustering in RGB color space to extract dominant colors, estimate palette proportions, and generate a reduced-color raster image.
    </p>
  </header>
);

interface ClusterControlProps {
    numClusters: number;
    setNumClusters: (updater: (prev: number) => number) => void;
    isLoading: boolean;
}

const ClusterControl: React.FC<ClusterControlProps> = ({ numClusters, setNumClusters, isLoading }) => {
    const canDecrement = numClusters > 2;
    const canIncrement = numClusters < 5;
    
    return (
        <div className="flex flex-col items-center justify-center my-6 space-y-2">
            <label className="text-sm font-medium text-gray-400">Palette Size</label>
            <div className="flex items-center space-x-4">
                <button
                    onClick={() => setNumClusters(p => Math.max(2, p - 1))}
                    disabled={!canDecrement || isLoading}
                    className="p-2 rounded-full bg-gray-900 border border-gray-800 shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
                    aria-label="Decrease palette size"
                >
                    <ChevronLeft className="w-5 h-5 text-gray-400" />
                </button>
                <span className="text-lg font-semibold text-gray-100 w-8 text-center" aria-live="polite">{numClusters}</span>
                <button
                    onClick={() => setNumClusters(p => Math.min(5, p + 1))}
                    disabled={!canIncrement || isLoading}
                    className="p-2 rounded-full bg-gray-900 border border-gray-800 shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
                    aria-label="Increase palette size"
                >
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
            </div>
        </div>
    );
};

const Footer: React.FC = () => (
  <footer className="bg-black w-full border-t border-gray-800 py-4 px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400 mt-auto">
    <div className="flex items-center gap-2">
      Built with
      <Heart className="w-4 h-4 text-red-500" />{", "}
      <Coffee className="w-4 h-4 text-orange-400" />{", and lots of "}
      <Cookie className="w-4 h-4 text-amber-500" />{"!"}
    </div>
    <a
      href="https://github.com/JuhilSavani"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 hover:text-white transition-colors"
    >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
      <path d="M9 18c-4.51 2-5-2-7-2"/>
    </svg>
      View on GitHub
    </a>
  </footer>
);

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ExtractionResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [numClusters, setNumClusters] = useState<number>(3);

  useEffect(() => {
    if (!imageFile) return;
    
    const objectUrl = URL.createObjectURL(imageFile);
    setImageUrl(objectUrl);
    
    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);
  
  useEffect(() => {
    if (!imageUrl) return;

    const processImage = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await extractAndRecolorImage(imageUrl, numClusters);
        setAnalysisResult(result);
      } catch (err) {
        console.error(err);
        setError("The image could not be processed. Try a PNG or JPEG file.");
        setAnalysisResult(null); 
      } finally {
        setIsLoading(false);
      }
    };
    
    processImage();
  }, [imageUrl, numClusters]);

  const handleImageUpload = useCallback((file: File) => {
    setImageFile(file);
    setAnalysisResult(null); 
  }, []);

  const accentColor = analysisResult?.palette[0]?.hex ?? '#0ea5e9';

  return (
    <div className="bg-black min-h-screen text-gray-300 flex flex-col">
      <main className="container mx-auto px-4 py-8 max-w-4xl flex-grow">
        <Hero />
        <ImageUploader onImageUpload={handleImageUpload} imageUrl={imageUrl} accentColor={accentColor}/>
        {imageFile && <ClusterControl numClusters={numClusters} setNumClusters={setNumClusters} isLoading={isLoading}/>}
        
        {isLoading && !analysisResult && (
            <div className="flex flex-col items-center justify-center text-center p-8 space-y-4" aria-live="polite">
                <div className="w-10 h-10 border-4 border-gray-800 border-t-sky-500 rounded-full animate-spin"></div>
                <p className="text-gray-400">Sampling pixels and grouping colors…</p>
            </div>
        )}

        {error && (
            <div className="text-center p-8 bg-red-900/20 text-red-400 border border-red-500/30 rounded-lg mt-8" role="alert">
                <p className="font-semibold">Image processing failed</p>
                <p className="text-sm">{error}</p>
            </div>
        )}
        
        {analysisResult && (
          <div className="relative">
             {isLoading && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl transition-opacity duration-300" aria-label="Recalculating palette">
                    <div className="w-8 h-8 border-4 border-gray-800 border-t-sky-500 rounded-full animate-spin"></div>
                </div>
            )}
            <ResultsDisplay 
                palette={analysisResult.palette}
                recoloredImageUrl={analysisResult.recoloredImageUrl}
                accentColor={accentColor}
            />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default App;
