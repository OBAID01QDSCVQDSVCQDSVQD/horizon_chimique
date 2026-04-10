import sys
import numpy as np
from PIL import Image
import os

def process_cachet(input_path, output_path):
    try:
        img = Image.open(input_path).convert("RGBA")
        arr = np.array(img).astype(float)
        
        # Calculate distance from white (255, 255, 255)
        # Using the same logic as 'keep_solid' in the logo script
        dist = np.sqrt(np.sum((arr[:,:,0:3] - 255.0)**2, axis=2))
        
        # Linear interpolation for alpha:
        # If distance < 20 (very white): alpha = 0 (transparent)
        # If distance > 100 (solid color): alpha = 255 (opaque)
        # In between: smooth transition
        alpha = np.interp(dist, [20, 100], [0, 255])
        
        arr[:,:,3] = alpha
        
        result_img = Image.fromarray(arr.astype(np.uint8), "RGBA")
        
        # Autocrop to remove empty margins
        alpha_channel = arr[:,:,3]
        non_empty_cols = np.where(alpha_channel.max(axis=0) > 5)[0]
        non_empty_rows = np.where(alpha_channel.max(axis=1) > 5)[0]
        
        if len(non_empty_cols) > 0 and len(non_empty_rows) > 0:
            result_img = result_img.crop((
                non_empty_cols[0], 
                non_empty_rows[0], 
                non_empty_cols[-1]+1, 
                non_empty_rows[-1]+1
            ))
            
        result_img.save(output_path, "PNG")
        print(f"Success: Processed cachet saved to {output_path}")
        return True
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python process_cachet.py <input_image> <output_image>")
    else:
        process_cachet(sys.argv[1], sys.argv[2])
