# -*- coding: utf-8 -*-
"""Builds StatPlan-Panduan-Penggunaan-Aplikasi-Lengkap.pptx — a complete visual user manual (not a talk deck).

Inputs come from the real app (see README): <work>/content.json, <work>/img (screens + shots.json + draft-skm.pdf),
<work>/cards (8 phase pages + 44×2 subprocess card views + cards.json).
python build_manual_pptx.py <work_dir> <out.pptx>
"""
import json, os, re, sys, math
import fitz
from PIL import Image, ImageFont
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE, MSO_CONNECTOR
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.oxml.ns import qn
from lxml import etree

WORK, OUT = sys.argv[1:3]
IMG, CARDS, CROPS = (os.path.join(WORK, d) for d in ("img", "cards", "pptx-crops"))
os.makedirs(CROPS, exist_ok=True)
D = json.load(open(os.path.join(WORK, "content.json"), encoding="utf8"))
SHOTS = {s["name"]: s for s in json.load(open(os.path.join(IMG, "shots.json"), encoding="utf8"))["shots"]}
CARDMETA = json.load(open(os.path.join(CARDS, "cards.json"), encoding="utf8"))
PHASES = D["phases"]
CODES = [c["code"] for p in PHASES for c in p["cards"]]
assert len(PHASES) == 8 and len(CODES) == 44
PHASE_EN = [ph["official"].split(" (")[0] for ph in PHASES]
CARD = {c["code"]: (ph, c) for ph in PHASES for c in ph["cards"]}
APP_URL = "https://statplan-gsbpm-bps-loteng.vercel.app"

# ---------------- visual system ----------------
NAVY = RGBColor(0x15, 0x32, 0x4B); INK = RGBColor(0x1F, 0x29, 0x33); GRAY = RGBColor(0x5F, 0x69, 0x75)
LIGHT = RGBColor(0xEA, 0xF1, 0xF8); BG = RGBColor(0xF7, 0xF6, 0xF2); WHITE = RGBColor(255, 255, 255)
LINE = RGBColor(0xD5, 0xDB, 0xE2); ACC = RGBColor(0xEB, 0x89, 0x1B); ACC_TXT = RGBColor(0xA4, 0x57, 0x0B)
WARN_BG = RGBColor(0xFF, 0xF6, 0xEC); TIP_BG = RGBColor(0xEE, 0xF6, 0xEF); TIP_TXT = RGBColor(0x2F, 0x6B, 0x3F)
BAND = RGBColor(0xF4, 0xF6, 0xF8); MUTED = RGBColor(0xC8, 0xD4, 0xE0)
TITLE_FONT, BODY_FONT = "Cambria", "Calibri"
W, H = 13.333, 7.5
X0, XW = 0.55, 12.23            # content left and width
Y0, YMAX = 1.42, 6.72           # content top / bottom
F_REG = ImageFont.truetype("C:/Windows/Fonts/calibri.ttf", 100)
F_BOLD = ImageFont.truetype("C:/Windows/Fonts/calibrib.ttf", 100)
CIRC = "①②③④⑤⑥⑦⑧⑨"

prs = Presentation()
prs.slide_width, prs.slide_height = Inches(W), Inches(H)
SL = []          # [{"slide", "section", "title", "dark"}]
KEYS = {}        # key -> slide index
LINKS = []       # (shape, key)
COUNT = {"screens": set(), "tables": 0, "diagrams": 0}


# ---------------- measurement ----------------
def text_width_pt(s, size, bold=False):
    return (F_BOLD if bold else F_REG).getlength(s) * size / 100.0


def wrap_lines(text, width_in, size, bold=False, indent_in=0.0):
    """Number of lines a paragraph takes (markup ** stripped)."""
    plain = text.replace("**", "")
    limit = (width_in - indent_in - 0.06) * 72
    lines, cur = 0, ""
    for para in plain.split("\n"):
        words, cur = para.split(" "), ""
        n = 1
        for w in words:
            t = (cur + " " + w).strip()
            if text_width_pt(t, size, bold) * 1.02 > limit and cur:
                n += 1; cur = w
            else:
                cur = t
        lines += n
    return lines


def lh(size):  # line height in inches
    return size * 1.2 / 72


# ---------------- primitives ----------------
def rect(s, x, y, w, h, fill=WHITE, line=None, radius=0.06, lw=1.0, shape=None):
    sh = s.shapes.add_shape(shape or (MSO_SHAPE.ROUNDED_RECTANGLE if radius else MSO_SHAPE.RECTANGLE), Inches(x), Inches(y), Inches(w), Inches(h))
    if fill is None: sh.fill.background()
    else: sh.fill.solid(); sh.fill.fore_color.rgb = fill
    if line is None: sh.line.fill.background()
    else: sh.line.color.rgb = line; sh.line.width = Pt(lw)
    if radius and shape is None: sh.adjustments[0] = radius
    sh.shadow.inherit = False
    return sh


def add_runs(p, text, size, color, bold=False, italic=False, font=BODY_FONT):
    for i, seg in enumerate(str(text).split("**")):
        if not seg: continue
        r = p.add_run(); r.text = seg
        r.font.size = Pt(size); r.font.color.rgb = color; r.font.name = font
        r.font.bold = bold or (i % 2 == 1); r.font.italic = italic


def tbox(s, x, y, w, h, paras, anchor=MSO_ANCHOR.TOP):
    """paras: list of dicts {t, size, color, bold, italic, align, bullet, indent, after, font}."""
    tb = s.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = tb.text_frame; tf.word_wrap = True; tf.vertical_anchor = anchor
    tf.margin_left = tf.margin_right = Inches(0.03); tf.margin_top = tf.margin_bottom = Inches(0.0)
    for i, pa in enumerate(paras):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = pa.get("align", PP_ALIGN.LEFT)
        p.line_spacing = 1.0
        p.space_after = Pt(pa.get("after", 0))
        p.space_before = Pt(pa.get("before", 0))
        prefix = pa.get("bullet")
        if prefix:
            ind = pa.get("indent", 0.24)
            pPr = p._p.get_or_add_pPr(); pPr.set("marL", str(int(Inches(ind)))); pPr.set("indent", str(-int(Inches(ind))))
            add_runs(p, prefix + "\u00A0", pa["size"], pa.get("bcolor", NAVY), bold=True)
        add_runs(p, pa["t"], pa["size"], pa.get("color", INK), pa.get("bold", False), pa.get("italic", False), pa.get("font", BODY_FONT))
    return tb


def text(s, x, y, w, h, t, size=14, color=INK, bold=False, italic=False, align=PP_ALIGN.LEFT, font=BODY_FONT, anchor=MSO_ANCHOR.TOP):
    return tbox(s, x, y, w, h, [{"t": t, "size": size, "color": color, "bold": bold, "italic": italic, "align": align, "font": font}], anchor)


def label_shape(sh, t, size=12, color=INK, bold=True, align=PP_ALIGN.CENTER):
    tf = sh.text_frame; tf.word_wrap = len(t) > 3; tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    m = 0.08 if len(t) > 3 else 0.0
    tf.margin_left = tf.margin_right = Inches(m); tf.margin_top = tf.margin_bottom = Inches(0.03 if m else 0.0)
    p = tf.paragraphs[0]; p.alignment = align
    add_runs(p, t, size, color, bold)


def link(shape, key):
    LINKS.append((shape, key))
    return shape


def link_last_viewed(shape):
    cNvPr = shape._element.find(".//" + qn("p:cNvPr"))
    h = etree.SubElement(cNvPr, qn("a:hlinkClick"))
    h.set(qn("r:id"), "")
    h.set("action", "ppaction://hlinkshowjump?jump=lastslideviewed")


# ---------------- slides ----------------
def new_slide(title, section, key=None, dark=False, subtitle=None):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    f = s.background.fill; f.solid(); f.fore_color.rgb = NAVY if dark else BG
    SL.append({"slide": s, "section": section, "title": title, "dark": dark})
    if key: KEYS[key] = len(SL) - 1
    if not dark:
        tsize = 25
        while tsize > 16 and text_width_pt(title, tsize, True) * 1.12 > XW * 72:
            tsize -= 0.5
        text(s, X0, 0.56, XW, 0.62, title, size=tsize, color=NAVY, bold=True, font=TITLE_FONT)
        if subtitle:
            text(s, X0, 1.07, XW, 0.32, subtitle, size=12, color=GRAY, italic=True)
    return s


def key_here(key):
    KEYS[key] = len(SL) - 1


SECTIONS = []  # (num, title, key)


