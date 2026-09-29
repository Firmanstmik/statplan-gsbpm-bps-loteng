# -*- coding: utf-8 -*-
"""Builds StatPlan-Panduan-Penggunaan-Aplikasi.docx.

Inputs are generated from the real app, never typed by hand:
  content.json  — npx vite-node docs/user-guide/source/panduan/export-panduan.ts <work>/content.json
  img/          — node docs/user-guide/source/panduan/capture-panduan.mjs <work>/img   (screens + shots.json)
  draft pages   — img/draft-skm.docx converted by Word (docx2pdf.ps1) → img/draft-skm.pdf

python build_panduan.py <work_dir> <out.docx>
"""
import json, os, sys
import fitz
from PIL import Image, ImageDraw, ImageFont
from docx import Document
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Pt, Cm, RGBColor

WORK, OUT = sys.argv[1:3]
IMG = os.path.join(WORK, "img")
ANN = os.path.join(WORK, "annotated")
os.makedirs(ANN, exist_ok=True)
D = json.load(open(os.path.join(WORK, "content.json"), encoding="utf8"))
SHOTS = {s["name"]: s for s in json.load(open(os.path.join(IMG, "shots.json"), encoding="utf8"))["shots"]}
PHASES = D["phases"]
assert len(PHASES) == 8 and sum(len(p["cards"]) for p in PHASES) == 44

APP_VERSION = "1.0.0"
GUIDE_VERSION = "1.0"
GUIDE_DATE = "29 September 2026"
APP_URL = "https://statplan-gsbpm-bps-loteng.vercel.app"

NAVY = RGBColor(0x15, 0x32, 0x4B)
INK = RGBColor(0x1F, 0x29, 0x33)
GRAY = RGBColor(0x5F, 0x69, 0x75)
ACCENT = RGBColor(0xA4, 0x57, 0x0B)
NAVY_HEX, LIGHT, BAND, WARN_FILL, TIP_FILL = "15324B", "EAF1F8", "F4F6F8", "FFF6EC", "EEF6EF"
ORANGE = (235, 137, 27)

doc = Document()
sec = doc.sections[0]
sec.page_height, sec.page_width = Cm(29.7), Cm(21.0)
sec.top_margin, sec.bottom_margin = Cm(2.4), Cm(2.2)
sec.left_margin, sec.right_margin = Cm(2.4), Cm(2.2)
sec.header_distance, sec.footer_distance = Cm(1.1), Cm(1.0)
sec.different_first_page_header_footer = True
TEXT_W = 21.0 - 2.4 - 2.2  # 16.4 cm

# ---------------- styles ----------------
st = doc.styles
normal = st["Normal"]
normal.font.name = "Calibri"
normal.element.rPr.rFonts.set(qn("w:eastAsia"), "Calibri")
normal.font.size = Pt(10.5)
normal.font.color.rgb = INK
normal.paragraph_format.space_after = Pt(5)
normal.paragraph_format.line_spacing = 1.15


def style_heading(name, size, before, after, color=NAVY, font="Cambria"):
    s = st[name]
    s.font.name = font
    rf = s.element.rPr.rFonts
    rf.set(qn("w:eastAsia"), font)
    for a in ("w:asciiTheme", "w:hAnsiTheme", "w:eastAsiaTheme", "w:cstheme"):
        if rf.get(qn(a)) is not None:
            del rf.attrib[qn(a)]
    s.font.size = Pt(size)
    s.font.bold = True
    s.font.italic = False
    s.font.color.rgb = color
    pf = s.paragraph_format
    pf.space_before, pf.space_after = Pt(before), Pt(after)
    pf.keep_with_next = True
    pf.keep_together = True


style_heading("Heading 1", 20, 0, 12)
style_heading("Heading 2", 13.5, 14, 5)
style_heading("Heading 3", 11.5, 12, 3, color=NAVY, font="Calibri")
for lvl in ("List Bullet", "List Number"):
    st[lvl].font.name = "Calibri"
    st[lvl].font.size = Pt(10.5)
    st[lvl].paragraph_format.space_after = Pt(2)


# ---------------- low-level helpers ----------------
def shade(cell, fill):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear"); shd.set(qn("w:color"), "auto"); shd.set(qn("w:fill"), fill)
    tcPr.append(shd)


def cell_borders(cell, **kw):
    tcPr = cell._tc.get_or_add_tcPr()
    b = OxmlElement("w:tcBorders")
    for edge in ("top", "left", "bottom", "right"):
        spec = kw.get(edge)
        el = OxmlElement(f"w:{edge}")
        if spec:
            el.set(qn("w:val"), "single"); el.set(qn("w:sz"), str(spec[0])); el.set(qn("w:color"), spec[1])
        else:
            el.set(qn("w:val"), "nil")
        b.append(el)
    tcPr.append(b)


def cell_margins(cell, top=70, bottom=70, left=120, right=120):
    tcPr = cell._tc.get_or_add_tcPr()
    m = OxmlElement("w:tcMar")
    for k, v in (("top", top), ("bottom", bottom), ("start", left), ("end", right)):
        e = OxmlElement(f"w:{k}"); e.set(qn("w:w"), str(v)); e.set(qn("w:type"), "dxa"); m.append(e)
    tcPr.append(m)


def table_borders(t, color="C9D1DA"):
    tblPr = t._tbl.tblPr
    borders = OxmlElement("w:tblBorders")
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        e = OxmlElement(f"w:{edge}"); e.set(qn("w:val"), "single"); e.set(qn("w:sz"), "4"); e.set(qn("w:color"), color); borders.append(e)
    tblPr.append(borders)


def no_split(row):
    trPr = row._tr.get_or_add_trPr()
    c = OxmlElement("w:cantSplit"); c.set(qn("w:val"), "true"); trPr.append(c)


def repeat_header(row):
    trPr = row._tr.get_or_add_trPr()
    th = OxmlElement("w:tblHeader"); th.set(qn("w:val"), "true"); trPr.append(th)


def fixed_layout(t, widths):
    tblPr = t._tbl.tblPr
    lay = OxmlElement("w:tblLayout"); lay.set(qn("w:type"), "fixed"); tblPr.append(lay)
    for row in t.rows:
        for i, w in enumerate(widths):
            row.cells[i].width = Cm(w)


def add_field(par, instr, size=None, color=None):
    runs = []
    r = par.add_run(); b = OxmlElement("w:fldChar"); b.set(qn("w:fldCharType"), "begin"); r._r.append(b); runs.append(r)
    r2 = par.add_run(); t = OxmlElement("w:instrText"); t.set(qn("xml:space"), "preserve"); t.text = instr; r2._r.append(t); runs.append(r2)
    r3 = par.add_run(); s = OxmlElement("w:fldChar"); s.set(qn("w:fldCharType"), "separate"); r3._r.append(s); runs.append(r3)
    r4 = par.add_run("1"); runs.append(r4)
    r5 = par.add_run(); e = OxmlElement("w:fldChar"); e.set(qn("w:fldCharType"), "end"); r5._r.append(e); runs.append(r5)
    for x in runs:
        if size: x.font.size = Pt(size)
        if color: x.font.color.rgb = color
    return r4


def add_rich(par, text, bold=False, italic=False, size=None, color=None):
    """**bold** segments are supported inside text."""
    for i, seg in enumerate(str(text).split("**")):
        if not seg:
            continue
        r = par.add_run(seg)
        r.bold = bold or (i % 2 == 1)
        r.italic = italic
        if size: r.font.size = Pt(size)
        if color: r.font.color.rgb = color
    return par


def p(text="", bold=False, italic=False, size=None, color=None, align=None, after=None, before=None, keep=False, style=None):
    par = doc.add_paragraph(style=style)
    if text:
        add_rich(par, text, bold=bold, italic=italic, size=size, color=color)
    if align is not None: par.alignment = align
    if after is not None: par.paragraph_format.space_after = Pt(after)
    if before is not None: par.paragraph_format.space_before = Pt(before)
    if keep: par.paragraph_format.keep_with_next = True
    return par


def bullets(items, style="List Bullet", size=None):
    for it in items:
        par = doc.add_paragraph(style=style)
        add_rich(par, it, size=size)


def numbered(items):
    """Explicit numbers (restart per list) — Word's List Number would continue across lists."""
    for i, it in enumerate(items, 1):
        par = doc.add_paragraph()
        par.paragraph_format.left_indent = Cm(0.75)
        par.paragraph_format.first_line_indent = Cm(-0.55)
        par.paragraph_format.space_after = Pt(2)
        r = par.add_run(f"{i}.\u00A0\u00A0"); r.bold = True; r.font.color.rgb = NAVY
        add_rich(par, it)


def label(text):
    """Small bold label paragraph kept with the following block."""
    return p(text, bold=True, size=10.5, color=NAVY, after=1, before=6, keep=True)


def spacer(after=3):
    doc.add_paragraph().paragraph_format.space_after = Pt(after)


def box(title, body, kind="info"):
    """Callout: info (catatan), warn (perhatian), tip (tips)."""
    fill, edge, tcolor, prefix = {
        "info": (LIGHT, NAVY_HEX, NAVY, "CATATAN"),
        "warn": (WARN_FILL, "B45309", ACCENT, "PERHATIAN"),
        "tip": (TIP_FILL, "2F7D4A", RGBColor(0x2F, 0x6B, 0x3F), "TIPS"),
    }[kind]
    t = doc.add_table(rows=1, cols=1)
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    c = t.rows[0].cells[0]
    no_split(t.rows[0])
    shade(c, fill)
    cell_borders(c, left=(24, edge))
    cell_margins(c, 100, 100, 180, 150)
    fixed_layout(t, [TEXT_W])
    c.paragraphs[0].paragraph_format.space_after = Pt(2)
    add_rich(c.paragraphs[0], f"{prefix} · {title}" if title else prefix, bold=True, size=9.5, color=tcolor)
    for line in (body if isinstance(body, list) else [body]):
        q = c.add_paragraph()
        q.paragraph_format.space_after = Pt(2)
        add_rich(q, line, size=10)
    spacer(4)


FIG = [0]
TAB = [0]


def table(headers, rows, caption=None, widths=None, size=9.5, header_fill=NAVY_HEX, band=True):
    if caption:
        TAB[0] += 1
        p(f"Tabel {TAB[0]}. {caption}", bold=True, size=9.5, after=3, keep=True)
    t = doc.add_table(rows=1, cols=len(headers))
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    for i, h in enumerate(headers):
        c = t.rows[0].cells[i]
        shade(c, header_fill)
        cell_margins(c, 55, 55, 100, 100)
        c.paragraphs[0].paragraph_format.space_after = Pt(0)
        r = c.paragraphs[0].add_run(h); r.bold = True; r.font.size = Pt(size); r.font.color.rgb = RGBColor(255, 255, 255)
    repeat_header(t.rows[0]); no_split(t.rows[0])
    for c in t.rows[0].cells:
        c.paragraphs[0].paragraph_format.keep_with_next = True
    for ri, row in enumerate(rows):
        r_ = t.add_row(); no_split(r_)
        for i, val in enumerate(row):
            c = r_.cells[i]
            if band and ri % 2 == 1: shade(c, BAND)
            cell_margins(c, 45, 45, 100, 100)
            lines = str(val).split("\n")
            c.paragraphs[0].paragraph_format.space_after = Pt(0)
            c.paragraphs[0].paragraph_format.line_spacing = 1.08
            add_rich(c.paragraphs[0], lines[0], size=size)
            for ln in lines[1:]:
                q = c.add_paragraph(); q.paragraph_format.space_after = Pt(0); q.paragraph_format.line_spacing = 1.08
                add_rich(q, ln, size=size)
    if widths: fixed_layout(t, widths)
    table_borders(t)
    spacer(4)
    return t


def kv(rows, caption=None, widths=(4.0, 12.4), size=9.5, key_fill=LIGHT):
    if caption:
        TAB[0] += 1
        p(f"Tabel {TAB[0]}. {caption}", bold=True, size=9.5, after=3, keep=True)
    t = doc.add_table(rows=0, cols=2)
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    for k, v in rows:
        r_ = t.add_row(); no_split(r_)
        cells = r_.cells
        shade(cells[0], key_fill)
        for c in cells:
            cell_margins(c, 50, 50, 110, 110)
            c.paragraphs[0].paragraph_format.space_after = Pt(0)
            c.paragraphs[0].paragraph_format.line_spacing = 1.08
        add_rich(cells[0].paragraphs[0], k, bold=True, size=size, color=NAVY)
        lines = str(v).split("\n")
        add_rich(cells[1].paragraphs[0], lines[0], size=size)
        for ln in lines[1:]:
            q = cells[1].add_paragraph(); q.paragraph_format.space_after = Pt(0)
            add_rich(q, ln, size=size)
    fixed_layout(t, list(widths))
    table_borders(t)
    spacer(4)


def step(num, title, tujuan, tindakan, hasil, catatan=None):
    """LANGKAH block: navy title bar + TUJUAN / TINDAKAN / HASIL / CATATAN rows, never split."""
    t = doc.add_table(rows=1, cols=2)
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    head = t.rows[0].cells
    head[0].merge(head[1])
    hc = t.rows[0].cells[0]
    shade(hc, NAVY_HEX)
    cell_margins(hc, 70, 70, 140, 140)
    hp = hc.paragraphs[0]; hp.paragraph_format.space_after = Pt(0)
    r = hp.add_run(f"LANGKAH {num:02d}   "); r.bold = True; r.font.size = Pt(9.5); r.font.color.rgb = RGBColor(0xF5, 0xB0, 0x5E)
    r = hp.add_run(title); r.bold = True; r.font.size = Pt(11); r.font.color.rgb = RGBColor(255, 255, 255)
    no_split(t.rows[0])
    rows = [("TUJUAN", [tujuan]), ("TINDAKAN", tindakan), ("HASIL", [hasil])]
    if catatan:
        rows.append(("CATATAN", [catatan]))
    for k, vals in rows:
        r_ = t.add_row(); no_split(r_)
        kc, vc = r_.cells
        shade(kc, LIGHT)
        for c in (kc, vc):
            cell_margins(c, 50, 50, 120, 120)
            c.paragraphs[0].paragraph_format.space_after = Pt(0)
        add_rich(kc.paragraphs[0], k, bold=True, size=9, color=NAVY)
        if k == "TINDAKAN" and len(vals) > 1:
            for i, v in enumerate(vals, 1):
                q = vc.paragraphs[0] if i == 1 else vc.add_paragraph()
                q.paragraph_format.space_after = Pt(1)
                q.paragraph_format.left_indent = Cm(0.45); q.paragraph_format.first_line_indent = Cm(-0.45)
                rr = q.add_run(f"{i}.\u00A0"); rr.bold = True; rr.font.size = Pt(10); rr.font.color.rgb = NAVY
                add_rich(q, v, size=10)
        else:
            add_rich(vc.paragraphs[0], vals[0], size=10)
    # keep the whole step on one page
    for row in t.rows:
        for c in row.cells:
            for q in c.paragraphs:
                q.paragraph_format.keep_with_next = True
    fixed_layout(t, [2.6, TEXT_W - 2.6])
    table_borders(t, "B9C6D3")
    spacer(5)


def buttons_table(rows, caption):
    """[Tombol] | Fungsi | Cara menggunakan | Hasil."""
    table(["Tombol / tautan", "Fungsi", "Cara menggunakan", "Hasil"], rows, caption, widths=[3.4, 4.3, 4.1, 4.6], size=9)


# ---------------- figures (real screenshots + numbered callouts) ----------------
try:
    FONT_B = ImageFont.truetype("C:/Windows/Fonts/calibrib.ttf", 30)
except OSError:
    FONT_B = ImageFont.load_default()
CIRCLED = "①②③④⑤⑥⑦⑧⑨"


