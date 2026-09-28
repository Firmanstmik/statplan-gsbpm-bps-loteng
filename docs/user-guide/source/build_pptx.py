# -*- coding: utf-8 -*-
"""StatPlan-Presentasi-Penggunaan.pptx — 18 slides, internal slide-jump navigation, real screenshots.
   python build_pptx.py <content.json> <img_dir> <out.pptx>"""
import json, os, sys
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE, MSO_CONNECTOR
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.oxml.ns import qn
from PIL import Image

CONTENT, IMG, OUT = sys.argv[1:4]
D = json.load(open(CONTENT, encoding="utf8"))
NAVY = RGBColor(0x15, 0x32, 0x4B); LIGHT = RGBColor(0xEA, 0xF1, 0xF8); BG = RGBColor(0xF7, 0xF6, 0xF2)
INK = RGBColor(0x1F, 0x29, 0x33); GRAY = RGBColor(0x5F, 0x69, 0x75); LINE = RGBColor(0xC9, 0xD1, 0xDA)
ACC = RGBColor(0xA4, 0x57, 0x0B); WHITE = RGBColor(255, 255, 255); ACCBG = RGBColor(0xFF, 0xF6, 0xEC)
TITLE_FONT, BODY_FONT = "Cambria", "Calibri"

prs = Presentation()
prs.slide_width, prs.slide_height = Inches(13.333), Inches(7.5)
BLANK = prs.slide_layouts[6]
N = 18
slides = [prs.slides.add_slide(BLANK) for _ in range(N)]

def bg(s, color=BG):
    f = s.background.fill; f.solid(); f.fore_color.rgb = color

def text(s, x, y, w, h, t, size=18, color=INK, bold=False, font=BODY_FONT, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, italic=False):
    tb = s.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = tb.text_frame; tf.word_wrap = True; tf.vertical_anchor = anchor
    tf.margin_left = tf.margin_right = Inches(0.02); tf.margin_top = tf.margin_bottom = Inches(0.02)
    lines = t if isinstance(t, list) else [t]
    for i, ln in enumerate(lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        run = p.add_run(); run.text = ln
        run.font.size = Pt(size); run.font.color.rgb = color; run.font.bold = bold; run.font.name = font; run.font.italic = italic
        p.space_after = Pt(size * 0.35)
    return tb

def bullets(s, x, y, w, h, items, size=17, color=INK):
    tb = s.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = tb.text_frame; tf.word_wrap = True
    for i, it in enumerate(items):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.space_after = Pt(9)
        head, _, rest = it.partition("|")
        r0 = p.add_run(); r0.text = "•  "; r0.font.size = Pt(size); r0.font.color.rgb = NAVY; r0.font.name = BODY_FONT; r0.font.bold = True
        r = p.add_run(); r.text = head; r.font.size = Pt(size); r.font.name = BODY_FONT; r.font.color.rgb = color; r.font.bold = bool(rest)
        if rest:
            r2 = p.add_run(); r2.text = rest if rest[:1] in ":;,." else " " + rest; r2.font.size = Pt(size); r2.font.name = BODY_FONT; r2.font.color.rgb = color
    return tb

def box(s, x, y, w, h, fill=LIGHT, line=NAVY, radius=True, lw=1.25):
    sh = s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE if radius else MSO_SHAPE.RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(h))
    sh.fill.solid(); sh.fill.fore_color.rgb = fill
    if line is None: sh.line.fill.background()
    else: sh.line.color.rgb = line; sh.line.width = Pt(lw)
    if radius: sh.adjustments[0] = 0.12
    sh.shadow.inherit = False
    return sh

