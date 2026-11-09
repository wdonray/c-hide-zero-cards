# Teacher outreach

Goal: get real teachers trying Hide Zero Cards in a real lesson, and
replying to Donray by email with what worked, what confused students,
and what is missing.

The tool is free for classrooms, with no login, no ads, and no student
accounts. Feedback goes to Donray directly at
donrayxwilliams@gmail.com. No feedback form is in the app yet, so email
is the feedback channel for now.

## What we want to learn

Ask every tester the same five questions, so replies stay comparable:

1. What grade or grades did you try it with, and on what device
   (projector, smartboard, Chromebook, tablet)?
2. What did students understand faster, or do more easily, with the
   cards than without them?
3. What confused students, or slowed the lesson down?
4. What is missing for your next place value lesson?
5. Would you use it again next week? Why or why not?

Also note the exact number or range they used, and whether they used
Roll, Mix, Hide zeros, or Number Forms. That detail is what turns a
general opinion into a fixable issue.

## Path forward

### Phase 1: Pilot with Chaley and her trusted circle

Start here. Do not skip to a public post.

- Chaley tries the current build in a real lesson first. She is the
  primary user this was built for, and her read on what is classroom
  ready is the gate for wider outreach.
- Then Chaley names 2 to 4 teachers she knows and trusts who teach
  place value. Donray emails each one personally from
  donrayxwilliams@gmail.com, using the template in
  `docs/teacher-outreach/email-to-teachers.md`.
- Ask for 10 minutes of use, then a reply to the same email. Offer a
  15 minute call only if they ask for one. Do not chase more than
  once.
- Target: 5 teachers tried it, 3 replies back. If fewer reply, the
  pilot is still useful, but do not widen it until the replies we do
  have are logged and triaged.

### Phase 2: Warm expansion, one introduction at a time

- Ask each pilot teacher who replies if they know one colleague who
  teaches place value and might try it. A named introduction beats a
  cold email every time.
- Donray also reaches out to any teacher contacts of his own, one
  personal email at a time. No purchased list, no scraped addresses,
  no bulk send.
- Keep each batch small, 3 to 5 teachers at a time, so every reply
  gets a real answer and a logged follow up.

### Phase 3: Public opt in, only after the pilot

Only start this phase if Phase 1 shows teachers can use it in a real
lesson without Donray in the room.

- Post in teacher communities Donray already belongs to, or that
  Chaley recommends, with a link to https://hidezerocards.org/about
  and an invitation to email Donray.
- Do not post the same message in many groups at once, and do not
  send cold direct messages to teachers who did not ask for it.
- Judge this phase by emailed replies and repeat classroom use, not
  by clicks or views.

## How to run a 10 minute test

Send this with the email, or use it on a call:

1. Open https://hidezerocards.org on the classroom display.
2. Roll a number in the range you are teaching, or type one in.
3. Hide the zeros. Ask the class what each digit is worth.
4. Pull one card out to show its full value, for example pull the 3
   out to show 3,000 in 3,743.
5. Try Mix once, then rebuild the number together.
6. Open Number Forms if you want word, expanded, or unit form.

The built in teacher's guide in the app has the same activities,
under Quick Start, Activities, and Assessment.

## How feedback is handled

1. Every reply is logged in
   `docs/teacher-outreach/feedback-log.md`, with the date, the
   teacher's first name and grade only, what they tried, and the
   verbatim point that matters. Full names and email addresses stay
   out of the repo.
2. Each point is triaged the same week: bug, confusion to fix in the
   product, missing feature to consider, or a question to answer by
   email.
3. Bugs and real product changes are filed as GitHub issues, with a
   link back to the log entry. The log records the issue or PR number.
4. Donray replies to the teacher when the fix ships, or when we decide
   not to change something and why. Closing the loop is the point.
   A reply with no follow up teaches us nothing the second time.

## What we will not do

- No cold bulk email, no purchased or scraped teacher lists, and no
  adding a teacher to any list because they replied once.
- No student names, photos, recordings, or student work in the repo,
  in an issue, or in any outreach. If a teacher sends student work,
  thank them, do not store it, and do not share it.
- No invented testimonials, metrics, or claims about results. Use
  only what the app does today, as described on the About page.
- No quoting a teacher in public copy without their explicit
  permission, in their own words, for that exact use.
- No promising a feature or a date in an outreach email. Offer to
  listen, log it, and follow up.

## Success criteria

The pilot has worked when we have:

- 5 teachers who tried it in a real lesson.
- 3 emailed replies, logged with the five questions answered.
- At least 1 teacher who would use it again next week.
- Every bug or confusion from those replies filed as an issue, or
  answered by email with a reason.

## Files in this folder

- `email-to-teachers.md`: the email template Donray sends.
- `feedback-log.md`: the running log of what teachers told us, what
  we changed, and what we learned.