def annotate(name, crop=None):
    meta = SHOTS[name]
    k = meta["dpr"]
    im = Image.open(os.path.join(IMG, f"{name}.png")).convert("RGB")
    d = ImageDraw.Draw(im)
    for m in meta["marks"]:
        x0, y0 = m["x"] * k, m["y"] * k
        x1, y1 = (m["x"] + m["w"]) * k, (m["y"] + m["h"]) * k
        d.rounded_rectangle([x0, y0, x1, y1], radius=10, outline=ORANGE, width=5)
        rad = 21
        cx = max(rad + 2, x0 - 6)
        cy = max(rad + 2, y0 - 6)
        if cx + rad > im.width: cx = im.width - rad - 2
        d.ellipse([cx - rad, cy - rad, cx + rad, cy + rad], fill=ORANGE, outline=(255, 255, 255), width=3)
        txt = str(m["n"])
        tw = d.textlength(txt, font=FONT_B)
        d.text((cx - tw / 2, cy - 17), txt, font=FONT_B, fill=(255, 255, 255))
    if crop:
        l, t_, r, b = crop
        im = im.crop((int(l * im.width), int(t_ * im.height), int(r * im.width), int(b * im.height)))
    out = os.path.join(ANN, f"{name}.png")
    im.save(out)
    return out, len(meta["marks"])


SCREENS_USED = []


def figure(name, caption, legend=None, width=15.6, crop=None, note="Tangkapan layar aplikasi StatPlan versi 1.0.0."):
    path, nmarks = annotate(name, crop)
    SCREENS_USED.append(name)
    if legend:
        assert len(legend) == nmarks, f"{name}: {nmarks} callouts but {len(legend)} legend items"
    FIG[0] += 1
    par = doc.add_paragraph()
    par.alignment = WD_ALIGN_PARAGRAPH.CENTER
    par.paragraph_format.keep_with_next = True
    par.paragraph_format.space_before = Pt(4)
    par.paragraph_format.space_after = Pt(2)
    par.add_run().add_picture(path, width=Cm(width))
    cap = p(f"Gambar {FIG[0]}. {caption}", bold=True, size=9.5, align=WD_ALIGN_PARAGRAPH.CENTER, after=1, keep=bool(legend))
    if legend:
        lg = p("  ".join(f"{CIRCLED[i]} {t}" for i, t in enumerate(legend)), size=9, color=INK, align=WD_ALIGN_PARAGRAPH.CENTER, after=1, keep=True)
    p(note, italic=True, size=8.5, color=GRAY, align=WD_ALIGN_PARAGRAPH.CENTER, after=8)


def diagram(nodes, out_name, caption, note, cols=1, width=9.5):
    """Vertical (or snake) flow of labelled boxes drawn with PIL."""
    S = 2
    bw, bh, gap = 620 * S, 96 * S, 44 * S
    W = bw + 120 * S
    H = len(nodes) * (bh + gap) + 40 * S
    im = Image.new("RGB", (W, H), "white")
    d = ImageDraw.Draw(im)
    ft = ImageFont.truetype("C:/Windows/Fonts/calibrib.ttf", 30 * S)
    fs = ImageFont.truetype("C:/Windows/Fonts/calibri.ttf", 22 * S)
    fn = ImageFont.truetype("C:/Windows/Fonts/calibrib.ttf", 22 * S)
    x0 = 90 * S
    for i, (title, sub) in enumerate(nodes):
        y = 20 * S + i * (bh + gap)
        last = i == len(nodes) - 1
        fill = (21, 50, 75) if last else (234, 241, 248)
        tc = (255, 255, 255) if last else (21, 50, 75)
        d.rounded_rectangle([x0, y, x0 + bw, y + bh], radius=16 * S, fill=fill, outline=(21, 50, 75), width=2 * S)
        cx, cy = x0 - 42 * S, y + bh // 2
        d.ellipse([cx - 22 * S, cy - 22 * S, cx + 22 * S, cy + 22 * S], fill=ORANGE)
        n = str(i + 1); tw = d.textlength(n, font=fn)
        d.text((cx - tw / 2, cy - 13 * S), n, font=fn, fill="white")
        d.text((x0 + 26 * S, y + 14 * S), title, font=ft, fill=tc)
        d.text((x0 + 26 * S, y + 54 * S), sub, font=fs, fill=(220, 230, 240) if last else (95, 105, 117))
        if not last:
            ax = x0 + bw // 2
            d.line([ax, y + bh + 4 * S, ax, y + bh + gap - 8 * S], fill=(21, 50, 75), width=3 * S)
            d.polygon([(ax - 10 * S, y + bh + gap - 18 * S), (ax + 10 * S, y + bh + gap - 18 * S), (ax, y + bh + gap - 4 * S)], fill=(21, 50, 75))
    path = os.path.join(ANN, out_name)
    im.save(path)
    FIG[0] += 1
    par = doc.add_paragraph(); par.alignment = WD_ALIGN_PARAGRAPH.CENTER; par.paragraph_format.keep_with_next = True
    par.add_run().add_picture(path, width=Cm(width))
    p(f"Gambar {FIG[0]}. {caption}", bold=True, size=9.5, align=WD_ALIGN_PARAGRAPH.CENTER, after=1)
    p(note, italic=True, size=8.5, color=GRAY, align=WD_ALIGN_PARAGRAPH.CENTER, after=8)


def draft_pages_figure(caption):
    pdf = os.path.join(IMG, "draft-skm.pdf")
    dd = fitz.open(pdf)
    pages = []
    for i in range(3):
        pm = dd[i].get_pixmap(dpi=100)
        pages.append(Image.frombytes("RGB", (pm.width, pm.height), pm.samples))
    w, h = pages[0].size
    sheet = Image.new("RGB", (3 * w + 4 * 24, h + 48), (228, 232, 238))
    for i, im in enumerate(pages):
        sheet.paste(im, (24 + i * (w + 24), 24))
    path = os.path.join(ANN, "draft-pages.png")
    sheet.save(path)
    FIG[0] += 1
    par = doc.add_paragraph(); par.alignment = WD_ALIGN_PARAGRAPH.CENTER; par.paragraph_format.keep_with_next = True
    par.add_run().add_picture(path, width=Cm(15.6))
    p(f"Gambar {FIG[0]}. {caption}", bold=True, size=9.5, align=WD_ALIGN_PARAGRAPH.CENTER, after=1)
    p(f"Halaman 1–3 dari berkas yang benar-benar diunduh dari StatPlan ({len(dd)} halaman, proyek demo SKM — contoh ilustratif).",
      italic=True, size=8.5, color=GRAY, align=WD_ALIGN_PARAGRAPH.CENTER, after=8)
    return len(dd)


# ---------------- headings ----------------
def h1(text, page_break=True):
    par = doc.add_paragraph(style="Heading 1")
    par.paragraph_format.page_break_before = page_break
    par.add_run(text)
    rule = doc.add_table(rows=1, cols=1)
    c = rule.rows[0].cells[0]
    cell_borders(c, top=(16, "EB891B"))
    fixed_layout(rule, [3.0])
    c.paragraphs[0].paragraph_format.space_after = Pt(0)
    c.paragraphs[0].runs or c.paragraphs[0].add_run("")
    spacer(2)


def h2(text):
    return doc.add_paragraph(text, style="Heading 2")


def h3(text):
    return doc.add_paragraph(text, style="Heading 3")


CARD = {c["code"]: (ph, c) for ph in PHASES for c in ph["cards"]}
PHASE_EN = [ph["official"].split(" (")[0] for ph in PHASES]


def fields_text(prep):
    out = []
    for f in prep["fields"]:
        s = f"**{f['label']}**" + (" (wajib)" if f["required"] else "")
        if f["options"]:
            s += f" — pilihan: {', '.join(f['options'])}"
        if f["columns"]:
            s += f" — kolom: {', '.join(f['columns'])}"
        if f["conditional"]:
            s += " — muncul bila pilihan sebelumnya sesuai"
        out.append(s)
    return out


# =====================================================================
# COVER
# =====================================================================
cov = doc.add_paragraph(); cov.paragraph_format.space_before = Pt(70); cov.paragraph_format.space_after = Pt(4)
r = cov.add_run("STATPLAN"); r.bold = True; r.font.size = Pt(44); r.font.color.rgb = NAVY; r.font.name = "Cambria"
rule = doc.add_table(rows=1, cols=1); c = rule.rows[0].cells[0]; cell_borders(c, top=(24, "EB891B")); fixed_layout(rule, [4.5])
p("", after=6)
p("PANDUAN PENGGUNAAN APLIKASI", bold=True, size=24, color=INK, after=6)
p("Simulator Perencanaan Kegiatan Statistik", size=15, color=NAVY, after=0)
p("Berbasis GSBPM 5.2", size=15, color=NAVY, after=16)
p("Untuk BPS Kabupaten Lombok Tengah dan Instansi Pengguna", italic=True, size=12, color=GRAY, after=48)
meta = [("Versi dokumen", GUIDE_VERSION), ("Tanggal", GUIDE_DATE), ("Status dokumen", "Panduan penggunaan — versi rilis 1.0"), ("Versi aplikasi", f"StatPlan {APP_VERSION}")]
mt = doc.add_table(rows=0, cols=2)
for k_, v_ in meta:
    cells = mt.add_row().cells
    add_rich(cells[0].paragraphs[0], k_, bold=True, size=10, color=GRAY)
    add_rich(cells[1].paragraphs[0], v_, size=10.5)
    for cc in cells: cc.paragraphs[0].paragraph_format.space_after = Pt(3)
fixed_layout(mt, [4.2, 11.0])
p("", after=40)
box("", "Panduan ini menjelaskan penggunaan aplikasi StatPlan. StatPlan merupakan alat bantu perencanaan dan pembelajaran berbasis GSBPM 5.2. Dokumen yang dihasilkan aplikasi merupakan draft perencanaan dan bukan dokumen resmi atau persetujuan BPS.")

# header / footer from page 2
hdr = sec.header.paragraphs[0]
hdr.alignment = WD_ALIGN_PARAGRAPH.RIGHT
x = hdr.add_run("StatPlan — Panduan Penggunaan Aplikasi"); x.font.size = Pt(8.5); x.font.color.rgb = GRAY
ftr = sec.footer.paragraphs[0]
ftr.alignment = WD_ALIGN_PARAGRAPH.CENTER
for t_, fld in (("Halaman ", "PAGE"), (" dari ", "NUMPAGES")):
    x = ftr.add_run(t_); x.font.size = Pt(8.5); x.font.color.rgb = GRAY
    add_field(ftr, fld, size=8.5, color=GRAY)
f2 = sec.footer.add_paragraph(); f2.alignment = WD_ALIGN_PARAGRAPH.CENTER
x = f2.add_run("Hasil ekspor StatPlan adalah draft perencanaan — bukan dokumen resmi BPS"); x.font.size = Pt(7.5); x.font.color.rgb = GRAY

# =====================================================================
# INFORMASI DOKUMEN + DAFTAR ISI
# =====================================================================
tp = p("Informasi Dokumen", bold=True, size=20, color=NAVY, after=10)
tp.paragraph_format.page_break_before = True
tp.runs[0].font.name = "Cambria"
kv([
    ("Nama dokumen", "Panduan Penggunaan Aplikasi StatPlan"),
    ("Nama aplikasi", "StatPlan — Simulator Perencanaan Kegiatan Statistik Berbasis GSBPM 5.2"),
    ("Versi aplikasi", APP_VERSION),
    ("Versi panduan", GUIDE_VERSION),
    ("Tujuan", "Membimbing pengguna baru memakai StatPlan dari halaman utama sampai mengunduh Draft Perencanaan Kegiatan Statistik (.docx), tanpa bantuan pembuat aplikasi."),
    ("Sasaran pengguna", "BPS Kabupaten Lombok Tengah, OPD/instansi pemerintah, penyelenggara kegiatan statistik, operator/petugas pengguna StatPlan, dan pengguna non-teknis yang belum mendalami GSBPM."),
    ("Basis proses", "GSBPM 5.2 (8 fase, 44 subproses) sebagaimana dijelaskan dalam Materi Proses Bisnis Statistik BPS."),
    ("Format output aplikasi", "Dokumen Microsoft Word (.docx) — “Draft Perencanaan Kegiatan Statistik”."),
    ("Status output aplikasi", "DRAFT — BUKAN DOKUMEN RESMI BPS. Perlu ditinjau oleh pihak berwenang/ahli metodologi."),
    ("Alamat aplikasi", f"{APP_URL} (saat panduan disusun)"),
    ("Tanggal penyusunan", GUIDE_DATE),
], widths=(4.2, 12.2))

p("Cara membaca panduan ini", bold=True, size=13.5, color=NAVY, before=14, after=5, keep=True).runs[0].font.name = "Cambria"
table(["Penanda", "Arti"], [
    ["**Tebal** dalam teks", "Nama tombol, menu, tab, atau isian persis seperti yang tertulis di aplikasi."],
    ["LANGKAH 01 …", "Kotak langkah berisi TUJUAN, TINDAKAN, HASIL, dan CATATAN. Ikuti tindakan dari atas ke bawah."],
    ["① ② ③ pada gambar", "Penanda bernomor pada tangkapan layar; penjelasannya ada di bawah judul gambar."],
    ["Kotak CATATAN", "Informasi penting untuk memahami langkah."],
    ["Kotak PERHATIAN", "Hal yang sering disalahpahami — misalnya status draft dan batasan StatPlan."],
    ["Kotak TIPS", "Cara kerja yang lebih cepat atau lebih aman."],
    ["Contoh ilustratif", "Contoh buatan StatPlan untuk belajar — bukan data kegiatan nyata dan bukan contoh resmi BPS."],
    ["Materi Proses Bisnis, Hal. N", "Rujukan ke Materi Proses Bisnis Statistik BPS, halaman N (nomor halaman PDF)."],
], "Penanda dalam panduan", widths=[4.4, 12.0])

tp = p("Daftar Isi", bold=True, size=20, color=NAVY, after=8)
tp.paragraph_format.page_break_before = True
tp.runs[0].font.name = "Cambria"
tocp = doc.add_paragraph()
add_field(tocp, 'TOC \\o "1-2" \\h \\z \\u')

# =====================================================================
# BAB 1
# =====================================================================
h1("BAB 1  Mengenal StatPlan")
h2("1.1 Apa itu StatPlan")
p("StatPlan adalah aplikasi web untuk belajar dan menyusun rencana kegiatan statistik. Pengguna menceritakan kebutuhannya dengan bahasa sehari-hari, melihat contoh kegiatan, mengikuti panduan per subproses GSBPM 5.2, lalu mengunduh draft perencanaan dalam format Word.")
p("StatPlan berjalan di browser. Tidak ada akun dan tidak ada server penyimpanan: data proyek disimpan di browser perangkat yang Anda gunakan.")
h2("1.2 Tujuan StatPlan")
p("StatPlan membantu pengguna yang belum tahu bagaimana menyelenggarakan kegiatan statistik dengan memberikan panduan, contoh, format kerja, timeline, dan draft perencanaan berbasis GSBPM 5.2.")
h2("1.3 Siapa yang dapat menggunakan StatPlan")
table(["Pengguna", "Kegunaan StatPlan"], [
    ["Pegawai OPD/instansi penyelenggara kegiatan statistik", "Menyusun rencana kegiatan dari nol, lengkap dengan persiapan per tahap."],
    ["Operator/petugas", "Mengisi dan memeriksa kelengkapan rencana, lalu mengunduh draft."],
    ["BPS Kabupaten Lombok Tengah", "Mendampingi instansi dan meninjau draft rencana yang dihasilkan."],
    ["Pengguna awam, mahasiswa/peserta PKL", "Memahami GSBPM 5.2 melalui contoh dan praktik."],
], "Sasaran pengguna", widths=[6.0, 10.4])
h2("1.4 Kapan StatPlan digunakan")
bullets([
    "Saat instansi baru merencanakan kegiatan statistik (survei, sensus/pendataan lengkap, atau kompilasi data administratif).",
    "Saat ingin memahami apa saja yang perlu disiapkan pada setiap tahap GSBPM sebelum kegiatan dimulai.",
    "Saat membutuhkan draft rencana tertulis sebagai bahan diskusi dengan tim, pimpinan, atau BPS.",
])
h2("1.5 Apa yang dihasilkan StatPlan")
p("Hasil akhir StatPlan adalah berkas **Draft Perencanaan Kegiatan Statistik** (.docx). Isinya dirinci di BAB 17. Menurut halaman utama aplikasi, draft memuat:")
bullets(D["landing"]["outputs"])
h2("1.6 Hubungan StatPlan dengan GSBPM 5.2")
p("GSBPM (Generic Statistical Business Process Model) adalah kerangka kerja standar internasional untuk menjelaskan proses bisnis dalam menghasilkan statistik (Materi Proses Bisnis, Hal. 5). StatPlan memakai 8 fase dan 44 subproses GSBPM 5.2 dengan kode dan nama sesuai Materi Proses Bisnis.")
table(["No.", "Fase (nama resmi)", "Nama di StatPlan", "Subproses"],
      [[str(ph["n"]), PHASE_EN[i], ph["title"], str(len(ph["cards"]))] for i, ph in enumerate(PHASES)] + [["", "Jumlah", "", "44"]],
      "Delapan fase GSBPM 5.2 di StatPlan", widths=[1.2, 4.6, 7.4, 3.2])