def box_text(sh, lines, size=16, color=INK, bold_first=True, align=PP_ALIGN.CENTER):
    tf = sh.text_frame; tf.word_wrap = True; tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    for m in ("margin_left", "margin_right"): setattr(tf, m, Inches(0.08))
    for i, ln in enumerate(lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        r = p.add_run(); r.text = ln; r.font.name = BODY_FONT
        r.font.size = Pt(size if i == 0 else size - 3); r.font.color.rgb = color; r.font.bold = bold_first and i == 0

def arrow(s, x1, y1, x2, y2, color=GRAY):
    c = s.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, Inches(x1), Inches(y1), Inches(x2), Inches(y2))
    c.line.color.rgb = color; c.line.width = Pt(2)
    ln = c.line._get_or_add_ln()
    tail = ln.makeelement(qn("a:tailEnd"), {"type": "triangle", "w": "med", "len": "med"}); ln.append(tail)
    return c

def link(shape, target_index):
    shape.click_action.target_slide = slides[target_index]

def header(s, eyebrow, title):
    text(s, 0.7, 0.45, 11.5, 0.35, eyebrow.upper(), size=12, color=ACC, bold=True)
    text(s, 0.7, 0.78, 11.9, 0.8, title, size=32, color=NAVY, bold=True, font=TITLE_FONT)

def nav(s, i):
    """Bottom navigation: slide number + Kembali / Alur / Lanjut buttons (internal slide jumps)."""
    line = s.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, Inches(0.7), Inches(6.83), Inches(12.63), Inches(6.83)); line.line.color.rgb = LINE; line.line.width = Pt(0.75)
    text(s, 0.7, 6.93, 4, 0.35, f"StatPlan · Panduan Penggunaan   {i + 1} / {N}", size=11, color=GRAY)
    specs = [("‹ Kembali", i - 1), ("Alur", 4), ("Lanjut ›", i + 1)]
    x = 9.35
    for label, tgt in specs:
        if 0 <= tgt < N and tgt != i:
            b = box(s, x, 6.93, 1.02, 0.36, fill=WHITE, line=LINE, lw=1)
            box_text(b, [label], size=11, color=NAVY)
            link(b, tgt)
        x += 1.1

def picture(s, name, x, y, w=None, h=None, crop_top=0.0, crop_bottom=0.0):
    path = os.path.join(IMG, name)
    pic = s.shapes.add_picture(path, Inches(x), Inches(y), Inches(w) if w else None, Inches(h) if h else None)
    pic.crop_top, pic.crop_bottom = crop_top, crop_bottom
    if h and w is None:
        pass
    pic.line.color.rgb = LINE; pic.line.width = Pt(1)
    return pic

def fit_picture(s, name, x, y, max_w, max_h, crop_top=0.0, crop_bottom=0.0):
    im = Image.open(os.path.join(IMG, name)); ar = im.width / (im.height * (1 - crop_top - crop_bottom))
    w = max_w; h = w / ar
    if h > max_h: h = max_h; w = h * ar
    pic = s.shapes.add_picture(os.path.join(IMG, name), Inches(x + (max_w - w) / 2), Inches(y), Inches(w), Inches(h))
    pic.crop_top, pic.crop_bottom = crop_top, crop_bottom
    pic.line.color.rgb = LINE; pic.line.width = Pt(1)
    text(s, x, y + h + 0.05, max_w, 0.3, "Tangkapan layar aplikasi StatPlan (data demo)", size=10, color=GRAY, italic=True, align=PP_ALIGN.CENTER)
    return pic

def note(s, x, y, w, h, title, body, warn=False):
    b = box(s, x, y, w, h, fill=ACCBG if warn else LIGHT, line=None)
    bar = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(x), Inches(y), Inches(0.08), Inches(h)); bar.fill.solid(); bar.fill.fore_color.rgb = ACC if warn else NAVY; bar.line.fill.background()
    text(s, x + 0.25, y + 0.1, w - 0.4, 0.35, title, size=14, color=ACC if warn else NAVY, bold=True)
    text(s, x + 0.25, y + 0.45, w - 0.4, h - 0.5, body, size=13, color=INK)