def divider(num, title, intro, items=None):
    key = f"sec{num:02d}"
    SECTIONS.append((num, title, key))
    s = new_slide(title, f"{num:02d} — {title.upper()}", key=key, dark=True)
    text(s, 0.9, 1.25, 3.0, 1.4, f"{num:02d}", size=80, color=ACC, bold=True, font=TITLE_FONT)
    text(s, 0.9, 2.75, 11.5, 0.9, title, size=36, color=WHITE, bold=True, font=TITLE_FONT)
    text(s, 0.9, 3.7, 11.2, 1.1, intro, size=16, color=MUTED)
    if items:
        text(s, 0.9, 4.8, 6, 0.3, "ISI BAGIAN INI (klik untuk membuka)", size=11, color=ACC, bold=True)
        cols = 2 if len(items) > 5 else 1
        per = math.ceil(len(items) / cols)
        for i, (lab, k) in enumerate(items):
            cx, cy = 0.9 + (i // per) * 5.9, 5.12 + (i % per) * 0.34
            b = text(s, cx, cy, 5.7, 0.32, "›  " + lab, size=13, color=WHITE)
            link(b, k)
    return s


# ---------------- flow layout ----------------
def blk_height(b, w):
    k = b["k"]; sz = b.get("size", 13)
    if k == "label": return lh(11.5) + 0.1
    if k == "p": return wrap_lines(b["t"], w, sz) * lh(sz) + 0.1
    if k in ("bul", "num", "kv", "check"):
        return sum(wrap_lines(it if k != "kv" else f"{it[0]}: {it[1]}", w, sz, indent_in=0.26) * lh(sz) + 0.045 for it in b["items"]) + 0.08
    if k == "links": return len(b["items"]) * 0.3 + 0.05
    if k == "box": return (wrap_lines(b["t"], w - 0.35, sz) + 1) * lh(sz) + 0.3
    raise ValueError(k)


def split_blk(b, w, room):
    """Split a list block so the first part fits `room`. Returns (head, tail) or (None, b)."""
    if b["k"] not in ("bul", "num", "kv", "check", "links") or len(b["items"]) < 2: return None, b
    for n in range(len(b["items"]) - 1, 0, -1):
        head = dict(b, items=b["items"][:n])
        if blk_height(head, w) <= room:
            tail = dict(b, items=b["items"][n:], start=b.get("start", 1) + n)
            return head, tail
    return None, b


def render_blk(s, b, x, y, w):
    k = b["k"]; sz = b.get("size", 13); h = blk_height(b, w)
    if k == "label":
        text(s, x, y + 0.02, w, 0.3, b["t"].upper(), size=11.5, color=ACC_TXT, bold=True)
    elif k == "p":
        text(s, x, y, w, h, b["t"], size=sz, color=b.get("color", INK), italic=b.get("italic", False), bold=b.get("bold", False))
    elif k in ("bul", "num", "check"):
        paras = []
        for i, it in enumerate(b["items"]):
            pre = {"bul": "•", "num": f"{b.get('start', 1) + i}.", "check": "☐"}[k]
            paras.append({"t": it, "size": sz, "bullet": pre, "indent": 0.3 if k != "bul" else 0.22, "after": 3})
        tbox(s, x, y, w, h, paras)
    elif k == "kv":
        tbox(s, x, y, w, h, [{"t": f"**{a}:** {v}", "size": sz, "bullet": "▪", "indent": 0.22, "after": 3, "bcolor": ACC} for a, v in b["items"]])
    elif k == "links":
        for i, (lab, key) in enumerate(b["items"]):
            t = text(s, x, y + i * 0.3, w, 0.28, "›  " + lab, size=sz, color=NAVY, bold=False)
            link(t, key)
    elif k == "box":
        fill, edge, tcol = {"info": (LIGHT, NAVY, NAVY), "warn": (WARN_BG, ACC_TXT, ACC_TXT), "tip": (TIP_BG, TIP_TXT, TIP_TXT)}[b.get("kind", "info")]
        rect(s, x, y, w, h - 0.08, fill=fill, radius=0.04)
        rect(s, x, y, 0.07, h - 0.08, fill=edge, radius=0)
        tbox(s, x + 0.2, y + 0.1, w - 0.32, h - 0.25, [
            {"t": b.get("title", "CATATAN").upper(), "size": 11, "color": tcol, "bold": True, "after": 2},
            {"t": b["t"], "size": sz, "color": INK}])
    return h


def scaled(blocks, sc):
    out = []
    for b in blocks:
        b2 = dict(b)
        if "size" in b2: b2["size"] = max(10.0, round(b2["size"] * sc * 2) / 2)
        out.append(b2)
    return out


def simulate(blocks, cols):
    """True if blocks fit entirely in cols (same placement rules as flow)."""
    queue = list(blocks); ci = 0
    x, y, w, bottom = cols[0]
    while queue:
        b = queue.pop(0)
        need = blk_height(b, w)
        if b["k"] == "label" and queue:
            need += min(blk_height(queue[0], w), lh(queue[0].get("size", 13)) * 2 + 0.1)
        room = bottom - y
        if need <= room:
            y += need if b["k"] != "label" else blk_height(b, w); continue
        head, tail = split_blk(b, w, room) if b["k"] != "label" else (None, b)
        if head is not None and room > 0.6:
            queue.insert(0, tail)
        else:
            queue.insert(0, b)
        ci += 1
        if ci >= len(cols): return False
        x, y, w, bottom = cols[ci]
    return True


def flow(blocks, first_cols, make_cont, cont_cols):
    """Places blocks in columns; creates continuation slides with make_cont() as needed.
    If a slightly smaller type (≥ 10 pt) makes everything fit on the first slide, it is used instead."""
    s, cols = first_cols
    if not simulate(blocks, cols):
        for sc in (0.95, 0.9, 0.85):
            if simulate(scaled(blocks, sc), cols):
                blocks = scaled(blocks, sc); break
    queue = list(blocks)
    ci = 0
    x, y, w, bottom = cols[0]
    while queue:
        b = queue.pop(0)
        need = blk_height(b, w)
        if b["k"] == "label" and queue:
            need += min(blk_height(queue[0], w), lh(queue[0].get("size", 13)) * 2 + 0.1)
        room = bottom - y
        if need <= room:
            y += render_blk(s, b, x, y, w)
            continue
        head, tail = split_blk(b, w, room) if b["k"] != "label" else (None, b)
        if head is not None and room > 0.6:
            render_blk(s, head, x, y, w)
            queue.insert(0, tail)
        else:
            queue.insert(0, b)
        ci += 1
        if ci >= len(cols):
            s = make_cont(); cols = cont_cols; ci = 0
        x, y, w, bottom = cols[ci]
    return s, y


def cont_factory(title, section):
    return lambda: new_slide(title + " (lanjutan)", section)


# ---------------- screenshots ----------------
def screen(s, name, x, y, w, maxh, src="img", crop=None, legend=None, caption=None, align="center"):
    """Real screenshot, fitted in (w × maxh), with numbered callouts drawn as native shapes.
    crop: (l, t, r, b) in CSS px of the capture. Returns (x, y, w, h) of the image."""
    meta = SHOTS[name] if src == "img" else CARDMETA[name]
    path = os.path.join(IMG if src == "img" else CARDS, f"{name}.png")
    dpr = meta.get("dpr", 1.5); vw, vh = meta.get("vw", 1280), meta.get("vh", 800)
    marks = [dict(m) for m in meta["marks"]]
    if crop:
        l, t, r, bt = crop
        im = Image.open(path)
        cp = os.path.join(CROPS, f"{name}-{l}-{t}-{r}-{bt}.png")
        im.crop((int(l * dpr), int(t * dpr), int(r * dpr), int(bt * dpr))).save(cp)
        path, vw, vh = cp, r - l, bt - t
        marks = [dict(m, x=m["x"] - l, y=m["y"] - t) for m in marks if m["x"] >= l - 4 and m["y"] >= t - 4 and m["x"] + m["w"] <= r + 8 and m["y"] + m["h"] <= bt + 8]
    ar = vw / vh
    iw, ih = w, w / ar
    if ih > maxh: ih = maxh; iw = ih * ar
    ix = x + (w - iw) / 2 if align == "center" else x + w - iw
    rect(s, ix - 0.03, y - 0.03, iw + 0.06, ih + 0.06, fill=WHITE, line=LINE, radius=0.01, lw=0.75)
    s.shapes.add_picture(path, Inches(ix), Inches(y), Inches(iw), Inches(ih))
    COUNT["screens"].add(f"{src}:{name}")
    sx, sy = iw / vw, ih / vh
    for m in marks:
        bx, by = ix + m["x"] * sx, y + m["y"] * sy
        bw, bh = max(0.22, m["w"] * sx), max(0.16, m["h"] * sy)
        rect(s, bx, by, bw, bh, fill=None, line=ACC, radius=0.05, lw=2.25)
        cx, cy = bx - 0.19, by - 0.19
        cx = min(max(cx, ix - 0.17), ix + iw - 0.2); cy = max(cy, y - 0.17)
        c = rect(s, cx, cy, 0.36, 0.36, fill=NAVY, line=WHITE, lw=1.5, radius=0, shape=MSO_SHAPE.OVAL)
        label_shape(c, str(m["n"]), size=12, color=WHITE)
    if legend is not None:
        assert len(legend) == len(marks), f"{name}: {len(marks)} callouts vs {len(legend)} legend"
    if caption:
        text(s, ix, y + ih + 0.06, iw, 0.26, caption, size=10, color=GRAY, italic=True, align=PP_ALIGN.CENTER)
    return ix, y, iw, ih


def legend_blocks(legend):
    """legend items: str or (name, fungsi, aksi)."""
    out = []
    for i, it in enumerate(legend):
        if isinstance(it, str):
            out.append({"k": "p", "t": f"**{CIRC[i]}  {it}**", "size": 13})
        else:
            nm, fn, ak = it
            out.append({"k": "p", "t": f"**{CIRC[i]}  {nm}**", "size": 13})
            out.append({"k": "kv", "items": [("Fungsi", fn), ("Yang dilakukan", ak)], "size": 12})
    return out


def shot_slide(title, section, name, legend, extra=None, src="img", crop=None, key=None, subtitle=None, img_w=8.25, caption=None):
    """Large screenshot left, legend + extra blocks right (flows to continuation slide)."""
    s = new_slide(title, section, key=key, subtitle=subtitle)
    ix, iy, iw, ih = screen(s, name, X0, Y0 + 0.05, img_w, YMAX - Y0 - 0.35, src=src, crop=crop, legend=legend, caption=caption or f"Tangkapan layar aplikasi StatPlan 1.0.0{' (proyek demo)' if 'tab-' in name or name in ('33-ekspor',) else ''}")
    rx = ix + iw + 0.3
    blocks = ([{"k": "label", "t": "Penanda pada gambar"}] + legend_blocks(legend) if legend else []) + (extra or [])
    flow(blocks, (s, [(rx, Y0 + 0.05, X0 + XW - rx, YMAX)]), cont_factory(title, section), [(X0, Y0, 5.95, YMAX), (X0 + 6.28, Y0, 5.95, YMAX)])
    return s


STEP_NO = [0]


def step_slide(title, section, name, legend, tindakan, diisi=None, hasil=None, catatan=None, src="img", crop=None, img_w=7.6):
    STEP_NO[0] += 1
    n = STEP_NO[0]
    s = new_slide(f"LANGKAH {n:02d}  ·  {title}", section)
    ix, iy, iw, ih = screen(s, name, X0, Y0 + 0.05, img_w, YMAX - Y0 - 0.35, src=src, crop=crop, legend=legend, caption="Tangkapan layar aplikasi StatPlan 1.0.0")
    rx = ix + iw + 0.3
    blocks = []
    if legend:
        blocks += [{"k": "label", "t": "Penanda"}] + [{"k": "p", "t": f"**{CIRC[i]}** {t}", "size": 12.5} for i, t in enumerate(legend)]
    blocks += [{"k": "label", "t": "Tindakan"}, {"k": "num", "items": tindakan, "size": 13}]
    if diisi:
        blocks += [{"k": "label", "t": "Yang harus diisi"}] + ([{"k": "kv", "items": diisi, "size": 12.5}] if isinstance(diisi, list) else [{"k": "p", "t": diisi, "size": 12.5}])
    if hasil:
        blocks += [{"k": "label", "t": "Hasil"}, {"k": "p", "t": hasil, "size": 13}]
    if catatan:
        blocks += [{"k": "box", "title": "Catatan", "t": catatan, "kind": "info", "size": 12}]
    flow(blocks, (s, [(rx, Y0 + 0.05, X0 + XW - rx, YMAX)]), cont_factory(f"LANGKAH {n:02d}  ·  {title}", section), [(X0, Y0, 5.95, YMAX), (X0 + 6.28, Y0, 5.95, YMAX)])
    return s


def text_slide(title, section, blocks, cols=2, key=None, subtitle=None):
    s = new_slide(title, section, key=key, subtitle=subtitle)
    y0 = Y0 + (0.05 if not subtitle else 0.1)
    colspec = [(X0, y0, XW, YMAX)] if cols == 1 else [(X0, y0, 5.95, YMAX), (X0 + 6.28, y0, 5.95, YMAX)]
    contspec = [(X0, Y0, XW, YMAX)] if cols == 1 else [(X0, Y0, 5.95, YMAX), (X0 + 6.28, Y0, 5.95, YMAX)]
    flow(blocks, (s, colspec), cont_factory(title, section), contspec)
    return s


def table_slide(title, section, headers, rows, widths, size=12, key=None, subtitle=None, link_col=None):
    """Native table; rows that do not fit continue on the next slide (header repeated)."""
    s = new_slide(title, section, key=key, subtitle=subtitle)
    COUNT["tables"] += 1
    y = Y0 + (0.12 if subtitle else 0.05)
    avail = YMAX - y
    def row_h(r):
        return max(wrap_lines(str(v).replace("\n", " \n"), widths[i] - 0.12, size) for i, v in enumerate(r)) * lh(size) + 0.1
    chunk, used = [], row_h(headers)
    chunks = []
    for r in rows:
        rh = row_h(r)
        if used + rh > avail and chunk:
            chunks.append(chunk); chunk, used = [], row_h(headers)
        chunk.append(r); used += rh
    chunks.append(chunk)
    for ci, ch in enumerate(chunks):
        if ci > 0:
            s = new_slide(title + " (lanjutan)", section)
        tbl = s.shapes.add_table(len(ch) + 1, len(headers), Inches(X0), Inches(y if ci == 0 else Y0 + 0.05), Inches(sum(widths)), Inches(0.3)).table
        for i, wdt in enumerate(widths): tbl.columns[i].width = Inches(wdt)
        for ri, r in enumerate([headers] + ch):
            tbl.rows[ri].height = Inches(row_h(r) - 0.02)
            for i, v in enumerate(r):
                cell = tbl.cell(ri, i)
                cell.margin_left = cell.margin_right = Inches(0.06); cell.margin_top = cell.margin_bottom = Inches(0.03)
                cell.fill.solid(); cell.fill.fore_color.rgb = NAVY if ri == 0 else (BAND if ri % 2 == 0 else WHITE)
                tf = cell.text_frame; tf.word_wrap = True
                lines = str(v).split("\n")
                for li, ln in enumerate(lines):
                    p = tf.paragraphs[0] if li == 0 else tf.add_paragraph()
                    add_runs(p, ln, size, WHITE if ri == 0 else INK, bold=ri == 0)
        if link_col is not None:
            yy = y if ci == 0 else Y0 + 0.05
            yy += row_h(headers)
            for r in ch:
                rh = row_h(r)
                if r[link_col[0]] in link_col[1]:
                    hot = rect(s, X0, yy, sum(widths), rh - 0.02, fill=None, radius=0)
                    link(hot, link_col[1][r[link_col[0]]])
                yy += rh
    return s


def box(t, title="Catatan", kind="info", size=12.5):
    return {"k": "box", "t": t, "title": title, "kind": kind, "size": size}


def P(t, size=13, **kw): return dict({"k": "p", "t": t, "size": size}, **kw)
def L(t): return {"k": "label", "t": t}
def B(items, size=13): return {"k": "bul", "items": items, "size": size}
def N(items, size=13): return {"k": "num", "items": items, "size": size}
def KV(items, size=12.5): return {"k": "kv", "items": items, "size": size}


def fields_text(prep):
    out = []
    for f in prep["fields"]:
        s = f"**{f['label']}**" + (" (wajib)" if f["required"] else "")
        if f["options"]: s += f" — pilihan: {', '.join(f['options'])}"
        if f["columns"]: s += f" — kolom: {', '.join(f['columns'])}"
        if f["conditional"]: s += " — muncul bila pilihan sebelumnya sesuai"
        out.append(s)
    return out


# =====================================================================
# 01 — MENGENAL STATPLAN
# =====================================================================
s = new_slide("", "", key="cover", dark=True)
text(s, 0.9, 0.9, 6, 0.4, "STATPLAN", size=16, color=ACC, bold=True)
text(s, 0.9, 1.45, 11.5, 1.0, "PANDUAN PENGGUNAAN APLIKASI", size=40, color=WHITE, bold=True, font=TITLE_FONT)
text(s, 0.9, 2.45, 11.5, 0.5, "Manual Digital Lengkap", size=22, color=MUTED)
text(s, 0.9, 3.15, 11.5, 0.9, "Simulator Perencanaan Kegiatan Statistik Berbasis GSBPM 5.2\nUntuk BPS Kabupaten Lombok Tengah dan Instansi Pengguna", size=17, color=WHITE)
rect(s, 0.9, 4.35, 2.2, 0.05, fill=ACC, radius=0)
text(s, 0.9, 4.55, 11.0, 0.9, "Versi dokumen 1.0  ·  29 September 2026  ·  StatPlan 1.0.0\nStatus: panduan penggunaan — versi rilis 1.0", size=14, color=MUTED)
b = rect(s, 0.9, 5.55, 11.5, 0.95, fill=RGBColor(0x1F, 0x44, 0x63), radius=0.05)
label_shape(b, "Panduan ini menjelaskan penggunaan aplikasi StatPlan. StatPlan merupakan alat bantu perencanaan dan pembelajaran berbasis GSBPM 5.2. Dokumen yang dihasilkan aplikasi merupakan DRAFT PERENCANAAN KEGIATAN STATISTIK dan BUKAN DOKUMEN RESMI BPS.", size=13, color=WHITE, bold=False, align=PP_ALIGN.LEFT)

table_slide("Informasi Dokumen", "01 — MENGENAL STATPLAN", ["Atribut", "Keterangan"], [
    ["Nama dokumen", "Panduan Penggunaan Aplikasi StatPlan — Manual Digital Lengkap (PowerPoint)"],
    ["Nama aplikasi", "StatPlan — Simulator Perencanaan Kegiatan Statistik Berbasis GSBPM 5.2"],
    ["Versi aplikasi / panduan", "1.0.0 / 1.0"],
    ["Tujuan", "Membimbing pengguna baru dari halaman utama sampai mengunduh dan meninjau Draft Perencanaan Kegiatan Statistik (.docx) secara mandiri."],
    ["Sasaran pengguna", "BPS Kabupaten Lombok Tengah, OPD/instansi pemerintah, petugas statistik, operator, perencana kegiatan statistik, pengguna non-teknis."],
    ["Basis proses", "GSBPM 5.2 — 8 fase, 44 subproses — sebagaimana dijelaskan dalam Materi Proses Bisnis Statistik BPS."],
    ["Format output aplikasi", "Microsoft Word (.docx): “Draft Perencanaan Kegiatan Statistik”."],
    ["Status output aplikasi", "DRAFT — BUKAN DOKUMEN RESMI BPS. Perlu ditinjau oleh pihak berwenang/ahli metodologi."],
    ["Alamat aplikasi", APP_URL + " (saat panduan disusun)"],
    ["Pendamping", "Versi cetak: StatPlan-Panduan-Penggunaan-Aplikasi.docx / .pdf (isi setara)."],
], [3.2, 9.0], size=13, key="info")

TOC_INDEX = len(SL)
s = new_slide("Daftar Isi", "DAFTAR ISI", key="toc", subtitle="Klik judul bagian untuk membukanya. Tombol ⌂ Daftar Isi di setiap halaman kembali ke sini.")
# (entries are drawn at the end, when all section slides exist)

text_slide("Cara Menggunakan Panduan Ini", "01 — MENGENAL STATPLAN", [
    L("Membaca panduan"),
    B(["Baca dari halaman pertama sampai terakhir, atau klik bagian di **Daftar Isi**.",
       "Setiap langkah ditulis sebagai **LANGKAH NN**: tangkapan layar, TINDAKAN, YANG HARUS DIISI, HASIL, dan CATATAN.",
       "Topik panjang dilanjutkan pada halaman berikutnya berjudul “(lanjutan)”.",
       "Tulisan **tebal** adalah nama tombol, menu, tab, atau isian persis seperti di aplikasi."]),
    L("Penanda pada tangkapan layar"),
    B(["Kotak oranye menandai bagian aplikasi yang dibahas.", "Lingkaran bernomor ①②③ dijelaskan di kolom “Penanda” di samping gambar.", "Semua gambar adalah tangkapan layar asli StatPlan 1.0.0; gambar Ruang kerja memakai proyek demo (contoh ilustratif)."]),
    L("Tombol navigasi (kanan bawah)"),
    KV([("⌂ Daftar Isi", "kembali ke daftar isi"), ("↩ Kembali", "ke halaman yang terakhir dilihat"), ("‹ / ›", "halaman sebelumnya / berikutnya"), ("Awal bagian", "ke halaman pembuka bagian")]),
    L("Kotak keterangan"),
    KV([("CATATAN", "informasi penting untuk memahami langkah"), ("PERHATIAN", "hal yang sering disalahpahami"), ("TIPS", "cara kerja yang lebih cepat atau aman"), ("Contoh ilustratif", "contoh buatan StatPlan — bukan data atau dokumen resmi")]),
    box("Gunakan mode Slide Show (F5) agar semua tautan dapat diklik. Pada mode Normal, tahan Ctrl lalu klik tautan.", "Tips", "tip"),
], key="howto")

divider(1, "Mengenal StatPlan", "Apa itu StatPlan, untuk siapa, kapan digunakan, apa hasilnya, dan batasannya.", [
    ("Apa itu StatPlan", "about"), ("Tujuan StatPlan", "goal"), ("Siapa yang menggunakan", "who"), ("Kapan digunakan", "when"),
    ("Apa yang dihasilkan", "output"), ("Batasan StatPlan", "limits"), ("StatPlan dan GSBPM 5.2", "gsbpm")])
SEC = "01 — MENGENAL STATPLAN"
text_slide("Apa Itu StatPlan", SEC, [
    P("StatPlan adalah aplikasi web untuk **belajar dan menyusun rencana kegiatan statistik**. Anda menceritakan kebutuhan dengan bahasa sehari-hari, melihat contoh kegiatan, mengikuti panduan per subproses GSBPM 5.2, lalu mengunduh draft perencanaan dalam format Word.", 15),
    L("Yang perlu diketahui"),
    B(["Berjalan di browser — tidak perlu instalasi dan tidak ada akun.", "Data proyek disimpan di browser perangkat yang Anda gunakan, bukan di server.", "Berisi contoh kegiatan, Mode Terpandu (Guided GSBPM), Ruang kerja, pemeriksaan kelengkapan, dan ekspor draft."], 14),
    L("Halaman utama aplikasi menyebut"),
    B(["Simulator dan media belajar perencanaan kegiatan statistik.", "Berbasis GSBPM 5.2 dari Materi Proses Bisnis.", "Alat bantu menyusun persiapan secara terstruktur, di browser Anda."], 14),
], cols=1, key="about")
text_slide("Tujuan StatPlan", SEC, [
    box("StatPlan membantu pengguna yang belum tahu bagaimana menyelenggarakan kegiatan statistik dengan memberikan panduan, contoh, template, timeline, dan draft perencanaan berbasis GSBPM 5.2.", "Tujuan", "info", 16),
    L("Yang dibantu StatPlan"),
    KV([("Panduan", "penjelasan setiap subproses GSBPM dengan bahasa sederhana dan rujukan halaman Materi Proses Bisnis"),
        ("Contoh", "contoh kegiatan yang sudah tersusun (survei, sensus, kompromin) — contoh ilustratif"),
        ("Template", "format kerja untuk menyiapkan bahan pada setiap subproses"),
        ("Timeline", "pembagian periode kegiatan ke delapan fase"),
        ("Draft", "dokumen Word “Draft Perencanaan Kegiatan Statistik” untuk ditinjau")], 14),
], cols=1, key="goal")
table_slide("Siapa yang Menggunakan StatPlan", SEC, ["Pengguna", "Kegunaan StatPlan"], [
    ["Pegawai OPD/instansi penyelenggara kegiatan statistik", "Menyusun rencana kegiatan dari nol, lengkap dengan persiapan per tahap."],
    ["Operator/petugas", "Mengisi, memeriksa kelengkapan rencana, dan mengunduh draft."],
    ["Perencana kegiatan statistik", "Memastikan rencana mencakup kebutuhan, rancangan, variabel, instrumen, metadata, dan jadwal."],
    ["BPS Kabupaten Lombok Tengah", "Mendampingi instansi dan meninjau draft rencana yang dihasilkan."],
    ["Pengguna non-teknis, mahasiswa/peserta PKL", "Memahami GSBPM 5.2 melalui contoh dan praktik."],
], [4.6, 7.6], size=14, key="who")
text_slide("Kapan StatPlan Digunakan", SEC, [
    L("Gunakan StatPlan saat"),
    B(["Instansi baru merencanakan kegiatan statistik — survei, sensus/pendataan lengkap, atau kompilasi data administratif.",
       "Ingin memahami apa yang perlu disiapkan pada setiap tahap GSBPM sebelum kegiatan dimulai.",
       "Membutuhkan draft rencana tertulis sebagai bahan diskusi dengan tim, pimpinan, atau BPS.",
       "Ingin belajar dari contoh kegiatan yang sudah tersusun."], 15),
    box("StatPlan dipakai pada tahap perencanaan. StatPlan tidak mengumpulkan data responden, tidak mengolah data, dan tidak menghitung statistik resmi.", "Perhatian", "warn", 14),
], cols=1, key="when")
text_slide("Apa yang Dihasilkan StatPlan", SEC, [
    P("Hasil akhir StatPlan adalah berkas **Draft Perencanaan Kegiatan Statistik** (.docx). Menurut halaman utama aplikasi, draft memuat:", 15),
    B(D["landing"]["outputs"], 14),
    P("Struktur lengkap dokumen dijelaskan di Bagian 19.", 13, italic=True, color=GRAY),
    box("Setiap berkas berjudul “DRAFT PERENCANAAN KEGIATAN STATISTIK” dan memuat pernyataan “DRAFT — BUKAN DOKUMEN RESMI BPS” di sampul dan kaki halaman.", "Status dokumen", "warn", 14),
], cols=1, key="output")
table_slide("Batasan StatPlan", SEC, ["StatPlan adalah …", "StatPlan bukan …"], [
    ["Alat bantu perencanaan dan pembelajaran.", "Sistem produksi statistik BPS."],
    ["Panduan berbasis GSBPM 5.2.", "Sistem persetujuan BPS atau sistem rekomendasi resmi BPS."],
    ["Penghasil DRAFT perencanaan untuk ditinjau.", "Pengganti keputusan metodologis atau ahli metodologi."],
    ["Pencatat hasil pemeriksaan portal yang Anda lakukan sendiri.", "Pemeriksa portal otomatis — tidak terhubung ke SIRuSa, Romantik, atau Portal SDI."],
    ["Pemberi saran awal jenis kegiatan dari aturan sederhana.", "Bukti bahwa kegiatan telah disetujui BPS."],
    ["Penyimpan data di browser perangkat Anda.", "Layanan dengan akun, server, atau sinkronisasi antarperangkat."],
], [6.1, 6.1], size=14, key="limits")
text_slide("Hubungan StatPlan dan GSBPM 5.2", SEC, [
    P("GSBPM (Generic Statistical Business Process Model) adalah kerangka kerja standar internasional untuk menjelaskan proses bisnis dalam menghasilkan statistik (Materi Proses Bisnis, Hal. 5). StatPlan memakai **8 fase** dan **44 subproses** GSBPM 5.2 dengan kode dan nama sesuai Materi Proses Bisnis.", 14),
    {"k": "links", "items": [(f"Fase {ph['n']} — {PHASE_EN[ph['n'] - 1]} ({ph['title']}) · {len(ph['cards'])} subproses", f"phase{ph['n']}") for ph in PHASES], "size": 13.5},
    box("Materi Proses Bisnis menyebut GSBPM bersifat fleksibel dan tidak harus digunakan secara linear (Hal. 5 dan 8). Urutan fase di Mode Terpandu adalah urutan belajar StatPlan — bukan urutan wajib GSBPM.", "GSBPM tidak harus linear", "info", 13),
], cols=1, key="gsbpm")

# =====================================================================
# 02 — ALUR PENGGUNAAN
# =====================================================================
divider(2, "Alur Penggunaan", "Panduan ini mengikuti alur penggunaan aplikasi dari awal sampai akhir. Setiap tahap memiliki satu tindakan utama.")
SEC = "02 — ALUR PENGGUNAAN"
FLOW = [("Halaman utama", "sec03"), ("Contoh / Mulai rencana", "sec04"), ("Identifikasi", "sec05"), ("Timeline", "sec07"), ("Guided GSBPM", "sec08"),
        ("Workspace", "sec11"), ("Pemeriksaan", "sec16"), ("Ekspor", "sec17"), ("Download draft", "sec18"), ("Review", "sec19")]
s = new_slide("Diagram Alur Penggunaan StatPlan", SEC, subtitle="Klik kotak tahap untuk membuka bagian yang menjelaskannya.")
COUNT["diagrams"] += 1
bw, bh = 2.1, 1.05
for i, (t, k) in enumerate(FLOW):
    row, col = divmod(i, 5)
    col = col if row == 0 else 4 - col
    x = 0.75 + col * 2.5; y = 1.75 + row * 2.3
    last = i == len(FLOW) - 1
    b = rect(s, x, y, bw, bh, fill=NAVY if last else LIGHT, line=NAVY, radius=0.12, lw=1.25)
    label_shape(b, t, size=14, color=WHITE if last else NAVY)
    link(b, k)
    c = rect(s, x - 0.18, y - 0.18, 0.42, 0.42, fill=ACC, line=WHITE, lw=1.5, radius=0, shape=MSO_SHAPE.OVAL)
    label_shape(c, str(i + 1), size=12 if i < 9 else 10, color=WHITE)
    if i < len(FLOW) - 1:
        if i == 4:
            con = s.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, Inches(x + bw / 2), Inches(y + bh), Inches(x + bw / 2), Inches(y + 2.3))
        elif row == 0:
            con = s.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, Inches(x + bw), Inches(y + bh / 2), Inches(x + 2.5), Inches(y + bh / 2))
        else:
            con = s.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, Inches(x), Inches(y + bh / 2), Inches(x - 0.4), Inches(y + bh / 2))
        con.line.color.rgb = NAVY; con.line.width = Pt(2)
        ln = con.line._get_or_add_ln(); ln.append(ln.makeelement(qn("a:tailEnd"), {"type": "triangle", "w": "med", "len": "med"}))
