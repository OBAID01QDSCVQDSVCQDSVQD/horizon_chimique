import numpy as np
from PIL import Image

def remove_white_bg_perfect(input_path, output_path, old_logo_path):
    img = Image.open(input_path).convert("RGB")
    arr = np.array(img).astype(float) / 255.0
    
    # Calculate estimated alpha. Assuming background is white (1,1,1)
    # The true color C is blended with white: Obs = C * A + 1 * (1 - A)
    # Therefore, A * (1 - C) = 1 - Obs
    # Since C must be between 0 and 1, A >= 1 - Obs for all channels.
    # Therefore, the minimum possible alpha for each pixel is max(1 - Obs).
    # To recover the sharpest colors without white halos, we use exactly this minimum alpha.
    alpha = np.max([1 - arr[:,:,0], 1 - arr[:,:,1], 1 - arr[:,:,2]], axis=0)
    
    # Optional: Boost alpha slightly to make colors solid, but apply a curve to preserve soft edges
    # We can use a contrast curve on the alpha channel.
    # Actually, min possible alpha gives the purest but darkest color. Let's just use it.
    
    # Prevent division by zero
    alpha_safe = np.where(alpha == 0, 1.0, alpha)
    
    # Recover original colors
    r = (arr[:,:,0] - (1.0 - alpha)) / alpha_safe
    g = (arr[:,:,1] - (1.0 - alpha)) / alpha_safe
    b = (arr[:,:,2] - (1.0 - alpha)) / alpha_safe
    
    # Clip just in case
    r = np.clip(r, 0.0, 1.0)
    g = np.clip(g, 0.0, 1.0)
    b = np.clip(b, 0.0, 1.0)
    
    # Recombine to RGBA
    rgba_arr = np.stack([r, g, b, alpha], axis=2)
    rgba_arr = (rgba_arr * 255.0).astype(np.uint8)
    
    out_img = Image.fromarray(rgba_arr, "RGBA")
    
    # crop bounding box
    alpha_chan = rgba_arr[:,:,3]
    non_empty_cols = np.where(alpha_chan.max(axis=0) > 5)[0]
    non_empty_rows = np.where(alpha_chan.max(axis=1) > 5)[0]
    
    if len(non_empty_cols) > 0 and len(non_empty_rows) > 0:
        left, right = non_empty_cols[0], non_empty_cols[-1]
        top, bottom = non_empty_rows[0], non_empty_rows[-1]
        # Add a tiny padding
        pad = 5
        left = max(0, left - pad)
        right = min(out_img.width - 1, right + pad)
        top = max(0, top - pad)
        bottom = min(out_img.height - 1, bottom + pad)
        
        cropped = out_img.crop((left, top, right + 1, bottom + 1))
    else:
        cropped = out_img
        
    # resize to fit target
    old_img = Image.open(old_logo_path)
    tw, th = old_img.size
    
    scale = min(tw / cropped.width, th / cropped.height)
    new_w = int(cropped.width * scale)
    new_h = int(cropped.height * scale)
    
    resized = cropped.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    final_img = Image.new("RGBA", (tw, th), (0, 0, 0, 0))
    x_off = (tw - new_w) // 2
    y_off = (th - new_h) // 2
    
    final_img.paste(resized, (x_off, y_off), resized)
    final_img.save(output_path)
    print(f"Success. Transparent image saved to: {output_path}")

new_path = r"C:\Users\OBAID\.gemini\antigravity\brain\e3b293a2-cc32-4b87-b5b1-9227bb6f4076\sdk_batiment_new_final_1774107837329.png"
out_path = r"C:\Users\OBAID\.gemini\antigravity\brain\e3b293a2-cc32-4b87-b5b1-9227bb6f4076\sdk_batiment_new_final_bg_removed.png"
old_path = r"d:\HORIZON CHIMIQUE APP\public\logo.png"

remove_white_bg_perfect(new_path, out_path, old_path)
