export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: 'image/jpeg' | 'image/webp';
}

const defaultOptions: Required<ImageCompressionOptions> = {
  maxWidth: 1600,
  maxHeight: 1080,
  quality: 0.82,
  mimeType: 'image/jpeg'
};

export async function compressImageToDataUrl(
  file: File,
  options?: ImageCompressionOptions
): Promise<string> {
  const config = { ...defaultOptions, ...options };
  const image = await loadImage(file);

  const { width, height } = fitInside(
    image.width,
    image.height,
    config.maxWidth,
    config.maxHeight
  );

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas context is unavailable');
  }

  // Re-encoding through canvas strips EXIF metadata and reduces size.
  ctx.drawImage(image, 0, 0, width, height);

  const blob = await canvasToBlob(canvas, config.mimeType, config.quality);
  return blobToDataUrl(blob);
}

function fitInside(
  sourceWidth: number,
  sourceHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  const ratio = Math.min(maxWidth / sourceWidth, maxHeight / sourceHeight, 1);

  return {
    width: Math.max(1, Math.round(sourceWidth * ratio)),
    height: Math.max(1, Math.round(sourceHeight * ratio))
  };
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to decode image'));
    };

    img.src = objectUrl;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to create compressed image blob'));
          return;
        }
        resolve(blob);
      },
      mimeType,
      quality
    );
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('Failed to read compressed image as data URL'));
        return;
      }
      resolve(reader.result);
    };

    reader.onerror = () => reject(new Error('Failed to read compressed image'));
    reader.readAsDataURL(blob);
  });
}