text(s, X0, 6.2, XW, 0.4, "Diagram (bukan tangkapan layar), disusun dari struktur aplikasi StatPlan 1.0.0. Anda boleh berpindah bagian kapan saja; GSBPM sendiri bersifat fleksibel.", size=11, color=GRAY, italic=True)
table_slide("Tahap 1–5: dari Halaman Utama sampai Guided GSBPM", SEC, ["Tahap", "Di aplikasi", "Tindakan utama", "Hasil"], [
    ["1. Halaman utama", "Beranda (alamat aplikasi)", "Klik **Mulai perencanaan** atau **Pelajari contoh**", "Anda memahami fungsi StatPlan dan memilih titik awal"],
    ["2. Contoh / Mulai rencana", "Halaman contoh kegiatan; Rencana baru", "Klik **Gunakan contoh ini untuk membuat rencana** atau **Rencana baru**", "Formulir Rencana baru terbuka"],
    ["3. Identifikasi", "Rencana baru — Langkah 1 (Ceritakan) dan 2 (Hasil)", "Tulis kebutuhan, pilih jenis kegiatan, tetapkan hasil", "Kebutuhan dan tujuan awal tersusun"],
    ["4. Timeline", "Rencana baru — Langkah 3 (Waktu)", "Isi tanggal, klik **Gunakan rencana waktu & lanjutkan**", "Proyek tersimpan dengan jadwal 8 fase"],
    ["5. Guided GSBPM", "Mode Terpandu: 8 fase, 44 subproses", "Pelajari kartu, isi format kerja, **Tandai sudah dipahami**", "Materi dipahami dan bahan kerja disiapkan"],
], [2.7, 3.2, 3.5, 2.8], size=13)
table_slide("Tahap 6–10: dari Workspace sampai Review Draft", SEC, ["Tahap", "Di aplikasi", "Tindakan utama", "Hasil"], [
    ["6. Workspace", "Ruang kerja — 9 tab (Timeline … Ekspor)", "Lengkapi variabel, instrumen, metadata, checklist", "Isi draft lengkap"],
    ["7. Pemeriksaan", "Tab Ekspor — **TINJAUAN SEBELUM EKSPOR**", "Klik tombol perbaikan, mis. **Buka pemeriksaan portal**", "Tidak ada temuan **Perlu dilengkapi**"],
    ["8. Ekspor", "Tab **Ekspor**", "Klik **Unduh draf perencanaan**", "Dokumen disusun di perangkat Anda"],
    ["9. Download draft", "Folder unduhan browser", "Buka berkas **StatPlan-<nama-kegiatan>.docx**", "Draft tersimpan di perangkat"],
    ["10. Review", "Microsoft Word", "Baca draft; perbaiki di StatPlan bila perlu, lalu ekspor ulang", "Draft siap ditinjau tim/ahli metodologi"],
], [2.7, 3.2, 3.5, 2.8], size=13)

# =====================================================================
# 03 — HALAMAN UTAMA
# =====================================================================
divider(3, "Halaman Utama", "Mengenal halaman pertama StatPlan: judul, navigasi, cara kerja, contoh, dan tombol untuk memulai.")
SEC = "03 — HALAMAN UTAMA"
STEP_NO[0] = 0
step_slide("Buka halaman utama", SEC, "01-landing", ["Navigasi atas", "Tombol Mulai perencanaan", "Tombol Pelajari contoh"],
           [f"Buka browser, lalu ketik alamat aplikasi: {APP_URL}.", "Tunggu hingga halaman utama tampil.", "Baca judul dan penjelasan singkat di bagian atas."],
           hasil="Halaman utama StatPlan terbuka.", catatan="Jika belum memahami proses kegiatan statistik, pelajari contoh kegiatan terlebih dahulu (Bagian 04).")
shot_slide("Halaman Utama — Elemen Utama", SEC, "01-landing", [
    ("Navigasi atas", "Menu Contoh, Cara kerja, Presentasi, Proyek saya, dan tombol Rencana baru.", "Klik menu untuk berpindah halaman atau bagian."),
    ("Mulai perencanaan", "Membuat rencana kegiatan baru.", "Klik untuk membuka Rencana baru — Langkah 1."),
    ("Pelajari contoh", "Membuka contoh kegiatan yang sudah tersusun.", "Klik untuk melihat contoh sebelum membuat rencana sendiri.")],
    extra=[L("Hasil"), P("Anda memilih titik awal: membuat rencana atau belajar dari contoh.", 12.5)])
shot_slide("Halaman Utama — Cara Kerja", SEC, "02-landing-cara-kerja", [
    ("Empat langkah", "Menjelaskan alur StatPlan: " + "; ".join(f"{s_['number']} {s_['title']}" for s_ in D["landing"]["steps"]) + ".", "Baca untuk memahami urutan penggunaan.")])
shot_slide("Halaman Utama — Belajar dari Contoh", SEC, "03-landing-contoh", [
    ("Kartu contoh", "Tiga contoh kegiatan: survei, sensus, dan kompromin.", "Klik kartu (tautan “Pelajari contoh: …”) untuk membuka contoh.")],
    extra=[box("Contoh ilustratif StatPlan — bukan data atau dokumen resmi.", "Perhatian", "warn", 12)])
table_slide("Halaman Utama — Bagian dan Tombol", SEC, ["Bagian / tombol", "Fungsi", "Cara menggunakan", "Hasil"], [
    ["**Mulai perencanaan**", "Membuat rencana kegiatan baru.", "Klik tombol di bagian atas.", "Rencana baru — Langkah 1 terbuka."],
    ["**Pelajari contoh**", "Membuka contoh kegiatan.", "Klik tombol, lalu pilih contoh.", "Halaman contoh terbuka."],
    ["**Rencana baru** (navigasi)", "Sama dengan Mulai perencanaan.", "Klik di pojok kanan atas.", "Rencana baru terbuka."],
    ["**Contoh**, **Cara kerja**, **Presentasi**, **Proyek saya**", "Navigasi utama.", "Klik menu di bagian atas.", "Halaman/bagian terkait terbuka."],
    ["Tersusun mengikuti GSBPM 5.2", "Ringkasan delapan fase GSBPM.", "Gulir halaman.", "Anda melihat kerangka yang dipakai."],
    ["Apa yang Anda dapatkan?", "Isi draft yang dihasilkan.", "Gulir halaman.", "Anda tahu hasil akhir StatPlan."],
    ["Tentang StatPlan", "Apa StatPlan dan apa yang bukan.", "Gulir halaman.", "Anda memahami batasannya."],
    ["**Lihat FAQ** (Masih bingung?)", "Membuka Pertanyaan umum.", "Klik tombol.", "Halaman FAQ terbuka (Bagian 22)."],
], [3.3, 3.1, 2.9, 2.9], size=12.5)
text_slide("Halaman Utama — Langkah Penggunaan dan Catatan", SEC, [
    L("Langkah penggunaan"),
    N(["Buka alamat aplikasi di browser.", "Baca penjelasan singkat dan bagian **Cara kerja**.", "Jika belum berpengalaman, klik **Pelajari contoh** dan baca satu contoh.", "Klik **Mulai perencanaan** (atau **Gunakan contoh ini untuk membuat rencana** dari halaman contoh)."], 14),
    L("Hasil"), P("Formulir Rencana baru terbuka pada Langkah 1 dari 6.", 14),
    L("Catatan"),
    box("Saat pertama kali membuka halaman aplikasi (misalnya Proyek saya), dapat muncul panduan singkat tiga langkah: “Selamat datang di StatPlan”, “Cara memakainya”, dan “Butuh bantuan?”. Gunakan **Lanjut**, **Kembali**, **Lewati**, atau **Buka beranda** di langkah terakhir.", "Panduan singkat kunjungan pertama", "info", 13),
    box("Tidak perlu paham GSBPM dulu. Hasil StatPlan berupa draf, bukan dokumen resmi BPS.", "Perhatian", "warn", 13),
])

# =====================================================================
# 04 — CONTOH KEGIATAN
# =====================================================================
divider(4, "Contoh Kegiatan", "Contoh disediakan agar Anda dapat melihat bentuk akhir sebuah rencana sebelum menyusun rencana sendiri.")
SEC = "04 — CONTOH KEGIATAN"
table_slide("Tiga Contoh Kegiatan di StatPlan", SEC, ["Contoh", "Jenis kegiatan", "Yang bisa dipelajari"],
            [[e["title"], {"survei": "Survei", "sensus": "Sensus (pendataan lengkap)", "kompromin": "Kompromin (kompilasi data administratif)"}[e["jenis"]], e["takeaways"][0] if e["takeaways"] else e["whatToKnow"]] for e in D["examples"]],
            [3.3, 3.2, 5.7], size=13, subtitle="Contoh ilustratif StatPlan — bukan data atau dokumen resmi.")
step_slide("Buka contoh kegiatan", SEC, "04-contoh", ["Tombol Gunakan contoh ini untuk membuat rencana"],
           ["Di halaman utama, klik **Pelajari contoh** atau kartu **Pelajari contoh: …**.", "Baca judul contoh dan label “Contoh ilustratif StatPlan”.", "Gulir ke bawah untuk membaca isi contoh."],
           hasil="Halaman contoh kegiatan (studi kasus) terbuka.", catatan="Kembali ke daftar contoh dengan tautan **Semua contoh** (kiri atas) — membuka halaman utama pada bagian Belajar dari contoh.")
