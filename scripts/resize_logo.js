const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

async function processLogo() {
  try {
    const oldLogoPath = path.join(__dirname, '..', 'public', 'logo.png');
    const oldLogo = await Jimp.read(oldLogoPath);
    const targetWidth = oldLogo.bitmap.width;
    const targetHeight = oldLogo.bitmap.height;
    
    console.log(`Old logo dimensions: ${targetWidth}x${targetHeight}`);

    const newLogoPath = 'C:\\Users\\OBAID\\.gemini\\antigravity\\brain\\e3b293a2-cc32-4b87-b5b1-9227bb6f4076\\sdk_batiment_horizontal_v1_1774105611018.png';
    const newLogo = await Jimp.read(newLogoPath);
    
    // Auto-crop white background. We make all pure white pixels transparent, then autocrop.
    newLogo.scan(0, 0, newLogo.bitmap.width, newLogo.bitmap.height, function(x, y, idx) {
      var red = this.bitmap.data[idx + 0];
      var green = this.bitmap.data[idx + 1];
      var blue = this.bitmap.data[idx + 2];
      
      // If the pixel is very close to white, make it transparent
      if (red > 240 && green > 240 && blue > 240) {
        this.bitmap.data[idx + 3] = 0; // alpha to 0
      }
    });

    // Autocrop transparent borders
    newLogo.autocrop();

    console.log(`New logo cropped dimensions: ${newLogo.bitmap.width}x${newLogo.bitmap.height}`);

    // Now fit the new logo into the target dimensions, containment approach
    // We create a new transparent image of the exact target dimensions
    const finalImage = new Jimp(targetWidth, targetHeight, 0x00000000);
    
    // Resize the cropped logo to fit within the target dimensions while maintaining aspect ratio
    newLogo.scaleToFit(targetWidth, targetHeight);
    
    // Calculate position to center it (or maybe just left-align? Let's just center align like usual, or left-align because the old one looks left-aligned)
    const xOffset = Math.floor((targetWidth - newLogo.bitmap.width) / 2);
    const yOffset = Math.floor((targetHeight - newLogo.bitmap.height) / 2);
    
    finalImage.composite(newLogo, xOffset, yOffset);
    
    const outputPath = 'C:\\Users\\OBAID\\.gemini\\antigravity\\brain\\e3b293a2-cc32-4b87-b5b1-9227bb6f4076\\sdk_batiment_final.png';
    await finalImage.writeAsync(outputPath);
    console.log(`Saved final logo to ${outputPath}`);
  } catch (err) {
    console.error('Error processing image:', err);
  }
}

processLogo();
