#!/usr/bin/env python3
"""Generate the Teachers Pay Teachers folder for Hide Zero Cards.

Builds three US Letter PDFs plus a zip, all in this directory:

- 01-Teacher-Instructions-Hide-Zero-Cards.pdf
- 02-Print-and-Cut-Cards-Black-and-White.pdf
- 03-Print-and-Cut-Cards-Color.pdf
- hide-zero-cards-tpt-folder.zip

Run: python3 docs/teacher-outreach/generate-tpt-pdfs.py
Requires: reportlab (pip install reportlab)

Style matches the original one-page lesson PDF (ReportLab, Helvetica,
rust-red section headings, footer attribution). Card colors are the
app's production place-value paint from lib/constants.ts CARD_PAINT;
nothing here invents a new color.

The cards are the app's own place value arrow cards, built with the
app's math from lib/cardLayout.ts, so they stack exactly the way
the on-screen fan does:
- Card width is the natural text width of the full value, commas
  included ("1,000", "0,000"), plus padding. The cards shrink-wrap
  their text, like the app's absolutely-positioned cards.
- Digits are letter-spaced at 0.3x the font size (the app uses
  20 px letter-spacing at a 60 px font). The spacing puts a wide
  band of whitespace between digits, so the covering card's edge
  always lands in whitespace, never on ink.
- Stacking is right-aligned (lib/cardLayout.ts
  getRightAlignedFanPositions): lay the widest card down first,
  then line up the right edges of the next card with it. The
  visible peek of each card is the width difference to the next
  card, which is exactly its leading digit, plus the comma for a
  group-final card ("3,"), so the fan reads like the formatted
  number ("3,743"). The comma survives because it sits in the
  peek, not under the covering card.
- The font size is the largest that fits US Letter: the thousands
  card ("0,000") is the widest, and at 139 pt it is 539 pt, just
  inside the 540 pt usable width. A playing-card-sized ones card
  would make the thousands card about 14 in wide, so this is the
  max. The card files run 6 pages (ones 1, tens 1, hundreds 2,
  thousands 2). Zero cards are "0", "00", "000", "0,000", the
  app's formatCardValue.

No em dashes in any user-facing copy.
"""

from __future__ import annotations

import zipfile
from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    KeepTogether,
    ListFlowable,
    ListItem,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

HERE = Path(__file__).resolve().parent

# ---------------------------------------------------------------------------
# Shared style (matches the original one-page lesson PDF)
# ---------------------------------------------------------------------------

INK = HexColor("#1A1A1A")
MUTED = HexColor("#555555")
RUST = HexColor("#C0392B")
RULE = HexColor("#C0392B")
LIGHT_BG = HexColor("#FDF2EF")
FOOTER_RULE = HexColor("#999999")

TITLE = "Hide the Zeros: A 10-Minute Place Value Lesson"
AUTHOR = "Donray Williams"
SITE = "hidezerocards.org"
FEEDBACK_EMAIL = "donrayxwilliams@gmail.com"

# Production card paint, lib/constants.ts CARD_PAINT (ones, tens,
# hundreds, thousands). Gradient runs from the base hue to the darker stop.
CARD_PAINT = {
    1: ("#DC2626", "#C22121"),
    10: ("#B91C1C", "#A31919"),
    100: ("#991B1B", "#871818"),
    1000: ("#A16207", "#8E5606"),
}

PLACE_NAMES = {
    1: "ones",
    10: "tens",
    100: "hundreds",
    1000: "thousands",
}

PAGE_W, PAGE_H = LETTER


def format_card_value(digit: int, place: int) -> str:
    """The app's formatCardValue() in lib/cardLayout.ts, verbatim:
    the full place value with a thousands comma ("1,000"), and a
    zero card shows the place value with a leading zero ("0,000").
    The comma survives stacking because it sits in the peek, not
    under the covering card."""
    if digit == 0:
        return f"{place:,}".replace("1", "0", 1) if place > 1 else "0"
    return f"{digit * place:,}"


def hex_to_rgb(hex_color: str) -> tuple[float, float, float]:
    hex_color = hex_color.lstrip("#")
    return tuple(int(hex_color[i : i + 2], 16) / 255 for i in (0, 2, 4))


