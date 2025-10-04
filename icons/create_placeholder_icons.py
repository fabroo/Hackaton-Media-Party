#!/usr/bin/env python3
"""
Create placeholder icons for Chrome extension
Requires PIL (Pillow): pip install Pillow
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_placeholder_icon(size, filename):
    """
    Create a placeholder icon with the given size
    """
    # Create a new image with RGBA mode (supports transparency)
    img = Image.new('RGBA', (size, size), (103, 126, 234, 255))  # Purple background
    
    # Get a drawing context
    draw = ImageDraw.Draw(img)
    
    # Draw a circular background
    margin = int(size * 0.1)
    draw.ellipse([margin, margin, size-margin, size-margin], fill=(118, 75, 162, 255))
    
    # Draw text based on size
    if size >= 48:
        text = "MP"
        try:
            font_size = int(size * 0.4)
            font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", font_size)
        except:
            font_size = int(size * 0.3)
            font = ImageFont.load_default()
    elif size >= 32:
        text = "M"
        try:
            font_size = int(size * 0.5)
            font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", font_size)
        except:
            font_size = int(size * 0.4)
            font = ImageFont.load_default()
    else:
        text = "●"
        font = ImageFont.load_default()
    
    # Get text dimensions for centering
    if hasattr(font, 'getsize'):
        text_bbox = font.getsize(text)
    else:
        text_bbox = font.getbbox(text)
        text_bbox = (text_bbox[2] - text_bbox[0], text_bbox[3] - text_bbox[1])
    
    text_x = (size - text_bbox[0]) // 2
    text_y = (size - text_bbox[1]) // 2
    
    # Draw white text
    draw.text((text_x, text_y), text, fill=(255, 255, 255, 255), font=font)
    
    # Save the image
    img.save(filename, 'PNG')
    print(f"Created {filename} ({size}x{size})")

def main():
    """
    Create all required icon sizes
    """
    sizes = [16, 32, 48, 128]
    
    print("Creating placeholder icons...")
    print("Note: These are temporary placeholders. Replace with professional icons before publishing.")
    
    for size in sizes:
        filename = f"icon{size}.png"
        create_placeholder_icon(size, filename)
        if os.path.exists(filename):
            print(f"✓ {filename} created successfully")
        else:
            print(f"✗ Failed to create {filename}")
    
    print("\nPlaceholder icons created! Remember to replace with professional icons.")

if __name__ == "__main__":
    main()