def content_slide(i, eyebrow, title, items, img=None, crop_top=0.0, crop_bottom=0.0, text_w=5.3, size=17):
    s = slides[i]; bg(s); header(s, eyebrow, title)
    bullets(s, 0.7, 1.75, text_w, 4.6, items, size=size)
    if img: fit_picture(s, img, 0.7 + text_w + 0.35, 1.75, 12.63 - (0.7 + text_w + 0.35), 4.65, crop_top, crop_bottom)
    nav(s, i)
    return s

phases = D["phases"]

# ---------- 1. Title ----------
s = slides[0]; bg(s, NAVY)
text(s, 0.9, 1.5, 11, 0.4, "BERBASIS GSBPM 5.2 · MATERI PROSES BISNIS", size=14, color=RGBColor(0xF7, 0xB7, 0x6E), bold=True)
text(s, 0.9, 2.0, 11, 1.2, "STATPLAN", size=66, color=WHITE, bold=True, font=TITLE_FONT)
text(s, 0.9, 3.25, 11.2, 1.0, "Panduan Penggunaan Simulator Perencanaan Kegiatan Statistik", size=28, color=WHITE, font=TITLE_FONT)
text(s, 0.9, 4.2, 11, 0.5, "Alat bantu belajar dan perencanaan — hasilnya berupa draft, bukan dokumen resmi BPS.", size=16, color=RGBColor(0xC8, 0xD4, 0xE0))
b = box(s, 0.9, 5.2, 2.0, 0.6, fill=WHITE, line=None); box_text(b, ["Mulai  ›"], size=16, color=NAVY); link(b, 1)
b = box(s, 3.1, 5.2, 2.3, 0.6, fill=NAVY, line=WHITE); box_text(b, ["Lihat alur"], size=16, color=WHITE); link(b, 4)
text(s, 0.9, 6.7, 11, 0.4, "StatPlan versi 1.0.0 · 2026 · PKL BPS Kabupaten Lombok Tengah", size=12, color=RGBColor(0xC8, 0xD4, 0xE0))

# ---------- 2. Problem ----------
s = slides[1]; bg(s); header(s, "Latar belakang", "Masalah yang ingin dibantu")
q = box(s, 0.7, 1.8, 11.9, 1.3, fill=WHITE, line=LINE)
box_text(q, ["“Saya ingin membuat kegiatan statistik, tetapi tidak tahu harus mulai dari mana.”"], size=24, color=NAVY)
qs = [("Apa yang harus disiapkan?", "Kebutuhan, tujuan, data yang sudah ada"), ("Dokumen apa?", "KAK, daftar kebutuhan data, instrumen, metadata"),
      ("Prosesnya bagaimana?", "Tahapan dari kebutuhan sampai evaluasi"), ("Contohnya seperti apa?", "Bentuk kegiatan yang sudah tersusun")]
for k, (a, b2) in enumerate(qs):
    bx = box(s, 0.7 + k * 3.02, 3.5, 2.85, 2.2, fill=LIGHT, line=None)
    box_text(bx, [a, b2], size=18, color=NAVY)
text(s, 0.7, 6.0, 11.9, 0.5, "StatPlan menjawab pertanyaan-pertanyaan ini langkah demi langkah.", size=16, color=GRAY, italic=True)
nav(s, 1)

# ---------- 3. What is StatPlan ----------
s = slides[2]; bg(s); header(s, "Pengenalan", "Apa itu StatPlan?")
text(s, 0.7, 1.7, 11.9, 0.9, "Alat bantu pembelajaran dan perencanaan kegiatan statistik yang membantu pengguna memahami dan menyusun rencana kegiatan statistik berdasarkan GSBPM 5.2.", size=18, color=INK)
colA = box(s, 0.7, 2.75, 5.85, 3.8, fill=WHITE, line=LINE); colB = box(s, 6.78, 2.75, 5.85, 3.8, fill=WHITE, line=LINE)
text(s, 1.0, 2.9, 5.3, 0.4, "StatPlan membantu…", size=18, color=NAVY, bold=True)
bullets(s, 1.0, 3.4, 5.4, 3.1, ["memahami apa yang perlu disiapkan", "melihat contoh kegiatan", "mengikuti 44 subproses GSBPM 5.2", "menyusun variabel, instrumen, metadata", "menghasilkan draft rencana (.docx)"], size=16)
text(s, 7.08, 2.9, 5.3, 0.4, "StatPlan bukan…", size=18, color=ACC, bold=True)
bullets(s, 7.08, 3.4, 5.4, 3.1, ["sistem resmi atau sistem persetujuan BPS", "pengganti ahli metodologi", "sistem pengumpulan data responden", "pengambil keputusan berbasis AI", "platform kolaborasi cloud"], size=16)
nav(s, 2)