shot_slide("Membaca Contoh — Bagian Sekilas", SEC, "05-contoh-sekilas", [
    ("Sekilas", "Jenis kegiatan, topik, tujuan, pengguna informasi, output yang direncanakan, dan periode contoh.", "Baca untuk memahami gambaran kegiatan.")],
    extra=[L("Melihat timeline dan output"), B(["**Periode contoh** menunjukkan contoh jadwal dari materi (Hal. 23).", "**Output yang direncanakan** menunjukkan hasil yang ingin dibuat."], 12.5)])
table_slide("Membaca Contoh — Isi Halaman", SEC, ["Bagian halaman contoh", "Yang dipelajari"], [
    ["**Sekilas**", "Jenis kegiatan, topik, tujuan, pengguna informasi, output, periode."],
    ["**Mengapa kegiatan ini dibutuhkan?**", "Latar belakang, siapa yang membutuhkan, informasi yang diharapkan."],
    ["**Apa yang perlu disiapkan?** / **Satu fase, satu langkah**", "Delapan fase GSBPM dengan jumlah subprosesnya. Klik nama fase (mis. **01 Identifikasi Kebutuhan 6 subproses**) untuk melihat persiapannya — cara mempelajari GSBPM dari contoh."],
    ["**Contoh asli dari materi**", "Contoh dari Materi Proses Bisnis beserta halaman. Tombol **Perbesar** memperbesar gambar."],
    ["**Apa yang bisa saya tiru?**", "Pelajaran singkat yang dapat diterapkan pada kegiatan Anda."],
], [4.6, 7.6], size=13)
table_slide("Tombol di Halaman Contoh", SEC, ["Tombol / tautan", "Fungsi", "Cara menggunakan", "Hasil"], [
    ["**Gunakan contoh ini untuk membuat rencana**", "Membuat rencana baru berdasarkan contoh.", "Klik tombol di bagian atas.", "Rencana baru terbuka dengan cerita kebutuhan sudah terisi."],
    ["**Mulai dari contoh ini**", "Sama (di bilah atas).", "Klik di pojok kanan atas.", "Rencana baru berbasis contoh terbuka."],
    ["**Pelajari langkahnya dulu**", "Menggulir ke penjelasan langkah contoh.", "Klik di samping tombol utama.", "Bagian penjelasan ditampilkan."],
    ["**Semua contoh**", "Kembali ke daftar contoh.", "Klik di kiri atas.", "Halaman utama, bagian Belajar dari contoh."],
], [3.6, 3.0, 2.7, 2.9], size=13)
text_slide("Menggunakan Contoh sebagai Referensi", SEC, [
    B(["Menggunakan contoh selalu membuat **rencana baru milik Anda**. Isian awal diambil dari contoh dan dapat diubah bebas.",
       "Contoh aslinya tidak berubah.", "Muncul keterangan “Dimulai dari contoh: …” di atas Rencana baru.",
       "Ganti semua isian contoh dengan informasi kegiatan Anda sebelum draft digunakan."], 15),
    box("Contoh ilustratif StatPlan — bukan data atau dokumen resmi. Tidak ada angka hasil atau data responden sungguhan.", "Perhatian", "warn", 14),
], cols=1)

# =====================================================================
# 05 — MEMULAI RENCANA
# =====================================================================
divider(5, "Memulai Rencana", "Rencana baru terdiri atas tiga layar isian: Ceritakan, Hasil, dan Waktu. Bilah kemajuan menampilkan “Langkah N dari 6”; tiga langkah terakhir (Siapkan, Periksa, Draf) dikerjakan di Mode Terpandu dan Ruang kerja.")
SEC = "05 — MEMULAI RENCANA"
step_slide("Buka Rencana baru dan ceritakan kebutuhan", SEC, "06-rencana-ceritakan", ["Kotak cerita kebutuhan", "Contoh kalimat siap pakai"],
           ["Klik **Mulai perencanaan**, **Rencana baru**, atau **Gunakan contoh ini untuk membuat rencana**.",
            "Isi kotak **Informasi apa yang ingin Anda ketahui atau hasilkan?** dengan 1–2 kalimat (minimal 12 karakter).",
            "Jika bingung, klik contoh kalimat: **Kepuasan pelayanan**, **Pendataan UMKM**, atau **Statistik dari data administratif**."],
           diisi=[("Informasi apa yang ingin Anda ketahui atau hasilkan?", "cerita singkat kebutuhan. Contoh ilustratif: “" + D["intake"]["storyExample"] + "”")],
           hasil="Ringkasan dan saran cara memperoleh data muncul di bawah kotak.", catatan="Tautan **Bingung mulai dari mana?** membuka jawaban FAQ di tempat tanpa menghapus isian.")
step_slide("Periksa saran dan pilih jenis kegiatan", SEC, "06b-rencana-saran", ["Nama kegiatan (draf)", "Cara memperoleh data yang disarankan", "Pilihan Survei / Sensus / Kompromin", "Tombol Lanjutkan"],
           ["Periksa **Nama kegiatan (draf)** dan **Ringkasan kebutuhan**.", "Baca **Cara memperoleh data yang disarankan**.", "Jika kurang tepat, klik **Survei**, **Sensus**, atau **Kompromin**.", "Klik **Lanjutkan**."],
           hasil="Layar Langkah 2 “Apa yang ingin Anda dapatkan dari kegiatan ini?” terbuka.",
           catatan="Saran awal dari aturan sederhana berdasarkan kata-kata Anda — bukan AI dan bukan keputusan BPS.")
step_slide("Tentukan hasil yang diinginkan", SEC, "07-rencana-hasil", ["Kebutuhan awal", "Gunakan contoh ini", "Tulis sendiri", "Gunakan contoh & lanjutkan"],
           ["Baca kotak **Kebutuhan awal**.", "Klik **Gunakan contoh ini**, atau **Tulis sendiri** (satu baris per item).", "Klik **Gunakan contoh & lanjutkan** (atau **Gunakan & lanjutkan**)."],
           diisi=[("Tulis hasil (satu baris per item)", "output yang diharapkan, mis. “Tingkat kepuasan masyarakat” — contoh ilustratif")],
           hasil="Layar Langkah 3 “Kapan kegiatan ini dilakukan?” terbuka (Bagian 07).", catatan="Klik **Kembali** untuk mengubah Langkah 1.")

# =====================================================================
# 06 — IDENTIFIKASI KEGIATAN
# =====================================================================
divider(6, "Identifikasi Kegiatan", "Penjelasan setiap isian identifikasi di Rencana baru: tujuan, apa yang diisi, contoh pengisian, kesalahan umum, dan hasilnya.")
SEC = "06 — IDENTIFIKASI KEGIATAN"
table_slide("Isian Identifikasi — Langkah 1 (Ceritakan)", SEC, ["Isian", "Tujuan", "Yang diisi", "Contoh pengisian", "Kesalahan umum", "Hasil"], [
    ["Informasi apa yang ingin Anda ketahui atau hasilkan?", "Menjelaskan kebutuhan informasi.", "1–2 kalimat sehari-hari; min. 12 karakter.", "Contoh ilustratif: “" + D["intake"]["storyExample"] + "”", "Terlalu singkat; langsung menulis daftar variabel.", "Nama, ringkasan, dan saran muncul."],
    ["Nama kegiatan (draf)", "Nama awal proyek.", "Tidak diisi — periksa.", "“Survei kepuasan masyarakat terhadap pelayanan perizinan”", "Menganggapnya final.", "Nama proyek; dapat dilengkapi di Metadata."],
    ["Ringkasan kebutuhan", "Ringkasan cerita.", "Tidak diisi — periksa.", "“Kegiatan untuk mengetahui kepuasan masyarakat …”", "—", "Tampil sebagai Kebutuhan awal."],
    ["Cara memperoleh data yang disarankan", "Menentukan jenis kegiatan.", "Terima saran atau pilih tombol lain.", "Survei", "Menganggap saran sebagai keputusan BPS.", "Jenis kegiatan proyek."],
], [2.4, 1.8, 2.0, 2.4, 1.9, 1.7], size=11.5)
table_slide("Isian Identifikasi — Langkah 2 (Hasil)", SEC, ["Isian", "Tujuan", "Yang diisi", "Contoh pengisian (contoh ilustratif)", "Kesalahan umum", "Hasil"], [
    ["Daftar hasil (Gunakan contoh ini)", "Memakai contoh hasil sebagai awal.", "Klik tombol.", "Tingkat kepuasan masyarakat terhadap pelayanan; Hasil menurut jenis layanan", "Tidak menyesuaikan contoh.", "Hasil yang direncanakan tersimpan."],
    ["Tulis hasil (satu baris per item)", "Menulis hasil sendiri.", "Satu output per baris.", "Tingkat kepuasan masyarakat\nHasil menurut jenis layanan", "Menulis angka target atau hasil yang belum ada.", "Menjadi tujuan proyek di draft."],
], [2.4, 1.9, 1.7, 2.8, 1.8, 1.6], size=12)
text_slide("Survei, Sensus, atau Kompromin?", SEC, [
    KV([("Survei", "data dikumpulkan dari sebagian unit (sampel)."), ("Sensus", "data dikumpulkan dari seluruh unit (pendataan lengkap)."), ("Kompromin", "statistik disusun dari data administrasi yang sudah ada.")], 15),
    P("Keputusan akhir sebaiknya dibuat setelah memeriksa ketersediaan data (subproses 1.5). Lihat FAQ “Apa perbedaan survei, sensus, dan kompilasi data?”.", 14),
    box("Jenis kegiatan menentukan butir checklist yang relevan dan bagian draft (misalnya sampling hanya untuk survei). Jenis dapat diubah kemudian di Ruang kerja: **Survei / Sensus / Kompromin**.", "Catatan", "info", 13),
], cols=1)

# =====================================================================
# 07 — TIMELINE
# =====================================================================
divider(7, "Timeline", "Timeline membagi periode kegiatan Anda ke delapan fase GSBPM. Timeline dibuat pada Langkah 3 Rencana baru, sebelum proyek disimpan.")
SEC = "07 — TIMELINE"
w_ = {x["phaseId"]: x["weight"] for x in D["intake"]["weights"]}
text_slide("Memahami Timeline", SEC, [
    L("Mengapa timeline dibuat"),
    B(["Memberi gambaran kapan setiap fase dikerjakan.", "Membantu menyusun jadwal kegiatan (Materi Proses Bisnis memuat contoh jadwal pada fase Perancangan, Hal. 23).", "Mengisi periode kegiatan di draft dan di kotak Mode Terpandu “Rencana waktu Anda”."], 14),
    L("Bobot pembagian awal per fase"),
    KV([(f"{ph['n']}. {ph['title']}", str(w_[ph["id"]])) for ph in PHASES], 12.5),
    box("Timeline StatPlan merupakan alat bantu perencanaan, bukan durasi wajib BPS. Dalam praktik, fase GSBPM bisa tumpang tindih atau diulang.", "Perhatian", "warn", 13),
])
step_slide("Isi tanggal mulai dan tanggal selesai", SEC, "08-rencana-waktu", ["Pintasan durasi", "Tanggal mulai", "Tanggal selesai"],
           ["Klik pintasan **1 bulan**, **2 bulan**, **3 bulan**, atau **6 bulan** (opsional).", "Isi atau ubah **Tanggal mulai**.", "Isi atau ubah **Tanggal selesai** (sama dengan atau setelah tanggal mulai).", "Periksa kotak **Durasi kegiatan**."],
           diisi=[("Tanggal mulai", "tanggal kegiatan dimulai"), ("Tanggal selesai", "tanggal kegiatan selesai")],
           hasil="**Rencana waktu awal** menampilkan delapan fase dengan tanggalnya.", catatan="Pintasan hanya mengisi tanggal; Anda tetap dapat mengubah tanggal secara langsung.")
step_slide("Baca dan sesuaikan rencana waktu awal", SEC, "09-rencana-jadwal", ["Sesuaikan jadwal", "Keterangan: bukan durasi wajib BPS"],
           ["Baca nomor, nama, tanggal, dan batang setiap fase.", "Untuk mengubah, klik **Sesuaikan jadwal**.", "Ubah tanggal **Mulai** dan **Selesai** fase.", "Klik **Selesai sesuaikan**."],
           hasil="Tanggal fase diperbarui.", catatan="Tanggal fase harus berada di dalam periode kegiatan. Mengubah tanggal mulai/selesai kegiatan membuat pembagian fase dihitung ulang.")
table_slide("Pesan Kesalahan Tanggal", SEC, ["Pesan di aplikasi", "Artinya", "Cara memperbaiki"], [
    ["Tanggal mulai wajib diisi. / Tanggal selesai wajib diisi.", "Salah satu tanggal kosong.", "Isi kedua tanggal."],
    ["Tanggal selesai harus setelah atau sama dengan tanggal mulai.", "Tanggal selesai lebih awal.", "Perbaiki tanggal selesai."],
    ["Tanggal mulai tahap tidak boleh sebelum tanggal mulai kegiatan.", "Tanggal fase di luar periode.", "Geser tanggal fase ke dalam periode."],
    ["Tanggal selesai tahap tidak boleh setelah tanggal selesai kegiatan.", "Tanggal fase di luar periode.", "Geser tanggal fase ke dalam periode."],
    ["Rencana waktu belum lengkap. Periksa tanggal kegiatan.", "Pembagian delapan fase belum terbentuk.", "Periksa tanggal mulai dan selesai."],
], [5.4, 3.3, 3.5], size=13)
step_slide("Simpan rencana dan lanjut", SEC, "10-serah-terima", ["Lanjut ke Identifikasi Kebutuhan"],
           ["Klik **Gunakan rencana waktu & lanjutkan**.", "Baca ringkasan **Rencana waktu sudah dibuat**: Kebutuhan, Hasil, Waktu, Pembagian tahap.", "Klik **Lanjut ke Identifikasi Kebutuhan**."],
           hasil="Proyek tersimpan (pemberitahuan “Rencana waktu tersimpan”) dan Mode Terpandu terbuka.")
shot_slide("Melihat Timeline Setelah Proyek Dibuat", SEC, "25-tab-timeline", [
    ("Tab Timeline", "Tab pertama Ruang kerja: batang per fase dengan minggu ke- dan tanggal.", "Klik tab Timeline untuk melihat jadwal.")],
    extra=[L("Mengubah tanggal"), P("Sebelum menekan **Gunakan rencana waktu & lanjutkan**, tanggal dapat diubah kapan saja (tombol **Kembali** ke langkah sebelumnya).", 12.5),
           box("Pada StatPlan 1.0.0 tab Timeline hanya menampilkan jadwal. Pengubahan tanggal setelah proyek dibuat tidak ditemukan pada implementasi aplikasi yang diperiksa. Jika periode berubah, buat rencana baru.", "Perhatian", "warn", 12)])

# =====================================================================
# 08 — GUIDED GSBPM
# =====================================================================
divider(8, "Guided GSBPM (Mode Terpandu)", "Mode Terpandu adalah panduan belajar dan perencanaan: pelajari satu subproses GSBPM pada satu waktu, lalu siapkan bahannya. Kunci tahap adalah urutan belajar StatPlan, bukan urutan wajib GSBPM.")
SEC = "08 — GUIDED GSBPM"
text_slide("Membuka Mode Terpandu", SEC, [
    L("Tiga cara membuka"),
    N(["Setelah membuat rencana: klik **Lanjut ke Identifikasi Kebutuhan**.", "Dari **Proyek saya**: klik **Lanjutkan di Mode Terpandu** pada kartu “Lanjutkan pekerjaan”.", "Dari Ruang kerja: klik tautan **Kembali ke Mode Terpandu**."], 15),
    box("Anda dapat membuka Ruang kerja kapan saja dari Mode Terpandu dengan tombol **Buka ruang kerja lengkap** di bawah halaman fase.", "Tips", "tip", 13),
], cols=1)
shot_slide("Halaman Fase — Struktur Utama", SEC, "11-terpandu-fase", [
    ("Urutan belajar StatPlan", "Delapan fase dengan status Sedang dipelajari, Tersedia, Dipahami, atau Belum dibuka (gembok).", "Klik fase yang terbuka untuk berpindah."),
    ("Judul fase", "Nomor, nama fase, dan penjelasan singkat.", "Baca untuk memahami tujuan fase.")])
