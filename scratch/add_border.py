from PIL import Image, ImageDraw

def add_blue_border(input_path, output_path, border_width_ratio=0.03):
    img = Image.open(input_path).convert("RGBA")
    w, h = img.size
    
    # Scale border with image dimensions
    border_width = max(2, int(min(w, h) * border_width_ratio))
    
    # Circular crop mask
    mask = Image.new('L', (w, h), 0)
    draw_mask = ImageDraw.Draw(mask)
    draw_mask.ellipse((0, 0, w, h), fill=255)
    
    result = img.copy()
    result.putalpha(mask)
    
    draw = ImageDraw.Draw(result)
    # Inset bounding box by half stroke width to avoid edge clipping
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
