# Project Chroma

Project Chroma is a browser-based image color quantization tool. It extracts a small representative palette from an uploaded image and generates a reduced-color version of the image using k-means clustering in RGB color space.

Live demo: [juhilsavani.github.io/project-chroma](https://juhilsavani.github.io/project-chroma/)

## What it does

- Accepts PNG and JPEG images from the user’s device.
- Processes the image locally in the browser; there is no application backend.
- Reduces the image to a maximum dimension of 200 pixels for faster processing.
- Groups opaque pixels into 2–5 RGB color clusters.
- Reports each cluster as HEX, RGB, and CMYK values.
- Estimates the proportion of the image represented by each color.
- Generates a color-quantized preview using the cluster centroids.
- Exports the extracted palette as a PNG image.

## How the extraction works

1. The uploaded file is loaded into an HTML canvas.
2. The image is downscaled while preserving its aspect ratio.
3. Pixels with low alpha values are excluded.
4. The remaining RGB pixels are clustered with k-means.
5. Each cluster centroid becomes a palette color.
6. Pixels are replaced with their assigned centroid to produce the quantized image.

The implementation uses Euclidean distance in RGB space and runs 15 fixed k-means iterations. Initial centroids are selected randomly, so repeated runs can produce slightly different palettes.

## Running locally

Requirements:

- Node.js 20 or newer
- npm

Install dependencies and start the development server:

```bash
npm ci
npm run dev
```

The development server is available at `http://localhost:3000`.

Create a production build with:

```bash
npm run build
```

Preview the production build locally with:

```bash
npm run preview
```

## Deployment

`npm run deploy` creates the production Vite build in `dist/`.

The repository includes a GitHub Actions workflow at `.github/workflows/deploy.yml`. It runs on pushes to `main` and manual workflow runs:

1. Installs dependencies with `npm ci`.
2. Runs `npm run deploy`.
3. Uploads `dist/` as a Pages artifact.
4. Publishes the artifact through GitHub Pages.

GitHub Pages must be configured to use **GitHub Actions** as its source.

## Technical stack

- React
- TypeScript
- Vite
- HTML Canvas API
- Recharts
- Lucide React
- Tailwind CSS via the CDN script in `index.html`

## Limitations

- The clustering is performed in RGB space, which is not perceptually uniform.
- Random centroid initialization means results are not fully deterministic.
- Downscaling can remove small or subtle color regions.
- Processing runs on the browser’s main thread.
- Palette proportions are estimates based on the downscaled image.
- The tool does not store uploaded images or provide project/session persistence.