table_slide("Halaman Fase — Bagian-bagiannya", SEC, ["Bagian", "Isi dan fungsi"], [
    ["**Subproses resmi**", "Jumlah subproses resmi pada fase."],
    ["**Dipahami**", "Progress: berapa subproses sudah ditandai dipahami (mis. 0 / 6)."],
    ["**Rencana waktu Anda**", "Tanggal fase dari timeline — “Bukan durasi wajib BPS”."],
    ["Catatan sumber", "Nama resmi fase, halaman Materi Proses Bisnis, **Output tahap menurut materi**, catatan GSBPM fleksibel."],
    ["Kartu subproses", "Kode, nama resmi, halaman materi, status format kerja, tombol **Pelajari**."],
    ["**Bahan Anda**", "Status format kerja tiap subproses; tombol **Lanjutkan menyiapkan bahan**."],
    ["Kotak penyelesaian", "“N dari M subproses sudah dipahami” dan tombol **Selesai memahami tahap ini**."],
    ["**Buka ruang kerja lengkap**", "Membuka Ruang kerja proyek (Bagian 11)."],
], [4.0, 8.2], size=13.5)
shot_slide("Kartu Subproses — Bagian Penjelasan", SEC, "12-subproses-apa", [
    ("Apa?", "Penjelasan sederhana dengan rujukan halaman materi.", "Baca; klik **Lihat poin dari materi** untuk poin asli.")],
    extra=[L("Urutan isi kartu"), N(["**Apa?** — penjelasan", "**Contoh** — contoh penerapan; buka **Contoh isian lengkap**", "**Yang bisa dipelajari** — poin penting", "**Format kerja StatPlan** — **Isi format kerja**", "**Bukti dukung** — dokumen yang biasa disiapkan", "**Tandai sudah dipahami** lalu **Lanjut ke …**"], 12)])
shot_slide("Kartu Subproses — Format Kerja dan Bukti Dukung", SEC, "13-subproses-format-bukti", [
    ("Format kerja StatPlan", "Bahan kerja subproses dengan status draft.", "Baca penjelasannya."),
    ("Isi format kerja", "Membuka panel isian.", "Klik untuk mengisi bahan kerja."),
    ("Bukti dukung", "Dokumen yang biasanya disiapkan.", "Status diisi di dalam panel format kerja.")])
step_slide("Isi format kerja", SEC, "14-format-kerja", ["Isian format kerja", "Status penyimpanan lokal", "Tombol Selesai mengisi"],
           ["Klik **Isi format kerja** pada kartu.", "Baca penjelasan dan **Contoh ilustratif StatPlan** di kiri panel.", "Isi kolom **Format kerja StatPlan · Isian Anda** (tanda * wajib).", "Klik **Selesai mengisi**."],
           hasil="Status format kerja: **Belum diisi** → **Draft disiapkan** (sebagian) → **Bahan siap** (kolom wajib terisi).",
           catatan="Isian tersimpan otomatis (“Disimpan secara lokal”). **Reset draft** mengosongkan isian subproses tersebut. Status ini ringkasan persiapan — bukan status resmi BPS.")
step_slide("Tandai status bukti dukung", SEC, "15-bukti-dukung", ["Bukti yang perlu disiapkan", "Status persiapan"],
           ["Di panel format kerja, gulir ke **Bukti yang perlu disiapkan**.", "Pilih **Status persiapan**: Belum disiapkan, Sedang disiapkan, atau Sudah disiapkan.", "Isi **Catatan (opsional)** bila perlu."],
           hasil="Jumlah bukti yang disiapkan tampil sebagai “N/M disiapkan”.",
           catatan="Status bukti adalah catatan lokal — bukan verifikasi BPS. Tidak semua bukti wajib dan tidak ada unggahan dokumen ke server.")
step_slide("Tandai subproses sudah dipahami", SEC, "16-sudah-dipahami", ["Status Sudah dipahami", "Tombol Lanjut ke subproses berikutnya"],
           ["Setelah membaca kartu, klik **Tandai sudah dipahami**.", "Klik **Lanjut ke …** untuk subproses berikutnya."],
           hasil="Kartu berstatus **Sudah dipahami**; penghitung **Dipahami** bertambah.",
           catatan="“Sudah dipahami” adalah status pembelajaran pada StatPlan, bukan bukti bahwa proses statistik di dunia nyata telah selesai. Kartu yang sudah dipahami dapat dibuka lagi (tombol **Tinjau**).")
step_slide("Periksa Bahan Anda dan selesaikan fase", SEC, "17-bahan-anda", ["Bahan Anda", "Jumlah subproses yang sudah dipahami"],
           ["Pastikan semua kartu fase berstatus **Sudah dipahami**.", "Periksa ringkasan **Bahan Anda** — bahan tidak harus lengkap untuk melanjutkan.", "Klik **Selesai memahami tahap ini**."],
           hasil="Fase berstatus **Dipahami**.", catatan="Tombol **Selesai memahami tahap ini** aktif setelah semua subproses fase ditandai dipahami.")
step_slide("Lanjut ke fase berikutnya", SEC, "18-fase-selesai", ["Keterangan fase sudah dipelajari", "Tombol Lanjut ke Perancangan"],
           ["Baca keterangan “Fase ini sudah Anda pelajari.”", "Klik **Lanjut ke …** (mis. **Lanjut ke Perancangan**)."],
           hasil="Fase berikutnya terbuka.")
shot_slide("Kembali dan Berpindah Fase", SEC, "19-fase-perancangan", [
    ("Urutan belajar StatPlan", "Fase selesai berstatus Dipahami; fase berikutnya Sedang dipelajari.", "Klik nama fase yang terbuka untuk kembali."),
    ("Judul fase Perancangan", "Fase kedua yang baru terbuka.", "Pelajari subproses 2.1–2.6.")],
    extra=[L("Kembali"), P("Klik nama fase pada **Urutan belajar StatPlan**, atau tombol **Kembali ke …** di bawah fase.", 12.5)])
step_slide("Mode Terpandu selesai dan Review StatPlan", SEC, "20-terpandu-selesai", ["Judul Mode Terpandu selesai", "Periksa di Workspace", "Unduh draf"],
           ["Setelah fase Evaluasi selesai, baca **Mode Terpandu selesai** dan kotak **Review StatPlan**.", "Klik **Periksa di Workspace** (tab Checklist) atau **Unduh draf** (tab Ekspor).", "**Lihat kembali persiapan** kembali ke fase Evaluasi; **Kembali ke beranda** ke Proyek saya."],
           hasil="Anda masuk ke Ruang kerja untuk meninjau kesiapan draft.",
           catatan="Ini penyelesaian belajar — bukan bahwa kegiatan statistik selesai, disetujui BPS, atau lulus evaluasi resmi. Isian format kerja tidak disalin otomatis ke Ruang kerja.")

# =====================================================================
# 09 — 8 FASE GSBPM
# =====================================================================
divider(9, "8 Fase GSBPM", "Satu bagian untuk setiap fase: tujuan, penjelasan sederhana, hubungan dengan StatPlan, daftar subproses, dan cara menggunakannya.",
        [(f"Fase {ph['n']} — {PHASE_EN[ph['n'] - 1]}", f"phase{ph['n']}") for ph in PHASES])
SEC = "09 — 8 FASE GSBPM"
for ph in PHASES:
    n = ph["n"]
    s = new_slide(f"Fase {n} — {PHASE_EN[n - 1]} ({ph['title']})", SEC, key=f"phase{n}", subtitle=f"Materi Proses Bisnis, {ph['pdfRange']} · {len(ph['cards'])} subproses")
    ix, iy, iw, ih = screen(s, f"phase-{n}", 7.0, Y0 + 0.12, 5.78, YMAX - Y0 - 0.45, src="cards", crop=(170, 0, 1110, 736),
                            legend=None, caption=f"Mode Terpandu — fase {ph['title']}: ① urutan belajar ② judul fase ③ subproses resmi")
    how = ("Otomatis setelah membuat rencana, atau lewat **Lanjutkan di Mode Terpandu**." if n == 1 else
           f"Selesaikan fase sebelumnya, lalu klik **Lanjut ke {ph['title']}** atau klik fase ini pada **Urutan belajar StatPlan**.")
    blocks = [L("Tujuan"), P(ph["purpose"], 12.5), L("Penjelasan sederhana"), P(ph["explanation"], 12.5),
              L("Hubungan dengan StatPlan"), P(f"Di Mode Terpandu fase ini berisi {len(ph['cards'])} kartu subproses, masing-masing dengan penjelasan, contoh, format kerja, dan bukti dukung. Di Ruang kerja, tab **Alur kerja** dan **Checklist** memuat butir checklist fase ini.", 12.5),
              L(f"Daftar subproses ({len(ph['cards'])}) — klik untuk membuka"),
              {"k": "links", "items": [(f"{c['code']} {c['official']}", f"sp-{c['code']}") for c in ph["cards"]], "size": 12.5},
              L("Cara penggunaan"), P(how, 12.5), L("Pertanyaan fase"), P(ph["question"], 12.5),
              L("Output tahap menurut materi"), B(ph["outputs"] + [f"(Materi Proses Bisnis, Hal. {ph['outputsPage']})"], 12)]
    flow(blocks, (s, [(X0, Y0 + 0.12, 6.2, YMAX)]), cont_factory(f"Fase {n} — {PHASE_EN[n - 1]}", SEC), [(X0, Y0, 5.95, YMAX), (X0 + 6.28, Y0, 5.95, YMAX)])

# =====================================================================
# 10 — 44 SUBPROSES
# =====================================================================
divider(10, "44 Subproses GSBPM", "Setiap subproses dijelaskan pada halaman tersendiri: tujuan, apa yang perlu dipahami, langkah di StatPlan, tangkapan layar kartu, contoh, format kerja, bukti dukung, status “Sudah dipahami”, hasil, dan catatan.")
SEC = "10 — 44 SUBPROSES"
s = new_slide("Indeks 44 Subproses (klik kode untuk membuka)", SEC, key="spindex")
col_w = XW / 4
col, row = 0, 0
yy = Y0
for ph in PHASES:
    need = 0.34 + sum(0.2 * wrap_lines(f"{c['code']}  {c['official']}", col_w - 0.1, 10.5) + 0.06 for c in ph["cards"])
    if yy + need > YMAX + 0.05:
        col += 1; yy = Y0
    x = X0 + col * col_w
    t = text(s, x, yy, col_w - 0.1, 0.3, f"Fase {ph['n']} — {PHASE_EN[ph['n'] - 1]}", size=12, color=ACC_TXT, bold=True)
    link(t, f"phase{ph['n']}")
    yy += 0.32
    for c in ph["cards"]:
        nl = wrap_lines(f"{c['code']}  {c['official']}", col_w - 0.1, 10.5)
        t = text(s, x, yy, col_w - 0.1, 0.2 * nl + 0.05, f"{c['code']}  {c['official']}", size=10.5, color=NAVY)
        link(t, f"sp-{c['code']}")
        yy += 0.2 * nl + 0.06
    yy += 0.1
DONE_SP = []
for ph in PHASES:
    for c in ph["cards"]:
        code = c["code"]; prep = c["prep"]
        title = f"{code} {c['official']}"
        sub = f"Fase {ph['n']} {PHASE_EN[ph['n'] - 1]} ({ph['title']}) · Judul di StatPlan: “{c['title']}” · Materi Proses Bisnis, Hal. {c['page']}"
        # --- slide A: tujuan, pemahaman, langkah + screenshot of the card
        s = new_slide(title, SEC, key=f"sp-{code}", subtitle=sub)
        DONE_SP.append(code)
        ix, _, iw, _ = screen(s, f"card-{code}-a", 7.0, Y0 + 0.12, X0 + XW - 7.0, YMAX - Y0 - 0.95, src="cards",
               legend=None, caption="Kartu subproses (tangkapan layar asli)", align="right")
        text(s, ix, YMAX - 0.45, iw, 0.42, "① Kartu subproses  ② Apa?  ③ Contoh", size=11, color=INK, align=PP_ALIGN.CENTER)
        TXW = ix - X0 - 0.35
        pts = c["materiPoints"] or c["lessonPoints"]
        req = [f["label"] for f in prep["fields"] if f["required"]]
        blocksA = [L("Tujuan"), P(c["apa"], 12.5),
                   L("Apa yang perlu dipahami"), P(f"Menurut Materi Proses Bisnis, Hal. {c['page']}:" if c["materiPoints"] else "Poin penting (penjelasan sederhana StatPlan):", 11, color=GRAY, italic=True), B(pts, 12)]
        if c["materiPoints"] and c["lessonPoints"]:
            blocksA += [P("Yang bisa dipelajari:", 11, color=GRAY, italic=True), B(c["lessonPoints"], 12)]
        blocksA += [L("Langkah di StatPlan"), N([
            f"Buka Mode Terpandu fase **{ph['title']}**, lalu klik kartu **{code}** (tombol **Pelajari**).",
            "Baca **Apa?**, **Contoh**, dan **Yang bisa dipelajari**.",
            f"Klik **Isi format kerja** (“{prep['title']}”), isi minimal " + ("; ".join(f"**{x}**" for x in req) if req else "isian yang relevan") + ", lalu **Selesai mengisi**.",
            "Pilih status bukti di **Bukti yang perlu disiapkan**, lalu klik **Tandai sudah dipahami**."], 12)]
        cont = cont_factory(title, SEC)
        flow(blocksA, (s, [(X0, Y0 + 0.12, TXW, YMAX)]), cont, [(X0, Y0, 5.95, YMAX), (X0 + 6.28, Y0, 5.95, YMAX)])
        # --- slide B: contoh, format kerja, bukti dukung, status, hasil, catatan + screenshot of the lower card
        s = new_slide(title + " — Contoh dan Format Kerja", SEC, subtitle=sub)
        ix, _, iw, _ = screen(s, f"card-{code}-b", 7.0, Y0 + 0.12, X0 + XW - 7.0, YMAX - Y0 - 0.95, src="cards", legend=None, caption="Bagian bawah kartu (tangkapan layar asli)", align="right")
        text(s, ix, YMAX - 0.45, iw, 0.42, "① Format kerja  ② Bukti dukung  ③ Tandai sudah dipahami", size=11, color=INK, align=PP_ALIGN.CENTER)
        TXW = ix - X0 - 0.35
        cls = {"A": "Menurut Materi Proses Bisnis", "B": "Penjelasan sederhana", "C": "Contoh ilustratif StatPlan — bukan data atau dokumen resmi."}.get(c["contohClass"], "Contoh")
        ev = [e["label"] + (f" — output tahap menurut materi, Hal. {e['page']}" if e["page"] else "") for e in prep["evidence"]]
        notes = [prep["disclaimer"]] + ([prep["educationalNote"]] if prep.get("educationalNote") else [])
        if c["checklist"]:
            notes.append("Butir checklist terkait di Ruang kerja: " + "; ".join(x["label"] + (" (wajib)" if x["required"] else "") + (f" — khusus {', '.join(x['jenis'])}" if x["jenis"] else "") + (f" — khusus {', '.join(x['klasifikasi'])}" if x["klasifikasi"] else "") for x in c["checklist"]) + ".")
        if c["skipWhen"]:
            notes.append("Butir checklist subproses ini tidak ditampilkan untuk: " + ", ".join(c["skipWhen"]) + ".")
        blocksB = [L("Contoh"), P(c["contoh"], 12.5), P(cls, 11, color=ACC_TXT, italic=True)]
        if c["contohDetail"]:
            blocksB.append(KV([(r["label"], r["value"]) for r in c["contohDetail"]], 11.5))
        blocksB += [L("Format kerja"), P(f"**{prep['title']}** ({prep['sourceLabel']}). Isian:", 12), B(fields_text(prep), 11.5),
                    L("Bukti dukung"), B(ev, 11.5), P("Status: Belum disiapkan, Sedang disiapkan, atau Sudah disiapkan — catatan lokal, bukan verifikasi BPS.", 10.5, color=GRAY, italic=True),
                    L("Status “Sudah dipahami”"), P("Klik **Tandai sudah dipahami** setelah membaca materi. “Sudah dipahami” adalah status pembelajaran pada StatPlan, bukan bukti bahwa proses statistik di dunia nyata telah selesai.", 12),
                    L("Hasil"), P(f"Anda memahami subproses {code} {c['official']} dan memiliki bahan kerja “{prep['title']}” (status **Bahan siap** bila kolom wajib terisi) beserta catatan bukti dukung.", 12),
                    L("Catatan"), B(notes, 11.5)]
        flow(blocksB, (s, [(X0, Y0 + 0.12, TXW, YMAX)]), cont_factory(title + " — Contoh dan Format Kerja", SEC), [(X0, Y0, 5.95, YMAX), (X0 + 6.28, Y0, 5.95, YMAX)])
