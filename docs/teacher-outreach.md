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

Chaley does not actively teach at a school, and there are no teachers
to reach through her. So there is no warm list to start from. The
path below replaces the old Chaley-network pilot. Chaley still tries
the current build first as a sanity check, because she is a teacher
and the tool was built for her, but she is not the source of testers.
The full channel plan, with rules checked and ready copy, is in
`docs/teacher-outreach/marketing-plan.md`.

### Phase 1: Be findable where teachers already look

Do these first, one at a time, so results stay attributable.

- Submit Hide Zero Cards for a Common Sense Education review. They
  accept developer requests, review about 150 new tools a year, and
  never take payment for a review. Low odds and a long lead, but a
  listing there is where teachers already search.
- Publish a free one page place value lesson on Teachers Pay
  Teachers, priced Free, that uses the tool in class. Teachers search
  TpT for free place value lessons. This needs Donray to open a TpT
  seller account, which is his call.
- Post a short demo from Donray's own accounts, not in a group: a
  30 second screen recording showing Roll, Hide zeros, and pulling
  the 3 out to show 3,000 in 3,743, with a link to
  https://hidezerocards.org/about and an invitation to email
  donrayxwilliams@gmail.com. No post goes out without Donray
  approving the exact copy, account, and time first.

### Phase 2: Communities where posting is allowed, mods first

- r/matheducation allows creator posts on Saturdays only. One post,
  on a Saturday, disclosed as the builder, on topic.
- r/homeschool usually limits promotion to a recurring thread. Use
  that thread if it exists that week, disclosed, or do not post.
- Do not post in r/Teachers. Its rules prohibit self-promotion,
  including links to a product and requests for feedback, and posts
  are removed. Answer place value questions there without a link
  instead, and share the link only if someone asks for it.
- Facebook homeschool groups vary. Many ban self-promotion even for
  free resources. Read the rules on the day, use an admin sharing
  thread if there is one, or ask the admins first. Never send an
  unsolicited direct message to work around a ban.
- Keep each post to one community at a time, days apart, so we know
  which one brought a reply.

### Phase 3: Ask one teacher creator at a time

- Once a few teachers have tried it and replied, ask one teacher
  creator or blogger who already shares free math tools if they will
  try it and give an honest read. Personal email, no payment, no
  script. One at a time.
- Ask each teacher who replies if they know one colleague who
  teaches place value and might try it. A named introduction beats a
  cold email every time.
- No purchased list, no scraped addresses, no bulk send, ever.

Target for the whole plan: 5 teachers tried it in a real lesson, 3
emailed replies back. Judge every channel by emailed replies and
repeat classroom use, not by clicks or views.

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
- `marketing-plan.md`: the channel plan, with rules checked and
  ready copy, for reaching teachers without a warm list.
