import sys
import argparse
from rembg import remove
from PIL import Image
import numpy as np

def process_logo(input_path, old_logo_path, output_path):
    # 1. Open new image and remove background
    input_img = Image.open(input_path).convert("RGBA")
    
    print("Removing background with rembg...")
    # remove background perfectly
    output_img = remove(input_img)
    
    # 2. Get target dimensions from old logo
    old_img = Image.open(old_logo_path)
    target_w, target_h = old_img.size
    print(f"Target dimensions: {target_w}x{target_h}")
    
    # 3. Crop to bounding box of the non-transparent pixels
    # convert to numpy array to find bounding box
    img_arr = np.array(output_img)
    alpha = img_arr[:, :, 3]
    
    # find rows and cols where alpha > 0
    non_empty_columns = np.where(alpha.max(axis=0) > 0)[0]
    non_empty_rows = np.where(alpha.max(axis=1) > 0)[0]
    
    if len(non_empty_columns) > 0 and len(non_empty_rows) > 0:
        left = int(non_empty_columns[0])
        right = int(non_empty_columns[-1])
        top = int(non_empty_rows[0])
        bottom = int(non_empty_rows[-1])
        
        # crop the image tightly
        cropped = output_img.crop((left, top, right + 1, bottom + 1))
        print(f"Cropped dimensions: {cropped.size[0]}x{cropped.size[1]}")
    else:
        cropped = output_img # fallback if completely empty
    
    # 4. Resize and center to fit the target dimensions
    # Calculate scale to fit
    scale = min(target_w / cropped.size[0], target_h / cropped.size[1])
    new_w = int(cropped.size[0] * scale)
    new_h = int(cropped.size[1] * scale)
    
    # Use LACSZOS for high quality downsampling
    resized = cropped.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    # 5. Create the final transparent canvas and paste the resized image centered
    final_img = Image.new("RGBA", (target_w, target_h), (0, 0, 0, 0))
    x_offset = (target_w - new_w) // 2
    y_offset = (target_h - new_h) // 2
    
    final_img.paste(resized, (x_offset, y_offset), resized)
    
    # 6. Save final output
    final_img.save(output_path)
    print(f"Saved final logo to {output_path}")

if __name__ == "__main__":
    new_logo = r"C:\Users\OBAID\.gemini\antigravity\brain\e3b293a2-cc32-4b87-b5b1-9227bb6f4076\sdk_batiment_horizontal_v2_1774106047143.png"
    old_logo = r"d:\HORIZON CHIMIQUE APP\public\logo.png"
    out_logo = r"C:\Users\OBAID\.gemini\antigravity\brain\e3b293a2-cc32-4b87-b5b1-9227bb6f4076\sdk_batiment_final_v2.png"
    process_logo(new_logo, old_logo, out_logo)
