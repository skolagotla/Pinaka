/**
 * Image Compression Utility
 * Compresses and resizes images before converting to base64
 * Reduces file size significantly while maintaining good visual quality
 */

/**
 * Compress and resize an image file
 * @param {File} file - The image file to compress
 * @param {Object} options - Compression options
 * @param {number} options.maxWidth - Maximum width in pixels (default: 1920)
 * @param {number} options.maxHeight - Maximum height in pixels (default: 1920)
 * @param {number} options.quality - JPEG quality 0-1 (default: 0.85)
 * @param {number} options.maxSizeMB - Maximum file size in MB (default: 2)
 * @returns {Promise<string>} - Base64 data URL of compressed image
 */
export function compressImage(file, options = {}) {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = 1920,
      maxHeight = 1920,
      quality = 0.85,
      maxSizeMB = 2
    } = options;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      reject(new Error('File is not an image'));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        
        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob with compression
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }
            
            // Check if compressed size is acceptable
            const sizeMB = blob.size / (1024 * 1024);
            if (sizeMB > maxSizeMB) {
              // Try again with lower quality
              canvas.toBlob(
                (smallerBlob) => {
                  if (!smallerBlob) {
                    reject(new Error('Failed to compress image to acceptable size'));
                    return;
                  }
                  const reader2 = new FileReader();
                  reader2.onload = (e2) => resolve(e2.target.result);
                  reader2.onerror = () => reject(new Error('Failed to read compressed image'));
                  reader2.readAsDataURL(smallerBlob);
                },
                'image/jpeg',
                0.7 // Lower quality for large files
              );
            } else {
              const reader2 = new FileReader();
              reader2.onload = (e2) => resolve(e2.target.result);
              reader2.onerror = () => reject(new Error('Failed to read compressed image'));
              reader2.readAsDataURL(blob);
            }
          },
          'image/jpeg', // Always convert to JPEG for better compression
          quality
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target.result;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Get estimated compression ratio
 * @param {File} file - Original file
 * @returns {Promise<number>} - Estimated compression ratio (0-1)
 */
export async function getEstimatedCompression(file) {
  // Rough estimate: resizing to 1920px and JPEG compression typically reduces size by 60-80%
  // This is just an estimate for UI feedback
  return 0.7; // ~70% reduction on average
}