# ---------- 4. StatPlan ↔ GSBPM ----------
s = slides[3]; bg(s); header(s, "Kerangka", "Hubungan StatPlan dan GSBPM 5.2")
stack = [("Antarmuka StatPlan", "alur bertahap untuk belajar & merencanakan"), ("GSBPM 5.2", "kerangka standar internasional (Hal. 5)"),
         ("8 fase", "Specify Need → Evaluate"), ("44 subproses", "6 · 6 · 7 · 4 · 8 · 5 · 5 · 3"), ("Materi Proses Bisnis", "sumber nama, kode, dan penjelasan")]
for k, (a, b2) in enumerate(stack):
    y = 1.75 + k * 0.98
    bx = box(s, 0.7, y, 5.6, 0.78, fill=NAVY if k == 0 else LIGHT, line=None)
    box_text(bx, [a, b2], size=17, color=WHITE if k == 0 else NAVY)
    if k < len(stack) - 1: arrow(s, 3.5, y + 0.8, 3.5, y + 0.96)
tbl_rows = [(str(p["n"]), p["official"].split(" (")[0], p["title"], str(len(p["cards"]))) for p in phases]
gt = s.shapes.add_table(len(tbl_rows) + 1, 4, Inches(6.8), Inches(1.75), Inches(5.83), Inches(3.9)).table
for c, h in enumerate(["No", "Fase", "Nama di StatPlan", "Sub"]):
    cell = gt.cell(0, c); cell.text = h
for r, row in enumerate(tbl_rows, start=1):
    for c, v in enumerate(row): gt.cell(r, c).text = v
for c, w in enumerate([0.55, 1.6, 3.0, 0.68]): gt.columns[c].width = Inches(w)
for r in range(len(tbl_rows) + 1):
    for c in range(4):
        cell = gt.cell(r, c); cell.fill.solid(); cell.fill.fore_color.rgb = NAVY if r == 0 else (WHITE if r % 2 else LIGHT)
        for p in cell.text_frame.paragraphs:
            for run in p.runs:
                run.font.size = Pt(13); run.font.name = BODY_FONT; run.font.color.rgb = WHITE if r == 0 else INK; run.font.bold = r == 0
text(s, 6.8, 5.75, 5.8, 0.9, "StatPlan menggunakan alur bertahap untuk membantu belajar. GSBPM sendiri bersifat fleksibel dan tahapan dapat saling terkait (Hal. 5, 8).", size=13, color=GRAY, italic=True)
nav(s, 3)

# ---------- 5. Flow (clickable agenda) ----------
s = slides[4]; bg(s); header(s, "Alur penggunaan · klik langkah untuk membuka slide", "Alur Penggunaan StatPlan")
flow = [("Mulai", "Beranda", 0), ("Contoh", "studi kasus", 5), ("Rencana", "ceritakan kebutuhan", 6), ("Identifikasi", "kebutuhan & hasil", 7), ("Timeline", "rencana waktu", 8),
        ("Mode Terpandu", "8 fase · 44 subproses", 9), ("Validasi", "apa yang kurang", 13), ("Workspace", "9 tab", 12), ("Draft Output", "unduh .docx", 14)]
