import numpy as np
from PIL import Image

def remove_white(img):
    img = img.convert("RGB")
    arr = np.array(img).astype(float) / 255.0
    alpha = np.max([1 - arr[:,:,0], 1 - arr[:,:,1], 1 - arr[:,:,2]], axis=0)
    alpha_safe = np.where(alpha == 0, 1.0, alpha)
    r = np.clip((arr[:,:,0] - (1.0 - alpha)) / alpha_safe, 0.0, 1.0)
    g = np.clip((arr[:,:,1] - (1.0 - alpha)) / alpha_safe, 0.0, 1.0)
    b = np.clip((arr[:,:,2] - (1.0 - alpha)) / alpha_safe, 0.0, 1.0)
    rgba = np.stack([r, g, b, alpha], axis=2)
    return Image.fromarray((rgba * 255.0).astype(np.uint8), "RGBA")


def autocrop(img):
    arr = np.array(img)
    alpha = arr[:,:,3]
    non_empty_cols = np.where(alpha.max(axis=0) > 5)[0]
    non_empty_rows = np.where(alpha.max(axis=1) > 5)[0]
    if len(non_empty_cols) > 0 and len(non_empty_rows) > 0:
        return img.crop((non_empty_cols[0], non_empty_rows[0], non_empty_cols[-1]+1, non_empty_rows[-1]+1))
    return img

# 1. Load the image that has the chosen icon
img_icon_source = Image.open(r"C:\Users\OBAID\.gemini\antigravity\brain\e3b293a2-cc32-4b87-b5b1-9227bb6f4076\horizon_chimique_horizontal_logo_2_1774105340923.png")

# 2. Load the image that has the perfect text
img_text_source = Image.open(r"C:\Users\OBAID\.gemini\antigravity\brain\e3b293a2-cc32-4b87-b5b1-9227bb6f4076\sdk_batiment_horizontal_v1_1774105611018.png")

# We remove backgrounds from both but avoid the complex alpha trick that made text pale
# Simple alpha trick based on brightness
def keep_solid(img):
    img = img.convert("RGBA")
    arr = np.array(img).astype(float)
    # distance from white (255,255,255)
    dist = np.sqrt(np.sum((arr[:,:,0:3] - 255.0)**2, axis=2))
    # if distance is less than 30, it's white, alpha = 0
    # if distance > 100, solid, alpha = 255
    alpha = np.interp(dist, [20, 100], [0, 255])
    arr[:,:,3] = alpha
    return Image.fromarray(arr.astype(np.uint8), "RGBA")

icon_transparent = keep_solid(img_icon_source)
text_transparent = keep_solid(img_text_source)

# Now we need to crop just the ICON from the left half of the first image
# The icon is on the far left. Crop precisely
icon_half = icon_transparent.crop((0, 0, 95, icon_transparent.height))
icon_cropped = autocrop(icon_half)

# Now we crop exactly the TEXT from the right half of the second image
text_half = text_transparent.crop((text_transparent.width // 2 - 100, 0, text_transparent.width, text_transparent.height))
text_cropped = autocrop(text_half)

# Now combine them side by side
gap = 30
new_w = icon_cropped.width + gap + text_cropped.width
new_h = max(icon_cropped.height, text_cropped.height)

combined = Image.new("RGBA", (new_w, new_h), (0,0,0,0))

# Paste icon vertically centered
icon_y = (new_h - icon_cropped.height) // 2
combined.paste(icon_cropped, (0, icon_y), icon_cropped)

# Paste text vertically centered
text_y = (new_h - text_cropped.height) // 2
combined.paste(text_cropped, (icon_cropped.width + gap, text_y), text_cropped)

# Now scale the combined image to exactly match the old logo format 472x177
old_logo = Image.open(r"d:\HORIZON CHIMIQUE APP\public\logo.png")
target_w, target_h = old_logo.size

scale = min(target_w / combined.width, target_h / combined.height)
final_w = int(combined.width * scale)
final_h = int(combined.height * scale)

resized = combined.resize((final_w, final_h), Image.Resampling.LANCZOS)

final_img = Image.new("RGBA", (target_w, target_h), (0,0,0,0))
x_off = (target_w - final_w) // 2
y_off = (target_h - final_h) // 2

final_img.paste(resized, (x_off, y_off), resized)

# Save the final result
out_path = r"C:\Users\OBAID\.gemini\antigravity\brain\e3b293a2-cc32-4b87-b5b1-9227bb6f4076\sdk_combo_logo.png"
final_img.save(out_path)

# Also explicitly overwrite the live logo
live_path = r"d:\HORIZON CHIMIQUE APP\public\logo.png"
final_img.save(live_path)

print(f"Successfully compounded and saved to {live_path}")
