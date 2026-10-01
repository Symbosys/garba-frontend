/**
 * Compresses an image File to be strictly under `maxSizeBytes` (default 100 KB = 102,400 bytes).
 * Employs HTML5 Canvas downscaling and progressive quality iteration.
 */
export async function compressImage(file: File, maxSizeBytes: number = 100 * 1024): Promise<File> {
  // If already under max size and is standard JPEG/WebP/PNG, check if compression needed
  if (file.size <= maxSizeBytes && (file.type === 'image/jpeg' || file.type === 'image/webp')) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        try {
          let width = img.width;
          let height = img.height;

          // Max dimension clamp for high visual fidelity
          const MAX_DIMENSION = 1200;
          if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
            if (width > height) {
              height = Math.round((height * MAX_DIMENSION) / width);
              width = MAX_DIMENSION;
            } else {
              width = Math.round((width * MAX_DIMENSION) / height);
              height = MAX_DIMENSION;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return resolve(file);
          }

          // Fill white background for transparent PNG conversions
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          const mimeType = 'image/jpeg';
          let quality = 0.85;
          let blob: Blob | null = await new Promise((res) => canvas.toBlob(res, mimeType, quality));

          // Progressive quality reduction
          while (blob && blob.size > maxSizeBytes && quality > 0.2) {
            quality -= 0.12;
            blob = await new Promise((res) => canvas.toBlob(res, mimeType, quality));
          }

          // Downscale dimension further if still above maxSizeBytes
          let currentScale = 0.8;
          while (blob && blob.size > maxSizeBytes && currentScale > 0.2) {
            const scaledCanvas = document.createElement('canvas');
            scaledCanvas.width = Math.max(100, Math.round(width * currentScale));
            scaledCanvas.height = Math.max(100, Math.round(height * currentScale));
            const scaledCtx = scaledCanvas.getContext('2d');
            if (scaledCtx) {
              scaledCtx.fillStyle = '#FFFFFF';
              scaledCtx.fillRect(0, 0, scaledCanvas.width, scaledCanvas.height);
              scaledCtx.drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);
              blob = await new Promise((res) => scaledCanvas.toBlob(res, mimeType, Math.max(quality, 0.45)));
            }
            currentScale -= 0.2;
          }

          if (blob) {
            const cleanName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
            const compressedFile = new File([blob], cleanName, {
              type: mimeType,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Format bytes into human-readable string (e.g. "64.2 KB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