bw, bh, gap = 2.12, 1.15, 0.3
pos = []
for k in range(len(flow)):
    if k < 5:
        x, y = 0.7 + k * (bw + gap), 2.0
    else:
        col = 3 - (k - 5)  # second row runs right-to-left (snake)
        x, y = 0.7 + (col + 0.5) * (bw + gap), 4.1
    pos.append((x, y))
for k, ((a, b2, tgt), (x, y)) in enumerate(zip(flow, pos)):
    core = a == "Mode Terpandu"
    bx = box(s, x, y, bw, bh, fill=NAVY if core else WHITE, line=NAVY)
    box_text(bx, [f"{k + 1}. {a}", b2], size=17, color=WHITE if core else NAVY)
    link(bx, tgt)
for k in range(len(flow) - 1):
    (x1, y1), (x2, y2) = pos[k], pos[k + 1]
    if y1 == y2 and x2 > x1: arrow(s, x1 + bw + 0.02, y1 + bh / 2, x2 - 0.02, y2 + bh / 2)
    elif y1 == y2: arrow(s, x1 - 0.02, y1 + bh / 2, x2 + bw + 0.02, y2 + bh / 2)
    else: arrow(s, x1 + bw / 2, y1 + bh + 0.02, x2 + bw / 2, y2 - 0.02)
text(s, 0.7, 5.55, 11.9, 0.9, "Validasi terlihat di Ruang kerja (kartu Langkah berikutnya dan tab Ekspor). Setiap tahap punya satu tindakan utama — pengguna tidak perlu memilih di antara banyak tujuan sekaligus.", size=14, color=GRAY, italic=True)
nav(s, 4)

# ---------- 6..15 step slides ----------
content_slide(5, "Langkah 1", "Lihat Contoh", [
    "Belum tahu harus mulai dari mana?| Lihat contoh dulu.",
    "Studi kasus|: sekilas kegiatan, alasan, peta 8 fase, materi dari PDF.",
    "Tiga contoh|: survei, pendataan lengkap, kompilasi data administratif.",
    "Aman|: “Mulai dari contoh ini” selalu membuat proyek baru; contoh aslinya tidak berubah.",
    "Label jujur|: “Contoh ilustratif StatPlan” — bukan data nyata, bukan contoh resmi BPS.",
], img="02-contoh.png")
content_slide(6, "Langkah 2", "Buat Rencana", [
    "Pertanyaan pertama|: “Apa kegiatan yang ingin Anda rencanakan?”",
    "Cukup satu atau dua kalimat sehari-hari| — atau pilih contoh kalimat.",
    "StatPlan menyusun| nama kegiatan (draf), ringkasan kebutuhan, dan saran cara memperoleh data.",
    "Saran berasal dari aturan sederhana| — bukan AI dan bukan keputusan BPS; bisa diubah.",
], img="03-intake.png")
content_slide(7, "Langkah 3", "Identifikasi Kebutuhan", [
    "Penjelasan| (Apa?) dengan rujukan halaman materi.",
    "Contoh| penerapan — berlabel contoh ilustratif.",
    "Format kerja| untuk menyusun bahan secara rapi.",
    "FAQ kontekstual|: “Bingung mulai dari mana?” terbuka di tempat.",
    "Dasar|: Specify Need, 6 subproses (Materi Hal. 10–16).",
], img="08-subproses.png", crop_bottom=0.1)
s = content_slide(8, "Langkah 4", "Susun Timeline", [
    "Pertanyaan|: “Kapan kegiatan ini dilakukan?”",
    "Pilih periode| 1, 2, 3, atau 6 bulan — atau isi tanggal sendiri.",
    "Otomatis dibagi| ke 8 fase GSBPM; tanggal tiap fase dapat diubah.",
], img="05-timeline.png", size=16)
note(slides[8], 0.7, 4.55, 5.3, 1.6, "Penting", "Jadwal adalah alat bantu perencanaan/ilustrasi — bukan durasi wajib BPS. Fase GSBPM bisa tumpang tindih atau diulang.", warn=True)
content_slide(9, "Langkah 5", "Mode Terpandu", [
    "8 fase, 44 subproses resmi| GSBPM 5.2 — nama & kode sesuai materi.",
    "Progressive disclosure|: satu fase dibuka pada satu waktu.",
    "Tiap fase|: jumlah subproses, yang sudah dipahami, rencana waktu, catatan sumber.",
    "Urutan belajar StatPlan| — bukan urutan wajib GSBPM.",
], img="07-guided-fase.png")