def draw_footer(c: canvas.Canvas, doc) -> None:
    c.saveState()
    c.setStrokeColor(FOOTER_RULE)
    c.setLineWidth(0.6)
    c.line(doc.leftMargin, 0.6 * inch, PAGE_W - doc.rightMargin, 0.6 * inch)
    c.setFont("Helvetica", 9)
    c.setFillColor(MUTED)
    c.drawString(
        doc.leftMargin,
        0.45 * inch,
        "Hide Zero Cards is free, by Donray Williams.  hidezerocards.org  -  "
        "hidezerocards.org/about",
    )
    c.restoreState()


# ---------------------------------------------------------------------------
# Doc 1: Teacher instructions (website first)
# ---------------------------------------------------------------------------


def build_instructions(path: Path) -> None:
    body = ParagraphStyle("body", fontName="Helvetica", fontSize=10.5, leading=13.5, textColor=INK)
    heading = ParagraphStyle(
        "heading",
        fontName="Helvetica-Bold",
        fontSize=11.5,
        leading=13.5,
        textColor=RUST,
        spaceBefore=5,
        spaceAfter=2,
    )
    title_style = ParagraphStyle(
        "title", fontName="Helvetica-Bold", fontSize=18, leading=21, textColor=INK
    )
    intro = ParagraphStyle(
        "intro", fontName="Helvetica", fontSize=10.5, leading=13.5, textColor=MUTED
    )
    bullet = ParagraphStyle(
        "bullet", parent=body, leftIndent=14, bulletIndent=4, spaceAfter=1
    )
    callout = ParagraphStyle(
        "callout", fontName="Helvetica", fontSize=10.5, leading=13.5, textColor=INK
    )
    callout_bold = ParagraphStyle(
        "callout_bold", fontName="Helvetica-Bold", fontSize=10.5, leading=13.5, textColor=INK
    )

    def p(text: str, style: ParagraphStyle = body) -> Paragraph:
        return Paragraph(text, style)

    def section(title: str, flowables: list) -> list:
        return [p(title, heading)] + flowables

    doc = SimpleDocTemplate(
        str(path),
        pagesize=LETTER,
        leftMargin=0.75 * inch,
        rightMargin=0.75 * inch,
        topMargin=0.45 * inch,
        bottomMargin=0.65 * inch,
        title=TITLE,
        author=AUTHOR,
    )

    callout_table = Table(
        [
            [
                Paragraph(
                    "<b>Start with the free tool. No printing or cutting needed.</b>",
                    callout_bold,
                )
            ],
            [
                Paragraph(
                    "Open <b>hidezerocards.org</b> on a projector, smartboard, tablet, "
                    "or Chromebook. No login, no ads, no student accounts, nothing to "
                    "install. Roll or type a number and it fans out as color coded "
                    "place value cards. The printed cards in this folder are the "
                    "hands-on version for small groups or centers.",
                    callout,
                )
            ],
        ],
        colWidths=[doc.width],
    )
    callout_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), LIGHT_BG),
                ("BOX", (0, 0), (-1, -1), 0.75, RUST),
                ("LINEBELOW", (0, 0), (-1, 0), 0, LIGHT_BG),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ("TOPPADDING", (0, 0), (-1, 0), 8),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 2),
                ("TOPPADDING", (0, 1), (-1, 1), 2),
                ("BOTTOMPADDING", (0, 1), (-1, 1), 8),
            ]
        )
    )

    story = [
        p(TITLE, title_style),
        p(
            "A free lesson for elementary classrooms, built around Hide Zero Cards, "
            "a free digital tool. Grades 3-4. Works for grades 2-5 by changing the "
            "Roll range.",
            intro,
        ),
        Spacer(1, 4),
        callout_table,
        Spacer(1, 2),
    ]

    story += section(
        "What is in this folder",
        [
            ListFlowable(
                [
                    ListItem(p("<b>01 Teacher Instructions</b> (this file): the 10-minute lesson.", bullet)),
                    ListItem(p("<b>02 Print and Cut Cards, Black and White</b>: cards to 1,000 for any printer.", bullet)),
                    ListItem(p("<b>03 Print and Cut Cards, Color</b>: the same cards in the app colors.", bullet)),
                ],
                bulletType="bullet",
                start="circle",
            )
        ],
    )

    story += section(
        "What it is",
        [
            p(
                "Hide Zero Cards is the digital version of place value arrow cards. "
                "You roll or type a number, and it fans out as color coded cards, one "
                "for each digit. Tap <b>Hide zeros</b> and the zero cards hide in place, "
                "so 3,743 reads as 3, 7, 4, 3 while the class talks about what each "
                "digit is worth. Pull the 3 card out and it shows <b>3,000</b>, the value "
                "that was tucked behind it all along."
            )
        ],
    )

    story += section(
        "You will need",
        [p("10 minutes. A classroom display, or one device per student. Nothing to print, nothing to install, no accounts.")],
    )

    lesson_steps = [
        "<b>Roll or type a number.</b> Start with 3,743, or type a number from your current unit.",
        "<b>Hide the zeros.</b> Ask: what is each digit worth? The 3 is 3,000, the 7 is 700, the 4 is 40, the 3 is 3.",
        "<b>Pull one card out.</b> Pull the 3 to show 3,000, then the 7 to show 700. The digit was that value all along.",
        "<b>Try 2,609.</b> Hide the zeros and ask what changed. The zero in the tens place hides, and the 600 card shows in full. Ask: is there no digit there, or is the digit zero?",
        "<b>Mix and rebuild.</b> Tap Mix to scatter the cards, then have students drag them back into place value order.",
        "<b>Number Forms.</b> Show the same number in word, expanded, and unit form, plus standard form.",
    ]
    story += section(
        "The lesson",
        [
            ListFlowable(
                [ListItem(p(step, bullet), value=i + 1) for i, step in enumerate(lesson_steps)],
                bulletType="1",
            )
        ],
    )

    story += section(
        "Try these numbers",
        [
            p(
                "<b>3,743:</b> hide the zeros, then pull the 3 out for 3,000. &nbsp; "
                "<b>2,609:</b> what does the zero in the tens place mean? &nbsp; "
                "<b>180,736:</b> start smaller, then build up. &nbsp; "
                "<b>Roll:</b> ranges run from up to 100 to up to 1,000,000,000, so set "
                "the range to the level you are teaching."
            )
        ],
    )

    story += section(
        "Talk prompts",
        [
            p(
                "What is the 3 in 3,743 worth, and how do you know? &nbsp; What changes "
                "when we hide the zeros, and what stays the same? &nbsp; If we move the "
                "7 card, what happens to the number?"
            )
        ],
    )

    story += section(
        "Using the printed cards",
        [
            p(
                "Print file 02 or 03 on US Letter paper, one set per group, and cut "
                "along the grid lines. The cards touch, so each cut separates two "
                "cards. The cards are arrow cards: wider for bigger places, so the "
                "width tells you the place and the black and white set works without "
                "color. Lay the widest card down first, then line up the right "
                "edges of the next card with it: 20 with a 3 over the 0 reads 23."
            )
        ],
    )

    story += section(
        "After the lesson",
        [
            p(
                f"Tell the builder what happened. Email <b>{FEEDBACK_EMAIL}</b> with "
                "the grade you tried it with, what students understood faster, what "
                "confused them, and whether you would use it again next week."
            )
        ],
    )

    # Footer is drawn on every page by draw_footer; do not add another one
    # to the story (it would duplicate on the last page).
    doc.build(story, onFirstPage=draw_footer, onLaterPages=draw_footer)