box("GSBPM tidak harus linear", "Materi Proses Bisnis menyebut GSBPM bersifat fleksibel dan tidak harus digunakan secara linear (Hal. 5 dan 8). Urutan fase di Mode Terpandu adalah urutan belajar StatPlan agar pengguna tidak kewalahan — bukan urutan wajib GSBPM.")
h2("1.7 Batasan StatPlan")
table(["StatPlan adalah …", "StatPlan bukan …"], [
    ["Simulator dan media belajar perencanaan kegiatan statistik.", "Sistem operasional atau sistem produksi statistik BPS."],
    ["Alat bantu menyusun persiapan secara terstruktur.", "Sistem persetujuan atau pemberi rekomendasi resmi BPS."],
    ["Penghasil draft perencanaan untuk ditinjau.", "Pengganti prosedur lembaga atau penilaian ahli metodologi."],
    ["Pencatat hasil pemeriksaan portal yang dilakukan pengguna.", "Pemeriksa portal otomatis — StatPlan tidak terhubung ke SIRuSa, Romantik, atau Portal SDI."],
], "Posisi StatPlan", widths=[8.2, 8.2])
p("Batasan teknis: data tersimpan di browser (tidak ada sinkronisasi antarperangkat), tidak ada kolaborasi real-time, dan saran jenis kegiatan berasal dari aturan sederhana, bukan AI dan bukan keputusan BPS.")
h2("1.8 Status dokumen hasil ekspor")
box("Draft — bukan dokumen resmi BPS", [
    "Setiap berkas yang diunduh dari StatPlan berjudul “DRAFT PERENCANAAN KEGIATAN STATISTIK” dan memuat pernyataan “DRAFT — BUKAN DOKUMEN RESMI BPS” di sampul dan kaki halaman.",
    "Persentase checklist, “Sudah dipahami”, dan “Siap ditinjau” adalah status di StatPlan — bukan bukti bahwa kegiatan telah dilaksanakan, disetujui, atau direkomendasikan BPS.",
], kind="warn")

# =====================================================================
# BAB 2
# =====================================================================
h1("BAB 2  Memahami Alur Penggunaan")
p("Panduan ini mengikuti alur penggunaan aplikasi dari awal sampai akhir. Setiap tahap memiliki satu tindakan utama sehingga Anda selalu tahu langkah berikutnya.")
diagram([
    ("Halaman utama", "Pahami fungsi StatPlan — Mulai perencanaan / Pelajari contoh"),
    ("Contoh kegiatan / Mulai rencana", "Pelajari contoh ilustratif atau langsung buat rencana"),
    ("Identifikasi", "Ceritakan kebutuhan dan hasil yang diinginkan"),
    ("Timeline", "Tanggal mulai–selesai, dibagi ke 8 fase"),
    ("Mode Terpandu (Guided GSBPM)", "8 fase · 44 subproses: pahami, isi format kerja"),
    ("Ruang kerja (Workspace)", "9 tab untuk meninjau dan melengkapi rencana"),
    ("Pemeriksaan", "Tinjauan sebelum ekspor: Perlu dilengkapi / Perlu ditinjau"),
    ("Ekspor", "Tab Ekspor — tombol Unduh draf perencanaan"),
    ("Unduh draft", "Berkas .docx: DRAFT — bukan dokumen resmi BPS"),
], "flow-utama.png", "Alur penggunaan StatPlan dari halaman utama sampai draft", "Diagram (bukan tangkapan layar), disusun dari struktur aplikasi StatPlan 1.0.0.", width=10.5)
table(["No.", "Tahap", "Di aplikasi", "Tindakan utama", "Bab"], [
    ["1", "Halaman utama", "Beranda (alamat aplikasi)", "Mulai perencanaan atau Pelajari contoh", "4"],
    ["2", "Contoh / mulai rencana", "Halaman contoh kegiatan; Rencana baru", "Gunakan contoh ini untuk membuat rencana", "5, 6"],
    ["3", "Identifikasi", "Rencana baru — Langkah 1 dan 2", "Lanjutkan; Gunakan contoh & lanjutkan", "6, 7"],
    ["4", "Timeline", "Rencana baru — Langkah 3", "Gunakan rencana waktu & lanjutkan", "8"],
    ["5", "Mode Terpandu", "8 fase, 44 subproses", "Tandai sudah dipahami; Selesai memahami tahap ini", "9, 10"],
    ["6", "Ruang kerja", "9 tab (Timeline … Ekspor)", "Lengkapi bagian yang diminta", "11–13"],
    ["7", "Pemeriksaan", "Tab Ekspor — Tinjauan sebelum ekspor", "Tombol perbaikan, mis. Buka pemeriksaan portal", "14, 15"],
    ["8", "Ekspor", "Tab Ekspor", "Unduh draf perencanaan", "16"],
    ["9", "Draft", "Berkas .docx", "Tinjau, perbaiki bila perlu, ekspor ulang", "16, 17"],
], "Tahap, lokasi di aplikasi, dan tindakan utama", widths=[1.0, 3.2, 4.8, 5.6, 1.8], size=9)
box("Anda boleh berpindah bagian", "Tidak semua bagian harus lengkap sebelum pindah. Anda dapat membuka Ruang kerja kapan saja dari Mode Terpandu (tombol **Buka ruang kerja lengkap**) dan kembali lewat tautan **Kembali ke Mode Terpandu**.", kind="tip")

# =====================================================================
# BAB 3
# =====================================================================
h1("BAB 3  Persiapan Sebelum Menggunakan")
h2("3.1 Perangkat dan browser")
table(["Kebutuhan", "Keterangan"], [
    ["Perangkat", "Komputer/laptop disarankan untuk mengisi dan meninjau. Aplikasi juga dapat dibuka di ponsel dan tablet."],
    ["Browser", "Browser modern. Aplikasi diuji menggunakan Google Chrome pada lebar layar 375–1440 piksel."],
    ["Koneksi internet", "Diperlukan untuk membuka alamat aplikasi."],
    ["Akun", "Tidak diperlukan. Tidak ada proses masuk (login)."],
    ["Aplikasi pembuka dokumen", "Microsoft Word atau aplikasi lain yang dapat membuka berkas .docx, untuk membaca draft hasil unduhan."],
], "Kebutuhan perangkat", widths=[4.0, 12.4])
box("Data tersimpan di browser", [
    "Proyek disimpan di browser perangkat yang dipakai. Gunakan perangkat dan browser yang sama untuk melanjutkan pekerjaan.",
    "Menghapus data situs/riwayat browser juga menghapus proyek. Mode penyamaran (incognito) tidak menyimpan proyek setelah jendela ditutup.",
    "Untuk memindahkan salinan proyek ke perangkat lain gunakan **Salin tautan berbagi** di Ruang kerja (BAB 11).",
], kind="warn")
h2("3.2 Informasi yang sebaiknya disiapkan")
p("Anda tidak harus memiliki semua informasi di awal. Siapkan sebanyak yang tersedia:")
table(["Informasi", "Contoh pertanyaan", "Dipakai pada"], [
    ["Kebutuhan", "Informasi apa yang ingin diketahui? Masalah apa yang ingin dijawab?", "Rencana baru, subproses 1.1"],
    ["Pengguna hasil", "Siapa yang akan memakai hasilnya dan untuk apa?", "Subproses 1.2"],
    ["Hasil/output", "Tabel, indikator, atau ringkasan apa yang diharapkan?", "Rencana baru langkah 2, subproses 1.3"],
    ["Periode", "Kapan kegiatan dimulai dan selesai?", "Rencana baru langkah 3 (timeline)"],
    ["Data yang sudah ada", "Apakah data serupa sudah tersedia di portal rujukan?", "Subproses 1.5, tab Alur kerja"],
    ["Identitas kegiatan", "Penyelenggara, penanggung jawab, cakupan wilayah, tahun.", "Tab Metadata (MS-Keg)"],
    ["Variabel & pertanyaan", "Data apa yang akan dicatat dari setiap responden/unit?", "Tab Variabel, tab Instrumen"],
], "Informasi yang membantu pengisian", widths=[3.2, 7.8, 5.4], size=9)
h2("3.3 Jika informasi belum tersedia")
bullets([
    "**Gunakan contoh** yang disediakan StatPlan sebagai titik awal, lalu ubah sesuai kegiatan Anda.",
    "**Isi seadanya dulu.** Format kerja menyimpan isian sebagai draft; status “Draft disiapkan” menandakan isian belum lengkap.",
    "**Pilih “Belum tahu”** bila opsi tersebut tersedia (misalnya pada pemeriksaan data 1.5).",
    "**Baca FAQ** (menu **FAQ**) untuk istilah yang belum dipahami.",
    "**Diskusikan dengan BPS atau ahli metodologi** untuk keputusan teknis seperti metode sampling.",
])
h2("3.4 Bedakan data nyata dan contoh")
box("Contoh ilustratif bukan data resmi", "Semua contoh di StatPlan — kalimat contoh, proyek demo, dan isian contoh — berlabel **Contoh ilustratif**. Contoh tersebut bukan data kegiatan nyata dan bukan contoh resmi BPS. Ganti isian contoh dengan informasi kegiatan Anda sebelum draft digunakan.", kind="warn")

# =====================================================================
# BAB 4
# =====================================================================
h1("BAB 4  Membuka Halaman Utama")
step(1, "Buka halaman utama", "Memulai penggunaan StatPlan.",
     [f"Buka browser, lalu ketik alamat aplikasi: {APP_URL}.", "Tunggu hingga halaman utama tampil.", "Baca judul dan penjelasan singkat di bagian atas."],
     "Halaman utama StatPlan terbuka.",
     "Jika belum memahami proses kegiatan statistik, pelajari contoh kegiatan terlebih dahulu (BAB 5).")
figure("01-landing", "Halaman utama StatPlan", ["Navigasi atas", "Tombol Mulai perencanaan", "Tombol Pelajari contoh"])
h2("4.1 Apa yang terlihat di halaman utama")
table(["Bagian", "Isi"], [
    ["Judul utama", "“Susun kegiatan statistik dengan langkah yang lebih jelas.” beserta penjelasan singkat dan dua tombol utama."],
    ["Cara kerja", "“Empat langkah, dari kebutuhan sampai draf”: " + "; ".join(f"{s['number']} {s['title']}" for s in D["landing"]["steps"]) + "."],
    ["Belajar dari contoh", "“Belum tahu harus mulai dari mana?” — tiga kartu contoh kegiatan: survei, sensus, dan kompromin."],
    ["Tersusun mengikuti GSBPM 5.2", "Ringkasan delapan fase GSBPM yang dipakai StatPlan."],
    ["Apa yang Anda dapatkan?", "Isi draft perencanaan yang dihasilkan."],
    ["Tentang StatPlan", "Apa StatPlan dan apa yang bukan StatPlan."],
    ["Masih bingung?", "Tombol **Lihat FAQ** ke halaman Pertanyaan umum."],
], "Bagian-bagian halaman utama", widths=[4.4, 12.0], size=9.5)
figure("02-landing-cara-kerja", "Bagian Cara kerja — empat langkah", ["Empat langkah dari kebutuhan sampai draf"])
h2("4.2 Tombol dan navigasi")
buttons_table([
    ["**Mulai perencanaan**", "Membuat rencana kegiatan baru.", "Klik tombol di bagian atas halaman.", "Halaman Rencana baru — Langkah 1 terbuka (BAB 6)."],
    ["**Pelajari contoh**", "Membuka contoh kegiatan.", "Klik tombol, lalu pilih salah satu contoh.", "Halaman contoh kegiatan terbuka (BAB 5)."],
    ["**Rencana baru** (navigasi)", "Sama dengan Mulai perencanaan.", "Klik di pojok kanan atas.", "Halaman Rencana baru terbuka."],
    ["**Contoh** (navigasi)", "Membuka contoh kegiatan.", "Klik menu Contoh.", "Halaman contoh survei terbuka."],
    ["**Cara kerja** (navigasi)", "Menggulir ke bagian Cara kerja.", "Klik menu Cara kerja.", "Empat langkah StatPlan ditampilkan."],
    ["**Presentasi** (navigasi)", "Membuka halaman presentasi StatPlan.", "Klik menu Presentasi.", "Halaman presentasi terbuka."],
    ["**Proyek saya** (navigasi)", "Membuka daftar proyek yang tersimpan.", "Klik menu Proyek saya.", "Halaman Proyek saya terbuka (BAB 11)."],
    ["**Pelajari contoh: …** (kartu)", "Membuka contoh tertentu.", "Klik kartu contoh di bagian Belajar dari contoh.", "Halaman contoh tersebut terbuka."],
    ["**Lihat FAQ**", "Membuka Pertanyaan umum.", "Klik di bagian Masih bingung?", "Halaman FAQ terbuka (BAB 19)."],
], "Tombol dan tautan di halaman utama")
figure("03-landing-contoh", "Bagian Belajar dari contoh — tiga contoh kegiatan", ["Kartu contoh: survei, sensus, dan kompromin"])
box("Panduan singkat pada kunjungan pertama", "Saat pertama kali membuka halaman aplikasi (misalnya Proyek saya), dapat muncul panduan singkat tiga langkah: “Selamat datang di StatPlan”, “Cara memakainya”, dan “Butuh bantuan?”. Gunakan **Lanjut** untuk membaca, **Kembali** untuk mundur, **Lewati** untuk menutup, atau **Buka beranda** di langkah terakhir.")

# =====================================================================
# BAB 5
# =====================================================================
h1("BAB 5  Mempelajari Contoh Kegiatan")
p("Contoh disediakan agar Anda dapat melihat bentuk akhir sebuah rencana sebelum menyusun rencana sendiri. StatPlan menyediakan tiga contoh:")
table(["Contoh", "Jenis kegiatan", "Yang bisa dipelajari"],
      [[e["title"], {"survei": "Survei", "sensus": "Sensus (pendataan lengkap)", "kompromin": "Kompromin (kompilasi data administratif)"}[e["jenis"]], e["takeaways"][0] if e["takeaways"] else e["whatToKnow"]] for e in D["examples"]],
      "Contoh kegiatan di StatPlan", widths=[4.2, 4.2, 8.0], size=9)
step(2, "Buka contoh kegiatan", "Melihat contoh rencana yang sudah tersusun.",
     ["Di halaman utama, klik **Pelajari contoh** atau salah satu kartu **Pelajari contoh: …**.", "Baca judul contoh dan label “Contoh ilustratif StatPlan”.", "Gulir ke bawah untuk membaca isi contoh."],
     "Halaman contoh kegiatan terbuka.",
     "Contoh lain dapat dibuka melalui tautan di halaman contoh, atau kembali ke daftar contoh dengan **Semua contoh**.")