assert DONE_SP == CODES

# =====================================================================
# 11 — WORKSPACE
# =====================================================================
divider(11, "Workspace (Ruang Kerja)", "Ruang kerja adalah tempat melihat dan melengkapi seluruh isi proyek. Mode Terpandu untuk belajar dan menyiapkan bahan; Ruang kerja untuk melengkapi data yang masuk ke draft dan memeriksa kesiapan ekspor.")
SEC = "11 — WORKSPACE"
shot_slide("Proyek Saya — Membuka Proyek", SEC, "21-proyek-saya", [
    ("Perbarui demo / Muat demo", "Memuat atau menyegarkan lima proyek demo (contoh ilustratif).", "Klik bila ingin berlatih dengan proyek demo.")],
    extra=[L("Tombol lain"), KV([("Lanjutkan di Mode Terpandu", "melanjutkan belajar proyek terakhir"), ("Buka ruang kerja", "membuka Ruang kerja proyek terakhir"), ("Buka", "membuka proyek pada daftar"),
                                 ("Ikon tempat sampah", "menghapus proyek (dengan konfirmasi)"), ("Bersihkan data demo", "menghapus proyek demo saja")], 12),
           P("**Perlu perhatian** menampilkan hal yang perlu dilengkapi; **Ringkasan** menghitung Proyek, Siap ditinjau, Siap diekspor.", 12)])
shot_slide("Bagian Atas Ruang Kerja", SEC, "22-workspace", [
    ("FASE SAAT INI · CHECKLIST WAJIB · DRAF DOKUMEN", "Fase proyek, persentase checklist wajib (“Minimal 80% untuk ekspor draf”), dan status **Siap diunduh**/**Belum siap**.", "Periksa sebelum ekspor."),
    ("LANGKAH BERIKUTNYA", "Hal paling penting untuk dikerjakan sekarang.", "Klik tombolnya, mis. **Buka Alur kerja**.")],
    extra=[L("Tombol lain"), KV([("Detail proyek", "penanggung jawab, klasifikasi, metode, portal rujukan, rekomendasi BPS, tanggal"), ("Lihat persyaratan ekspor", "menuju tab Ekspor"),
                                 ("Salin tautan berbagi", "menyalin tautan berisi salinan proyek ke clipboard"), ("Kembali ke Mode Terpandu", "kembali ke Mode Terpandu"), ("Survei / Sensus / Kompromin", "mengubah jenis kegiatan")], 12),
           box("Perubahan di Ruang kerja tersimpan otomatis di browser (“Draf tersimpan”).", "Tips", "tip", 11.5)])
table_slide("Sembilan Tab Ruang Kerja", SEC, ["Tab", "Fungsi / yang ditampilkan", "Cara menggunakan", "Yang diperiksa sebelum ekspor"], [
    ["**Timeline**", "Jadwal per fase (minggu ke- dan tanggal).", "Lihat jadwal.", "Periode sesuai rencana."],
    ["**Alur kerja**", "Checklist per fase/subproses, pemeriksaan portal, draf rekomendasi (sektoral).", "Centang butir; catat portal; isi draf rekomendasi.", "Portal dicek; butir 1.5 dan 2.6 ditandai."],
    ["**Checklist**", "Semua butir wajib per fase.", "Centang butir yang benar-benar disiapkan.", "Checklist wajib ≥ 80%."],
    ["**Perancangan**", "Cara, metode, moda; sampling (survei).", "Pilih isian; pakai kalkulator sampel.", "Cara pengumpulan terisi."],
    ["**Variabel**", "Manajer variabel dan ringkasan indikator.", "Tambah/ubah/hapus variabel.", "Nama dan definisi lengkap."],
    ["**Instrumen**", "Pertanyaan (survei/sensus) atau pemetaan sumber (kompromin).", "Tambah/ubah pertanyaan.", "Instrumen tersusun."],
    ["**Metadata**", "Draft MS-Keg, MS-Var, MS-Ind.", "Isi kolom metadata.", "MS-Keg lengkap."],
    ["**Riwayat**", "Waktu dibuat, diubah, pemeriksaan portal dicatat.", "Lihat saja.", "Tidak memengaruhi ekspor."],
    ["**Ekspor**", "Tinjauan sebelum ekspor dan unduh draft.", "Periksa kekurangan; unduh .docx.", "Tidak ada temuan Perlu dilengkapi."],
], [2.0, 4.0, 3.2, 3.0], size=12.5)
shot_slide("Tab Timeline", SEC, "25-tab-timeline", [("Tab Timeline", "Rencana waktu per fase (minggu ke-berapa), ilustratif untuk perencanaan — tidak mengubah validasi ekspor.", "Periksa periode dan urutan fase.")],
           extra=[L("Hasil"), P("Anda melihat jadwal proyek; tanggal tidak dapat diubah di tab ini (lihat Bagian 07).", 12.5)])
shot_slide("Tab Alur Kerja", SEC, "26-tab-alur-kerja", [("Tab Alur kerja", "Kelompok pembelajaran (8 fase dengan persentase), subproses, penjelasan, Contoh ilustrasi, dan butir CHECKLIST (* = wajib).", "Pilih fase → subproses → centang butir → Lanjut ke …")],
           extra=[L("Kotak khusus"), B(["**Pemeriksaan portal rujukan statistik** (1.5) — lihat Bagian 16.", "**Draf rekomendasi kegiatan statistik ke BPS** (Perancangan, sektoral): Nama kegiatan, Penyelenggara, Tujuan kegiatan, Periode pelaksanaan, Catatan tambahan; klik **Ubah**."], 12),
                  box("Draf rekomendasi hanya bahan kerja; pengajuan dilakukan melalui prosedur yang berlaku. Di draft, statusnya “Belum diverifikasi”.", "Perhatian", "warn", 11.5)])
shot_slide("Tab Checklist", SEC, "27-tab-checklist", [("Tab Checklist", "Semua butir checklist per fase dengan kode subproses; butir tak relevan dengan jenis kegiatan tidak ditampilkan.", "Centang hanya butir yang sudah benar-benar disiapkan.")],
           extra=[L("Hasil"), P("Persentase **CHECKLIST WAJIB** bertambah; minimal 80% untuk ekspor.", 12.5), box("Checklist StatPlan bukan daftar kelengkapan atau persetujuan BPS.", "Perhatian", "warn", 11.5)])
shot_slide("Tab Perancangan", SEC, "28-tab-perancangan", [("Tab Perancangan", "Perancangan pengumpulan data dan Kalkulator ukuran sampel.", "Pilih isian sesuai rencana.")],
           extra=[L("Isian"), KV([("Cara pengumpulan", "Survei, Sensus, atau Kompromin (menyesuaikan jenis kegiatan dan checklist)"), ("Metode pengumpulan", "wawancara, pengisian mandiri, observasi lapangan"),
                                  ("Moda pengumpulan", "PAPI, CAPI, CATI, CAWI"), ("Metode sampling (Design 2.4) / Ukuran sampel", "khusus survei"),
                                  ("Kalkulator ukuran sampel", "Populasi (N), Margin error (e) %, Rumus (Yamane atau Z + koreksi populasi), lalu **Terapkan ke ukuran sampel** — hasil ilustratif, perlu ditinjau ahli metodologi")], 11.5)])
shot_slide("Tab Riwayat", SEC, "32-tab-riwayat", [("Tab Riwayat", "Waktu Dibuat, Terakhir diubah, dan Pemeriksaan portal dicatat.", "Lihat saja; bukan log setiap aktivitas.")],
           extra=[L("Hasil"), P("Tidak memengaruhi ekspor.", 12.5)])

# =====================================================================
# 12 — VARIABEL / 13 INDIKATOR / 14 INSTRUMEN / 15 METADATA
# =====================================================================
divider(12, "Variabel", "Variabel adalah informasi yang dikumpulkan dari setiap responden atau unit (Materi Proses Bisnis, Hal. 19).")
SEC = "12 — VARIABEL"
v = D["skm"]["variables"][2]
text_slide("Apa Itu Variabel", SEC, [
    P("Variabel adalah informasi yang dikumpulkan dari setiap responden/unit, misalnya umur atau pekerjaan (Materi Proses Bisnis, Hal. 19).", 15),
    L("Contoh ilustratif (proyek demo SKM)"), B([x["name"] + " — " + x["definition"] for x in D["skm"]["variables"]], 14),
    L("Hubungan"), P("Pertanyaan pada **instrumen** menghasilkan nilai **variabel**; **indikator** dihitung dari variabel.", 14),
], cols=1)
step_slide("Tambah dan lengkapi variabel", SEC, "29-tab-variabel", ["Tab Variabel"],
           ["Buka Ruang kerja, tab **Variabel**.", "Klik **+ Tambah**.", "Isi **Nama variabel*** dan **Definisi** dulu.", "Lengkapi **Kategori**, **Tipe data**, **Skala**, **Satuan**, **Sumber**, **Contoh nilai**, **Aturan nilai hilang**.", "Gunakan **Pindah ke atas/bawah**, **Duplikat variabel**, **Hapus variabel** bila perlu."],
           diisi=[("Nama variabel*", v["name"]), ("Definisi", v["definition"]), ("Tipe data / Skala", f"{v['type']} / {v['scale']}"), ("Satuan", v["unit"] or "—"), ("Contoh nilai", v["example"] or "—"), ("Aturan nilai hilang", v["missing"] or "—")],
           hasil="Variabel tersimpan otomatis dan tampil di draft (bagian Variabel).", catatan="Setiap isian punya tombol bantuan **Cara mengisi: …**; tautan **Apa itu variabel?** membuka FAQ.")
text_slide("Memeriksa Variabel", SEC, [
    N(["Setiap variabel memiliki **Nama variabel** dan **Definisi** (jika tidak, muncul temuan “Ada variabel tanpa definisi”).", "Setiap kolom/baris rancangan tabel (2.1) terwakili variabel.", "Tipe data dan skala sesuai jenis jawaban.", "Aturan nilai hilang dicatat.", "Variabel yang tidak dipakai di output dihapus."], 15),
    box("Contoh variabel pada panduan ini berasal dari proyek demo — contoh ilustratif StatPlan, bukan data atau dokumen resmi.", "Perhatian", "warn", 13),
], cols=1)

divider(13, "Indikator", "Indikator adalah angka ringkas yang dihitung dari variabel untuk menggambarkan suatu keadaan.")
SEC = "13 — INDIKATOR"
ind = D["skm"]["indicators"]
text_slide("Apa Itu Indikator dan Cara Melihatnya", SEC, [
    P("Indikator adalah angka ringkas yang dihitung dari variabel untuk menggambarkan suatu keadaan (penjelasan sederhana; Materi Proses Bisnis Hal. 14 dan 17).", 14),
    L("Contoh ilustratif (proyek demo SKM)"), KV([(i["name"], f"{i['formula']} — variabel terkait: {', '.join(i['related'])}") for i in ind], 13),
    L("Cara melihat dan mengisi di StatPlan"),
    N(["Buka tab **Variabel**; gulir ke bagian **Indikator** di bawah Manajer variabel — tampil nama indikator, rumus, dan variabel terkait.", "Lengkapi definisi dan satuan indikator di tab **Metadata** → **MS-Ind** (Nama indikator, Definisi indikator, Rumus / cara perhitungan, Variabel terkait, Satuan indikator).", "Di Mode Terpandu, subproses 2.1 membahas formulasi indikator."], 13),
    box("Di draft hasil ekspor, definisi dan satuan indikator diambil dari MS-Ind bila tersedia; “—” berarti belum diisi.", "Catatan", "info", 12.5),
], cols=1)
shot_slide("Indikator pada Tab Variabel", SEC, "29-tab-variabel", [("Tab Variabel", "Bagian Indikator berada di bawah Manajer variabel.", "Gulir ke bawah untuk melihat indikator.")],
           extra=[L("Hasil"), P("Indikator tampil di draft (bagian Indikator) dengan rumus dan variabel terkait.", 12.5)])

divider(14, "Instrumen", "Instrumen adalah alat pengumpulan data, misalnya kuesioner atau panduan (Materi Proses Bisnis, Hal. 24).")
SEC = "14 — INSTRUMEN"
text_slide("Apa Itu Instrumen", SEC, [
    P("Instrumen adalah alat pengumpulan data, misalnya kuesioner atau panduan teknis (Materi Proses Bisnis, Hal. 24).", 15),
    L("Contoh ilustratif (proyek demo SKM)"), B([f"{q['number']}. {q['text']} ({q['type']})" for q in D["skm"]["questions"]], 13),
    box("Susun pertanyaan runtut dan singkat, hindari pertanyaan ganda atau mengarahkan, dan samakan opsi jawaban dengan kategori variabel (Materi Proses Bisnis, Build 3.1).", "Tips", "tip", 13),
], cols=1)
step_slide("Susun pertanyaan instrumen", SEC, "30-tab-instrumen", ["Tab Instrumen"],
           ["Buka tab **Instrumen**.", "Klik **Tambah**.", "Isi **No.**, **Teks pertanyaan***, pilih **Tipe** (Terbuka, Tertutup, Skala), isi **Opsi jawaban**.", "Gunakan **Duplikat pertanyaan** / **Hapus pertanyaan** bila perlu."],
           diisi=[("No.", "nomor urut, mis. 1 atau P1"), ("Teks pertanyaan*", "mis. “Jenis kelamin responden” — contoh ilustratif"), ("Tipe", "Terbuka, Tertutup, atau Skala"), ("Opsi jawaban", "mis. Laki-laki | Perempuan")],
           hasil="Pertanyaan tersimpan otomatis dan tampil di draft (Lampiran B).", catatan="Untuk kompromin tidak ada kuesioner — tab ini dipakai untuk mendokumentasikan pemetaan variabel ke sumber data administrasi.")

divider(15, "Metadata", "Metadata adalah informasi dalam struktur dan format baku untuk menggambarkan dan menjelaskan data (Materi Proses Bisnis, Hal. 58). Di StatPlan berupa DRAFT METADATA.")
SEC = "15 — METADATA"
table_slide("Draft Metadata: MS-Keg, MS-Var, MS-Ind", SEC, ["Bagian", "Menjelaskan", "Kolom (* = wajib)"], [
    ["**MS-Keg**", "Kegiatan statistik", "; ".join(f["label"] + (" *" if f["required"] else "") for f in D["metadata"]["keg"])],
    ["**MS-Var**", "Variabel", "; ".join(f["label"] + (" *" if f["required"] else "") for f in D["metadata"]["var"])],
    ["**MS-Ind**", "Indikator", "; ".join(f["label"] + (" *" if f["required"] else "") for f in D["metadata"]["ind"])],
], [1.8, 2.4, 8.0], size=13, subtitle="Mengikuti arah Peraturan BPS Nomor 5 Tahun 2020.")
step_slide("Isi draft metadata", SEC, "31-tab-metadata", ["Tab Metadata"],
           ["Buka tab **Metadata**.", "Lengkapi **MS-Keg** dulu — seluruh kolom * wajib untuk ekspor.", "Lengkapi **MS-Var** dan **MS-Ind**.", "Periksa tanda **Lengkap** pada setiap kolom."],
           hasil="Draft memuat bagian **Draft Metadata**.", catatan="Tautan **Mengapa metadata diperlukan?** membuka FAQ.")
text_slide("Yang Diperiksa pada Metadata", SEC, [
    N(["**MS-Keg lengkap** — tanpa ini draft tidak dapat diunduh.", "Nama kegiatan dan penyelenggara di MS-Keg sama dengan identitas proyek.", "MS-Var dan MS-Ind (disarankan) menjelaskan variabel dan indikator utama."], 15),
    box("Metadata di StatPlan adalah rancangan. Di dokumen hasil ekspor bagian ini berjudul “Draft Metadata” dengan keterangan bahwa struktur metadata perlu disesuaikan dan diverifikasi sesuai ketentuan yang berlaku. StatPlan tidak mengirim atau mendaftarkan metadata ke sistem BPS.", "DRAFT METADATA", "warn", 13.5),
], cols=1)

