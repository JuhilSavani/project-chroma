
export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export interface CMYKColor {
  c: number;
  m: number;
  y: number;
  k: number;
}

export interface ColorData {
  rgb: RGBColor;
  hex: string;
  cmyk: CMYKColor;
  proportion: number;
}

export interface ExtractionResult {
  palette: ColorData[];
  recoloredImageUrl: string;
}

export type ColorMode = 'HEX' | 'RGB' | 'CMYK';
