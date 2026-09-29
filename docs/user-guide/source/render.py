import sys, fitz
from PIL import Image
pdf, prefix, per = sys.argv[1], sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 6
doc = fitz.open(pdf)
pages = [Image.frombytes("RGB", (pm.width, pm.height), pm.samples) for pm in (pg.get_pixmap(dpi=70) for pg in doc)]
w, h = pages[0].size
cols = 3
for s in range(0, len(pages), per):
    chunk = pages[s:s + per]
    rows = (len(chunk) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * w + (cols + 1) * 10, rows * h + (rows + 1) * 10), (120, 120, 120))
    for i, im in enumerate(chunk):
        sheet.paste(im, (10 + (i % cols) * (w + 10), 10 + (i // cols) * (h + 10)))
    sheet.save(f"{prefix}-{s // per + 1:02d}.png")
print(len(pages), "pages rendered")