# ---------- 11. One subprocess ----------
s = slides[10]; bg(s); header(s, "Cara belajar", "Bagaimana Mengerjakan Satu Subproses?")
steps = [("Pahami", "Apa? + sumber"), ("Contoh", "contoh ilustratif"), ("Format kerja", "isi bahan"), ("Kerjakan", "bukti dukung"), ("Validasi", "cek di Ekspor")]
for k, (a, b2) in enumerate(steps):
    y = 1.8 + k * 0.93
    bx = box(s, 0.7, y, 4.2, 0.72, fill=LIGHT if k < 4 else WHITE, line=NAVY)
    box_text(bx, [a, b2], size=17, color=NAVY)
    if k < len(steps) - 1: arrow(s, 2.8, y + 0.74, 2.8, y + 0.91)
fit_picture(s, "09-format-kerja.png", 5.3, 1.8, 7.33, 4.2)
text(s, 5.3, 6.35, 7.33, 0.4, "“Sudah dipahami” adalah status belajar — bukan bukti kegiatan statistik selesai.", size=13, color=NAVY, bold=True)
nav(s, 10)

content_slide(11, "Bantuan", "FAQ — Pertanyaan Umum", [
    f"{len(D['faq'])} pertanyaan, {len(D['faqCats'])} kategori| — bahasa sederhana.",
    "Pencarian|: ketik “variabel”, “sampel”, “metadata”.",
    "Kategori| dan accordion — buka satu jawaban saat dibutuhkan.",
    "Label sumber|: Materi Proses Bisnis · Hal. N, Penjelasan sederhana, atau Penjelasan StatPlan.",
    "FAQ kontekstual| di Rencana baru, Mode Terpandu, dan Ruang kerja.",
], img="10-faq.png")
content_slide(12, "Ruang kerja", "Workspace", [
    "9 tab|: Timeline · Alur kerja · Checklist · Perancangan · Variabel · Instrumen · Metadata · Riwayat · Ekspor",
    "Dibuka dari Timeline| — kapan → bagaimana alurnya → apa yang disiapkan → detail.",
    "Kartu “Langkah berikutnya”| menunjukkan hal paling penting.",
    "“Kembali ke Mode Terpandu”| selalu tersedia.",
], img="13-workspace-timeline.png", size=16)
content_slide(13, "Pemeriksaan", "Validasi", [
    "Apa yang masih kurang?| Perlu dilengkapi (menghalangi ekspor) atau Perlu ditinjau (saran).",
    "Mengapa?| Setiap temuan menjelaskan alasannya.",
    "Bagaimana memperbaikinya?| Tombol langsung ke bagian yang tepat.",
    "Bukan validasi resmi BPS| — pemeriksaan kelengkapan draft oleh aturan StatPlan.",
], img="15-validasi.png", size=16)
s = content_slide(14, "Hasil", "Draft Output", [
    "Unduh draf perencanaan| (.docx) setelah semua “Perlu dilengkapi” selesai.",
    "Isi|: identitas, portal rujukan, perancangan, variabel & indikator, instrumen, draf rekomendasi, timeline, checklist, metadata.",
    "Disusun di perangkat| — tanpa unggahan ke server.",
], img="14-ekspor-demo.png", size=16)
note(slides[14], 0.7, 4.75, 5.3, 1.35, "Status dokumen", "Draft perencanaan — bukan dokumen resmi BPS.", warn=True)

