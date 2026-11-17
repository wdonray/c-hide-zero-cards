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
nothing here invents a new color. Card values follow the app's
formatCardValue() in lib/cardLayout.ts, including the leading-zero
form of zero cards ("00", "000", "0,000").

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
    """Mirror lib/cardLayout.ts formatCardValue()."""
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
                "along the dashed lines. Each card is labelled with its place (ones, "
                "tens, hundreds, thousands), so the black and white set works without "
                "color. Line the cards up in place value order to build a number, then "
                "pull one card out to show what its digit is worth, just like the tool."
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

CARD_COLS = 2
CARD_ROWS = 5
GAP_X = 18
GAP_Y = 12
MARGIN = 0.5 * inch
HEADER_H = 52
FOOTER_H = 30


def draw_card(c: canvas.Canvas, x: float, y: float, w: float, h: float,
              value: str, place: int, color: bool) -> None:
    """Draw one card. (x, y) is the lower-left corner of the card face."""
    cut = 4  # dashed cut line sits outside the card face
    c.saveState()
    if color:
        top = hex_to_rgb(CARD_PAINT[place][0])
        bottom = hex_to_rgb(CARD_PAINT[place][1])
        # Vertical gradient in thin bands, top light to bottom dark,
        # matching the app's card paint.
        bands = 48
        band_h = h / bands
        path = c.beginPath()
        path.roundRect(x, y, w, h, 14)
        c.clipPath(path, stroke=0, fill=0)
        for i in range(bands):
            t = i / (bands - 1)
            c.setFillColorRGB(
                top[0] + (bottom[0] - top[0]) * t,
                top[1] + (bottom[1] - top[1]) * t,
                top[2] + (bottom[2] - top[2]) * t,
            )
            c.rect(x, y + h - (i + 1) * band_h, w, band_h + 0.5, stroke=0, fill=1)
        text_color = HexColor("#FFFFFF")
        label_color = HexColor("#FFFFFF")
    else:
        c.setFillColor(HexColor("#FFFFFF"))
        c.setStrokeColor(HexColor("#BBBBBB"))
        c.setLineWidth(0.75)
        c.roundRect(x, y, w, h, 14, stroke=1, fill=1)
        text_color = HexColor("#1A1A1A")
        label_color = HexColor("#555555")

    # Place label, small caps at the top of the card.
    label = PLACE_NAMES[place].upper()
    c.setFillColor(label_color)
    c.setFont("Helvetica-Bold", 11)
    c.drawCentredString(x + w / 2, y + h - 24, label)

    # Card value, large and centered.
    c.setFillColor(text_color)
    font_size = 44 if len(value) <= 4 else 36
    c.setFont("Helvetica-Bold", font_size)
    c.drawCentredString(x + w / 2, y + h / 2 - font_size * 0.36, value)
    c.restoreState()

    # Dashed cut line around the card face.
    c.saveState()
    c.setStrokeColor(HexColor("#666666"))
    c.setLineWidth(0.75)
    c.setDash(6, 4)
    c.roundRect(x - cut, y - cut, w + 2 * cut, h + 2 * cut, 16, stroke=1, fill=0)
    c.restoreState()


def build_cards(path: Path, *, color: bool, title: str) -> None:
    c = canvas.Canvas(str(path), pagesize=LETTER)
    c.setTitle(title)
    c.setAuthor(AUTHOR)

    usable_w = PAGE_W - 2 * MARGIN
    usable_h = PAGE_H - MARGIN - HEADER_H - FOOTER_H - MARGIN
    card_w = (usable_w - (CARD_COLS - 1) * GAP_X) / CARD_COLS
    card_h = (usable_h - (CARD_ROWS - 1) * GAP_Y) / CARD_ROWS
    top_y = PAGE_H - MARGIN - HEADER_H

    places = [1, 10, 100, 1000]
    page = 0
    total_pages = len(places)

    for place in places:
        page += 1
        # Header
        c.setFillColor(INK)
        c.setFont("Helvetica-Bold", 15)
        c.drawString(MARGIN, PAGE_H - MARGIN - 16,
                     f"Print and cut cards: {PLACE_NAMES[place].title()}")
        c.setFillColor(MUTED)
        c.setFont("Helvetica", 10.5)
        c.drawString(
            MARGIN, PAGE_H - MARGIN - 32,
            "Hide Zero Cards to 1,000  -  Print on US Letter paper, then cut along the dashed lines.",
        )
        c.setFont("Helvetica", 10.5)
        c.drawRightString(PAGE_W - MARGIN, PAGE_H - MARGIN - 16, f"Page {page} of {total_pages}")
        c.setStrokeColor(RUST if color else HexColor("#666666"))
        c.setLineWidth(1.2)
        c.line(MARGIN, PAGE_H - MARGIN - 40, PAGE_W - MARGIN, PAGE_H - MARGIN - 40)

        # Ten cards: digits 0-9 for this place.
        for i, digit in enumerate(range(10)):
            col = i % CARD_COLS
            row = i // CARD_COLS
            x = MARGIN + col * (card_w + GAP_X)
            y_top = top_y - row * (card_h + GAP_Y)
            draw_card(c, x, y_top - card_h, card_w, card_h,
                      format_card_value(digit, place), place, color)

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
