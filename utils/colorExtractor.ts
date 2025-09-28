
import type { RGBColor, CMYKColor, ColorData, ExtractionResult } from '../types';

const MAX_IMAGE_SIZE = 200; // px for performance
const KMEANS_ITERATIONS = 15;

// --- Color Conversion Utilities ---
const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (c: number) => `0${c.toString(16)}`.slice(-2);
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const rgbToCmyk = (r: number, g: number, b: number): CMYKColor => {
    let c = 1 - (r / 255);
    let m = 1 - (g / 255);
    let y = 1 - (b / 255);
    let k = Math.min(c, m, y);

    if (k === 1) {
        return { c: 0, m: 0, y: 0, k: 100 };
    }

    c = Math.round(((c - k) / (1 - k)) * 100);
    m = Math.round(((m - k) / (1 - k)) * 100);
    y = Math.round(((y - k) / (1 - k)) * 100);
    k = Math.round(k * 100);

    return { c, m, y, k };
};

// --- K-Means Clustering Logic ---
const euclideanDistance = (p1: RGBColor, p2: RGBColor): number => {
  return Math.sqrt(
    Math.pow(p1.r - p2.r, 2) + Math.pow(p1.g - p2.g, 2) + Math.pow(p1.b - p2.b, 2)
  );
};

const kMeans = (pixels: RGBColor[], k: number): { centroids: RGBColor[]; assignments: number[] } => {
  // 1. Initialize centroids randomly from the pixels
  let centroids: RGBColor[] = [];
  const usedIndices = new Set<number>();
  while (centroids.length < k) {
    const index = Math.floor(Math.random() * pixels.length);
    if (!usedIndices.has(index)) {
      centroids.push(pixels[index]);
      usedIndices.add(index);
    }
  }

  const assignments = new Array(pixels.length).fill(0);

  for (let i = 0; i < KMEANS_ITERATIONS; i++) {
    // 2. Assign each pixel to the closest centroid
    for (let j = 0; j < pixels.length; j++) {
      let minDistance = Infinity;
      let closestCentroidIndex = 0;
      for (let c = 0; c < k; c++) {
        const distance = euclideanDistance(pixels[j], centroids[c]);
        if (distance < minDistance) {
          minDistance = distance;
          closestCentroidIndex = c;
        }
      }
      assignments[j] = closestCentroidIndex;
    }

    // 3. Recalculate centroids
    const newCentroids: RGBColor[] = Array.from({ length: k }, () => ({ r: 0, g: 0, b: 0 }));
    const counts = new Array(k).fill(0);
    for (let j = 0; j < pixels.length; j++) {
      const centroidIndex = assignments[j];
      newCentroids[centroidIndex].r += pixels[j].r;
      newCentroids[centroidIndex].g += pixels[j].g;
      newCentroids[centroidIndex].b += pixels[j].b;
      counts[centroidIndex]++;
    }

    for (let c = 0; c < k; c++) {
      if (counts[c] > 0) {
        newCentroids[c].r = Math.round(newCentroids[c].r / counts[c]);
        newCentroids[c].g = Math.round(newCentroids[c].g / counts[c]);
        newCentroids[c].b = Math.round(newCentroids[c].b / counts[c]);
      } else {
        // If a centroid has no points, re-initialize it to a random pixel
        newCentroids[c] = pixels[Math.floor(Math.random() * pixels.length)];
      }
    }
    centroids = newCentroids;
  }

  return { centroids, assignments };
};

// --- Main Exported Function ---
export const extractAndRecolorImage = (imageUrl: string, k: number): Promise<ExtractionResult> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageUrl;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context not available'));

      // Downscale image for performance
      let { width, height } = img;
      if (width > height) {
        if (width > MAX_IMAGE_SIZE) {
          height = Math.round((height * MAX_IMAGE_SIZE) / width);
          width = MAX_IMAGE_SIZE;
        }
      } else {
        if (height > MAX_IMAGE_SIZE) {
          width = Math.round((width * MAX_IMAGE_SIZE) / height);
          height = MAX_IMAGE_SIZE;
        }
      }
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      const pixels: RGBColor[] = [];

      for (let i = 0; i < data.length; i += 4) {
        // Ignore transparent pixels
        if (data[i + 3] > 128) {
           pixels.push({ r: data[i], g: data[i + 1], b: data[i + 2] });
        }
      }
      
      if (pixels.length === 0) {
          return reject(new Error("No opaque pixels found in image."));
      }

      const { centroids, assignments } = kMeans(pixels, k);

      // Create recolored image
      const recoloredCanvas = document.createElement('canvas');
      const recoloredCtx = recoloredCanvas.getContext('2d');
      if (!recoloredCtx) return reject(new Error('Canvas context not available'));
      recoloredCanvas.width = width;
      recoloredCanvas.height = height;
      const newImageData = recoloredCtx.createImageData(width, height);
      
      let pixelIndex = 0;
      for (let i = 0; i < newImageData.data.length; i += 4) {
        if (data[i+3] > 128) { // if original pixel was not transparent
            const assignment = assignments[pixelIndex];
            const centroid = centroids[assignment];
            newImageData.data[i] = centroid.r;
            newImageData.data[i + 1] = centroid.g;
            newImageData.data[i + 2] = centroid.b;
            newImageData.data[i + 3] = 255;
            pixelIndex++;
        } else { // preserve transparency
            newImageData.data[i + 3] = 0;
        }
      }
      recoloredCtx.putImageData(newImageData, 0, 0);
      const recoloredImageUrl = recoloredCanvas.toDataURL();


      // Calculate proportions
      const counts = new Array(k).fill(0);
      assignments.forEach(assignment => counts[assignment]++);
      const totalPixels = pixels.length;
      
      const palette: ColorData[] = centroids
        .map((rgb, index) => ({
            rgb,
            hex: rgbToHex(rgb.r, rgb.g, rgb.b),
            cmyk: rgbToCmyk(rgb.r, rgb.g, rgb.b),
            proportion: counts[index] / totalPixels,
        }))
        .sort((a, b) => b.proportion - a.proportion);

      resolve({ palette, recoloredImageUrl });
    };

    img.onerror = (err) => reject(err);
  });
};
