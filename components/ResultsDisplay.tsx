import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { ColorData, ColorMode } from '../types';
import { Copy, Download, Check } from "lucide-react";

interface ResultsDisplayProps {
  palette: ColorData[];
  recoloredImageUrl: string;
  accentColor: string;
}

const Card: React.FC<{children: React.ReactNode, className?: string}> = ({ children, className }) => (
  <div className={`bg-gray-950 rounded-xl shadow-lg border border-white/20 hover:border-white/40 transition duration-500 p-4 sm:p-6 ${className}`}>
    {children}
  </div>
);

const getTextColorForBackground = (hex: string): 'text-white' | 'text-black' => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? 'text-black' : 'text-white';
};

const Palette: React.FC<{ palette: ColorData[], accentColor: string }> = ({ palette }) => {
    const [colorMode, setColorMode] = useState<ColorMode>('HEX');
    const [copiedColor, setCopiedColor] = useState<string | null>(null);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedColor(text);
        setTimeout(() => setCopiedColor(null), 2000);
    };

    const getColorValue = (color: ColorData) => {
        switch(colorMode) {
            case 'HEX': return color.hex;
            case 'RGB': return `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;
            case 'CMYK': return `cmyk(${color.cmyk.c}, ${color.cmyk.m}, ${color.cmyk.y}, ${color.cmyk.k})`;
        }
    }
    
    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-1 bg-gray-800/80 p-1 rounded-md text-sm">
                   {(['HEX', 'RGB', 'CMYK'] as ColorMode[]).map(mode => (
                       <button 
                         key={mode}
                         onClick={() => setColorMode(mode)}
                         className={`px-3 py-1 rounded-md transition-colors ${colorMode === mode ? 'bg-white text-black shadow-sm text-gray-100 font-medium' : 'text-gray-300 hover:bg-gray-700/80'}`}
                       >
                           {mode}
                       </button>
                   ))}
                </div>
                <DownloadButton palette={palette} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {palette.map((color, idx) => {
                    const value = getColorValue(color);
                    return (
                        <div key={idx} className="flex flex-col items-center text-center group">
                            <div className="w-full h-24 rounded-lg mb-2 shadow-inner" style={{ backgroundColor: color.hex }}></div>
                            <div 
                                className="font-mono text-xs text-gray-400 p-1 rounded-md w-full cursor-pointer hover:bg-gray-800 flex items-center justify-center"
                                onClick={() => handleCopy(value)}
                            >
                                <span className="truncate">{value}</span>
                                {copiedColor === value ? <Check className="w-4 h-4 ml-1 text-green-500" /> : <Copy className="w-4 h-4 ml-1 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />}
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
};


const ColorChart: React.FC<{ palette: ColorData[] }> = ({ palette }) => {
    const chartData = palette.map((c, i) => ({
        name: `Color ${i + 1}`,
        proportion: Math.round(c.proportion * 100),
        fill: c.hex,
    }));

    return (
        <Card>
            <h3 className="text-lg text-gray-100 mb-4">Color Proportions</h3>
            <div className="w-full h-56">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} stroke="#6b7280" fontSize={12} />
                        <YAxis type="category" dataKey="name" stroke="#6b7280" fontSize={12} />
                        <Tooltip
                            cursor={{ fill: 'rgba(55, 65, 81, 0.5)' }}
                            contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '0.5rem' }}
                            labelStyle={{ fontWeight: 'bold', color: '#f3f4f6' }}
                            itemStyle={{ color: '#d1d5db' }}
                            formatter={(value, name, props) => [`${value}%`, `Proportion`]}
                        />
                        <Bar dataKey="proportion" background={{ fill: '#374151' }} radius={[0, 4, 4, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

const RecoloredImage: React.FC<{ imageUrl: string }> = ({ imageUrl }) => (
    <Card>
        <h3 className="text-lg text-gray-100 mb-4">Recolored Image</h3>
        <div className="flex items-center justify-center bg-gray-900/50 rounded-lg overflow-hidden h-56">
             <img src={imageUrl} alt="Recolored based on palette" className="w-full h-full object-contain" />
        </div>
    </Card>
);

const DownloadButton: React.FC<{ palette: ColorData[] }> = ({ palette }) => {
  const downloadPalette = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const swatchSize = 200;
    const padding = 20;
    const textHeight = 60;
    
    canvas.width = palette.length * swatchSize + (palette.length + 1) * padding;
    canvas.height = swatchSize + textHeight + 2 * padding;
    
    ctx.fillStyle = '#111827'; // gray-900
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    palette.forEach((color, i) => {
      const x = padding + i * (swatchSize + padding);
      
      ctx.fillStyle = color.hex;
      ctx.fillRect(x, padding, swatchSize, swatchSize);
      
      ctx.font = '18px monospace';
      ctx.fillStyle = '#d1d5db'; // gray-300
      ctx.textAlign = 'center';
      ctx.fillText(color.hex, x + swatchSize / 2, padding + swatchSize + 30);
    });

    const link = document.createElement('a');
    link.download = 'color-palette.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };
  
//   const textColor = getTextColorForBackground(accentColor);

  return (
    <button
      onClick={downloadPalette}
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none px-4 py-2 border border-white/20 hover:border-white/40 transition duration-500 text-white`}
    >
      <Download className="w-4 h-4 mr-2" />
      Download Palette
    </button>
  );
};


const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ palette, recoloredImageUrl, accentColor }) => {
    const [isVisible, setIsVisible] = useState(false);
    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <div className={`space-y-8 mt-8 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <Palette palette={palette} accentColor={accentColor} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ColorChart palette={palette} />
                <RecoloredImage imageUrl={recoloredImageUrl} />
            </div>
        </div>
    );
};

export default ResultsDisplay;