# -*- coding: utf-8 -*-
"""Shared visual system for both StatPlan decks (python-pptx).
Shapes named anim_seq_* / anim_wipe_* are animated afterwards by PowerPoint itself (animate.ps1)."""
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE, MSO_CONNECTOR
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.oxml.ns import qn
from PIL import Image

NAVY = RGBColor(0x15, 0x32, 0x4B); NAVY2 = RGBColor(0x1F, 0x44, 0x63); LIGHT = RGBColor(0xEA, 0xF1, 0xF8)
BG = RGBColor(0xF7, 0xF6, 0xF2); WHITE = RGBColor(255, 255, 255); INK = RGBColor(0x1F, 0x29, 0x33)
GRAY = RGBColor(0x5F, 0x69, 0x75); LINE = RGBColor(0xD5, 0xDB, 0xE2); ACC = RGBColor(0xC9, 0x6F, 0x14)
ACC_TXT = RGBColor(0xA4, 0x57, 0x0B); ACC_BG = RGBColor(0xFF, 0xF6, 0xEC); MUTED = RGBColor(0xC8, 0xD4, 0xE0)
CALLOUT = RGBColor(0xEB, 0x89, 0x1B)
TITLE_FONT, BODY_FONT = "Cambria", "Calibri"
W, H = 13.333, 7.5