# ---------- 16. Scenario ----------
s = slides[15]; bg(s); header(s, "Contoh skenario · proyek demo (ilustratif)", "Contoh Skenario Penggunaan")
sc = [("Tujuan", "mengetahui kepuasan pelayanan perizinan"), ("Contoh", "Survei kepuasan pelayanan"), ("Rencana", "Mulai dari contoh ini → saran: Survei"),
      ("Timeline", "periode 3 bulan, 8 fase"), ("Mode Terpandu", "1.5 portal rujukan; 2.2 variabel; 2.4 sampel"), ("Validasi", "lengkapi MS-Keg, portal, checklist ≥ 80%"),
      ("Workspace", "15 variabel · 2 indikator · 15 pertanyaan"), ("Draft", "unduh .docx → tinjau bersama tim")]
for k, (a, b2) in enumerate(sc):
    row, col = divmod(k, 4)
    x, y = 0.7 + col * 3.02, 1.85 + row * 2.1
    bx = box(s, x, y, 2.85, 1.75, fill=NAVY if a == "Mode Terpandu" else WHITE, line=NAVY)
    box_text(bx, [f"{k + 1}. {a}", b2], size=17, color=WHITE if a == "Mode Terpandu" else NAVY)
    if col < 3: arrow(s, x + 2.87, y + 0.87, x + 3.0, y + 0.87)
text(s, 0.7, 6.1, 11.9, 0.5, f"Proyek demo: {D['skm']['name']} — Contoh ilustratif StatPlan, bukan kegiatan resmi.", size=13, color=GRAY, italic=True)
nav(s, 15)

# ---------- 17. Benefits ----------
s = slides[16]; bg(s); header(s, "Ringkasan", "Apa Manfaat StatPlan?")
ben = [("Membantu pemula", "tanpa harus menguasai GSBPM dulu"), ("Memberi contoh", "bentuk akhir kegiatan terlihat"), ("Memberi panduan", "penjelasan, format kerja, bukti dukung"),
       ("Menghubungkan ke GSBPM", "8 fase · 44 subproses"), ("Membantu dokumentasi", "variabel, instrumen, metadata"), ("Menghasilkan draft", "dokumen Word untuk ditinjau")]
for k, (a, b2) in enumerate(ben):
    row, col = divmod(k, 3)
    bx = box(s, 0.7 + col * 4.02, 1.9 + row * 2.2, 3.8, 1.85, fill=LIGHT, line=None)
    box_text(bx, [a, b2], size=20, color=NAVY)
nav(s, 16)

# ---------- 18. Closing ----------
s = slides[17]; bg(s, NAVY)
lines = ["Mulai dari kebutuhan.", "Pahami contohnya.", "Susun rencananya.", "Gunakan panduan GSBPM.", "Hasilkan draft."]
for k, ln in enumerate(lines):
    text(s, 0.9, 1.2 + k * 0.72, 11, 0.7, ln, size=30, color=WHITE if k < 4 else RGBColor(0xF7, 0xB7, 0x6E), font=TITLE_FONT, bold=k == 4)
text(s, 0.9, 5.2, 6.8, 0.9, "Terima kasih", size=40, color=WHITE, bold=True, font=TITLE_FONT)
text(s, 0.9, 6.2, 11, 0.4, "StatPlan membantu Anda memahami apa yang perlu dilakukan — hasilnya draft untuk ditinjau.", size=15, color=RGBColor(0xC8, 0xD4, 0xE0))
b = box(s, 10.4, 5.4, 2.2, 0.55, fill=WHITE, line=None); box_text(b, ["‹ Ke awal"], size=14, color=NAVY); link(b, 0)
b = box(s, 8.0, 5.4, 2.2, 0.55, fill=NAVY, line=WHITE); box_text(b, ["Lihat alur"], size=14, color=WHITE); link(b, 4)

prs.save(OUT)
print("saved", OUT, len(prs.slides), "slides")
