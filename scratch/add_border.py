from PIL import Image, ImageDraw

def add_blue_border(input_path, output_path, border_width_ratio=0.03):
    img = Image.open(input_path).convert("RGBA")
    w, h = img.size
    
    # Determine a good border width based on image size
    border_width = max(2, int(min(w, h) * border_width_ratio))
    
    # Create mask for round crop
    mask = Image.new('L', (w, h), 0)
    draw_mask = ImageDraw.Draw(mask)
    draw_mask.ellipse((0, 0, w, h), fill=255)
    
    # Apply mask
    result = img.copy()
    result.putalpha(mask)
    
    # Draw blue border
    draw = ImageDraw.Draw(result)
    # The bounding box needs to be offset by half the border width 
    # to fit entirely within the image bounds without getting clipped
    bbox = (
        border_width // 2,
        border_width // 2,
        w - (border_width // 2) - 1,
        h - (border_width // 2) - 1
    )
    draw.ellipse(bbox, outline=(0, 122, 255, 255), width=border_width)
    
    result.save(output_path)

if __name__ == "__main__":
    add_blue_border("image.png", "image_round_border.png")