# =====================================================================
# 16 — PEMERIKSAAN DAN VALIDASI
# =====================================================================
divider(16, "Pemeriksaan dan Validasi", "Pemeriksaan kelengkapan draft oleh aturan StatPlan, ditampilkan di tab Ekspor bagian TINJAUAN SEBELUM EKSPOR. Ini bukan validasi atau persetujuan BPS.")
SEC = "16 — PEMERIKSAAN DAN VALIDASI"
step_slide("Buka tinjauan sebelum ekspor", SEC, "23-validasi", ["Tinjauan sebelum ekspor", "Tombol perbaikan Buka pemeriksaan portal"],
           ["Di Ruang kerja, klik tab **Ekspor** (atau **Lihat persyaratan ekspor**).", "Baca **TINJAUAN SEBELUM EKSPOR**.", "Klik **Mengapa & cara memperbaiki** untuk alasan dan cara memperbaiki."],
           hasil="Temuan dikelompokkan menjadi **Perlu dilengkapi** dan **Perlu ditinjau**.", catatan="Tinjauan ini dibuat oleh aturan StatPlan untuk membantu kelengkapan draft — bukan validasi resmi BPS.")
table_slide("Membaca Hasil Pemeriksaan", SEC, ["Kelompok / status", "Arti", "Pengaruh pada ekspor"], [
    ["**Perlu dilengkapi**", "Kekurangan yang wajib diselesaikan.", "Menghalangi unduhan draft."],
    ["**Perlu ditinjau**", "Saran perbaikan.", "Tidak menghalangi unduhan."],
    ["**Sudah siap ditinjau**", "Tidak ada yang perlu dilengkapi untuk draft ini.", "Tombol **Unduh draf perencanaan** aktif."],
], [3.2, 5.0, 4.0], size=14)
V = D["validation"]
SEVL = {"portal_sdi": "Perlu dilengkapi", "checklist_incomplete": "Perlu dilengkapi", "rekomendasi_required": "Perlu dilengkapi (sektoral)", "metadata_keg": "Perlu dilengkapi",
        "jenis_undocumented": "Perlu ditinjau", "rekomendasi_form": "Perlu ditinjau (sektoral)", "metadata_var": "Perlu ditinjau", "metadata_ind": "Perlu ditinjau",
        "no_variables": "Perlu ditinjau", "variable_def": "Perlu ditinjau", "design_cara": "Perlu ditinjau", "no_questionnaire": "Perlu ditinjau (survei/sensus)", "sampling_design": "Perlu ditinjau (survei)"}
LOC = {"portal_sdi": "Alur kerja → 1.5", "checklist_incomplete": "Tab Checklist", "rekomendasi_required": "Alur kerja → 2.6", "metadata_keg": "Metadata (MS-Keg)",
       "jenis_undocumented": "Alur kerja → 1.5", "rekomendasi_form": "Alur kerja → Draf rekomendasi", "metadata_var": "Metadata (MS-Var)", "metadata_ind": "Metadata (MS-Ind)",
       "no_variables": "Tab Variabel", "variable_def": "Tab Variabel", "design_cara": "Tab Perancangan", "no_questionnaire": "Tab Instrumen", "sampling_design": "Alur kerja → 2.4"}
assert set(SEVL) == set(V)
table_slide("Daftar Temuan dan Cara Memperbaikinya", SEC, ["Temuan (judul di aplikasi)", "Status", "Arti", "Cara memperbaiki", "Tombol → lokasi"],
            [[V[k]["title"], SEVL[k], V[k]["why"], V[k]["fix"], f"**{V[k]['cta']}** → {LOC[k]}"] for k in SEVL], [2.6, 1.8, 3.1, 2.9, 1.8], size=11)
step_slide("Contoh perbaikan: catat pemeriksaan portal", SEC, "24-portal", ["Pemeriksaan portal rujukan statistik", "Sudah mengecek sirusa.web.bps.go.id", "Sudah mengecek romantik.bps.go.id"],
           ["Periksa sendiri sirusa.web.bps.go.id dan romantik.bps.go.id (serta Portal SDI bila relevan).", "Di tab Ekspor klik **Buka pemeriksaan portal** — Alur kerja terbuka di subproses 1.5.", "Centang kedua kotak **Sudah mengecek …**.", "Tulis hasil di **Catatan hasil pengecekan**; centang butir checklist 1.5."],
           hasil="Pemeriksaan portal “Sudah dikonfirmasi”; temuan hilang dari tinjauan.", catatan="StatPlan tidak memeriksa portal secara otomatis; centang hanya setelah Anda benar-benar memeriksanya.")
text_slide("Memeriksa Ulang", SEC, [
    L("Kapan memeriksa ulang"), B(["Setiap kali Anda mengubah isian terkait temuan — tinjauan diperbarui otomatis.", "Sebelum menekan **Unduh draf perencanaan**.", "Setelah memperbaiki kesalahan yang ditemukan di draft hasil unduhan."], 15),
    L("Cara memeriksa ulang"), N(["Buka tab **Ekspor**.", "Pastikan tidak ada temuan **Perlu dilengkapi**.", "Pertimbangkan temuan **Perlu ditinjau**.", "Status **Sudah siap ditinjau** tampil."], 15),
    box("Validasi StatPlan ≠ persetujuan BPS.", "Perhatian", "warn", 14),
], cols=1)

# =====================================================================
# 17 — EKSPOR / 18 — DOWNLOAD DOCX / 19 — DOKUMEN HASIL
# =====================================================================
divider(17, "Ekspor", "Tab Ekspor menampilkan isi draft, tinjauan kelengkapan, dan tombol Unduh draf perencanaan.")
SEC = "17 — EKSPOR"
shot_slide("Halaman Ekspor", SEC, "33-ekspor", [
    ("Sudah siap ditinjau", "Status kelengkapan dari TINJAUAN SEBELUM EKSPOR.", "Pastikan status ini tampil."),
    ("Unduh draf perencanaan", "Tombol ekspor.", "Klik untuk membuat dan mengunduh .docx.")],
    extra=[L("Informasi di kartu Draf rencana kegiatan"), P("Label “Draf bahan kerja — bukan dokumen resmi BPS” dan daftar isi draft: Identitas kegiatan, Pemeriksaan portal rujukan, Perancangan, Variabel & indikator, Instrumen, Draf rekomendasi BPS, Timeline, Checklist GSBPM 5.2, Metadata — masing-masing dengan status.", 11.5),
           P("Tautan **Apakah hasil ini dokumen resmi BPS?** membuka FAQ.", 11.5)])
text_slide("Cara Ekspor", SEC, [
    L("Cara ekspor"), N(["Buka Ruang kerja → tab **Ekspor** (atau **Unduh draf** dari Mode Terpandu selesai).", "Pastikan **TINJAUAN SEBELUM EKSPOR** menampilkan **Sudah siap ditinjau**.", "Klik **Unduh draf perencanaan**.", "Tunggu beberapa detik; perhatikan pemberitahuan “Ekspor berhasil — draf dokumen diunduh”."], 15),
    L("Hasil"), P("Berkas **StatPlan-<nama-kegiatan>.docx** terunduh; status proyek menjadi **Siap ditinjau**.", 15),
    L("Catatan"), B(["Jika tombol belum aktif, tampil jumlah hal yang perlu dilengkapi (Bagian 16).", "Jika muncul “Ekspor gagal. Coba lagi.”, klik tombol unduh sekali lagi.", "“Siap ditinjau” berarti draft siap ditinjau bersama tim — bukan disetujui BPS."], 14),
], cols=1)

divider(18, "Download DOCX", "Dari tombol ekspor sampai berkas terbuka dan diperiksa di Microsoft Word.")
SEC = "18 — DOWNLOAD DOCX"
step_slide("Klik tombol ekspor", SEC, "33-ekspor", ["Status Sudah siap ditinjau", "Tombol Unduh draf perencanaan"],
           ["Pastikan status **Sudah siap ditinjau**.", "Klik **Unduh draf perencanaan**."], hasil="Proses pembuatan dokumen dimulai.")
text_slide("Proses Pembuatan dan Download", SEC, [
    L("Proses pembuatan dokumen"), P("Dokumen Word disusun di perangkat Anda — tanpa unggahan ke server — dari isian proyek saat itu.", 15),
    L("Download"), B(["Browser menyimpan berkas ke folder unduhan (umumnya **Downloads/Unduhan**).", "Nama berkas: **StatPlan-<nama-kegiatan>.docx**, mis. StatPlan-Survei-Kepuasan-Masyarakat-Pelayanan-Perizinan-DPMPTSP-2026.docx.", "Pemberitahuan “Ekspor berhasil — draf dokumen diunduh” muncul di aplikasi."], 15),
    L("Membuka DOCX"), N(["Buka folder unduhan (di Chrome: menu unduhan → **Tampilkan di folder**).", "Klik dua kali berkas untuk membukanya di Microsoft Word.", "Jika tampil Protected View, klik **Enable Editing/Aktifkan Pengeditan** bila ingin mengubah."], 15),
], cols=1)
# draft file pages
PDF = fitz.open(os.path.join(IMG, "draft-skm.pdf"))
PAGES = [re.sub(r"[\s\u00a0]+", " ", pg.get_text()) for pg in PDF]
def page_png(i):
    out = os.path.join(CROPS, f"draft-p{i + 1:02d}.png")
    if not os.path.exists(out):
        PDF[i].get_pixmap(dpi=110).save(out)
    return out
def find_page(needle):
    for i, t in enumerate(PAGES):
        if i >= 2 and needle in t: return i
    raise SystemExit(f"not in draft: {needle}")
def doc_slide(title, section, idxs, blocks, key=None):
    s = new_slide(title, section, key=key)
    x = X0
    for i in idxs:
        p_ = page_png(i)
        im = Image.open(p_); ar = im.width / im.height
        hh = YMAX - Y0 - 0.35; ww = hh * ar
        rect(s, x - 0.03, Y0 + 0.02, ww + 0.06, hh + 0.06, fill=WHITE, line=LINE, radius=0.01)
        s.shapes.add_picture(p_, Inches(x), Inches(Y0 + 0.05), Inches(ww), Inches(hh))
        text(s, x, Y0 + hh + 0.1, ww, 0.25, f"Halaman {i + 1} dari {len(PDF)} — berkas asli hasil unduhan", size=10, color=GRAY, italic=True, align=PP_ALIGN.CENTER)
        x += ww + 0.25
    COUNT["screens"].add("draft:" + ",".join(map(str, idxs)))
    flow(blocks, (s, [(x + 0.1, Y0 + 0.05, X0 + XW - x - 0.1, YMAX)]), cont_factory(title, section), [(X0, Y0, 5.95, YMAX), (X0 + 6.28, Y0, 5.95, YMAX)])
doc_slide("File Hasil — Sampul dan Informasi Dokumen", SEC, [0, 1], [
    L("Pemeriksaan isi"), N(["Nama kegiatan, penyelenggara, dan periode di sampul.", "Status “DRAFT — BUKAN DOKUMEN RESMI BPS”.", "Informasi Dokumen: versi draft (waktu ekspor) dan tanggal.", "Daftar Isi lengkap sampai lampiran."], 12.5)])
text_slide("Pemeriksaan Isi Setelah Download", SEC, [
    N(["Nama kegiatan, penyelenggara, dan periode pada sampul dan Informasi Dokumen.", "Ringkasan Perencanaan sesuai kebutuhan dan tujuan.", "Variabel, indikator, dan instrumen lengkap dan konsisten.", "Timeline sesuai rencana.", "Tidak ada isian contoh ilustratif yang tertinggal.", "Bagian Catatan dan Batasan dibaca dan dipahami."], 15),
    box("Perbaikan langsung di Word tidak kembali ke StatPlan. Agar draft berikutnya benar, perbaiki di StatPlan lalu ekspor ulang (Bagian 20).", "Perhatian", "warn", 14),
], cols=1)

divider(19, "Memahami Dokumen Hasil", "Struktur dokumen yang benar-benar dihasilkan StatPlan 1.0.0 — apa isinya, untuk apa, dan apa yang perlu diperiksa.")
SEC = "19 — MEMAHAMI DOKUMEN HASIL"
DOCSEC = [
    ("Sampul", [0], "Identitas StatPlan (tanpa kop instansi), “DRAFT PERENCANAAN KEGIATAN STATISTIK”, nama kegiatan, penyelenggara, jenis, klasifikasi, periode, kotak “DRAFT — BUKAN DOKUMEN RESMI BPS”.", "Menandai dokumen sebagai draft StatPlan.", "Nama, penyelenggara, periode benar."),
    ("Informasi Dokumen dan Daftar Isi", [1], "Nama kegiatan, jenis, klasifikasi, penyelenggara, periode, versi draft, tanggal, status, versi StatPlan; daftar 14 bagian dan lampiran.", "Kontrol dokumen dan navigasi.", "Versi draft = ekspor terbaru."),
    ("1. Ringkasan Perencanaan — Status Perencanaan", [find_page("1. Ringkasan Perencanaan")], "Kebutuhan utama, tujuan, output, metode, periode, status; kotak STATUS PERENCANAAN: persentase checklist StatPlan.", "Memahami kegiatan tanpa membaca seluruh dokumen.", "Persentase checklist bukan bukti kegiatan selesai atau disetujui."),
    ("2. Informasi Kegiatan — Dasar Perencanaan", [find_page("2. Informasi Kegiatan")], "Identitas kegiatan; Dasar Perencanaan (GSBPM 5.2, Materi Proses Bisnis, StatPlan sebagai alat bantu).", "Menjelaskan identitas dan dasar penyusunan.", "Penanggung jawab dan cakupan wilayah terisi."),
    ("3. Kebutuhan dan Tujuan — 4. Saran Awal StatPlan", [find_page("3. Kebutuhan dan Tujuan")], "A. Kebutuhan, B. Permasalahan, C. Tujuan, D. Output, E. Pengguna hasil; saran awal metode dari aturan sederhana, tanpa persentase.", "Menunjukkan alasan dan sasaran kegiatan.", "Bagian “Belum diuraikan di StatPlan” perlu dilengkapi (format kerja 1.1–1.3)."),
    ("5. Perancangan Pengumpulan", [find_page("5. Perancangan Pengumpulan")], "Cara, metode, moda, sampling, kerangka sampel, ukuran sampel; draf informasi pengajuan rekomendasi (sektoral) berstatus “Belum diverifikasi”.", "Rancangan cara memperoleh data.", "Isian sesuai tab Perancangan."),
    ("6–7. Variabel dan Indikator", [find_page("6. Variabel")], "Tabel variabel (definisi, tipe/skala, satuan, contoh, nilai hilang) dan tabel indikator.", "Kamus data rencana.", "Setiap variabel punya definisi."),
    ("8–9. Instrumen dan Timeline", [find_page("9. Timeline")], "Ringkasan instrumen; tabel fase-periode dan gambaran jadwal dengan “Contoh jadwal perencanaan — bukan durasi wajib BPS.”", "Jadwal dan alat pengumpulan.", "Periode sesuai rencana."),
    ("10–12. Portal Rujukan, Ringkasan GSBPM, Ringkasan Validasi", [find_page("11. Ringkasan GSBPM")], "Status SIRuSa/Romantik sesuai catatan pengguna; 8 fase dengan status checklist dan output kunci; Status–Temuan–Dampak–Tindakan.", "Menunjukkan kesiapan dan temuan.", "Validasi StatPlan bukan validasi resmi BPS."),
    ("13. Draft Metadata — 14. Catatan dan Batasan", [find_page("13. Draft Metadata")], "MS-Keg, MS-Var, MS-Ind sebagai rancangan; status draft dan batasan StatPlan.", "Rancangan metadata dan batasan dokumen.", "Metadata perlu disesuaikan dan diverifikasi."),
    ("Lampiran A — Checklist GSBPM 5.2", [find_page("Lampiran A")], "Checklist per subproses (✓ ditandai, ☐ belum) per fase.", "Rincian kesiapan per subproses.", "Hanya butir yang benar-benar disiapkan yang ditandai."),
    ("Lampiran B — Draf Instrumen", [find_page("Lampiran B")], "Daftar pertanyaan dan pilihan jawaban (bila ada).", "Draft kuesioner untuk diuji coba.", "Nomor dan opsi jawaban konsisten."),
]
for t, idxs, isi, untuk, periksa in DOCSEC:
    doc_slide(t, SEC, idxs, [L("Apa isinya"), P(isi, 12.5), L("Untuk apa"), P(untuk, 12.5), L("Apa yang perlu diperiksa"), P(periksa, 12.5)])
text_slide("Kaki Halaman dan Status Dokumen", SEC, [
    P("Setiap halaman memuat kaki halaman “StatPlan · Draft Perencanaan Kegiatan Statistik · Bukan dokumen resmi BPS · Halaman X dari Y”.", 15),
    box("Seluruh isi dokumen berasal dari isian proyek Anda. Dokumen ini adalah DRAFT PERENCANAAN KEGIATAN STATISTIK — BUKAN DOKUMEN RESMI BPS, bukan persetujuan, dan bukan rekomendasi resmi BPS.", "Dokumen adalah draft", "warn", 15),
], cols=1)

