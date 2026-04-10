export const compressImage = async (file, quality = 0.8) => {
    // If not an image, return original
    if (!file.type.startsWith('image/')) return file;

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = async () => {
                const canvas = document.createElement('canvas');
                // Keep original resolution
                canvas.width = img.width;
                canvas.height = img.height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                // Add Watermark
                try {
                    const watermark = new Image();
                    watermark.src = '/watermark.png';
                    await new Promise((res) => {
                        watermark.onload = res;
                        watermark.onerror = res; // Proceed even if watermark fails
                    });

                    if (watermark.complete && watermark.naturalWidth > 0) {
                        // Calculate watermark size (e.g., 30% of main image width)
                        const wmWidth = canvas.width * 0.3;
                        const wmHeight = (watermark.height / watermark.width) * wmWidth;
                        
                        // Center of the image
                        const x = (canvas.width - wmWidth) / 2;
                        const y = (canvas.height - wmHeight) / 2;

                        // Transparency
                        ctx.globalAlpha = 0.15;
                        ctx.drawImage(watermark, x, y, wmWidth, wmHeight);
                        ctx.globalAlpha = 1.0;
                    }
                } catch (e) {
                    console.error("Watermark failed, skipping...", e);
                }

                // Compress
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Compression failed'));
                            return;
                        }
                        // Create new File from blob with original name but potentially jpg extension if converted
                        const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        resolve(newFile);
                    },
                    'image/jpeg',
                    quality
                );
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};