class Deck:
    def __init__(self, n_slides):
        self.prs = Presentation()
        self.prs.slide_width, self.prs.slide_height = Inches(W), Inches(H)
        self.slides = [self.prs.slides.add_slide(self.prs.slide_layouts[6]) for _ in range(n_slides)]
        self._anim = {}

    # ——— primitives ———
    def bg(self, s, color=BG):
        f = s.background.fill; f.solid(); f.fore_color.rgb = color

    def name(self, shape, kind, s):
        """Mark a shape for native animation, in creation order."""
        k = self._anim.setdefault(id(s), 0) + 1
        self._anim[id(s)] = k
        shape.name = f"anim_{kind}_{k:02d}"
        return shape

    def text(self, s, x, y, w, h, t, size=18, color=INK, bold=False, font=BODY_FONT, align=PP_ALIGN.LEFT,
             anchor=MSO_ANCHOR.TOP, italic=False, spacing=0.3, line=1.0):
        tb = s.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
        tf = tb.text_frame; tf.word_wrap = True; tf.vertical_anchor = anchor
        tf.margin_left = tf.margin_right = Inches(0.02); tf.margin_top = tf.margin_bottom = Inches(0.02)
        for i, ln in enumerate(t if isinstance(t, list) else [t]):
            p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
            p.alignment = align; p.space_after = Pt(size * spacing); p.line_spacing = line
            r = p.add_run(); r.text = ln
            r.font.size = Pt(size); r.font.color.rgb = color; r.font.bold = bold; r.font.name = font; r.font.italic = italic
        return tb

    def rect(self, s, x, y, w, h, fill=WHITE, line=None, radius=0.08, lw=1.0, shape=None):
        sh = s.shapes.add_shape(shape or (MSO_SHAPE.ROUNDED_RECTANGLE if radius else MSO_SHAPE.RECTANGLE),
                                Inches(x), Inches(y), Inches(w), Inches(h))
        if fill is None: sh.fill.background()
        else: sh.fill.solid(); sh.fill.fore_color.rgb = fill
        if line is None: sh.line.fill.background()
        else: sh.line.color.rgb = line; sh.line.width = Pt(lw)
        if radius and (shape is None): sh.adjustments[0] = radius
        sh.shadow.inherit = False
        return sh

    def label(self, sh, lines, size=16, color=INK, bold_first=True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE, sub_color=None):
        tf = sh.text_frame; tf.word_wrap = True; tf.vertical_anchor = anchor
        tf.margin_left = tf.margin_right = Inches(0.12); tf.margin_top = tf.margin_bottom = Inches(0.06)
        for i, ln in enumerate(lines):
            p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
            p.alignment = align; p.space_after = Pt(2)
            r = p.add_run(); r.text = ln; r.font.name = BODY_FONT
            r.font.size = Pt(size if i == 0 else size - 3)
            r.font.bold = bold_first and i == 0
            r.font.color.rgb = color if i == 0 else (sub_color or color)

    def arrow(self, s, x1, y1, x2, y2, color=GRAY, w=1.75):
        c = s.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, Inches(x1), Inches(y1), Inches(x2), Inches(y2))
        c.line.color.rgb = color; c.line.width = Pt(w)
        ln = c.line._get_or_add_ln()
        ln.append(ln.makeelement(qn("a:tailEnd"), {"type": "triangle", "w": "med", "len": "med"}))
        return c

    def link(self, shape, idx):
        shape.click_action.target_slide = self.slides[idx]

    def notes(self, s, text):
        s.notes_slide.notes_text_frame.text = text

    # ——— composite components ———
    def eyebrow_title(self, s, eyebrow, title, y=0.42, size=34):
        if eyebrow:
            self.text(s, 0.7, y, 10, 0.32, eyebrow.upper(), size=12, color=ACC_TXT, bold=True)
        self.text(s, 0.7, y + 0.32, 12.0, 0.8, title, size=size, color=NAVY, bold=True, font=TITLE_FONT)

    def nav(self, s, i, n, home=0, agenda=1, footer="StatPlan"):
        self.rect(s, 0.7, 6.9, 11.93, 0.012, fill=LINE, radius=0)
        self.text(s, 0.7, 6.98, 6, 0.3, f"{footer}   ·   {i + 1} / {n}", size=11, color=GRAY)
        specs = [("⌂ Beranda", home, 1.05), ("Agenda", agenda, 0.85), ("‹", i - 1, 0.42), ("›", i + 1, 0.42), ("Akhir", n - 1, 0.7)]
        x = 12.63 - sum(w for *_, w in specs) - 0.06 * (len(specs) - 1)
        for lab, tgt, w in specs:
            if 0 <= tgt < n and tgt != i:
                b = self.rect(s, x, 6.97, w, 0.34, fill=WHITE, line=LINE, radius=0.3, lw=0.75)
                self.label(b, [lab], size=11, color=NAVY, bold_first=lab in ("‹", "›"))
                self.link(b, tgt)
            x += w + 0.06

    def browser(self, s, img_path, x, y, w, url="statplan-gsbpm-bps-loteng.vercel.app", max_h=None, crop_top=0.0):
        """Real screenshot in a light browser frame. Returns (img_x, img_y, img_w, img_h) in inches."""
        im = Image.open(img_path)
        ar = im.width / (im.height * (1 - crop_top))
        bar = 0.3
        iw = w; ih = iw / ar
        if max_h and ih + bar > max_h:
            ih = max_h - bar; iw = ih * ar; x = x + (w - iw) / 2
        frame = self.rect(s, x - 0.02, y - 0.02, iw + 0.04, ih + bar + 0.04, fill=WHITE, line=LINE, radius=0.02, lw=0.75)
        self.rect(s, x, y, iw, bar, fill=RGBColor(0xEE, 0xF1, 0xF4), radius=0)
        for k, c in enumerate([RGBColor(0xE0, 0x6C, 0x5F), RGBColor(0xE5, 0xB3, 0x4B), RGBColor(0x5D, 0xB8, 0x6B)]):
            self.rect(s, x + 0.12 + k * 0.17, y + 0.1, 0.1, 0.1, fill=c, radius=0, shape=MSO_SHAPE.OVAL)
        pill = self.rect(s, x + 0.75, y + 0.055, min(4.2, iw - 1.0), 0.19, fill=WHITE, line=None, radius=0.5)
        self.label(pill, [url], size=8, color=GRAY, bold_first=False, align=PP_ALIGN.LEFT)
        pic = s.shapes.add_picture(img_path, Inches(x), Inches(y + bar), Inches(iw), Inches(ih))
        if crop_top: pic.crop_top = crop_top
        return x, y + bar, iw, ih

    def callouts(self, s, marks, vw, vh, ix, iy, iw, ih, seq=True):
        """Numbered callouts on a screenshot, positioned from captured CSS-pixel boxes."""
        sx, sy = iw / vw, ih / vh
        for m in marks:
            x, y, w, h = ix + m["x"] * sx, iy + m["y"] * sy, max(0.25, m["w"] * sx), max(0.18, m["h"] * sy)
            r = self.rect(s, x, y, w, h, fill=None, line=CALLOUT, radius=0.06, lw=2.25)
            badge = self.rect(s, max(ix - 0.05, x - 0.2), max(iy - 0.05, y - 0.2), 0.38, 0.38, fill=NAVY, line=WHITE, lw=1.5, radius=0, shape=MSO_SHAPE.OVAL)
            self.label(badge, [str(m["n"])], size=13, color=WHITE)
            if seq:
                self.name(r, "seq", s); self.name(badge, "seq", s)

    def number_list(self, s, x, y, w, items, size=15, gap=0.12, circle=NAVY):
        cy = y
        for k, it in enumerate(items, start=1):
            c = self.rect(s, x, cy + 0.02, 0.32, 0.32, fill=circle, line=None, radius=0, shape=MSO_SHAPE.OVAL)
            self.label(c, [str(k)], size=12, color=WHITE)
            import math
            per_line = max(10, int((w - 0.45) * 72 / (size * 0.52)))  # ≈ characters per line for Calibri
            lines = max(1, math.ceil(len(it) / per_line))
            h = (size / 72) * 1.25 * lines + 0.1
            self.text(s, x + 0.45, cy, w - 0.45, h, it, size=size, color=INK)
            cy += h + gap
        return cy