# =====================================================================
# 20 — PERBAIKAN / 21 TROUBLESHOOTING / 22 FAQ / 23 CHECKLIST
# =====================================================================
divider(20, "Perbaikan dan Ekspor Ulang", "Skenario: Anda menemukan kesalahan setelah mengunduh draft.")
SEC = "20 — PERBAIKAN DAN EKSPOR ULANG"
s = new_slide("Alur Perbaikan", SEC)
COUNT["diagrams"] += 1
steps_fix = ["Buka kembali StatPlan", "Cari bagian terkait", "Perbaiki", "Periksa ulang", "Validasi", "Ekspor ulang", "Download versi terbaru"]
for i, t in enumerate(steps_fix):
    x = 0.6 + i * 1.77
    b = rect(s, x, 2.3, 1.55, 1.1, fill=NAVY if i == len(steps_fix) - 1 else LIGHT, line=NAVY, radius=0.12)
    label_shape(b, t, size=13, color=WHITE if i == len(steps_fix) - 1 else NAVY)
    if i < len(steps_fix) - 1:
        con = s.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, Inches(x + 1.55), Inches(2.85), Inches(x + 1.77), Inches(2.85))
        con.line.color.rgb = NAVY; con.line.width = Pt(2)
        ln = con.line._get_or_add_ln(); ln.append(ln.makeelement(qn("a:tailEnd"), {"type": "triangle", "w": "med", "len": "med"}))
flow([L("Langkah"), N(["Buka StatPlan di perangkat dan browser yang sama → **Proyek saya** → **Buka**.", "Cari bagian terkait (lihat Bagian 23, kolom lokasi, atau Bagian 16).", "Perbaiki isian; perubahan tersimpan otomatis.", "Buka tab **Ekspor**; pastikan **Sudah siap ditinjau**.", "Klik **Unduh draf perencanaan** lagi — berkas versi terbaru terunduh."], 14)],
     (s, [(X0, 3.8, XW, YMAX)]), cont_factory("Alur Perbaikan", SEC), [(X0, Y0, XW, YMAX)])
divider(21, "Troubleshooting", "Kondisi yang benar-benar dapat terjadi saat memakai StatPlan, penyebabnya, dan solusinya.")
SEC = "21 — TROUBLESHOOTING"
table_slide("Masalah Umum dan Solusinya", SEC, ["Situasi", "Penyebab", "Solusi"], [
    ["Belum tahu harus mulai dari mana", "Belum pernah menyusun kegiatan statistik.", "Buka **Pelajari contoh** → **Gunakan contoh ini untuk membuat rencana**; atau **Bingung mulai dari mana?**."],
    ["**Lanjutkan** di Langkah 1 tidak aktif", "Cerita kurang dari 12 karakter.", "Tulis 1–2 kalimat atau pilih contoh kalimat."],
    ["Belum tahu apa yang harus diisi", "Istilah belum dipahami.", "Baca **Apa?**, **Contoh**, format kerja, tombol **Cara mengisi: …**, atau **FAQ**."],
    ["Timeline belum sesuai", "Tanggal/pembagian fase kurang tepat.", "Sebelum proyek dibuat: ubah tanggal/**Sesuaikan jadwal**. Setelahnya: buat rencana baru."],
    ["Fase berikutnya terkunci", "Fase sebelumnya belum selesai.", "Tandai semua subproses dipahami → **Selesai memahami tahap ini**."],
    ["**Selesai memahami tahap ini** tidak aktif", "Ada subproses belum ditandai.", "Buka kartunya → **Tandai sudah dipahami**."],
    ["Masih ada bagian belum lengkap", "Ada temuan pemeriksaan.", "Tab **Ekspor** → tombol perbaikan tiap temuan."],
    ["Draft belum bisa diekspor", "Ada temuan **Perlu dilengkapi**.", "Selesaikan portal, checklist ≥ 80%, MS-Keg, rekomendasi (sektoral)."],
    ["Isian format kerja tidak muncul di Ruang kerja", "Format kerja tidak disalin otomatis.", "Isi juga tab terkait (Variabel, Metadata, …)."],
    ["Proyek tidak ditemukan", "Perangkat/browser lain atau data browser dihapus.", "Pakai perangkat dan browser yang sama; pindahkan salinan dengan **Salin tautan berbagi**."],
    ["Hasil dokumen perlu diperbaiki", "Isian di StatPlan keliru.", "Perbaiki di StatPlan → periksa → ekspor ulang (Bagian 20)."],
    ["“Proyek terlalu besar untuk tautan …”", "Proyek terlalu besar untuk tautan berbagi.", "Bagikan berkas draft .docx sebagai gantinya."],
], [3.6, 3.4, 5.2], size=12.5)
divider(22, "FAQ", f"Pertanyaan yang paling relevan dari halaman FAQ aplikasi ({len(D['faq'])} pertanyaan dalam {len(D['faqCats'])} kategori), dikutip apa adanya.")
SEC = "22 — FAQ"
shot_slide("Halaman FAQ", SEC, "34-faq", [("Kotak pencarian", "Mencari pertanyaan dengan kata kunci.", "Ketik mis. “variabel”, “sampel”, “metadata”.")],
           extra=[L("Membuka FAQ"), P("Menu **FAQ** di navigasi atas, tombol **Lihat FAQ** di halaman utama, atau tautan FAQ kontekstual di aplikasi.", 12.5)])
FAQ = {f["id"]: f for f in D["faq"]}
PICK = ["mulai-dari-mana", "perlu-paham-gsbpm", "harus-urut", "survei-sensus-kompilasi", "cek-data-tersedia", "belum-bisa-ekspor", "siap-ditinjau", "word-resmi",
        "persetujuan-bps", "sistem-resmi", "ubah-rencana", "tersimpan-di-mana", "kembali-langkah", "langkah-belum-selesai", "contoh-ilustratif", "masih-bingung"]
fb = []
for fid in PICK:
    f = FAQ[fid]
    fb.append(P(f"**{f['q']}**", 13, color=NAVY))
    for a in f["a"]:
        fb.append(B(a, 11.5) if isinstance(a, list) else P(a, 12))
text_slide("Pertanyaan yang Sering Diajukan", SEC, fb)
divider(23, "Checklist Akhir", "Checklist kerja untuk operator — dapat dicetak.")
SEC = "23 — CHECKLIST AKHIR"
text_slide("Checklist Operator", SEC, [
    L("Sebelum mulai"), {"k": "check", "items": ["Perangkat, browser, dan koneksi internet siap.", "Informasi kebutuhan, pengguna, dan periode dikumpulkan.", "Contoh kegiatan dipelajari (bila belum berpengalaman)."], "size": 12.5},
    L("Saat perencanaan"), {"k": "check", "items": ["Cerita kebutuhan ditulis; jenis kegiatan diperiksa.", "Hasil yang diinginkan ditetapkan.", "Tanggal mulai–selesai dan pembagian fase diperiksa."], "size": 12.5},
    L("Saat Guided GSBPM"), {"k": "check", "items": ["Setiap kartu dibaca: Apa?, Contoh, Yang bisa dipelajari.", "Format kerja diisi (minimal kolom wajib); status bukti dicatat.", "Setiap subproses ditandai Sudah dipahami; setiap fase diselesaikan."], "size": 12.5},
    L("Sebelum pemeriksaan"), {"k": "check", "items": ["Portal rujukan diperiksa sendiri dan dicatat (1.5).", "Checklist wajib ≥ 80% dengan butir yang benar-benar disiapkan.", "MS-Keg lengkap; variabel, indikator, instrumen diperiksa.", "Draf rekomendasi disiapkan (sektoral)."], "size": 12.5},
    L("Sebelum ekspor"), {"k": "check", "items": ["Tidak ada temuan Perlu dilengkapi.", "Temuan Perlu ditinjau dipertimbangkan.", "Isian contoh ilustratif sudah diganti."], "size": 12.5},
    L("Setelah download"), {"k": "check", "items": ["Berkas .docx dibuka dan dibaca seluruhnya.", "Kesalahan diperbaiki di StatPlan, lalu diekspor ulang.", "Draft ditinjau bersama tim/ahli metodologi.", "Dipahami: DRAFT — BUKAN DOKUMEN RESMI BPS."], "size": 12.5},
])

# =====================================================================
# 24–26 — RINGKASAN
# =====================================================================
divider(24, "Ringkasan 8 Fase", "Tabel ringkas delapan fase GSBPM 5.2.")
table_slide("Ringkasan 8 Fase GSBPM 5.2", "24 — RINGKASAN 8 FASE", ["Fase", "Nama", "Subproses", "Tujuan"],
            [[str(ph["n"]), f"{PHASE_EN[ph['n'] - 1]} ({ph['title']})", str(len(ph["cards"])), ph["purpose"]] for ph in PHASES] + [["", "Jumlah", "44", ""]],
            [0.8, 3.6, 1.3, 6.5], size=12.5, link_col=(0, {str(ph["n"]): f"phase{ph['n']}" for ph in PHASES}), subtitle="Klik baris fase untuk membuka bagian fase.")
divider(25, "Daftar 44 Subproses", "Tabel lengkap kode, nama, dan fase — tepat 44 subproses.")
rows44 = [[c["code"], c["official"], f"{ph['n']}. {PHASE_EN[ph['n'] - 1]}"] for ph in PHASES for c in ph["cards"]]
assert len(rows44) == 44
table_slide("Daftar 44 Subproses GSBPM 5.2", "25 — DAFTAR 44 SUBPROSES", ["Kode", "Nama subproses", "Fase"], rows44, [1.2, 7.4, 3.6], size=12,
            link_col=(0, {c: f"sp-{c}" for c in CODES}), subtitle="Klik baris untuk membuka halaman subproses.")
divider(26, "Glosarium", "Istilah penting dalam panduan dan aplikasi.")
GL = [("GSBPM", "Generic Statistical Business Process Model — kerangka kerja standar internasional untuk proses menghasilkan statistik (Hal. 5)."),
      ("Specify Need", "Identifikasi Kebutuhan — menentukan statistik yang dibutuhkan dan tujuannya."), ("Design", "Perancangan — merancang output, variabel, pengumpulan, sampel, pengolahan, alur kerja."),
      ("Build", "Pembangunan — membangun dan menguji instrumen serta sistem."), ("Collect", "Pengumpulan Data — mengumpulkan data sesuai rancangan."),
      ("Process", "Pengolahan Data — menyiapkan data agar siap dianalisis."), ("Analyse", "Analisis Data — mengubah hasil olahan menjadi output statistik."),
      ("Disseminate", "Penyajian dan Penyebarluasan — menyiapkan, merilis, mempromosikan produk statistik."), ("Evaluate", "Evaluasi — menilai kegiatan dan menyusun rencana tindak lanjut."),
      ("Subproses (subprocess)", "Langkah kerja rinci dalam satu fase; StatPlan memuat 44 subproses."), ("Variabel", "Informasi yang dikumpulkan dari setiap responden/unit (Hal. 19)."),
      ("Indikator", "Angka ringkas yang dihitung dari variabel."), ("Instrumen", "Alat pengumpulan data, mis. kuesioner atau panduan (Hal. 24)."),
      ("Metadata", "Informasi terstruktur untuk menjelaskan data (Hal. 58); di StatPlan berupa draft MS-Keg, MS-Var, MS-Ind."),
      ("Timeline", "Rencana waktu 8 fase; alat bantu, bukan durasi wajib BPS."), ("Workspace (Ruang kerja)", "Halaman proyek dengan 9 tab untuk meninjau dan melengkapi rencana."),
      ("Validasi", "Di StatPlan: pemeriksaan kelengkapan draft — bukan validasi resmi BPS. Dalam GSBPM: pemeriksaan data (Hal. 40)."),
      ("Draft", "Dokumen kerja yang belum final dan belum resmi."), ("Ekspor", "Membuat dan mengunduh draft .docx dari tab Ekspor.")]
table_slide("Glosarium", "26 — GLOSARIUM", ["Istilah", "Arti"], [[a, b_] for a, b_ in GL], [3.2, 9.0], size=12.5)
s = new_slide("", "", dark=True)
text(s, 0.9, 2.3, 11.5, 0.9, "Akhir Panduan", size=36, color=WHITE, bold=True, font=TITLE_FONT)
text(s, 0.9, 3.3, 11.5, 1.6, "Mulai dari kebutuhan → pelajari contoh → susun rencana → ikuti Guided GSBPM → lengkapi Ruang kerja → periksa → unduh draft → tinjau.\n\nHasil StatPlan adalah DRAFT PERENCANAAN KEGIATAN STATISTIK — BUKAN DOKUMEN RESMI BPS.", size=17, color=MUTED)

# =====================================================================
# TOC entries, header/footer, navigation
# =====================================================================
toc = SL[TOC_INDEX]["slide"]
per = math.ceil(len(SECTIONS) / 2)
for i, (num, title, key) in enumerate(SECTIONS):
    cx, cy = X0 + (i // per) * 6.2, Y0 + 0.12 + (i % per) * 0.38
    t = text(toc, cx, cy, 6.0, 0.34, f"{num:02d}   {title}", size=15, color=NAVY)
    link(t, key)
n_total = len(SL)
sec_start = {i: (KEYS.get("sec" + m["section"][:2]) if m["section"][:2].isdigit() else None) for i, m in enumerate(SL)}
for i, m in enumerate(SL):
    s = m["slide"]; dark = m["dark"]
    fg = MUTED if dark else GRAY
    text(s, X0, 0.18, 6, 0.28, "STATPLAN  ·  Panduan Penggunaan Aplikasi", size=10.5, color=ACC if dark else NAVY, bold=True)
    if m["section"]:
        text(s, X0 + XW - 6, 0.18, 6, 0.28, m["section"], size=10.5, color=ACC if dark else ACC_TXT, bold=True, align=PP_ALIGN.RIGHT)
    rect(s, X0, 0.5, XW, 0.012, fill=RGBColor(0x2E, 0x55, 0x78) if dark else LINE, radius=0)
    rect(s, X0, 6.88, XW, 0.012, fill=RGBColor(0x2E, 0x55, 0x78) if dark else LINE, radius=0)
    text(s, X0, 6.97, 4.6, 0.3, f"Halaman {i + 1} / {n_total}   ·   DRAFT StatPlan bukan dokumen resmi BPS", size=10, color=fg)
    specs = [("⌂ Daftar Isi", "toc", 1.2), ("↩ Kembali", "LAST", 1.05), ("Awal bagian", sec_start.get(i), 1.15), ("‹ Sebelumnya", i - 1, 1.2), ("Berikutnya ›", i + 1, 1.2)]
    x = X0 + XW - sum(w for *_, w in specs) - 0.06 * (len(specs) - 1)
    for lab, tgt, w in specs:
        ok = tgt == "LAST" or tgt == "toc" or (isinstance(tgt, int) and 0 <= tgt < n_total and tgt != i)
        if ok and not (tgt == "toc" and i == TOC_INDEX):
            bt = rect(s, x, 6.95, w, 0.34, fill=WHITE if not dark else RGBColor(0x1F, 0x44, 0x63), line=LINE if not dark else RGBColor(0x2E, 0x55, 0x78), radius=0.3, lw=0.75)
            label_shape(bt, lab, size=10.5, color=NAVY if not dark else WHITE, bold=True)
            if tgt == "LAST": bt.name = "nav_last"
            elif tgt == "toc": link(bt, "toc")
            else: LINKS.append((bt, int(tgt)))
        x += w + 0.06
missing = []
for sh, k in LINKS:
    idx = k if isinstance(k, int) else KEYS.get(k)
    if idx is None: missing.append(k); continue
    sh.click_action.target_slide = SL[idx]["slide"]
assert not missing, missing
prs.save(OUT)
nlinks = len(LINKS)
print(f"saved {OUT}\nslides {n_total}; internal slide links {nlinks} (+{n_total} 'Kembali' last-viewed links)")
print(f"sections {len(SECTIONS)}; phases {sum(1 for k in KEYS if k.startswith('phase'))}; subprocess pages {len(DONE_SP)}; tables {COUNT['tables']}; diagrams {COUNT['diagrams']}")
print("screenshots used (unique images):", len({x for x in COUNT['screens'] if ':' in x}))