figure("04-contoh", "Halaman contoh kegiatan (studi kasus)", ["Tombol Gunakan contoh ini untuk membuat rencana"])
h2("5.1 Apa yang dapat dipelajari dari contoh")
table(["Bagian halaman contoh", "Yang dipelajari"], [
    ["**Sekilas**", "Jenis kegiatan, topik, tujuan, pengguna informasi, output yang direncanakan, dan periode contoh."],
    ["**Mengapa kegiatan ini dibutuhkan?**", "Latar belakang kebutuhan, siapa yang membutuhkan, dan informasi yang diharapkan."],
    ["**Apa yang perlu disiapkan?** / **Satu fase, satu langkah**", "Delapan fase GSBPM beserta jumlah subprosesnya. Klik nama fase (mis. **01 Identifikasi Kebutuhan 6 subproses**) untuk melihat persiapan pada fase tersebut."],
    ["**Contoh asli dari materi**", "Contoh yang diambil dari Materi Proses Bisnis, dengan rujukan halaman."],
    ["**Apa yang bisa saya tiru?**", "Pelajaran singkat yang dapat diterapkan pada kegiatan Anda."],
], "Isi halaman contoh", widths=[5.4, 11.0], size=9.5)
figure("05-contoh-sekilas", "Bagian Sekilas pada halaman contoh", ["Ringkasan contoh (Sekilas)"])
h2("5.2 Tombol di halaman contoh")
buttons_table([
    ["**Gunakan contoh ini untuk membuat rencana**", "Membuat rencana baru berdasarkan contoh.", "Klik tombol di bagian atas halaman contoh.", "Rencana baru terbuka dengan cerita kebutuhan sudah terisi."],
    ["**Mulai dari contoh ini**", "Sama seperti tombol di atas (di bilah atas).", "Klik di pojok kanan atas.", "Rencana baru berbasis contoh terbuka."],
    ["**Pelajari langkahnya dulu**", "Menggulir ke penjelasan langkah contoh.", "Klik di samping tombol utama.", "Bagian penjelasan contoh ditampilkan."],
    ["**Semua contoh**", "Kembali ke daftar contoh.", "Klik di kiri atas.", "Halaman utama terbuka pada bagian Belajar dari contoh."],
], "Tombol di halaman contoh")
box("Contoh aslinya tidak berubah", "Menggunakan contoh selalu membuat rencana baru milik Anda. Isian awal diambil dari contoh ilustratif dan dapat diubah bebas; contoh aslinya tidak berubah.", kind="tip")
box("Contoh bukan data resmi", "Semua isian contoh adalah contoh ilustratif — tidak ada angka hasil atau data responden sungguhan, dan bukan contoh resmi BPS.", kind="warn")

# =====================================================================
# BAB 6
# =====================================================================
h1("BAB 6  Memulai Rencana Kegiatan")
p("Rencana baru terdiri atas tiga layar isian: **Ceritakan**, **Hasil**, dan **Waktu**. Bilah kemajuan di atas menampilkan “Langkah N dari 6”; tiga langkah terakhir (Siapkan, Periksa, Draf) dikerjakan di Mode Terpandu dan Ruang kerja.")
step(3, "Buka Rencana baru", "Membuat proyek rencana kegiatan baru.",
     ["Klik **Mulai perencanaan** di halaman utama, atau **Rencana baru** di pojok kanan atas, atau **Gunakan contoh ini untuk membuat rencana** di halaman contoh."],
     "Layar “Apa kegiatan yang ingin Anda rencanakan?” (Langkah 1 dari 6) terbuka.",
     "Jika dimulai dari contoh, muncul keterangan “Dimulai dari contoh: …” di bagian atas.")
step(4, "Ceritakan kebutuhan (Langkah 1)", "Menjelaskan kegiatan dengan bahasa sehari-hari.",
     ["Isi kotak **Informasi apa yang ingin Anda ketahui atau hasilkan?** dengan satu atau dua kalimat (minimal 12 karakter).",
      "Jika bingung, klik salah satu contoh kalimat: **Kepuasan pelayanan**, **Pendataan UMKM**, atau **Statistik dari data administratif**.",
      "Periksa ringkasan yang muncul: **Nama kegiatan (draf)**, **Ringkasan kebutuhan**, dan **Cara memperoleh data yang disarankan**.",
      "Jika saran kurang tepat, pilih sendiri **Survei**, **Sensus**, atau **Kompromin**.",
      "Klik **Lanjutkan**."],
     "Layar Langkah 2 “Apa yang ingin Anda dapatkan dari kegiatan ini?” terbuka.",
     "Tautan **Bingung mulai dari mana?** membuka jawaban FAQ di tempat tanpa menghapus isian.")
figure("06-rencana-ceritakan", "Rencana baru — Langkah 1: menceritakan kebutuhan", ["Kotak cerita kebutuhan", "Contoh kalimat siap pakai"])
figure("06b-rencana-saran", "Ringkasan dan saran cara memperoleh data", ["Nama kegiatan (draf)", "Cara memperoleh data yang disarankan", "Pilihan Survei / Sensus / Kompromin", "Tombol Lanjutkan"])
h2("6.1 Penjelasan isian Langkah 1")
table(["Isian / bagian", "Maksud", "Yang ditulis / dipilih", "Contoh pengisian", "Kesalahan umum"], [
    ["Informasi apa yang ingin Anda ketahui atau hasilkan?", "Cerita singkat kebutuhan informasi.", "1–2 kalimat sehari-hari; minimal 12 karakter.", f"Contoh ilustratif: “{D['intake']['storyExample']}”", "Menulis judul terlalu singkat, atau langsung menulis daftar variabel."],
    ["Nama kegiatan (draf)", "Nama yang disusun StatPlan dari cerita Anda.", "Tidak diisi; periksa saja.", "“Survei kepuasan masyarakat terhadap pelayanan perizinan”", "Menganggapnya nama final — nama dapat dilengkapi di Metadata."],
    ["Ringkasan kebutuhan", "Ringkasan kebutuhan dari cerita.", "Tidak diisi; periksa saja.", "“Kegiatan untuk mengetahui kepuasan masyarakat …”", "—"],
    ["Cara memperoleh data yang disarankan", "Saran awal: Survei, Sensus, atau Kompromin.", "Terima saran atau pilih tombol lain.", "Survei (data dari sebagian unit/responden).", "Menganggap saran sebagai keputusan BPS — saran berasal dari aturan sederhana."],
], "Isian Langkah 1 (Ceritakan)", widths=[3.4, 3.0, 3.2, 3.6, 3.2], size=8.5)
box("Survei, sensus, atau kompromin?", [
    "**Survei**: data dikumpulkan dari sebagian unit (sampel).",
    "**Sensus**: data dikumpulkan dari seluruh unit (pendataan lengkap).",
    "**Kompromin**: statistik disusun dari data administrasi yang sudah ada.",
    "Keputusan akhir sebaiknya dikonsultasikan setelah memeriksa ketersediaan data (subproses 1.5) — lihat FAQ “Apa perbedaan survei, sensus, dan kompilasi data?”.",
])
step(5, "Tentukan hasil (Langkah 2)", "Menetapkan hasil yang ingin didapatkan dari kegiatan.",
     ["Baca kotak **Kebutuhan awal** — ringkasan dari Langkah 1.",
      "Periksa daftar **Contoh ilustratif** hasil yang ditampilkan.",
      "Klik **Gunakan contoh ini** untuk memakai daftar tersebut, atau **Tulis sendiri** untuk menulis hasil (satu baris per item).",
      "Klik **Gunakan contoh & lanjutkan** (atau **Gunakan & lanjutkan** setelah menulis sendiri)."],
     "Layar Langkah 3 “Kapan kegiatan ini dilakukan?” terbuka.",
     "Klik **Kembali** untuk mengubah cerita di Langkah 1. Isian tetap tersimpan selama Anda belum meninggalkan halaman.")
figure("07-rencana-hasil", "Rencana baru — Langkah 2: hasil yang ingin didapatkan", ["Kebutuhan awal", "Gunakan contoh ini", "Tulis sendiri", "Gunakan contoh & lanjutkan"])
table(["Isian", "Yang ditulis", "Contoh pengisian (contoh ilustratif)", "Kesalahan umum"], [
    ["Tulis hasil (satu baris per item)", "Output yang diharapkan, satu per baris.", "Tingkat kepuasan masyarakat\nHasil menurut jenis layanan", "Menulis angka target atau hasil yang belum ada."],
], "Isian Langkah 2 (Hasil)", widths=[3.8, 3.8, 5.0, 3.8], size=9)
box("Langkah selanjutnya", "Langkah 3 (Waktu) dijelaskan di BAB 8. Setelah Langkah 3 selesai, proyek tersimpan dan Anda diarahkan ke Mode Terpandu.")

# =====================================================================
# BAB 7
# =====================================================================
h1("BAB 7  Identifikasi Kebutuhan")
ph1 = PHASES[0]
p(f"Identifikasi Kebutuhan adalah **Fase 1 — Specify Need** GSBPM 5.2 ({ph1['pdfRange'].replace('Hal.', 'Materi Proses Bisnis, Hal.')}). {ph1['explanation']}")
p("Di StatPlan, identifikasi kebutuhan berlangsung dua kali: secara singkat saat membuat rencana (BAB 6), lalu secara lengkap di Mode Terpandu fase **Identifikasi Kebutuhan** (subproses 1.1–1.6). Cara memakai Mode Terpandu dijelaskan di BAB 9; bab ini menjelaskan isi setiap subproses Fase 1.")
kv([
    ("Pertanyaan fase", ph1["question"]),
    ("Subproses", "; ".join(f"{c['code']} {c['official']}" for c in ph1["cards"])),
    ("Output tahap menurut materi", "; ".join(ph1["outputs"]) + f" (Materi Proses Bisnis, Hal. {ph1['outputsPage']})"),
], "Ringkasan Fase 1 — Specify Need", widths=(4.0, 12.4))
figure("14-format-kerja", "Contoh format kerja 1.1 — “Siapkan rumusan kebutuhan”", ["Isian format kerja", "Status penyimpanan lokal", "Tombol Selesai mengisi"])


def subprocess_entry(code, with_heading=True):
    """Full entry for one subprocess (used in BAB 7 for 1.x and BAB 10 for the rest)."""
    ph, c = CARD[code]
    prep = c["prep"]
    if with_heading:
        h3(f"{c['code']} {c['official']}")
    p(f"Judul di StatPlan: “{c['title']}” · Fase {ph['n']} {PHASE_EN[ph['n'] - 1]} ({ph['title']}) · Materi Proses Bisnis, Hal. {c['page']}", italic=True, size=9, color=GRAY, after=3, keep=True)
    label("Tujuan")
    p(c["apa"])
    label("Apa yang perlu dipahami")
    pts = c["materiPoints"] or c["lessonPoints"]
    src = f"Menurut Materi Proses Bisnis, Hal. {c['page']}:" if c["materiPoints"] else "Poin penting (penjelasan sederhana StatPlan):"
    p(src, size=9, color=GRAY, after=1, keep=True)
    bullets(pts)
    if c["materiPoints"] and c["lessonPoints"]:
        p("Yang bisa dipelajari:", size=9, color=GRAY, after=1, keep=True)
        bullets(c["lessonPoints"])
    label("Apa yang perlu dilakukan pengguna")
    p(prep["explanation"])
    label("Langkah di StatPlan")
    req = [f["label"] for f in prep["fields"] if f["required"]]
    numbered([
        f"Buka Mode Terpandu fase **{ph['title']}**, lalu klik kartu **{c['code']} {c['official']}** (tombol **Pelajari**).",
        "Baca bagian **Apa?**, **Contoh**, dan **Yang bisa dipelajari**.",
        f"Klik **Isi format kerja** (“{prep['title']}”). Isi minimal: " + ("; ".join(f"**{x}**" for x in req) if req else "isian yang relevan") + ". Isian tersimpan otomatis; klik **Selesai mengisi**.",
        "Di bagian **Bukti yang perlu disiapkan** (dalam format kerja), pilih status tiap bukti bila relevan.",
        "Klik **Tandai sudah dipahami**, lalu **Lanjut ke …** untuk subproses berikutnya.",
    ])
    label("Contoh")
    cls = {"A": "Menurut materi", "B": "Penjelasan sederhana", "C": "Contoh ilustratif StatPlan"}.get(c["contohClass"], "Contoh")
    p(f"{c['contoh']}  [{cls}]")
    if c["contohDetail"]:
        kv([(r_["label"], r_["value"]) for r_ in c["contohDetail"]], widths=(4.2, 12.2), size=9, key_fill=BAND)
    if c["materiExamples"]:
        p("Contoh dari materi yang dapat dibuka di aplikasi: " + "; ".join(m["title"] for m in c["materiExamples"]) + ".", size=9.5, color=GRAY)
    label("Format kerja")
    p(f"**{prep['title']}** ({prep['sourceLabel']}). Isian:", keep=True)
    bullets(fields_text(prep), size=10)
    label("Bukti dukung")
    ev = [e["label"] + (f" — output tahap menurut materi, Hal. {e['page']}" if e["page"] else "") for e in prep["evidence"]]
    bullets(ev, size=10)
    p("Status tiap bukti: Belum disiapkan, Sedang disiapkan, atau Sudah disiapkan — status persiapan lokal, bukan verifikasi BPS.", size=9, color=GRAY)
    label("Kapan dianggap sudah dipahami")
    p("Setelah Anda membaca materinya lalu klik **Tandai sudah dipahami**. Status ini hanya menunjukkan bahwa materi telah dipelajari — bukan bahwa kegiatan pada subproses ini sudah dilakukan di dunia nyata.")
    notes = [prep["disclaimer"]]
    if prep.get("educationalNote"):
        notes.append(prep["educationalNote"])
    cl = c["checklist"]
    if cl:
        notes.append("Butir checklist terkait di Ruang kerja: " + "; ".join(x["label"] + (" (wajib)" if x["required"] else "") + (f" — khusus {', '.join(x['jenis'])}" if x["jenis"] else "") + (f" — khusus {', '.join(x['klasifikasi'])}" if x["klasifikasi"] else "") for x in cl) + ".")
    if c["skipWhen"]:
        notes.append("Di Ruang kerja, butir checklist subproses ini tidak ditampilkan untuk jenis kegiatan: " + ", ".join(c["skipWhen"]) + ".")
    label("Catatan")
    bullets(notes, size=10)


for i, c in enumerate(PHASES[0]["cards"], 1):
    h2(f"7.{i} Subproses {c['code']} {c['official']}")
    subprocess_entry(c["code"], with_heading=False)
    ph, cc = CARD[c["code"]]
    kv([
        ("Informasi yang perlu disiapkan", "; ".join(f["label"] for f in cc["prep"]["fields"])),
        ("Hasil setelah selesai", f"Format kerja “{cc['prep']['title']}” berstatus **Bahan siap** atau **Draft disiapkan**, dan kartu {cc['code']} berstatus **Sudah dipahami**."),
    ], widths=(4.4, 12.0), size=9.5)

# =====================================================================
# BAB 8
# =====================================================================
h1("BAB 8  Menentukan Timeline")
p("Timeline membagi periode kegiatan Anda ke delapan fase GSBPM. Timeline dibuat pada **Langkah 3** Rencana baru, sebelum proyek disimpan.")
box("Alat bantu perencanaan", "Timeline StatPlan merupakan alat bantu perencanaan dan bukan penetapan durasi wajib BPS. Dalam praktik, fase GSBPM bisa tumpang tindih atau diulang.", kind="warn")
h2("8.1 Mengapa timeline dibuat")
bullets(["Memberi gambaran kapan setiap fase dikerjakan.", "Membantu menyusun jadwal kegiatan (Materi Proses Bisnis memuat contoh jadwal pada fase Perancangan, Hal. 23).", "Mengisi periode kegiatan pada draft dan pada kotak Mode Terpandu “Rencana waktu Anda”."])
step(6, "Isi tanggal kegiatan", "Menentukan periode kegiatan.",
     ["Pada **Pintasan durasi**, klik **1 bulan**, **2 bulan**, **3 bulan**, atau **6 bulan** — atau lewati pintasan.",
      "Isi atau ubah **Tanggal mulai**.",
      "Isi atau ubah **Tanggal selesai** (harus sama dengan atau setelah tanggal mulai).",
      "Periksa kotak **Durasi kegiatan** (jumlah hari, termasuk hari mulai dan selesai)."],
     "Bagian **Rencana waktu awal** menampilkan delapan fase beserta tanggalnya.",
     "Pintasan hanya mengisi tanggal. Anda tetap dapat mengubah tanggal secara langsung.")
figure("08-rencana-waktu", "Rencana baru — Langkah 3: periode kegiatan", ["Pintasan durasi", "Tanggal mulai", "Tanggal selesai"])
h2("8.2 Membaca rencana waktu awal")
p("StatPlan membagi rentang tanggal ke delapan fase secara proporsional. Setiap fase ditampilkan dengan nomor, nama, tanggal mulai–selesai, dan batang kecil yang menunjukkan posisinya dalam periode kegiatan. Pembagian awal memakai bobot:")
w = {x["phaseId"]: x["weight"] for x in D["intake"]["weights"]}
table(["Fase", "Bobot pembagian awal"], [[f"{ph['n']}. {ph['title']}", str(w[ph['id']])] for ph in PHASES],
      "Bobot pembagian rencana waktu awal", widths=[9.0, 7.4], size=9)