# ---------------------------------------------------------------------------
# Docs 2 and 3: Print and cut cards
# ---------------------------------------------------------------------------

MARGIN = 0.5 * inch
HEADER_H = 52
FOOTER_H = 30

# The app's card math, from lib/cardLayout.ts and
# components/HomePageClient.tsx:
# - Card width is the natural text width of the full value, commas
#   included, plus padding on each side. The app measures each
#   card's scrollWidth; here stringWidth is the same measurement.
# - Letter-spacing is 0.3x the font size (the app uses 20 px at a
#   60 px font, 0.3x on mobile). The spacing puts a wide band of
#   whitespace between digits, so a covering card's edge always
#   lands in whitespace, never on ink.
# - The font size is the largest that fits US Letter: the thousands
#   card ("0,000") is the widest, and at 139 pt it is 539 pt, just
#   inside the 540 pt usable width. A playing-card-sized ones card
#   would make the thousands card about 14 in wide, so this is
#   the max.
from reportlab.pdfbase.pdfmetrics import stringWidth

PADDING = 12
LETTER_SPACING_RATIO = 0.3


def text_width(value: str, font_size: float) -> float:
    """Natural text width of a card value at a font size, letter
    spacing included: the sum of the character advances plus the
    spacing between them."""
    advances = sum(stringWidth(ch, "Helvetica-Bold", font_size) for ch in value)
    gaps = LETTER_SPACING_RATIO * font_size * max(0, len(value) - 1)
    return advances + gaps


