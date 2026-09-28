# Draws the StatPlan journey diagram (3 rows, snake order). python flow.py out.png
import sys
from PIL import Image, ImageDraw, ImageFont

OUT = sys.argv[1]
S = 3  # supersample
W, H = 1800 * S // 2, 900 * S // 2
img = Image.new("RGB", (W, H), "white")
d = ImageDraw.Draw(img)
F = "C:/Windows/Fonts/"
title = ImageFont.truetype(F + "calibrib.ttf", 30 * S // 2)
sub = ImageFont.truetype(F + "calibri.ttf", 22 * S // 2)
num = ImageFont.truetype(F + "calibrib.ttf", 20 * S // 2)
NAVY, LIGHT, GRAY, ACC = (21, 50, 75), (234, 241, 248), (95, 105, 117), (235, 137, 27)

nodes = [
    ("Beranda", "Mulai perencanaan /\nPelajari contoh"),
    ("Contoh kegiatan", "Studi kasus ilustratif\n→ Mulai dari contoh ini"),
    ("Rencana baru", "Ceritakan kebutuhan\n& hasil yang diinginkan"),
    ("Timeline", "Rencana waktu 8 fase\n(alat bantu, bukan wajib BPS)"),
    ("Mode Terpandu", "8 fase · 44 subproses\nGSBPM 5.2"),
    ("Review StatPlan", "Mode Terpandu selesai:\ntinjau kesiapan draf"),
    ("Ruang kerja", "9 tab, dimulai dari\nTimeline"),
    ("Validasi", "Perlu dilengkapi /\nPerlu ditinjau"),
    ("Draft output", "Unduh draf perencanaan\n(.docx)"),
]
cols, bw, bh = 3, 470 * S // 2, 190 * S // 2
gx = (W - cols * bw) // (cols + 1)
rows_y = [70 * S // 2, 350 * S // 2, 630 * S // 2]
pos = []
for i in range(len(nodes)):
    r, c = divmod(i, cols)
    if r % 2 == 1: c = cols - 1 - c
    x = gx + c * (bw + gx)
    pos.append((x, rows_y[r]))

def arrow(x1, y1, x2, y2):
    d.line((x1, y1, x2, y2), fill=GRAY, width=4 * S // 2)
    import math
    a = math.atan2(y2 - y1, x2 - x1); L = 18 * S // 2
    for s in (0.45, -0.45):
        d.line((x2, y2, x2 - L * math.cos(a + s), y2 - L * math.sin(a + s)), fill=GRAY, width=4 * S // 2)

for i in range(len(nodes) - 1):
    (x1, y1), (x2, y2) = pos[i], pos[i + 1]
    if y1 == y2:
        if x2 > x1: arrow(x1 + bw + 6, y1 + bh // 2, x2 - 8, y2 + bh // 2)
        else: arrow(x1 - 6, y1 + bh // 2, x2 + bw + 8, y2 + bh // 2)
    else:
        arrow(x1 + bw // 2, y1 + bh + 6, x2 + bw // 2, y2 - 8)

for i, ((t, s), (x, y)) in enumerate(zip(nodes, pos)):
    core = t == "Mode Terpandu"
    d.rounded_rectangle((x, y, x + bw, y + bh), radius=22 * S // 2, fill=NAVY if core else LIGHT, outline=NAVY, width=3 * S // 2)
    fg = (255, 255, 255) if core else NAVY
    d.ellipse((x + 18 * S // 2, y + 18 * S // 2, x + 58 * S // 2, y + 58 * S // 2), fill=ACC if core else NAVY)
    d.text((x + 38 * S // 2, y + 38 * S // 2), str(i + 1), font=num, fill="white", anchor="mm")
    d.text((x + 72 * S // 2, y + 38 * S // 2), t, font=title, fill=fg, anchor="lm")
    d.multiline_text((x + 24 * S // 2, y + 80 * S // 2), s, font=sub, fill=(220, 230, 240) if core else (60, 70, 80), spacing=6 * S // 2)

img = img.resize((W * 2 // S, H * 2 // S), Image.LANCZOS)
img.save(OUT)
print("saved", OUT, img.size)