p("Bobot hanya menentukan pembagian awal agar setiap fase mendapat porsi waktu; bobot bukan ketentuan BPS.", size=9.5, color=GRAY)
step(7, "Sesuaikan tanggal fase (opsional)", "Menyesuaikan tanggal setiap fase.",
     ["Klik **Sesuaikan jadwal**.", "Ubah tanggal **Mulai** dan **Selesai** fase yang perlu disesuaikan.", "Klik **Selesai sesuaikan**."],
     "Tanggal fase diperbarui.",
     "Tanggal fase harus berada di dalam periode kegiatan. Jika tidak, muncul pesan kesalahan (lihat Tabel berikut).")
figure("09-rencana-jadwal", "Rencana waktu awal dan tombol Sesuaikan jadwal", ["Sesuaikan jadwal", "Keterangan: bukan durasi wajib BPS"])
table(["Pesan di aplikasi", "Artinya", "Cara memperbaiki"], [
    ["Tanggal mulai wajib diisi. / Tanggal selesai wajib diisi.", "Salah satu tanggal kosong.", "Isi kedua tanggal."],
    ["Tanggal selesai harus setelah atau sama dengan tanggal mulai.", "Tanggal selesai lebih awal dari tanggal mulai.", "Perbaiki tanggal selesai."],
    ["Tanggal mulai tahap tidak boleh sebelum tanggal mulai kegiatan.", "Tanggal fase di luar periode.", "Geser tanggal fase ke dalam periode."],
    ["Tanggal selesai tahap tidak boleh setelah tanggal selesai kegiatan.", "Tanggal fase di luar periode.", "Geser tanggal fase ke dalam periode."],
    ["Rencana waktu belum lengkap. Periksa tanggal kegiatan.", "Pembagian delapan fase belum terbentuk.", "Periksa kembali tanggal mulai dan selesai."],
], "Pesan kesalahan tanggal", widths=[6.0, 4.6, 5.8], size=9)
step(8, "Simpan rencana dan lanjut", "Menyimpan proyek beserta timeline.",
     ["Klik **Gunakan rencana waktu & lanjutkan**.", "Baca ringkasan pada layar **Rencana waktu sudah dibuat**: Kebutuhan, Hasil, Waktu, dan Pembagian tahap.", "Klik **Lanjut ke Identifikasi Kebutuhan**."],
     "Proyek tersimpan (pemberitahuan “Rencana waktu tersimpan”) dan Mode Terpandu fase Identifikasi Kebutuhan terbuka.")
figure("10-serah-terima", "Layar Rencana waktu sudah dibuat", ["Lanjut ke Identifikasi Kebutuhan"])
h2("8.3 Melihat dan mengubah timeline setelah proyek dibuat")
bullets([
    "Timeline dapat dilihat di Ruang kerja, tab **Timeline** (tab pertama), dalam bentuk batang per fase dengan minggu ke- dan tanggalnya.",
    "Di Mode Terpandu, kotak **Rencana waktu Anda** pada setiap fase menampilkan tanggal fase tersebut.",
    "Sebelum menekan **Gunakan rencana waktu & lanjutkan**, tanggal dapat diubah kapan saja; tombol **Kembali** membawa Anda ke langkah sebelumnya.",
])
box("Tanggal tidak dapat diubah setelah proyek dibuat", "Pada StatPlan 1.0.0, tab Timeline hanya menampilkan jadwal. Pengubahan tanggal setelah proyek dibuat tidak ditemukan pada implementasi aplikasi yang diperiksa. Jika periode kegiatan berubah, buat rencana baru dengan tanggal yang benar.", kind="warn")
figure("25-tab-timeline", "Ruang kerja — tab Timeline (proyek demo)", ["Tab Timeline"])

# =====================================================================
# BAB 9
# =====================================================================
h1("BAB 9  Mode Terpandu (Guided GSBPM)")
p("Mode Terpandu adalah panduan belajar dan perencanaan StatPlan. Anda mempelajari GSBPM 5.2 fase demi fase dan subproses demi subproses, lalu menyiapkan bahan kerjanya melalui format kerja. Keempat puluh empat subproses resmi tersedia; satu fase dibuka pada satu waktu agar tidak membingungkan.")
box("Urutan belajar, bukan urutan wajib", "Kunci tahap adalah urutan belajar StatPlan, bukan urutan wajib GSBPM. GSBPM sendiri bersifat fleksibel (Materi Proses Bisnis, Hal. 8).")
h2("9.1 Membuka Mode Terpandu")
bullets([
    "Otomatis setelah membuat rencana: klik **Lanjut ke Identifikasi Kebutuhan**.",
    "Dari **Proyek saya**: klik **Lanjutkan di Mode Terpandu** pada kartu “Lanjutkan pekerjaan”.",
    "Dari Ruang kerja: klik tautan **Kembali ke Mode Terpandu**.",
])
figure("11-terpandu-fase", "Mode Terpandu — halaman fase Identifikasi Kebutuhan", ["Urutan belajar StatPlan (navigasi fase)", "Judul fase"])
h2("9.2 Membaca halaman fase")
table(["Bagian", "Isi dan fungsi"], [
    ["**Urutan belajar StatPlan** (kiri)", "Delapan fase. Status tiap fase: **Sedang dipelajari**, **Tersedia**, **Dipahami**, atau **Belum dibuka** (ikon gembok). Klik fase yang terbuka untuk berpindah."],
    ["Judul fase", "Nomor dan nama fase, misalnya “01 Identifikasi Kebutuhan”, dengan penjelasan singkat."],
    ["**Subproses resmi**", "Jumlah subproses resmi pada fase tersebut."],
    ["**Dipahami**", "Berapa subproses yang sudah ditandai dipahami (mis. 0 / 6)."],
    ["**Rencana waktu Anda**", "Tanggal fase dari timeline, dengan keterangan “Bukan durasi wajib BPS”."],
    ["Catatan sumber", "Nama resmi fase, halaman Materi Proses Bisnis, **Output tahap menurut materi**, dan catatan bahwa GSBPM fleksibel."],
    ["Daftar kartu subproses", "Satu kartu per subproses dengan kode, nama resmi, halaman materi, status format kerja, dan tombol **Pelajari**."],
    ["**Bahan Anda**", "Ringkasan status format kerja setiap subproses dan tombol **Lanjutkan menyiapkan bahan**."],
    ["Kotak penyelesaian", "“N dari M subproses sudah dipahami” dan tombol **Selesai memahami tahap ini**."],
    ["**Buka ruang kerja lengkap**", "Membuka Ruang kerja proyek (BAB 11)."],
], "Bagian halaman fase", widths=[4.6, 11.8], size=9.5)
h2("9.3 Membuka dan membaca kartu subproses")
p("Klik kartu atau tombol **Pelajari** untuk membuka kartu. Isinya selalu berurutan sama:")
table(["Bagian kartu", "Yang dilakukan"], [
    ["**Apa?**", "Baca penjelasan sederhana. Klik **Lihat poin dari materi** untuk membaca poin asli Materi Proses Bisnis beserta halamannya."],
    ["**Contoh**", "Baca contoh penerapan. Buka **Contoh isian lengkap** untuk melihat contoh per bagian. Contoh berlabel **Contoh ilustratif StatPlan** bila bukan dari materi."],
    ["**Yang bisa dipelajari**", "Baca poin penting yang perlu diingat."],
    ["**Format kerja StatPlan**", "Klik **Isi format kerja** (atau **Lanjutkan format kerja**) untuk mengisi bahan kerja."],
    ["**Bukti dukung**", "Lihat dokumen yang biasanya disiapkan; status diisi di dalam format kerja."],
    ["**Tandai sudah dipahami**", "Menandai bahwa subproses ini sudah Anda pelajari."],
    ["**Lanjut ke …**", "Membuka subproses berikutnya."],
], "Urutan isi kartu subproses", widths=[4.4, 12.0], size=9.5)
figure("12-subproses-apa", "Kartu subproses yang dibuka — bagian Apa? dan Contoh", ["Penjelasan Apa? dengan rujukan halaman"])
figure("13-subproses-format-bukti", "Bagian bawah kartu — Format kerja dan Bukti dukung", ["Format kerja StatPlan", "Tombol Isi format kerja", "Bukti dukung"])
h2("9.4 Mengisi format kerja")
step(9, "Isi format kerja subproses", "Menyiapkan bahan kerja untuk subproses.",
     ["Klik **Isi format kerja** pada kartu subproses.",
      "Baca penjelasan dan **Contoh ilustratif StatPlan** di sisi kiri panel.",
      "Isi kolom di bagian **Format kerja StatPlan · Isian Anda**. Kolom bertanda * wajib untuk status **Bahan siap**.",
      "Perhatikan keterangan **Disimpan secara lokal** — isian tersimpan otomatis di browser.",
      "Klik **Selesai mengisi** untuk menutup panel."],
     "Status format kerja pada kartu berubah: **Belum diisi** → **Draft disiapkan** (sebagian) → **Bahan siap** (kolom wajib terisi).",
     "Klik **Reset draft** untuk mengosongkan isian format kerja subproses tersebut.")
table(["Status format kerja", "Arti"], [
    ["Belum diisi (—)", "Format kerja belum diisi sama sekali."],
    ["Draft disiapkan (◐)", "Sebagian isian terisi; kolom wajib belum lengkap."],
    ["Bahan siap (✓)", "Kolom wajib sudah terisi."],
], "Status format kerja", widths=[5.0, 11.4], size=9.5)
p("Status format kerja adalah ringkasan persiapan — bukan status resmi atau persetujuan BPS.", size=9.5, color=GRAY)
h2("9.5 Melihat dan menandai bukti dukung")
p("Bukti dukung adalah dokumen yang biasanya disiapkan pada subproses tersebut, misalnya notulen rapat atau daftar kebutuhan data. Bukti yang merupakan output tahap menurut materi ditandai “Output tahap menurut materi · Hal. N”.")
step(10, "Tandai status bukti dukung", "Mencatat persiapan dokumen pendukung.",
     ["Di dalam panel format kerja, gulir ke **Bukti yang perlu disiapkan**.", "Pada setiap bukti, pilih **Status persiapan**: Belum disiapkan, Sedang disiapkan, atau Sudah disiapkan.", "Isi **Catatan (opsional)** bila perlu."],
     "Jumlah bukti yang disiapkan tampil sebagai “N/M disiapkan”.",
     "Status bukti hanya catatan lokal di perangkat Anda. Tidak semua bukti wajib, dan tidak ada unggahan dokumen ke server.")
figure("15-bukti-dukung", "Bukti yang perlu disiapkan di dalam panel format kerja", ["Bukti yang perlu disiapkan", "Status persiapan"])
h2("9.6 Menandai “Sudah dipahami” dan berpindah subproses")
step(11, "Tandai subproses sudah dipahami", "Menyelesaikan pembelajaran satu subproses.",
     ["Setelah membaca kartu, klik **Tandai sudah dipahami**.", "Klik **Lanjut ke …** untuk membuka subproses berikutnya, atau klik kartu lain di daftar."],
     "Kartu berstatus **Sudah dipahami** dan penghitung “Dipahami” bertambah.",
     "Anda dapat membuka kembali kartu yang sudah dipahami untuk meninjau isinya (tombol **Tinjau**).")
figure("16-sudah-dipahami", "Kartu berstatus Sudah dipahami", ["Status Sudah dipahami", "Tombol Lanjut ke subproses berikutnya"])
box("Arti “Sudah dipahami”", "“Sudah dipahami” adalah status belajar di StatPlan. Status ini tidak berarti kegiatan pada subproses tersebut sudah dilakukan, disetujui, atau selesai. Memahami materi, menyiapkan bahan (format kerja), mencentang checklist, lolos pemeriksaan, dan kesiapan ekspor adalah lima hal yang berbeda.", kind="warn")
h2("9.7 Menyelesaikan fase dan membuka fase berikutnya")
step(12, "Selesaikan fase", "Menutup pembelajaran satu fase dan membuka fase berikutnya.",
     ["Pastikan semua kartu pada fase berstatus **Sudah dipahami**.", "Periksa ringkasan **Bahan Anda**. Bahan tidak harus lengkap untuk melanjutkan.", "Klik **Selesai memahami tahap ini**.", "Klik tombol **Lanjut ke …** (misalnya **Lanjut ke Perancangan**)."],
     "Fase berstatus **Dipahami** dan fase berikutnya terbuka.",
     "Tombol **Selesai memahami tahap ini** aktif setelah semua subproses fase tersebut ditandai dipahami.")
figure("17-bahan-anda", "Ringkasan Bahan Anda dan penghitung subproses", ["Bahan Anda", "Jumlah subproses yang sudah dipahami"])
figure("18-fase-selesai", "Fase selesai dipelajari", ["Keterangan fase sudah dipelajari", "Tombol Lanjut ke Perancangan"])
figure("19-fase-perancangan", "Fase berikutnya terbuka (Perancangan)", ["Navigasi fase: Identifikasi Kebutuhan berstatus Dipahami", "Judul fase Perancangan"])
p("Untuk kembali ke fase sebelumnya, klik nama fase pada **Urutan belajar StatPlan**, atau tombol **Kembali ke …** di bawah fase.")
h2("9.8 Ringkasan delapan fase di Mode Terpandu")
for ph in PHASES:
    h3(f"Fase {ph['n']} — {PHASE_EN[ph['n'] - 1]} ({ph['title']})")
    kv([
        ("Tujuan fase", ph["explanation"]),
        ("Pertanyaan fase", ph["question"]),
        ("Jumlah subproses", f"{len(ph['cards'])}: " + "; ".join(f"{c['code']} {c['official']}" for c in ph["cards"])),
        ("Materi", f"Materi Proses Bisnis, {ph['pdfRange']}"),
        ("Output tahap menurut materi", "; ".join(ph["outputs"]) + f" (Hal. {ph['outputsPage']})"),
        ("Cara membuka", "Selesaikan fase sebelumnya, lalu klik **Lanjut ke " + ph["title"] + "** atau klik fase ini pada Urutan belajar StatPlan." if ph["n"] > 1 else "Otomatis setelah membuat rencana, atau lewat Lanjutkan di Mode Terpandu."),
        ("Rincian subproses", f"BAB {'7' if ph['n'] == 1 else '10'} — {'Identifikasi Kebutuhan' if ph['n'] == 1 else 'Dokumentasi 44 Subproses, bagian 10.' + str(ph['n'] - 1)}"),
    ], widths=(4.2, 12.2), size=9)
h2("9.9 Mode Terpandu selesai dan Review StatPlan")
p("Setelah fase Evaluasi selesai dipelajari, muncul bagian **Mode Terpandu selesai** yang menampilkan status belajar kedelapan fase dan kotak **Review StatPlan**.")
figure("20-terpandu-selesai", "Mode Terpandu selesai", ["Judul Mode Terpandu selesai", "Periksa di Workspace", "Unduh draf"], width=13.0)
buttons_table([
    ["**Periksa di Workspace**", "Meninjau kelengkapan di Ruang kerja.", "Klik tombol utama.", "Ruang kerja terbuka pada tab Checklist."],
    ["**Unduh draf**", "Menuju halaman ekspor.", "Klik tombol.", "Ruang kerja terbuka pada tab Ekspor (BAB 16)."],
    ["**Lihat kembali persiapan**", "Kembali ke fase Evaluasi.", "Klik tombol.", "Fase Evaluasi ditampilkan."],
    ["**Kembali ke beranda**", "Kembali ke Proyek saya.", "Klik tautan.", "Halaman Proyek saya terbuka."],
], "Tombol pada Mode Terpandu selesai")
box("Penyelesaian belajar, bukan persetujuan", "“Mode Terpandu selesai” berarti Anda sudah mempelajari seluruh tahapan di StatPlan — bukan bahwa kegiatan statistik selesai, disetujui BPS, atau lulus evaluasi resmi. Isian format kerja tidak disalin otomatis ke Ruang kerja.", kind="warn")

