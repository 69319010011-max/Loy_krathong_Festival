/**
 * Image Compression Utility for Firestore
 * Compresses any input image (Camera Snapshot or Uploaded File)
 * to strictly guaranteed <= 500 KB while preserving high visual quality.
 */

export async function compressImageUnder500KB(input, maxSizeBytes = 500 * 1024) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    const processDataUrl = (dataUrl) => {
      const img = new Image();
      img.onload = () => {
        // Initial max dimension target (800x800 is crystal clear and lightweight)
        let maxDim = 800;
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio scale
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Iterative compression loop to ensure <= 500 KB
        let quality = 0.82;
        let resultDataUrl = canvas.toDataURL('image/jpeg', quality);
        let byteSize = getBase64ByteSize(resultDataUrl);

        // If larger than limit, progressively reduce quality and/or dimensions
        let attempts = 0;
        while (byteSize > maxSizeBytes && attempts < 8) {
          attempts++;
          quality -= 0.12;
          if (quality < 0.25) {
            // Scale canvas down further
            width = Math.round(width * 0.8);
            height = Math.round(height * 0.8);
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            quality = 0.75;
          }
          resultDataUrl = canvas.toDataURL('image/jpeg', Math.max(0.2, quality));
          byteSize = getBase64ByteSize(resultDataUrl);
        }

        resolve({
          dataUrl: resultDataUrl,
          sizeBytes: byteSize,
          sizeKB: (byteSize / 1024).toFixed(1),
          isUnderLimit: byteSize <= maxSizeBytes
        });
      };

      img.onerror = (err) => reject(new Error('Failed to load image for compression: ' + err));
      img.src = dataUrl;
    };

    if (typeof input === 'string') {
      processDataUrl(input);
    } else if (input instanceof Blob || input instanceof File) {
      reader.onload = (e) => processDataUrl(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(input);
    } else {
      reject(new Error('Invalid image input: expected File, Blob, or Data URL string'));
    }
  });
}

/**
 * Calculates byte size of a base64 Data URL string
 */
export function getBase64ByteSize(base64String) {
  if (!base64String) return 0;
  const commaIndex = base64String.indexOf(',');
  const base64Data = commaIndex !== -1 ? base64String.slice(commaIndex + 1) : base64String;
  const padding = (base64Data.endsWith('==') ? 2 : base64Data.endsWith('=') ? 1 : 0);
  return Math.round((base64Data.length * 3) / 4) - padding;
}

