# Kids-Centric Redesign Research

> **Living document.** This file collects the research behind the kids-centric
> redesign of Hide Zero Cards (issue #97). Update it whenever new research
> lands: add a dated entry under the relevant section, keep the sources list
> current, and never delete findings that a decision was based on.
>
> Last updated: 2026-10-11

## Status

- [x] Age-range research (2026-10-11): who learns place value, and when.
- [x] Design-precedent research (2026-10-11): best kids' math interactives,
      place-value manipulatives, design guidance, recommended direction.
- [x] Landing-page research (2026-10-11): hybrid recommendation. Root URL is
      both a brief landing page and the working tool; `/play` is the
      chrome-free share/bookmark/smartboard target.

## 1. Age range: who learns place value, and when

US Common Core progression (Number and Operations in Base Ten):

- **Kindergarten (ages 5-6):** work with numbers 11-19 (tens and ones
  foundation; K.NBT.A.1).
- **Grade 1 (ages 6-7):** tens and ones. 1.NBT.B.2 defines two-digit numbers
  as tens + ones; compare two-digit numbers.
  ([Twinkl summary](https://www.twinkl.ca/resources/usa-resources-common-core-math-grade-1/usa-resources-common-core-math-grade-1-number-and-operations-in-base-ten/usa-resources-common-core-math-grade-1-number-and-operations-in-base-ten-understand-place-value))
- **Grade 2 (ages 7-8):** hundreds. 2.NBT.1-4: hundreds/tens/ones, count to
  1,000, read/write numbers to 1,000, compare three-digit numbers.
  ([whatihavelearnedteaching.com](https://whatihavelearnedteaching.com/place-value-for-2nd-graders/))
- **Grade 3 (ages 8-9):** round to nearest 10/100 within 1,000 (3.NBT.A.1).
  ([shmoop.com](https://www.shmoop.com/common-core-standards/ccss-3-nbt-1.html/math-grade-2.html))
- **Grade 4 (ages 9-10):** multi-digit whole numbers to **millions**.
  4.NBT.A.2: read, write, and compare multi-digit whole numbers using
  base-ten numerals, number names, and expanded form.
  ([CA Dept of Ed](https://www2.cde.ca.gov/cacs/id/web/371))
- **Grade 5 (ages 10-11):** decimal place value, not larger whole numbers.

The Eureka Math/EngageNY Grade 4 curriculum builds the place value chart
**to 1 million** and makes students familiar with the base-thousand unit
names **up to 1 billion**, but formal read/write work is capped at 1
million.
([wiley.com excerpt](https://catalogimages.wiley.com/images/db/pdf/9781118792964.excerpt.pdf))

**Bottom line:** the tool's core users are **grades 2-4, roughly ages
7-10**, with the millions/billions end belonging to **grades 4-5 (ages
9-11)**. Billions is beyond the formal whole-number standard (it appears
in Grade 4 only as unit-name familiarity), so the top of the tool's range
is enrichment. NN/g insists on targeting a **narrow 2-3-year age band**
(young 3-5 / mid 6-8 / older 9-12); this tool straddles 6-8 and 9-12, so
the design should skew toward the **6-9 visual language** (approachable,
big, explicit) while avoiding anything "babyish" that 9-11-year-olds would
reject. NN/g found kids react negatively to content designed for children
even one grade above or below their own level.
([nngroup.com](https://www.nngroup.com/articles/childrens-websites-usability-issues/))

## 2. Best-designed interactive math products for ages ~7-10

| #   | Product                                                                                                            | Target age                   | Kid-friendly design choices observed                                                                                                                                                                                                                                                    |
| --- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | [Khan Academy Kids](https://www.bestfive.com.au/khan-academy-kids-review-2025-how-my-5-10-year-olds-use-it-daily/) | Ages 2-8                     | Cast of animal guide characters who deliver cheers and celebratory animations on task completion; gentle reward systems (stickers, badges, collectible outfits) instead of competitive scoring; completely ad-free.                                                                     |
| 2   | [Math Learning Center: Number Pieces](https://apps.mathlearningcenter.org/number-pieces/)                          | Grades K-5                   | Flat, calm, single-workspace canvas with zero chrome clutter; left tray of chunky piece buttons ("Drag or click to create..."); one row of large icon-only tool buttons. Every action accepts _both_ tap and drag, exactly what NN/g recommends for under-9s. Verified live 2026-10-11. |
| 3   | [ABCya](https://www.abcya.com/)                                                                                    | Pre-K-grade 6+               | Every subject is a big illustrated icon card; CTA buttons are large, rounded, with shimmer/flare animation; games give collectible rewards and audio read-aloud of instructions; grade picker organizes everything by kid age. Verified live 2026-10-11.                                |
| 4   | [SplashLearn](https://www.splashlearn.com/)                                                                        | Preschool-grade 5            | Story worlds + creature companions frame practice as exploration; no timed challenges; explicit safe-to-fail design; curriculum mapped visibly by grade. Verified live 2026-10-11.                                                                                                      |
| 5   | [Zearn](https://www.zearn.org/)                                                                                    | K-8 lessons (K-5 curriculum) | Concrete-to-pictorial-to-abstract approach with visual models and digital manipulatives, not text explanations; onscreen teacher videos; adaptive hints when kids struggle. Verified live 2026-10-11.                                                                                   |
| 6   | [Prodigy](https://medium.com/@shahidimran7476/prodigy-math-bridging-fantasy-and-formulas-bca169dfbd8b)             | Grades 1-8 (ages 6-14)       | Full fantasy RPG wrapper: wizard avatars, explorable worlds, monster battles resolved by answering math questions. **Cautionary lesson:** constant membership upsell pop-ups are widely cited by parents as hostile. Monetization that interrupts play destroys trust.                  |

### Place-value / base-ten manipulatives and their control design

1. **MLC Number Pieces** (verified live) - piece tray buttons accept **drag
   _or_ click-to-create**; bottom toolbar of big single-tap icons: Start
   Over, Break/Join pieces, Zoom, Cover, Trash, Color. Minimal text;
   everything discoverable by tapping.
   <https://apps.mathlearningcenter.org/number-pieces/>
2. **MLC Number Frames** - counters are dragged or tapped into
   five-/ten-/double-ten frames; same clean toolbar idiom; the **frame
   itself is the affordance**, no written instructions needed.
   <https://www.mathlearningcenter.org/apps>
3. **ABCya "Base Ten Fun"** - three task modes (reading + making, listening
   - making, counting + writing), click/tap virtual base-ten blocks for
     ones/tens/hundreds, read-aloud instructions, completion reward
     (collectible snake styles). The closest existing parallel to a
     place-value-card interaction loop.
     <https://www.abcya.com/games/mobile/base_ten_fun>

## 3. Design guidance for ages 7-10

**Nielsen Norman Group, "Children's UX: Usability Issues in Designing for
Young People"**
([nngroup.com](https://www.nngroup.com/articles/childrens-websites-usability-issues/))

- Target narrow age bands (3-5 / 6-8 / 9-12); kids reject designs aimed
  even one grade off their own.
- Young kids barely read, older kids scan: keep text minimal and at the
  user's grade level; font 12-14pt baseline.
- Avoid scrolling for young kids; favor big, simple touchscreen actions;
  kids love animation and sound (adults usually dislike it).
- Kids expect interactivity: they tap characters and pictures and expect
  something to happen; they mine-sweep the screen and will leave fast if
  nothing responds.

**NN/g, "Design for Kids Based on Their Stage of Physical Development"**
([nngroup.com](https://www.nngroup.com/articles/children-ux-physical-development/))

- Ages 6-8: clicking + simple keyboard; ages 9+: advanced gestures
  possible; desktop dragging/scrolling is hard for under-9s, especially
  long-distance drags.
- **Touch targets >= 2cm x 2cm** (about 75px at standard density), 4x the
  adult recommendation.
- Support **both tap and drag** for the same action; make drop targets
  forgiving (no pixel-exact placement); don't require precise drags, long
  drags, or multi-finger coordination.
- Give **clear instructions with images**. Kids skip paragraphs of text.

**Vitaly Friedman, "A Practical Guide To Designing For Children"**
([linkedin.com](https://www.linkedin.com/pulse/practical-guide-designing-children-vitaly-friedman-lwcef))

- Large text (18-19px), min 75x75px tap targets; translate text into
  visuals/icons/characters; provide **feedback on every action**; avoid
  buttons at the bottom edge (kids tap them by accident); design for a
  <=2-year age range; use typefaces resembling how children learn to
  write; don't patronize.

**C. Naranjo design review, citing NN/g + Piaget**
([medium.com](https://medium.com/design-bootcamp/design-considerations-for-kids-48ec9bf2b18))

- More images, less text; icons must be **self-explanatory to kids**
  (adult-obvious icons like a compass or undo arrow confuse 5-8-year-olds:
  label or animate them); instant sound/animation feedback on nearly
  every tap.

## 4. Recommended direction for the single-screen card tool

**Target the 6-9 band visually, keep 9-11 on board.** Bright but not
toddlerish.

- **Palette:** light, airy "paper" background (soft sky blue or warm paper
  white) with saturated accents drawn from the existing card colors
  (red/yellow/green/blue). The chrome should _frame_ those colors, not
  compete with them. Avoid neon/dark-mode-heavy or gray corporate
  palettes. NN/g's tested winners (Nick Jr., PBS Kids) use big colorful
  buttons on simple light grounds.
- **Typography:** rounded, friendly sans (schoolbook-style, e.g. Baloo 2 /
  Fredoka / Andika: typefaces resembling classroom handwriting), large
  (18-24px for controls, huge for the number readout). Keep the card
  digits' font unchanged since cards stay.
- **Buttons and chrome:** big pill or rounded-square buttons, >= 64-75px
  tall, with icon + short label ("Show all", "Hide zeros", "New number").
  Put the primary toggle ("Hide zeros") dead-center top or immediately
  beside the number input: the single most important control. A thin top
  toolbar + generous margins; nothing in the bottom 10% of the screen on
  tablets (accidental taps).
- **Background treatment:** subtle, static texture or faint number-line
  motif. Decorative but non-interactive (NN/g: kids tap everything, so
  anything that looks interactive but isn't causes frustration). Keep
  total screen noise low so the fanned cards are unmistakably the hero:
  cards centered, largest element on screen, generous whitespace around
  them.
- **Cards as hero:** keep the cards' existing colors/fonts exactly
  (they're the learned visual language). Add delight _around_ them
  without touching them: a gentle fan/spread animation when numbers
  change, a soft "pop" sound + confetti micro-celebration when "hide
  zeros" is toggled and cards vanish, maybe a playful mascot corner
  character that reacts ("Wow, three zeros hiding!"): Khan Academy
  Kids-style positive reinforcement.
- **Interactions:** every action needs instant visual/audio feedback (tap
  card: it wiggles/lifts; toggle: cards animate in/out). Allow tap AND
  drag for moving cards (per NN/g flexibility guidance). Drop tolerance
  forgiving: cards snap back to the fan.
- **Devices:** smartboard = treat as desktop-with-touch (keep 2cm+
  targets; finger on board is coarse). Tablet/phone = single-column
  layout, full-width number input, cards re-flow to wrap. No
  hover-dependent affordances anywhere (smartboards/phones have none). No
  multi-finger gestures.

**Top anti-patterns to avoid:**

1. Small or bottom-edge controls (accidental taps; fails NN/g 2cm rule).
2. Text-heavy instructions or unlabeled cryptic icons (kids skip text;
   adult-obvious icons confuse them).
3. Precise/long drag requirements or multi-step flows without instant
   feedback.
4. Splash screens, ads, pop-ups, or anything that looks clickable but
   isn't (kids can't distinguish; they'll leave: Prodigy's upsell pop-ups
   are the cautionary example).
5. A "babyish" look (bouncy cartoon fonts everywhere, cartoon overload)
   that makes 9-11-year-olds disengage; and, conversely, adult-clean gray
   minimalism that makes 6-8-year-olds bounce.
6. Requiring precise number input without an easy random-number / dice
   button. The core loop is "type, see": add a big dice button so young
   kids who can't type large numbers still get the magic.

## 5. Strongest design references (ranked)

1. **Math Learning Center Number Pieces**
   <https://apps.mathlearningcenter.org/number-pieces/> - drag-or-click
   piece creation + single icon toolbar on a clutter-free canvas; the
   closest UX cousin to draggable digit cards. Verified live 2026-10-11.
2. **Khan Academy Kids** - guide-character + micro-celebration feedback
   pattern that fits a single-screen tool without cluttering it; proven
   ad-free kid trust. Documented via third-party reviews, not a live
   session.
3. **ABCya Base Ten Fun**
   <https://www.abcya.com/games/mobile/base_ten_fun> - read-aloud
   instructions, listen-and-make modes, collectible completion rewards;
   the closest existing place-value game loop.
4. **NN/g "Design for Kids Based on Their Stage of Physical
   Development"**
   <https://www.nngroup.com/articles/children-ux-physical-development/> -
   the normative ruleset: 2cm targets, tap+drag flexibility, forgiving
   drop zones.
5. **Zearn** <https://about.zearn.org/> -
   concrete-to-pictorial-to-abstract lesson design and built-in
   differentiated hints; best model for what the "hide zeros" toggle
   _teaches_.

## 6. Landing page research

Researched 2026-10-11. Question: should a no-login, get-right-in tool like
this have a landing page, and how would that work?

**Recommendation: hybrid.** Make the root URL a single page that is BOTH a
brief landing page and the working tool (the tool loads immediately, no
click gate), with compact teacher-facing copy around it for SEO and
discoverability. Add a dedicated chrome-free `/play` (or `/app`) URL as
the canonical share/bookmark/smartboard target.

Concretely:

- `hidezerocards.org/` loads the tool immediately, no click gate, no
  onboarding, with a compact teacher-facing header around it: a clear H1,
  2-3 sentences on what it is and who it's for, and 3 tiny steps ("Type a
  number, drag the cards, hide the zeros"). This gives search engines
  indexable copy and gives a discovering teacher the at-a-glance "what is
  this" story.
- `hidezerocards.org/play` serves the tool full-screen with minimal
  chrome. Every shared link, bookmark, QR code, and smartboard shortcut
  should point here. It opens straight into the working tool.
- Keep all teacher/SEO content on the root page; keep all guidance _in_
  the tool as tiny contextual cues (kids skip instruction paragraphs).

**How it serves each audience:**

- _Teachers discovering the tool:_ the root page ranks for place-value
  searches with real copy, and the tool is visible working on the same
  page. The product sells itself instantly.
- _Kids on a smartboard:_ zero extra clicks. The teacher opens the
  bookmarked `/play` link and the tool is live. No launch button, no tour,
  no text to read.
- _Shared/bookmarked links:_ any link (root or `/play`) opens the working
  tool, never a gate. `/play` is the canonical share target.

**Precedents.** No comparable tool gates the tool behind a marketing
landing page. The dominant convention is the hybrid per-tool page: one URL
that is simultaneously the SEO/discovery page _and_ the working tool.

- Math Learning Center: catalog at
  [mathlearningcenter.org/apps](https://www.mathlearningcenter.org/apps)
  with "Open web app" links going straight into the tool; share links like
  `apps.mathlearningcenter.org/numberframes/?4ny52h37` open the working
  app immediately.
- PhET: per-sim info page with a Play button, PLUS a direct launch URL
  (`phet.colorado.edu/sims/html/..._en.html`) that teachers paste into
  worksheets. ([PhET GitHub](https://github.com/phetsims/balloons-and-static-electricity/issues/93))
- Toy Theater: each tool page (e.g.
  [toytheater.com/base-ten-blocks](https://toytheater.com/base-ten-blocks/))
  embeds the tool directly with a one-sentence description and a FULL
  SCREEN link. The page is both landing and tool.
- Coolmath Games, ABCya, Sheppard Software: same hybrid per-game page
  pattern. Tool loads in-page, description/instructions around it, no
  login.
- Math Curious (closest analog, a no-login digital place-value tool):
  "Click the link inside it, the game opens straight away in any browser.
  Send the link to your students, or open it on the board. There is
  nothing to install and no account to make."
  ([mathcurious.com](https://mathcurious.com/blog/digital-place-value-tools-3-6-digits/))

**Tradeoffs.**

- _SEO:_ a JavaScript-only tool screen has almost no indexable text.
  Every precedent puts crawlable copy on or next to the tool page.
- _First-run guidance:_ NN/g's children's research found kids skip long
  instructions and want instant gratification. Guidance belongs in-tool as
  contextual cues, not on a landing page.
  ([nngroup.com](https://www.nngroup.com/articles/childrens-websites-usability-issues/))
- _Shareability:_ teachers share direct tool links (PhET worksheets, MLC
  PDFs, Math Curious's link-based distribution). A shared link must open
  the working tool.
- _Smartboard:_ every extra click costs attention when a teacher is
  projecting to 25 kids. The expectation is "open the page and teach."
- _Return visits:_ NN/g found children rely more on bookmarks than
  search, so the bookmark target must be the tool itself.

**UX guidance.**

- NN/g "Children's UX" (three rounds of studies, 125 children ages 3-12):
  instant gratification, skip instructions, bookmark reliance, minimal
  text for young readers.
  ([nngroup.com](https://www.nngroup.com/articles/childrens-websites-usability-issues/))
- Influense Design: "The landing page isn't the objective. Getting the
  right person to the right information without making them hunt for it
  is." For a single, self-explanatory tool, the tool page itself can be
  the landing page.
  ([influense.design](https://influense.design/blog/what-is-a-landing-page-when-do-you-need-one/))
- Splitbase: for self-explanatory products, a direct page with clear copy
  suffices. "Sometimes the homepage IS the best landing page."
  ([splitbase.com](https://splitbase.com/blog/do-you-always-need-a-landing-page))

**Anti-patterns to avoid.**

- A landing page that buries the tool below the fold or behind a "Launch
  the tool" button.
- Forced onboarding tours, coach marks, or multi-step first-run modals.
- Email gates, accounts, or any signup wall.
- Ad clutter or promotional popups on the tool page.
- Making the shared/bookmarked URL resolve to anything other than the
  working tool.

Full notes:
`~/workspace/research_notes/hzc-landing-page-research-20261011-1306/`.

## Sources

- CA Dept of Education content standards (4.NBT.2):
  <https://www2.cde.ca.gov/cacs/id/web/371>
- Eureka Math Grade 4 excerpt (Wiley):
  <https://catalogimages.wiley.com/images/db/pdf/9781118792964.excerpt.pdf>
- Grade 2 standards summary:
  <https://whatihavelearnedteaching.com/place-value-for-2nd-graders/>
- Grade 1 standards summary:
  <https://www.twinkl.ca/resources/usa-resources-common-core-math-grade-1/usa-resources-common-core-math-grade-1-number-and-operations-in-base-ten/usa-resources-common-core-math-grade-1-number-and-operations-in-base-ten-understand-place-value>
- Grade 3 rounding standard:
  <https://www.shmoop.com/common-core-standards/ccss-3-nbt-1.html/math-grade-2.html>
- NN/g Children's UX:
  <https://www.nngroup.com/articles/childrens-websites-usability-issues/>
- NN/g physical development:
  <https://www.nngroup.com/articles/children-ux-physical-development/>
- Friedman, "A Practical Guide To Designing For Children":
  <https://www.linkedin.com/pulse/practical-guide-designing-children-vitaly-friedman-lwcef>
- Medium kids-design review:
  <https://medium.com/design-bootcamp/design-considerations-for-kids-48ec9bf2b18>
- Fast Company NN/g summary:
  <https://www.fastcompany.com/90217009/design-is-never-neutral?ref=uxdesignweekly>
- ABCya homepage: <https://www.abcya.com/> (verified live 2026-10-11);
  Base Ten Fun: <https://www.abcya.com/games/mobile/base_ten_fun>
- SplashLearn: <https://www.splashlearn.com/> (verified live 2026-10-11)
- MLC apps listing: <https://www.mathlearningcenter.org/apps> (verified
  live); Number Pieces app:
  <https://apps.mathlearningcenter.org/number-pieces/> (verified live)
- Zearn homepage: <https://www.zearn.org/> (verified live); about page:
  <https://about.zearn.org/>
- Khan Academy Kids review:
  <https://www.bestfive.com.au/khan-academy-kids-review-2025-how-my-5-10-year-olds-use-it-daily/>;
  overview: <https://outschool.org/khanacademykids>
- Prodigy reviews:
  <https://medium.com/@shahidimran7476/prodigy-math-bridging-fantasy-and-formulas-bca169dfbd8b>
  and <https://playtolearnapps.com/prodigy-math-review-parents-2025/>

## Research trail

- 2026-10-11: deep research pass on age range, design precedents, and
  guidance. Full notes:
  `~/workspace/research_notes/hzc-kids-redesign-research-20261011-1230/`.
  Caveat: Khan Academy Kids, Prodigy, Zearn lesson UI, and SplashLearn's
  in-game screens were documented via third-party reviews, not live
  browser sessions.
- 2026-10-11: landing-page research completed. Recommendation: hybrid
  (root URL = brief landing page + working tool; `/play` = chrome-free
  share/bookmark/smartboard target). Full notes:
  `~/workspace/research_notes/hzc-landing-page-research-20261011-1306/`.