# =====================================================================
# BAB 10 — 44 subprocesses
# =====================================================================
h1("BAB 10  Dokumentasi 44 Subproses")
p("Bab ini menjelaskan seluruh 44 subproses GSBPM 5.2 sebagaimana tampil di Mode Terpandu. Kode dan nama subproses mengikuti Materi Proses Bisnis. Isi setiap bagian diambil dari aplikasi: **Tujuan** dari bagian Apa?, **Apa yang perlu dipahami** dari poin materi, **Format kerja** dan **Bukti dukung** dari panel format kerja, dan **Catatan** dari keterangan aplikasi serta butir checklist Ruang kerja.")
box("Cara memakai bab ini", ["Cara umum membuka kartu, mengisi format kerja, dan menandai sudah dipahami dijelaskan di BAB 9. Setiap entri di bawah ini hanya mencantumkan isian khusus subproses tersebut.",
                             "Subproses Fase 1 (1.1–1.6) dijelaskan lengkap di BAB 7 dan dirangkum di bagian 10.1."])
h2("10.1 Fase 1 — Specify Need (Identifikasi Kebutuhan)")
table(["Kode", "Nama subproses", "Tujuan singkat", "Uraian lengkap"],
      [[c["code"], c["official"], c["title"], f"Subbab 7.{i}"] for i, c in enumerate(PHASES[0]["cards"], 1)],
      "Subproses Fase 1 (uraian lengkap di BAB 7)", widths=[1.3, 5.8, 6.3, 3.0], size=9)
for ph in PHASES[1:]:
    h2(f"10.{ph['n']} Fase {ph['n']} — {PHASE_EN[ph['n'] - 1]} ({ph['title']})")
    p(f"{ph['explanation']} Materi Proses Bisnis, {ph['pdfRange']}. Jumlah subproses: {len(ph['cards'])}.", after=4)
    for c in ph["cards"]:
        subprocess_entry(c["code"])

# =====================================================================
# BAB 11 — Workspace
# =====================================================================
h1("BAB 11  Ruang Kerja (Workspace)")
p("Ruang kerja adalah tempat melihat dan melengkapi seluruh isi proyek. Mode Terpandu untuk belajar dan menyiapkan bahan; Ruang kerja untuk melengkapi data yang masuk ke draft dan memeriksa kesiapan ekspor.")
h2("11.1 Proyek saya")
p("Halaman **Proyek saya** menampilkan semua proyek di perangkat Anda. Bukalah dari menu **Proyek saya**.")
figure("21-proyek-saya", "Halaman Proyek saya", ["Tombol Perbarui demo / Muat demo"])
buttons_table([
    ["**Lanjutkan di Mode Terpandu**", "Melanjutkan belajar proyek terakhir.", "Klik pada kartu Lanjutkan pekerjaan.", "Mode Terpandu proyek terbuka."],
    ["**Buka ruang kerja**", "Membuka Ruang kerja proyek terakhir.", "Klik pada kartu Lanjutkan pekerjaan.", "Ruang kerja terbuka."],
    ["**Buka** (kartu proyek)", "Membuka proyek tertentu.", "Klik Buka pada baris proyek.", "Ruang kerja proyek terbuka."],
    ["Ikon tempat sampah", "Menghapus proyek.", "Klik ikon, lalu konfirmasi.", "Proyek terhapus dari perangkat."],
    ["**Muat demo** / **Perbarui demo**", "Memuat atau menyegarkan lima proyek demo.", "Klik di bagian Proyek demo.", "Proyek demo (contoh ilustratif) tampil."],
    ["**Bersihkan data demo**", "Menghapus proyek demo saja.", "Klik, lalu konfirmasi.", "Proyek demo hilang; proyek Anda tetap."],
    ["**Rencana baru**, **Pelajari contoh**", "Membuat rencana atau membuka contoh.", "Klik di kanan atas.", "Rencana baru atau contoh terbuka."],
], "Tombol di Proyek saya")
p("Bagian **Perlu perhatian** menampilkan hal yang paling perlu dilengkapi pada setiap proyek, dan **Ringkasan** menghitung jumlah Proyek, Siap ditinjau, dan Siap diekspor.", size=10)
box("Proyek demo", "Proyek demo (SKM, UMKM, kependudukan, padi, sarana pendidikan) adalah contoh ilustratif untuk latihan dan terpisah dari proyek Anda. Nama instansi, tanggal, dan status di dalamnya bukan data sungguhan.", kind="warn")
h2("11.2 Bagian atas Ruang kerja")
figure("22-workspace", "Ruang kerja — ringkasan proyek dan Langkah berikutnya", ["Fase saat ini, Checklist wajib, Draf dokumen", "Langkah berikutnya"])
table(["Bagian", "Fungsi", "Yang diperiksa"], [
    ["Nama proyek dan label jenis", "Identitas proyek (mis. Survei · Draf).", "Nama dan jenis kegiatan sudah benar."],
    ["**FASE SAAT INI**", "Fase proyek yang sedang dikerjakan di Alur kerja.", "—"],
    ["**CHECKLIST WAJIB**", "Persentase butir checklist wajib yang dicentang. “Minimal 80% untuk ekspor draf”.", "Sudah mencapai 80%."],
    ["**DRAF DOKUMEN**", "**Siap diunduh** atau **Belum siap**, dengan alasan singkat.", "Status Siap diunduh."],
    ["**Detail proyek**", "Penanggung jawab, klasifikasi, metode, portal rujukan, rekomendasi BPS, tanggal dibuat/diperbarui.", "Isian sesuai kegiatan."],
    ["**LANGKAH BERIKUTNYA**", "Hal paling penting untuk dikerjakan sekarang, dengan tombol langsung ke lokasinya (mis. **Buka Alur kerja**).", "Ikuti tombol yang disarankan."],
    ["**Lihat persyaratan ekspor**", "Menuju tab Ekspor.", "—"],
    ["**Salin tautan berbagi**", "Menyalin tautan berisi salinan proyek ke clipboard.", "Tautan dibuka penerima untuk mengimpor salinan proyek."],
    ["**Kembali ke Mode Terpandu**", "Kembali ke Mode Terpandu proyek.", "—"],
    ["Pilihan **Survei / Sensus / Kompromin**", "Mengubah jenis kegiatan; butir checklist menyesuaikan.", "Jenis kegiatan sesuai keputusan 1.5."],
], "Bagian atas Ruang kerja", widths=[4.2, 7.2, 5.0], size=9)
box("Menyimpan perubahan", "Perubahan di Ruang kerja tersimpan otomatis di browser. Keterangan “Draf tersimpan” beserta waktunya menunjukkan penyimpanan terakhir.", kind="tip")
h2("11.3 Sembilan tab Ruang kerja")
p("Setiap tab diawali kotak **CARA KERJA TAB INI** yang menjelaskan fungsi tab. Urutan tab:")
table(["Tab", "Fungsi", "Yang dapat dilakukan", "Yang harus diperiksa sebelum ekspor"], [
    ["**Timeline**", "Jadwal per fase (minggu ke- dan tanggal).", "Melihat jadwal.", "Periode sesuai rencana (BAB 8)."],
    ["**Alur kerja**", "Checklist per fase dan subproses; pemeriksaan portal rujukan; draf rekomendasi ke BPS (kegiatan sektoral).", "Mencentang butir, mencatat pemeriksaan portal, mengisi draf rekomendasi.", "Portal sudah dicek; butir 1.5 dan 2.6 ditandai."],
    ["**Checklist**", "Semua butir wajib dikelompokkan per fase.", "Mencentang butir yang sudah benar-benar disiapkan.", "Checklist wajib ≥ 80%."],
    ["**Perancangan**", "Cara, metode, dan moda pengumpulan; sampling (survei).", "Memilih cara/metode/moda; memakai kalkulator ukuran sampel.", "Cara pengumpulan terisi."],
    ["**Variabel**", "Manajer variabel dan ringkasan indikator.", "Menambah, mengubah, menghapus variabel.", "Setiap variabel punya nama dan definisi (BAB 12)."],
    ["**Instrumen**", "Rancangan pertanyaan (survei/sensus) atau pemetaan sumber (kompromin).", "Menambah dan mengubah pertanyaan.", "Instrumen tersusun (BAB 12)."],
    ["**Metadata**", "Draft MS-Keg, MS-Var, MS-Ind.", "Mengisi kolom metadata.", "MS-Keg lengkap (BAB 13)."],
    ["**Riwayat**", "Waktu dibuat, diubah, dan pemeriksaan portal dicatat.", "Melihat riwayat.", "Tidak memengaruhi ekspor."],
    ["**Ekspor**", "Tinjauan sebelum ekspor dan unduh draft.", "Memeriksa kekurangan dan mengunduh .docx.", "Tidak ada temuan “Perlu dilengkapi” (BAB 14–16)."],
], "Tab Ruang kerja", widths=[2.4, 4.6, 4.6, 4.8], size=9)
h3("Tab Alur kerja")
p("Di sebelah kiri terdapat **KELOMPOK PEMBELAJARAN** berisi delapan fase dengan persentase kemajuannya. Pilih fase, lalu pilih subproses (misalnya **1.5 Pemeriksaan Ketersediaan & Kelayakan Data**). Setiap subproses menampilkan penjelasan, **Contoh ilustrasi** sesuai topik, butir **CHECKLIST** (bertanda * bila wajib), dan tombol **Lanjut ke …**.")
figure("26-tab-alur-kerja", "Tab Alur kerja (proyek demo)", ["Tab Alur kerja"])
p("Kotak khusus di tab Alur kerja:", keep=True)
bullets([
    "**Pemeriksaan portal rujukan statistik** (subproses 1.5): kotak **Sudah mengecek sirusa.web.bps.go.id**, **Sudah mengecek romantik.bps.go.id**, dan **Catatan hasil pengecekan**. Lihat BAB 14.",
    "**Draf rekomendasi kegiatan statistik ke BPS** (fase Perancangan, kegiatan sektoral): isian **Nama kegiatan**, **Penyelenggara**, **Tujuan kegiatan**, **Periode pelaksanaan**, dan **Catatan tambahan**; klik **Ubah** untuk mengedit.",
])
box("Draf rekomendasi bukan pengajuan", "Materi Proses Bisnis menyebut penyelenggara statistik sektoral mengajukan permintaan rekomendasi kegiatan statistik ke BPS (Hal. 17 & 23). StatPlan hanya membantu menyiapkan bahannya; pengajuan tetap dilakukan melalui prosedur yang berlaku. Di draft, statusnya selalu “Belum diverifikasi”.", kind="warn")
h3("Tab Checklist")
p("Menampilkan semua butir checklist per fase dengan kode subproses (mis. “1.1 Masalah kebijakan sudah dirumuskan”). Butir yang tidak relevan dengan jenis kegiatan tidak ditampilkan. Centang hanya butir yang sudah benar-benar Anda siapkan.")
figure("27-tab-checklist", "Tab Checklist (proyek demo)", ["Tab Checklist"])
h3("Tab Perancangan")
table(["Isian", "Keterangan"], [
    ["**Cara pengumpulan**", "Survei, Sensus, atau Kompromin. Mengubah cara pengumpulan juga menyesuaikan jenis kegiatan dan checklist yang relevan."],
    ["**Metode pengumpulan**", "Wawancara, pengisian mandiri, atau observasi lapangan."],
    ["**Moda pengumpulan**", "PAPI (kertas), CAPI (tablet), CATI (telepon), atau CAWI (daring)."],
    ["**Metode sampling (Design 2.4)**", "Khusus survei: metode pemilihan sampel."],
    ["**Ukuran sampel**", "Khusus survei: jumlah sampel yang direncanakan."],
    ["**Kalkulator ukuran sampel**", "Isi **Populasi (N)**, **Margin error (e) %**, dan pilih **Rumus** (**Yamane** atau **Z + koreksi populasi**), lalu klik **Terapkan ke ukuran sampel**. Hasilnya ilustratif dan perlu ditinjau ahli metodologi."],
], "Isian tab Perancangan", widths=[4.6, 11.8], size=9.5)
figure("28-tab-perancangan", "Tab Perancangan (proyek demo)", ["Tab Perancangan"])
h3("Tab Riwayat")
p("Menampilkan waktu proyek **Dibuat**, **Terakhir diubah**, dan **Pemeriksaan portal dicatat**. StatPlan hanya menyimpan waktu tersebut — bukan catatan setiap aktivitas. Tab ini tidak memengaruhi ekspor.")
figure("32-tab-riwayat", "Tab Riwayat (proyek demo)", ["Tab Riwayat"])

# =====================================================================
# BAB 12
# =====================================================================
h1("BAB 12  Variabel, Indikator, dan Instrumen")
h2("12.1 Pengertian sederhana")
table(["Istilah", "Arti sederhana", "Contoh ilustratif (proyek demo SKM)"], [
    ["Variabel", "Informasi yang dikumpulkan dari setiap responden/unit (Materi Proses Bisnis, Hal. 19).", ", ".join(v["name"] for v in D["skm"]["variables"])],
    ["Indikator", "Angka ringkas yang dihitung dari variabel untuk menggambarkan suatu keadaan.", "; ".join(f"{i['name']} = {i['formula']}" for i in D["skm"]["indicators"][:1])],
    ["Instrumen", "Alat pengumpulan data, misalnya kuesioner atau panduan (Materi Proses Bisnis, Hal. 24).", "; ".join(f"{q['number']}. {q['text']}" for q in D["skm"]["questions"][:3])],
], "Variabel, indikator, dan instrumen", widths=[2.6, 6.0, 7.8], size=9)
p("Hubungan ketiganya: **pertanyaan pada instrumen** menghasilkan **nilai variabel**, lalu **indikator** dihitung dari variabel. Karena itu setiap indikator mencantumkan variabel terkait, dan setiap variabel sebaiknya memiliki pertanyaan atau sumber data.")
h2("12.2 Mengisi tab Variabel")
step(13, "Tambah dan lengkapi variabel", "Menyusun daftar variabel kegiatan.",
     ["Buka Ruang kerja, tab **Variabel**.", "Klik **+ Tambah** untuk menambah variabel.", "Isi **Nama variabel*** dan **Definisi** terlebih dahulu.", "Lengkapi **Kategori**, **Tipe data**, **Skala**, **Satuan**, **Sumber**, **Contoh nilai**, dan **Aturan nilai hilang**.", "Gunakan tombol **Pindah ke atas/bawah**, **Duplikat variabel**, atau **Hapus variabel** bila perlu."],
     "Variabel tersimpan otomatis dan tampil di draft (bagian Variabel).",
     "Setiap isian memiliki tombol bantuan **Cara mengisi: …**. Tautan **Apa itu variabel?** membuka penjelasan FAQ.")
table(["Isian", "Yang ditulis", "Contoh ilustratif"], [
    ["Nama variabel*", "Nama singkat variabel.", D["skm"]["variables"][2]["name"]],
    ["Definisi", "Definisi operasional yang jelas dan dapat diukur.", D["skm"]["variables"][2]["definition"]],
    ["Tipe data / Skala", "Kategorik, numerik, teks, atau tanggal; skala nominal/ordinal/interval/rasio.", f"{D['skm']['variables'][2]['type']} / {D['skm']['variables'][2]['scale']}"],
    ["Satuan", "Satuan ukuran, bila ada.", D["skm"]["variables"][2]["unit"] or "—"],
    ["Contoh nilai", "Contoh isian yang wajar.", D["skm"]["variables"][2]["example"] or "—"],
    ["Aturan nilai hilang", "Cara mencatat jawaban kosong/tidak tahu.", D["skm"]["variables"][2]["missing"] or "—"],
], "Isian variabel", widths=[3.6, 6.0, 6.8], size=9)
figure("29-tab-variabel", "Tab Variabel — Manajer variabel (proyek demo)", ["Tab Variabel"])
h2("12.3 Indikator")
p("Di bawah Manajer variabel terdapat bagian **Indikator** yang menampilkan nama indikator, rumus, dan variabel terkait. Definisi dan satuan indikator dilengkapi pada draft metadata **MS-Ind** (BAB 13).")
h2("12.4 Mengisi tab Instrumen")
step(14, "Susun pertanyaan instrumen", "Menyusun rancangan kuesioner (survei/sensus).",
     ["Buka tab **Instrumen**.", "Klik **Tambah** untuk menambah pertanyaan.", "Isi **No.**, **Teks pertanyaan***, pilih **Tipe** (Terbuka, Tertutup, atau Skala), dan isi **Opsi jawaban** untuk pertanyaan tertutup/skala.", "Gunakan **Duplikat pertanyaan** atau **Hapus pertanyaan** bila perlu."],
     "Pertanyaan tersimpan otomatis dan tampil di draft (Lampiran B).",
     "Untuk kompromin tidak ada kuesioner; tab ini dipakai untuk mendokumentasikan pemetaan variabel ke sumber data administrasi.")
