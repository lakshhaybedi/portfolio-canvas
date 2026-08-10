#!/usr/bin/env python3
"""
One-off script that produced public/documents/ielts-score-report.pdf and
telc-b1-certificate.pdf from the original, unredacted source files. Kept for
reproducibility if either credential is ever renewed — not part of the build
(requires PyMuPDF + Pillow, `pip3 install pymupdf pillow`, neither of which
is a project dependency).

IELTS source has a real text layer, so redaction removes the underlying text
object via PyMuPDF's add_redact_annot + apply_redactions — the string is
gone from the content stream, not just covered by a box.

The telc certificate's page 1 is two flattened JPEGs with no text layer at
all (confirmed via get_text() returning ''). A drawn-over annotation there
could in principle be stripped back off by anyone who opens the file, so
instead this renders the page to a bitmap, paints solid bars directly into
the pixel data, then rebuilds the PDF from that bitmap alone — there is no
original layer left underneath to recover.

Kept: name (already public across the rest of the site), all score/exam
data, dates, validation stamps/QR codes. Redacted: DOB, candidate/ID
numbers, nationality, first language, sex, scheme code, birthplace.
"""
import fitz
from PIL import Image, ImageDraw

DOCS = "/Users/bedi/Documents/Lakshhay Bedi - Website Portfolio/portfolio-canvas/public/documents"


def redact_ielts():
    src = "/Users/bedi/Downloads/IELTS 2026 nf.pdf"
    doc = fitz.open(src)
    page = doc[0]

    # Each rect located via page.search_for() on the exact field value.
    for rect in [
        fitz.Rect(503.28, 134.80, 537.60, 148.41),   # Candidate Number
        fitz.Rect(112.32, 273.78, 157.87, 287.39),   # Candidate ID
        fitz.Rect(112.32, 322.67, 165.42, 336.29),   # Date of Birth
        fitz.Rect(337.0, 320.0, 353.0, 337.0),       # Sex (M/F) value
        fitz.Rect(462.24, 322.05, 544.70, 335.66),   # Scheme Code
        fitz.Rect(112.32, 394.86, 139.01, 408.48),   # Country of Nationality
        fitz.Rect(112.32, 431.86, 140.06, 445.48),   # First Language
        fitz.Rect(439.92, 706.15, 542.77, 719.77),   # Test Report Form Number
    ]:
        page.add_redact_annot(rect, fill=(0, 0, 0))
    page.apply_redactions()
    doc.save(f"{DOCS}/ielts-score-report.pdf", garbage=4, deflate=True)


def redact_telc_b1():
    src = "/Users/bedi/Downloads/B1 Deutsch Zertifikat Lakshhay-Bedi-yZWh.pdf"
    orig = fitz.open(src)
    page_rect = orig[0].rect

    target_w = 2200  # ~265 DPI on A4 — sharp on screen, reasonable file size
    scale = target_w / page_rect.width
    mat = fitz.Matrix(scale, scale)

    pix1 = orig[0].get_pixmap(matrix=mat)
    img1 = Image.frombytes("RGB", (pix1.width, pix1.height), pix1.samples)
    # Boxes found by rendering at 2x and visually locating each value field,
    # then scaled to this render's resolution.
    f = scale / 2
    for (x0, y0, x1, y1) in [
        (255, 600, 635, 628),   # Geburtsdatum value
        (665, 600, 1140, 628),  # Geburtsort value
    ]:
        ImageDraw.Draw(img1).rectangle([x0 * f, y0 * f, x1 * f, y1 * f], fill=(0, 0, 0))
    img1.convert("RGB").save("/tmp/b1_p1.jpg", quality=85)

    pix2 = orig[1].get_pixmap(matrix=mat)  # page 2: no personal data, kept as-is
    Image.frombytes("RGB", (pix2.width, pix2.height), pix2.samples).convert("RGB").save("/tmp/b1_p2.jpg", quality=85)

    out = fitz.open()
    out.new_page(width=page_rect.width, height=page_rect.height).insert_image(page_rect, filename="/tmp/b1_p1.jpg")
    out.new_page(width=page_rect.width, height=page_rect.height).insert_image(page_rect, filename="/tmp/b1_p2.jpg")
    out.save(f"{DOCS}/telc-b1-certificate.pdf", garbage=4, deflate=True)


if __name__ == "__main__":
    redact_ielts()
    redact_telc_b1()
    print("done")