_FONT_UNIT = text_width("0,000", 100) / 100
FONT_SIZE = int((PAGE_W - 2 * MARGIN - 2 * PADDING) // _FONT_UNIT)

# Card widths in points, one per place. Every value in a place has
# the same length and the same digit advances, so every card in a
# place has the same width.
CARD_W = {
    place: 2 * PADDING + text_width(format_card_value(0, place), FONT_SIZE)
    for place in (1, 10, 100, 1000)
}
# Vertical metrics, measured from Helvetica-Bold (a comma and a
# digit rendered at 139 pt and measured in pixels; the test PDF is
# /tmp/hzc-arrow-render/comma-test.pdf): cap height 97.2 pt and
# comma descent 21.2 pt below the baseline. The digits sit on one
# baseline across every place, the way the app's line box does,
# and the baseline is placed so the full ink extent (cap height
# plus comma descent) is centered in the card: the comma fits
# inside its own card instead of crossing the cut line below.
CAP_RATIO = 0.70
COMMA_DESCENT_RATIO = 0.153
INK_H = (CAP_RATIO + COMMA_DESCENT_RATIO) * FONT_SIZE
CARD_H = 126
BASELINE_FROM_BOTTOM = (CARD_H - INK_H) / 2 + COMMA_DESCENT_RATIO * FONT_SIZE

# Digits per place.
NUM_DIGITS = {1: 1, 10: 2, 100: 3, 1000: 4}

# Cards per row, so each place forms one tight grid: ones 5 across,
# tens 2 across, hundreds 1 across, thousands 1 across. Hundreds
# and thousands span two pages each, so the card files are 6 pages:
# ones 1, tens 1, hundreds 2, thousands 2.
PER_ROW = {1: 5, 10: 2, 100: 1, 1000: 1}


def draw_card(c: canvas.Canvas, x: float, y: float, w: float, h: float,
              value: str, place: int, color: bool) -> None:
    """Draw one arrow card face. (x, y) is the lower-left corner.

    Square corners, no stroke, no gap to the next card: the grid lines
    drawn over the block are the shared cut lines, so one cut
    separates two cards. The value is the full place value with its
    comma, letter-spaced at 0.3x the font size and left-aligned at
    the padding, exactly as the app renders it. No place label: the
    width is the place, like the physical cards teachers already use.
    """
    c.saveState()
    if color:
        top = hex_to_rgb(CARD_PAINT[place][0])
        bottom = hex_to_rgb(CARD_PAINT[place][1])
        # Vertical gradient in thin bands, top light to bottom dark,
        # matching the app's card paint.
        bands = 48
        band_h = h / bands
        for i in range(bands):
            t = i / (bands - 1)
            c.setFillColorRGB(
                top[0] + (bottom[0] - top[0]) * t,
                top[1] + (bottom[1] - top[1]) * t,
                top[2] + (bottom[2] - top[2]) * t,
            )
            c.rect(x, y + h - (i + 1) * band_h, w, band_h + 0.5, stroke=0, fill=1)
        text_color = HexColor("#FFFFFF")
    else:
        text_color = HexColor("#1A1A1A")

    # Card value, one character at a time with the app's
    # letter-spacing, left-aligned at the padding. The spacing is
    # what makes stacking work: the covering card's edge lands in
    # the whitespace between digits, so the leading digit and the
    # comma stay whole and the trailing zero hides fully.
    c.setFillColor(text_color)
    font_size = FONT_SIZE
    c.setFont("Helvetica-Bold", font_size)
    baseline = y + BASELINE_FROM_BOTTOM
    pen = x + PADDING
    for ch in value:
        c.drawString(pen, baseline, ch)
        pen += stringWidth(ch, "Helvetica-Bold", font_size)
        pen += LETTER_SPACING_RATIO * font_size
    c.restoreState()


def draw_grid(c: canvas.Canvas, x: float, y: float, w: float, h: float,
              cols: int, rows: int) -> None:
    """Straight-edged grid over a card block: one shared cut line
    between neighbors, outer border included. Empty cells get borders
    too, so the block stays a clean rectangle."""
    c.saveState()
    c.setStrokeColor(INK)
    c.setLineWidth(1)
    c.rect(x, y, w, h, stroke=1, fill=0)
    for i in range(1, cols):
        vx = x + i * w / cols
        c.line(vx, y, vx, y + h)
    for j in range(1, rows):
        hy = y + j * h / rows
        c.line(x, hy, x + w, hy)
    c.restoreState()


def build_cards(path: Path, *, color: bool, title: str) -> None:
    c = canvas.Canvas(str(path), pagesize=LETTER)
    c.setTitle(title)
    c.setAuthor(AUTHOR)

    usable_w = PAGE_W - 2 * MARGIN
    usable_h = PAGE_H - MARGIN - HEADER_H - FOOTER_H - MARGIN
    card_h = CARD_H
    top_y = PAGE_H - MARGIN - HEADER_H

    places = [1, 10, 100, 1000]
    rows_per_page = int(usable_h // card_h)  # 5 at the max size
    # Chunk each place's ten cards into pages. Ones and tens fit on
    # one page each; hundreds and thousands take two.
    chunks = []  # (place, [digits on this page])
    for place in places:
        per_row = PER_ROW[place]
        rows = (10 + per_row - 1) // per_row
        for start in range(0, rows, rows_per_page):
            chunk_rows = min(rows_per_page, rows - start)
            first = start * per_row
            last = min(10, first + chunk_rows * per_row)
            chunks.append((place, list(range(first, last))))
    total_pages = len(chunks)

    for page, (place, digits) in enumerate(chunks, start=1):
        # Header
        c.setFillColor(INK)
        c.setFont("Helvetica-Bold", 15)
        c.drawString(MARGIN, PAGE_H - MARGIN - 16,
                     f"Print and cut cards: {PLACE_NAMES[place].title()}")
        c.setFillColor(MUTED)
        c.setFont("Helvetica", 10.5)
        c.drawString(
            MARGIN, PAGE_H - MARGIN - 32,
            "Hide Zero Cards to 1,000  -  Print on US Letter paper, then cut along the grid lines.",
        )
        c.setFont("Helvetica", 10.5)
        c.drawRightString(PAGE_W - MARGIN, PAGE_H - MARGIN - 16, f"Page {page} of {total_pages}")
        c.setStrokeColor(RUST if color else HexColor("#666666"))
        c.setLineWidth(1.2)
        c.line(MARGIN, PAGE_H - MARGIN - 40, PAGE_W - MARGIN, PAGE_H - MARGIN - 40)

        # Arrow cards for this page. Cards touch on a straight-edged
        # grid, one shared cut line between neighbors.
        card_w = CARD_W[place]
        per_row = PER_ROW[place]
        rows = (len(digits) + per_row - 1) // per_row
        block_w = per_row * card_w
        block_h = rows * card_h
        # Center the block on the page.
        block_x = MARGIN + (usable_w - block_w) / 2
        grid_top = top_y - (usable_h - block_h) / 2
        for i, digit in enumerate(digits):
            col = i % per_row
            row = i // per_row
            x = block_x + col * card_w
            y_top = grid_top - row * card_h
            draw_card(c, x, y_top - card_h, card_w, card_h,
                      format_card_value(digit, place), place, color)
        draw_grid(c, block_x, grid_top - block_h, block_w, block_h,
                  per_row, rows)

        # Footer
        c.setStrokeColor(FOOTER_RULE)
        c.setLineWidth(0.6)
        c.line(MARGIN, MARGIN + 18, PAGE_W - MARGIN, MARGIN + 18)
        c.setFillColor(MUTED)
        c.setFont("Helvetica", 9)
        c.drawString(
            MARGIN, MARGIN + 6,
            "Hide Zero Cards is free, by Donray Williams.  hidezerocards.org",
        )
        c.drawRightString(PAGE_W - MARGIN, MARGIN + 6, f"Page {page} of {total_pages}")
        c.showPage()

    c.save()


def build_zip(zip_path: Path, pdfs: list[Path]) -> None:
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as z:
        for pdf in pdfs:
            z.write(pdf, arcname=pdf.name)


def main() -> None:
    doc1 = HERE / "01-Teacher-Instructions-Hide-Zero-Cards.pdf"
    doc2 = HERE / "02-Print-and-Cut-Cards-Black-and-White.pdf"
    doc3 = HERE / "03-Print-and-Cut-Cards-Color.pdf"
    zip_path = HERE / "hide-zero-cards-tpt-folder.zip"

    build_instructions(doc1)
    build_cards(doc2, color=False,
                title="Hide Zero Cards: Print and Cut Cards, Black and White")
    build_cards(doc3, color=True,
                title="Hide Zero Cards: Print and Cut Cards, Color")
    build_zip(zip_path, [doc1, doc2, doc3])

    for path in (doc1, doc2, doc3, zip_path):
        print(f"{path.name}: {path.stat().st_size:,} bytes")


if __name__ == "__main__":
    main()