figure("30-tab-instrumen", "Tab Instrumen — Rancangan instrumen (proyek demo)", ["Tab Instrumen"])
box("Tips instrumen", "Susun pertanyaan runtut dan singkat, hindari pertanyaan ganda atau mengarahkan, dan samakan opsi jawaban dengan kategori variabel (Materi Proses Bisnis, Build 3.1).", kind="tip")

# =====================================================================
# BAB 13
# =====================================================================
h1("BAB 13  Metadata")
p("Metadata adalah informasi dalam struktur dan format baku untuk menggambarkan dan menjelaskan data (Materi Proses Bisnis, Hal. 58). StatPlan menyediakan tiga draft metadata mengikuti arah Peraturan BPS Nomor 5 Tahun 2020:")
table(["Bagian", "Menjelaskan", "Kolom (tanda * = wajib)"], [
    ["**MS-Keg**", "Kegiatan statistik", "; ".join(f["label"] + (" *" if f["required"] else "") for f in D["metadata"]["keg"])],
    ["**MS-Var**", "Variabel", "; ".join(f["label"] + (" *" if f["required"] else "") for f in D["metadata"]["var"])],
    ["**MS-Ind**", "Indikator", "; ".join(f["label"] + (" *" if f["required"] else "") for f in D["metadata"]["ind"])],
], "Draft metadata di StatPlan", widths=[2.4, 3.2, 10.8], size=9)
step(15, "Isi draft metadata", "Melengkapi metadata yang diperlukan untuk ekspor.",
     ["Buka tab **Metadata**.", "Lengkapi **MS-Keg** terlebih dahulu — seluruh kolom bertanda * wajib untuk ekspor.", "Lengkapi **MS-Var** dan **MS-Ind**.", "Periksa tanda **Lengkap** di atas setiap bagian."],
     "Kolom yang terisi bertanda “Lengkap”; draft memuat bagian Draft Metadata.",
     "Tautan **Mengapa metadata diperlukan?** membuka penjelasan FAQ.")
figure("31-tab-metadata", "Tab Metadata — MS-Keg, MS-Var, MS-Ind (proyek demo)", ["Tab Metadata"])
box("DRAFT METADATA", "Metadata di StatPlan adalah rancangan. Di dokumen hasil ekspor bagian ini berjudul “Draft Metadata” dengan keterangan: struktur metadata merupakan rancangan yang perlu disesuaikan dan diverifikasi sesuai ketentuan yang berlaku. StatPlan tidak mengirim atau mendaftarkan metadata ke sistem BPS.", kind="warn")
h2("13.1 Yang diperiksa sebelum ekspor")
bullets(["MS-Keg lengkap: tanpa ini draft tidak dapat diunduh.", "Nama kegiatan dan penyelenggara di MS-Keg sama dengan identitas proyek.", "MS-Var dan MS-Ind (disarankan) menjelaskan variabel dan indikator utama."])

# =====================================================================
# BAB 14
# =====================================================================
h1("BAB 14  Pemeriksaan dan Validasi")
p("Pemeriksaan (validasi) di StatPlan adalah pemeriksaan kelengkapan draft oleh aturan StatPlan. Hasilnya ditampilkan di tab **Ekspor**, bagian **TINJAUAN SEBELUM EKSPOR**, dan diringkas di kartu **Langkah berikutnya** Ruang kerja.")
box("Validasi StatPlan bukan persetujuan BPS", "Tinjauan ini dibuat oleh aturan StatPlan untuk membantu kelengkapan draft — bukan validasi resmi BPS dan tidak menjamin kebenaran metodologi.", kind="warn")
h2("14.1 Cara mengetahui bagian yang belum lengkap")
step(16, "Buka tinjauan sebelum ekspor", "Melihat daftar kekurangan.",
     ["Di Ruang kerja, klik tab **Ekspor** (atau **Lihat persyaratan ekspor**).", "Baca bagian **TINJAUAN SEBELUM EKSPOR**.", "Klik **Mengapa & cara memperbaiki** untuk membaca alasan dan cara memperbaiki."],
     "Daftar temuan dikelompokkan menjadi **Perlu dilengkapi** dan **Perlu ditinjau**.")
figure("23-validasi", "Tinjauan sebelum ekspor pada proyek yang belum lengkap", ["Tinjauan sebelum ekspor", "Tombol perbaikan Buka pemeriksaan portal"])
table(["Kelompok / status", "Arti", "Pengaruh pada ekspor"], [
    ["**Perlu dilengkapi**", "Kekurangan yang wajib diselesaikan.", "Menghalangi unduhan draft."],
    ["**Perlu ditinjau**", "Saran perbaikan.", "Tidak menghalangi unduhan draft."],
    ["**Sudah siap ditinjau**", "Tidak ada yang perlu dilengkapi untuk draft ini.", "Tombol Unduh draf perencanaan aktif."],
], "Kelompok hasil pemeriksaan", widths=[4.0, 6.4, 6.0], size=9.5)
h2("14.2 Daftar temuan dan cara memperbaikinya")
V = D["validation"]
SEV = {"portal_sdi": "Perlu dilengkapi", "checklist_incomplete": "Perlu dilengkapi", "rekomendasi_required": "Perlu dilengkapi (sektoral)", "metadata_keg": "Perlu dilengkapi",
       "jenis_undocumented": "Perlu ditinjau", "rekomendasi_form": "Perlu ditinjau (sektoral)", "metadata_var": "Perlu ditinjau", "metadata_ind": "Perlu ditinjau",
       "no_variables": "Perlu ditinjau", "variable_def": "Perlu ditinjau", "design_cara": "Perlu ditinjau", "no_questionnaire": "Perlu ditinjau (survei/sensus)", "sampling_design": "Perlu ditinjau (survei)"}
LOC = {"portal_sdi": "Alur kerja → 1.5 (portal)", "checklist_incomplete": "Tab Checklist", "rekomendasi_required": "Alur kerja → Perancangan (2.6)", "metadata_keg": "Tab Metadata (MS-Keg)",
       "jenis_undocumented": "Alur kerja → 1.5", "rekomendasi_form": "Alur kerja → Draf rekomendasi", "metadata_var": "Tab Metadata (MS-Var)", "metadata_ind": "Tab Metadata (MS-Ind)",
       "no_variables": "Tab Variabel", "variable_def": "Tab Variabel", "design_cara": "Tab Perancangan", "no_questionnaire": "Tab Instrumen", "sampling_design": "Alur kerja → 2.4"}
assert set(SEV) == set(V), set(V) ^ set(SEV)
table(["Temuan (judul di aplikasi)", "Status", "Arti", "Cara memperbaiki", "Tombol → lokasi"],
      [[V[k]["title"], SEV[k], V[k]["why"], V[k]["fix"], f"**{V[k]['cta']}** → {LOC[k]}"] for k in SEV],
      "Temuan pemeriksaan StatPlan", widths=[3.4, 2.4, 3.8, 3.8, 3.0], size=8.5)
h2("14.3 Contoh perbaikan: pemeriksaan portal rujukan")
step(17, "Catat pemeriksaan portal rujukan", "Menyelesaikan temuan “Pemeriksaan portal rujukan belum dicatat”.",
     ["Periksa sendiri ketersediaan data di sirusa.web.bps.go.id dan romantik.bps.go.id (serta Portal SDI bila relevan) melalui browser.",
      "Di tab Ekspor, klik **Buka pemeriksaan portal**. Alur kerja langsung terbuka pada subproses 1.5.",
      "Centang **Sudah mengecek sirusa.web.bps.go.id** dan **Sudah mengecek romantik.bps.go.id**.",
      "Tulis hasilnya di **Catatan hasil pengecekan**.",
      "Centang butir checklist 1.5 yang sudah dilakukan."],
     "Pemeriksaan portal berstatus “Sudah dikonfirmasi” dan temuan hilang dari tinjauan.",
     "StatPlan tidak memeriksa portal secara otomatis; centang hanya setelah Anda benar-benar memeriksanya.")
figure("24-portal", "Alur kerja subproses 1.5 — pemeriksaan portal rujukan", ["Pemeriksaan portal rujukan statistik", "Sudah mengecek sirusa.web.bps.go.id", "Sudah mengecek romantik.bps.go.id"])
h2("14.4 Kapan memeriksa ulang")
bullets(["Setiap kali Anda mengubah isian yang terkait dengan temuan — tinjauan diperbarui otomatis.", "Sebelum menekan **Unduh draf perencanaan**.", "Setelah memperbaiki kesalahan yang ditemukan pada draft hasil unduhan."])

# =====================================================================
# BAB 15
# =====================================================================
h1("BAB 15  Menyiapkan Draft Perencanaan")
p("Sebelum mengekspor, periksa hal berikut. Kolom “Lokasi” menunjukkan tempat memeriksanya di aplikasi.")
table(["☐", "Yang diperiksa", "Lokasi"], [
    ["☐", "Identitas kegiatan: nama, penyelenggara, penanggung jawab, cakupan wilayah", "Tab Metadata (MS-Keg); Detail proyek"],
    ["☐", "Jenis kegiatan (Survei/Sensus/Kompromin) sesuai keputusan", "Bagian atas Ruang kerja; Alur kerja 1.5"],
    ["☐", "Tujuan kegiatan", "MS-Keg “Tujuan kegiatan”; hasil yang dipilih di Rencana baru"],
    ["☐", "Timeline dan periode", "Tab Timeline"],
    ["☐", "Pemeriksaan portal rujukan dicatat", "Alur kerja → 1.5"],
    ["☐", "Cara, metode, dan moda pengumpulan; sampling (survei)", "Tab Perancangan"],
    ["☐", "Variabel lengkap dengan definisi", "Tab Variabel"],
    ["☐", "Indikator dan rumusnya", "Tab Variabel (bagian Indikator); MS-Ind"],
    ["☐", "Instrumen / pemetaan sumber data", "Tab Instrumen"],
    ["☐", "Draft metadata MS-Keg lengkap; MS-Var dan MS-Ind", "Tab Metadata"],
    ["☐", "Checklist GSBPM wajib ≥ 80% dan hanya butir yang benar-benar disiapkan", "Tab Checklist"],
    ["☐", "Draf rekomendasi ke BPS (kegiatan sektoral)", "Alur kerja → Perancangan"],
    ["☐", "Tidak ada temuan “Perlu dilengkapi”; temuan “Perlu ditinjau” sudah dipertimbangkan", "Tab Ekspor"],
    ["☐", "Isian contoh ilustratif sudah diganti dengan data kegiatan Anda", "Semua tab"],
], "Checklist sebelum ekspor", widths=[0.9, 9.3, 6.2], size=9.5)
box("Checklist StatPlan ≠ kelengkapan BPS", "Checklist dan pemeriksaan di StatPlan adalah alat bantu internal untuk menghasilkan draft. Keduanya bukan daftar kelengkapan atau persetujuan BPS.", kind="warn")

# =====================================================================
# BAB 16
# =====================================================================
h1("BAB 16  Ekspor dan Unduh Draft")
diagram([
    ("Perencanaan", "Rencana baru, Mode Terpandu, Ruang kerja"),
    ("Pemeriksaan", "Tab Ekspor — Tinjauan sebelum ekspor"),
    ("Validasi", "Tidak ada temuan Perlu dilengkapi"),
    ("Ekspor", "Klik Unduh draf perencanaan"),
    ("Unduh DOCX", "Berkas tersimpan di folder unduhan"),
    ("Tinjau dokumen", "Baca draft bersama tim/ahli"),
    ("Perbaiki bila perlu", "Kembali ke StatPlan dan ubah isian"),
    ("Ekspor ulang", "Unduh draft versi terbaru"),
], "flow-ekspor.png", "Alur ekspor dan perbaikan draft", "Diagram (bukan tangkapan layar).", width=9.0)
step(18, "Buka halaman ekspor", "Menuju tempat mengunduh draft.",
     ["Di Ruang kerja, klik tab **Ekspor**; atau klik **Lihat persyaratan ekspor**; atau di Mode Terpandu selesai klik **Unduh draf**."],
     "Tab Ekspor terbuka dengan kartu **Draf rencana kegiatan** dan **TINJAUAN SEBELUM EKSPOR**.")
figure("33-ekspor", "Tab Ekspor pada proyek yang siap diunduh (proyek demo)", ["Status Sudah siap ditinjau", "Tombol Unduh draf perencanaan"])
h2("16.1 Apa yang ditampilkan di tab Ekspor")
table(["Bagian", "Isi"], [
    ["**Draf rencana kegiatan**", "Label “Draf bahan kerja — bukan dokumen resmi BPS” dan daftar isi draft: Identitas kegiatan, Pemeriksaan portal rujukan, Perancangan, Variabel & indikator, Instrumen, Draf rekomendasi BPS (sektoral), Timeline, Checklist GSBPM 5.2, Metadata — masing-masing dengan status singkat."],
    ["**TINJAUAN SEBELUM EKSPOR**", "Status kelengkapan: **Sudah siap ditinjau**, atau daftar **Perlu dilengkapi** dan **Perlu ditinjau** (BAB 14)."],
    ["**Unduh draf perencanaan**", "Tombol ekspor. Aktif bila tidak ada temuan Perlu dilengkapi; jika belum, tampil jumlah hal yang perlu dilengkapi."],
    ["**Apakah hasil ini dokumen resmi BPS?**", "Tautan ke jawaban FAQ."],
], "Isi tab Ekspor", widths=[4.6, 11.8], size=9.5)
step(19, "Unduh draft", "Menghasilkan dan mengunduh berkas .docx.",
     ["Pastikan status **Sudah siap ditinjau**.", "Klik **Unduh draf perencanaan**.", "Tunggu beberapa detik; dokumen disusun di perangkat Anda tanpa diunggah ke server.", "Perhatikan pemberitahuan “Ekspor berhasil — draf dokumen diunduh”."],
     "Berkas bernama **StatPlan-<nama-kegiatan>.docx** tersimpan di folder unduhan browser (umumnya folder **Downloads/Unduhan**). Status proyek menjadi **Siap ditinjau**.",
     "Jika muncul “Ekspor gagal. Coba lagi.”, klik tombol unduh sekali lagi.")
h2("16.2 Membuka dan membaca berkas")
numbered([
    "Buka folder unduhan browser (di Chrome: menu unduhan, lalu **Tampilkan di folder**).",
    "Klik dua kali berkas **StatPlan-….docx** untuk membukanya di Microsoft Word.",
    "Jika Word menampilkan tampilan terproteksi (Protected View), klik **Enable Editing/Aktifkan Pengeditan** bila ingin mengubah isi.",
    "Baca draft dari sampul sampai lampiran. Struktur dokumen dijelaskan di BAB 17.",
])
h2("16.3 Yang diperiksa setelah unduh")
bullets(["Nama kegiatan, penyelenggara, dan periode pada sampul dan Informasi Dokumen.", "Ringkasan Perencanaan sesuai kebutuhan dan tujuan.", "Variabel, indikator, dan instrumen lengkap dan konsisten.", "Timeline sesuai rencana.", "Tidak ada isian contoh ilustratif yang tertinggal.", "Bagian Catatan dan Batasan dibaca dan dipahami."])
h2("16.4 Jika ada data yang salah")
step(20, "Perbaiki dan ekspor ulang", "Memperbarui draft setelah menemukan kesalahan.",
     ["Kembali ke StatPlan dan buka proyek dari **Proyek saya** → **Buka**.", "Perbaiki isian di tab terkait (lihat kolom Lokasi pada BAB 15).", "Buka tab **Ekspor** dan pastikan status **Sudah siap ditinjau**.", "Klik **Unduh draf perencanaan** lagi."],
     "Berkas draft baru terunduh dengan data terbaru.",
     "Perbaikan di Word tidak kembali ke StatPlan. Agar draft berikutnya tetap benar, lakukan perbaikan di StatPlan lalu ekspor ulang. Berkas lama dapat dihapus atau diganti namanya.")
box("Hasil akhir adalah draft", "Berkas hasil ekspor adalah DRAFT PERENCANAAN KEGIATAN STATISTIK — bukan dokumen resmi BPS. Tinjau bersama tim, pimpinan, atau ahli metodologi sebelum dipakai dalam proses resmi.", kind="warn")

# =====================================================================
# BAB 17
# =====================================================================
h1("BAB 17  Memahami Dokumen Hasil Ekspor")
p("Struktur di bawah ini diambil dari dokumen yang benar-benar dihasilkan StatPlan 1.0.0.")
npages = draft_pages_figure("Halaman awal draft hasil unduhan: sampul, Informasi Dokumen dan Daftar Isi, Ringkasan Perencanaan")
table(["Bagian dokumen", "Isi dan cara membacanya"], [
    ["Sampul", "Identitas StatPlan (tanpa kop instansi), judul “DRAFT PERENCANAAN KEGIATAN STATISTIK”, nama kegiatan, penyelenggara, jenis dan klasifikasi, periode, serta kotak “DRAFT — BUKAN DOKUMEN RESMI BPS”."],
    ["Informasi Dokumen", "Nama kegiatan, jenis, klasifikasi, penyelenggara, periode, versi draft (waktu ekspor), tanggal dibuat, status, dan versi StatPlan."],
    ["Daftar Isi", "Daftar 14 bagian dan lampiran."],
    ["1. Ringkasan Perencanaan", "Kebutuhan utama, tujuan, output, metode, periode, status — dan kotak **Status Perencanaan**: persentase checklist StatPlan, dengan keterangan bahwa angka ini bukan bukti kegiatan selesai atau disetujui."],
    ["2. Informasi Kegiatan", "Identitas kegiatan dan **Dasar Perencanaan** (GSBPM 5.2, Materi Proses Bisnis, StatPlan sebagai alat bantu)."],
    ["3. Kebutuhan dan Tujuan", "A. Kebutuhan, B. Permasalahan, C. Tujuan, D. Output, E. Pengguna hasil — dari Rencana baru dan format kerja 1.1–1.3. Bagian yang belum diisi tertulis “Belum diuraikan di StatPlan”."],
    ["4. Saran Awal StatPlan", "Saran awal metode dari aturan sederhana StatPlan, tanpa persentase, beserta alasannya. Bukan keputusan atau rekomendasi resmi BPS."],
    ["5. Perancangan Pengumpulan", "Cara, metode, moda, sampling, kerangka sampel, ukuran sampel; untuk kegiatan sektoral juga draf informasi pengajuan rekomendasi berstatus “Belum diverifikasi”."],
    ["6–8. Variabel, Indikator, Instrumen", "Tabel variabel (definisi, tipe/skala, satuan, contoh, nilai hilang), tabel indikator, dan ringkasan instrumen."],
    ["9. Timeline", "Tabel fase dan periode serta gambaran jadwal (batang per minggu), dengan catatan “Contoh jadwal perencanaan — bukan durasi wajib BPS.”"],
    ["10. Pemeriksaan Sumber / Portal Rujukan", "Status SIRuSa dan Romantik sesuai catatan pengguna, tanggal, dan catatan. StatPlan tidak memverifikasi portal secara otomatis."],
    ["11. Ringkasan GSBPM", "Delapan fase: jumlah subproses, status checklist, dan output kunci."],
    ["12. Ringkasan Validasi", "Status, Temuan, Dampak, Tindakan — dari pemeriksaan kelengkapan StatPlan; bukan validasi resmi BPS."],
    ["13. Draft Metadata", "MS-Keg, MS-Var, MS-Ind sebagai rancangan yang perlu disesuaikan dan diverifikasi."],
    ["14. Catatan dan Batasan", "Status draft, batasan StatPlan, rujukan halaman materi."],
    ["Lampiran A", "Checklist GSBPM 5.2 per subproses (✓ ditandai, ☐ belum)."],
    ["Lampiran B", "Draf instrumen: daftar pertanyaan dan pilihan jawaban (bila ada)."],
    ["Kaki halaman", "“StatPlan · Draft Perencanaan Kegiatan Statistik · Bukan dokumen resmi BPS · Halaman X dari Y”."],
], "Struktur dokumen hasil ekspor", widths=[4.2, 12.2], size=9)
box("Dokumen adalah draft perencanaan", "Seluruh isi dokumen berasal dari isian proyek Anda. Dokumen ini adalah bahan kerja untuk ditinjau — bukan dokumen resmi, persetujuan, atau rekomendasi BPS.", kind="warn")

# =====================================================================
# BAB 18
# =====================================================================
h1("BAB 18  Kesalahan Umum dan Solusinya")
table(["Situasi", "Penyebab", "Solusi"], [
    ["Belum tahu harus mulai dari mana", "Belum pernah menyusun kegiatan statistik.", "Buka **Pelajari contoh** (BAB 5), lalu **Gunakan contoh ini untuk membuat rencana**; atau klik **Bingung mulai dari mana?** di Rencana baru."],
    ["Tombol Lanjutkan di Langkah 1 tidak aktif", "Cerita kebutuhan kurang dari 12 karakter.", "Tulis satu–dua kalimat kebutuhan, atau pilih contoh kalimat."],
    ["Belum tahu apa yang harus diisi", "Istilah atau isian belum dipahami.", "Baca bagian **Apa?** dan **Contoh** pada kartu subproses (BAB 9–10), tombol **Cara mengisi: …**, atau menu **FAQ**."],
    ["Timeline belum sesuai", "Tanggal atau pembagian fase kurang tepat.", "Sebelum proyek dibuat: ubah tanggal atau klik **Sesuaikan jadwal** (BAB 8). Setelah proyek dibuat: tanggal tidak dapat diubah — buat rencana baru."],
    ["Fase berikutnya terkunci di Mode Terpandu", "Fase sebelumnya belum diselesaikan.", "Tandai semua subproses **Sudah dipahami**, lalu klik **Selesai memahami tahap ini**."],
    ["Tombol Selesai memahami tahap ini tidak aktif", "Masih ada subproses yang belum ditandai.", "Buka kartu yang belum bertanda dan klik **Tandai sudah dipahami**."],
    ["Masih ada bagian belum lengkap", "Ada temuan pemeriksaan.", "Buka tab **Ekspor** → **TINJAUAN SEBELUM EKSPOR**, lalu klik tombol perbaikan pada setiap temuan (BAB 14)."],
    ["Draft belum bisa diekspor", "Masih ada temuan **Perlu dilengkapi**.", "Selesaikan: pemeriksaan portal, checklist wajib ≥ 80%, MS-Keg lengkap, dan persiapan rekomendasi (sektoral)."],
    ["Isian format kerja tidak muncul di Ruang kerja/draft", "Format kerja Mode Terpandu tidak disalin otomatis ke tab Ruang kerja.", "Isi juga bagian terkait di Ruang kerja (mis. Variabel, Metadata). Isian 1.1–1.3 dan 2.4 dipakai pada draft bagian Kebutuhan dan Tujuan serta Perancangan."],
    ["Data yang sudah diisi ingin diubah", "Perubahan rencana.", "Buka proyek dari **Proyek saya** → **Buka**, lalu ubah di tab terkait; atau buka kembali format kerja di Mode Terpandu."],
    ["Proyek tidak ditemukan", "Dibuka dari perangkat/browser lain, atau data browser dihapus.", "Buka dari perangkat dan browser yang sama. Untuk memindahkan salinan, gunakan **Salin tautan berbagi**."],
    ["Sudah unduh tetapi menemukan kesalahan", "Isian di StatPlan keliru.", "Kembali ke StatPlan, perbaiki, periksa tab Ekspor, lalu **Unduh draf perencanaan** lagi (BAB 16.4)."],
    ["Muncul “Proyek terlalu besar untuk tautan …”", "Proyek terlalu besar untuk dibagikan lewat tautan.", "Bagikan berkas draft .docx sebagai gantinya."],
], "Kesalahan umum dan solusinya", widths=[4.2, 4.4, 7.8], size=9)

# =====================================================================
# BAB 19
# =====================================================================
h1("BAB 19  FAQ Pengguna")
p(f"Halaman FAQ (menu **FAQ**) berisi {len(D['faq'])} pertanyaan dalam {len(D['faqCats'])} kategori, dilengkapi kotak pencarian. Berikut pertanyaan yang paling relevan untuk penggunaan operasional, dikutip dari aplikasi.")
figure("34-faq", "Halaman FAQ — pencarian dan kategori", ["Kotak pencarian"])
FAQ_PICK = ["mulai-dari-mana", "perlu-paham-gsbpm", "harus-urut", "survei-sensus-kompilasi", "cek-data-tersedia", "belum-bisa-ekspor",
            "siap-ditinjau", "word-resmi", "persetujuan-bps", "sistem-resmi", "ubah-rencana", "tersimpan-di-mana", "kembali-langkah",
            "langkah-belum-selesai", "contoh-ilustratif", "masih-bingung"]
FAQ = {f["id"]: f for f in D["faq"]}
CAT = {c["id"]: c["label"] for c in D["faqCats"]}
for fid in FAQ_PICK:
    f = FAQ[fid]
    p(f["q"], bold=True, color=NAVY, after=1, before=6, keep=True)
    for a in f["a"]:
        if isinstance(a, list):
            bullets(a)
        else:
            p(a, after=2)
    src = f["source"]
    lab = "Penjelasan StatPlan" if src["kind"] == "STATPLAN" else ("Menurut Materi Proses Bisnis" if src["kind"] == "A" else "Penjelasan sederhana") + (f" · Hal. {src.get('page')}" if src.get("page") else "")
    p(f"Kategori FAQ: {CAT[f['category']]} · {lab}", italic=True, size=8.5, color=GRAY, after=4)

# =====================================================================
# BAB 20
# =====================================================================
h1("BAB 20  Checklist Pengguna")
p("Halaman ini dapat dicetak dan dipakai sebagai checklist kerja.", italic=True, size=9.5, color=GRAY)
CK = [
    ("Sebelum mulai", ["Perangkat, browser, dan koneksi internet siap.", "Informasi kebutuhan, pengguna, dan periode kegiatan dikumpulkan sebisanya.", "Contoh kegiatan sudah dipelajari (bila belum berpengalaman)."]),
    ("Saat perencanaan", ["Cerita kebutuhan ditulis (Langkah 1).", "Jenis kegiatan dipilih/diperiksa.", "Hasil yang diinginkan ditetapkan (Langkah 2).", "Tanggal mulai–selesai dan pembagian fase diperiksa (Langkah 3)."]),
    ("Saat Mode Terpandu", ["Setiap kartu dibaca: Apa?, Contoh, Yang bisa dipelajari.", "Format kerja diisi (minimal kolom wajib).", "Status bukti dukung dicatat.", "Setiap subproses ditandai Sudah dipahami; setiap fase diselesaikan."]),
    ("Saat pemeriksaan", ["Portal rujukan diperiksa sendiri dan dicatat (1.5).", "Checklist wajib ≥ 80% dengan butir yang benar-benar disiapkan.", "MS-Keg lengkap; MS-Var dan MS-Ind dilengkapi.", "Variabel, indikator, dan instrumen diperiksa.", "Draf rekomendasi disiapkan (kegiatan sektoral)."]),
    ("Sebelum ekspor", ["Tidak ada temuan Perlu dilengkapi.", "Temuan Perlu ditinjau sudah dipertimbangkan.", "Isian contoh ilustratif sudah diganti."]),
    ("Setelah unduh", ["Berkas .docx dibuka dan dibaca seluruhnya.", "Kesalahan diperbaiki di StatPlan, lalu diekspor ulang.", "Draft ditinjau bersama tim/ahli metodologi.", "Semua pihak memahami bahwa dokumen adalah DRAFT — bukan dokumen resmi BPS."]),
]
for title, items in CK:
    p(title, bold=True, color=NAVY, size=11, after=1, before=5, keep=True)
    for it in items:
        par = p(f"☐  {it}", after=1)
        par.paragraph_format.left_indent = Cm(0.4)

# =====================================================================
# LAMPIRAN
# =====================================================================
h1("Lampiran A  Ringkasan 8 Fase GSBPM")
table(["Fase", "Nama", "Tujuan singkat", "Subproses"],
      [[str(ph["n"]), f"{PHASE_EN[ph['n'] - 1]} ({ph['title']})", ph["purpose"], str(len(ph["cards"]))] for ph in PHASES] + [["", "Jumlah", "", "44"]],
      "Ringkasan 8 fase GSBPM 5.2", widths=[1.2, 4.6, 8.6, 2.0], size=9)
p("Sumber: struktur fase dan subproses StatPlan yang merujuk Materi Proses Bisnis (Hal. 6 dan halaman tiap fase).", size=9, color=GRAY)

h1("Lampiran B  Daftar 44 Subproses")
rows = []
for ph in PHASES:
    for c in ph["cards"]:
        rows.append([c["code"], c["official"], f"{ph['n']}. {PHASE_EN[ph['n'] - 1]}", str(c["page"])])
assert len(rows) == 44
table(["Kode", "Nama subproses", "Fase", "Hal."], rows, "Daftar 44 subproses GSBPM 5.2 di StatPlan", widths=[1.4, 8.2, 5.2, 1.6], size=9)

h1("Lampiran C  Glosarium")
GL = [
    ("GSBPM", "Generic Statistical Business Process Model — kerangka kerja standar internasional untuk menjelaskan proses menghasilkan statistik (Materi Proses Bisnis, Hal. 5)."),
    ("Specify Need", "Identifikasi Kebutuhan — menentukan statistik yang dibutuhkan dan tujuannya."),
    ("Design", "Perancangan — merancang output, variabel, pengumpulan data, kerangka sampel, pengolahan, dan alur kerja."),
    ("Build", "Pembangunan — membangun dan menguji instrumen serta sistem sebelum kegiatan dijalankan."),
    ("Collect", "Pengumpulan Data — mengumpulkan data sesuai rancangan."),
    ("Process", "Pengolahan Data — menyiapkan data agar siap dianalisis."),
    ("Analyse", "Analisis Data — mengubah hasil olahan menjadi output statistik dan menafsirkannya."),
    ("Disseminate", "Penyajian dan Penyebarluasan — menyiapkan, merilis, dan mempromosikan produk statistik."),
    ("Evaluate", "Evaluasi — menilai kegiatan dan menyusun rencana tindak lanjut."),
    ("Subproses", "Langkah kerja rinci di dalam satu fase GSBPM. StatPlan memuat 44 subproses."),
    ("Variabel", "Informasi yang dikumpulkan dari setiap responden atau unit (Hal. 19)."),
    ("Indikator", "Angka ringkas yang dihitung dari variabel untuk menggambarkan suatu keadaan."),
    ("Instrumen", "Alat pengumpulan data, misalnya kuesioner atau panduan (Hal. 24)."),
    ("Metadata", "Informasi dalam struktur dan format baku untuk menggambarkan dan menjelaskan data (Hal. 58). Di StatPlan berupa draft MS-Keg, MS-Var, dan MS-Ind."),
    ("Timeline", "Rencana waktu kegiatan yang dibagi ke delapan fase; alat bantu perencanaan, bukan durasi wajib BPS."),
    ("Workspace (Ruang kerja)", "Halaman proyek berisi sembilan tab untuk meninjau dan melengkapi rencana."),
    ("Mode Terpandu", "Panduan belajar StatPlan per fase dan subproses GSBPM."),
    ("Format kerja", "Isian bahan kerja per subproses di Mode Terpandu; tersimpan di browser."),
    ("Validasi", "Di StatPlan: pemeriksaan kelengkapan draft oleh aturan StatPlan — bukan validasi resmi BPS. Dalam GSBPM: pemeriksaan data untuk menemukan kesalahan (Hal. 40)."),
    ("Draft", "Dokumen kerja yang belum final dan belum resmi; perlu ditinjau sebelum digunakan."),
    ("Ekspor", "Membuat dan mengunduh draft perencanaan dalam format .docx dari tab Ekspor."),
    ("Kompromin", "Kompilasi produk administrasi — statistik disusun dari data administrasi yang sudah tersedia."),
]
table(["Istilah", "Arti"], [[a, b] for a, b in GL], "Glosarium", widths=[4.0, 12.4], size=9.5)

doc.save(OUT)
print("saved", OUT)
print("figures", FIG[0], "screenshots", len(SCREENS_USED), "unique", len(set(SCREENS_USED)), "tables", TAB[0], "draft pages", npages)
unused = sorted(set(SHOTS) - set(SCREENS_USED))
print("unused shots:", unused)
