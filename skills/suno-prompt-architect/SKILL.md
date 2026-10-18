---
name: suno-prompt-architect
description: >
  Turn a user-given theme into two paste-ready inputs for Suno Custom Mode:
  an English Style brief for the "Style of Music" field and structure-tagged
  lyrics in the request language for the "Lyrics" field. Use when the user
  says "用 Suno 做一首关于 X 的歌", "给我 Suno 提示词", "make a Suno prompt
  for X", or hands over a theme, mood, meme or scene meant to become a song
  (pop track, short-form-video hook, meme song, ambient piece). Delivers the
  two input blocks plus generation advice — never the generated audio, and
  not general music-production advice. A full song defaults to 1:50–2:10;
  a 30–55 s skeleton is only for an explicitly requested short-form hook.
license: MIT
category: compose
domain: [media, writing]
action: [create, advise]
uses: []
artifacts:
  - "Style brief: English, 4–7 descriptors with the main genre first, 150–300 characters, paste-ready for Suno's 'Style of Music' field"
  - "Lyrics sheet: lyrics in the request language with [bracket] structure tags, paste-ready for Suno's Custom Mode 'Lyrics' field"
  - "Time budget: a 62-bar / 1:50–2:10 section table for a full song, or a named 30–55 s short-form skeleton"
---

# suno-prompt-architect

## What it does

Takes a theme — one sentence, a mood, a meme, a scene — and translates it
into the two inputs Suno Custom Mode actually reads: a Style field written
as a production brief, and a Lyrics field that is a song skeleton carrying
arrangement instructions as `[bracket]` tags. The craft is translation, not
ideation: the direction belongs to the user; this skill executes the chosen
direction to the point where both fields can be pasted and generated.

## When to use / not use

Use for: turning a stated theme into Suno prompts for pop songs,
short-form-video tracks, meme songs or ambient pieces; revising a previous
round's Style descriptors or lyric tags after a generation attempt; planning
a precise arrangement (drop counts, section lengths) across both fields at
once.

Hand off instead:

- Generating the audio, or judging how the result sounds → Suno itself; this
  skill's deliverable is the input pair.
- The visual MV from the finished take → mv-producer; it starts from the
  audio and the accepted lyric sheet.
- Literary editing of lyrics as standalone writing → a prose-editing
  capability.
- Music theory teaching, mixing engineering or DAW workflows → out of scope.

## Method

### 1. Lock one direction before writing

Suno fails less from too little description than from descriptions that fight
each other: EDM, rock, trap, ballad, female vocal and a festival drop in one
song leave the model without a center. Before writing anything, fix three
things: **the main genre, what the listener should feel, and where the song
will be used**. Restate them to the user in one line, in the request
language:

> I'll make 「{theme}」 as **{main genre}**, feeling **{core emotion}**, for
> **{usage scene}**.

If the user named no scene, infer a reasonable default — **a full song for
an MV or personal listening, 1:50–2:10** — and mark it inferred. A 30–55 s
short-form video is a default only when the user explicitly asks for a
short hook; never infer a short song for an MV. When the theme genuinely supports distinct genres, offer at most
three direction options in the same round and record the user's pick; a
direction the user has chosen is not re-opened.

### 2. Build the Style brief

The Style field is a production brief, not marketing copy. Stacked adjectives
dilute one another into prompt fatigue, and earlier positions carry more
weight — the first word holds roughly 60–70% of the output DNA, so **the
main genre goes first**. Write it in **English** (Suno reads English style
tags most stably), with **4–7 items** in a **150–300 character** budget:

```
[main genre/subgenre], [core emotion 1–2 words], [tempo: BPM or tempo feel],
[2–3 core instruments], [vocal direction], [usage scene],
[production texture / mix character]
```

- Tempo is a number or a named feel (`128 BPM`, `mid-tempo`, `slow burn`),
  never just "rhythmic".
- Vocal direction covers gender, timbre and delivery (`breathy female
  vocal`, `raspy male vocal`, `spoken word`); an instrumental uses
  `instrumental, no vocals`.
- The usage scene tells the model the energy level and structural intent
  (`for short-form video`, `for late-night listening`, `podcast intro`).
- No real artist names — describe the genre and its features instead.
- One musical center: no second genre that fights the first.

### 3. Write lyrics with structure tags

Write lyrics in the request language (Chinese request → Chinese lyrics)
unless the user names another language. Always include `[bracket]` tags —
they are arrangement instructions for the model, not decoration; wanting two
choruses means writing `[Chorus]` twice. The default pop skeleton:

```
[Intro]

[Verse 1]
{verse lyrics}

[Pre-Chorus]
{pre-chorus}

[Chorus]
{the hook: short lines, repetition, singable, one phrase worth
 quoting on its own}

[Verse 2]
{second verse}

[Chorus]
{same as, or nearly the same as, the first chorus}

[Bridge]
{optional — the emotional turn}

[Outro]
{closing}
```

- The chorus decides whether a song spreads. Keep lines short and spoken
  natural, and plant one extractable hook phrase. Give each section one
  rhyme family (for example -ui for the hook, -an for the verse); the last
  line lands on the title or the hook. Put the vocal timbre in Style —
  deadpan close-mic, robotic doubles, whispered ad-libs, a spoken bridge —
  not in a stage direction. A narrative arc beats a list: greeting →
  requests → internal monologue → hook wall → absurd second verse → system
  error → resignation → receipt; each section should change the argument,
  not just the adjectives.
- **Full-song default.** A song for an MV or listening is **1:50–2:10**. At
  144 BPM the tested full-song sheet is 62 bars:

  | Section | Bars |
  |---|---:|
  | Intro | 2 |
  | Verse 1 | 8 |
  | Pre-Chorus | 8 |
  | Chorus | 8 |
  | Stutter | 4 |
  | Verse 2 | 8 |
  | Pre-Chorus 2 | 8 |
  | Bridge | 4 |
  | Final Chorus | 8 |
  | Outro | 4 |
  | **Total** | **62** |

  62 bars at 144 BPM is about 103 s of bars; the model's intro/outro and
  transitions often bring the render to ~2:00. Do not cut the bar count to
  fit a 60 s video. Put the first chorus around **0:30** on the full-song
  sheet.
- For an explicitly requested short-form hook, hold the total to **30–55
  seconds**: compress to `[Intro] → [Verse] → [Chorus] → [Outro]` so the
  chorus lands within the first **15–20 seconds**. This is a separate
  deliverable, not a shortened full song; a 60–75 s MV edit is also a
  separate cut.
- Mark arrangement events with their own tags: `[Guitar Solo]`,
  `[Beat Drop]`, `[Silence: 2s]`.
- Lines need not be symmetric; serve the ear and the hook, not tidy form.
- Instrumental request: no vocal lines at all; the lyrics field carries
  structure tags only (or stays empty where the platform allows) and the
  Style brief carries `instrumental, no vocals`.

### 4. Optional: align both fields on one arrangement

When the user wants precise control (exact drop counts, section lengths),
append an arrangement narrative to the Style brief and mirror it in the
tags:

> `... arrangement: intro 4 bars, verse 8, chorus 8, drop 16, outro 4.`

The lyrics then use bar-count suffixes — `[Drop 16]`, `[Outro 4]` — so both
fields describe the same arrangement from two angles. Keep the counts equal
on both sides.

### 5. Generator behavior: what transfers, and writing for the edit

Field-tested behavior of the generator, kept instead of folklore:

- **Structure tags are the arrangement.** Tag order = song order; a chorus
  sung three times means writing the block three times; an empty `[Intro]`
  yields an instrumental lead-in; parentheses are ad-libs and shouts
  (`（大喊）`, `（机械音）` both render), brackets are structure. Never write
  stage directions as lyric lines.
- **Song length tracks lyric mass.** One verse + one chorus is a 35–55 s
  short-form hook; a full song is a different object. At 144 BPM the 62-bar
  sheet above is the full-song default. Add or remove whole blocks to hit a
  target duration; do not squeeze a full lyric into a 60 s skeleton.
- **What transfers from the Style field:** genre/texture vocabulary, tempo
  region (a "71 BPM half-time" request renders happily at ~143 double-time —
  the grid matters, the number does not), vocal timbre, mix character
  (low-passed, minimal bed, no bright hats all survive). **What does not:**
  dynamics words — a hot open is honored by writing a shouted first line in
  the lyrics, not by asking the mixer for loudness.
- **Dynamics live in the structure.** Contrast comes from section design:
  one shouted opener, one flowing verse against short chant lines, a
  near-silent beat before the final hook. Write the contrast you want; the
  generator follows structure more faithfully than adjectives.
- **Repetition with micro-variation.** Repeat the hook verbatim and change
  exactly one line per chorus block (punchline escalation) — repetition
  stays catchy instead of flat.
- **Write for the edit.** If the song may become a video, include a
  syllable-stutter section (the edit's climax) and a near-silent valley
  (the edit's breath); a stable tempo region is what makes beat-grid
  flashing possible later. The generated take can still be free-rhythm or
  land at a different BPM/key than requested — do not promise a fixed grid.
  The MV measures the actual vocal (vocal separation + word-timestamp ASR)
  before cutting.

### 5b. Handoff to mv-producer

The song prompt ends here. When the finished take becomes an MV, hand the
audio file and the accepted lyric sheet to **mv-producer**; it starts after
generation and does not write the song. The downloaded MP3 is a mixed stereo
track, not stems; the model may ignore the requested BPM/key; the vocal may
be free-rhythm. The MV separates the vocal, runs word-timestamp ASR and
re-times the shots. Do not pre-cut the lyric to a fixed bar grid and call it
frame sync.

### 6. Genre module: the AI-voice meme chant

When the user asks for an AI-catchphrase meme song (梗曲), the song is built
**entirely from 3–4 spoken catchphrases** — service phrases like "sure, great
question", "I've got you", "you're right", "let me think". Repetition is the
song; there is no second topic. The measured grammar of the genre:

- **Hot open**: the first phrase is one shout, markedly louder than the rest
  — it is the 3-second grab.
- **Short repeats** → **one long confessional verse** (a flowing,
  therapy-toned monologue as contrast) → **syllable-stutter section** →
  **hook statement** → **valley** (a near-silent beat) → **outro echo
  repeats**, fading.
- Chant lines stay **≤ 7 syllables** and work as standalone catchphrases;
  the chorus is the shortest one. The stutter section repeats single words
  or syllables (对 对 对 对 / 想 一 想) — mark it with its own tag
  (`[Stutter]`) plus per-word lines so the chop grid is visible.
- Style-brief vocabulary for this genre: `spoken-word AI-voice chant`,
  `vocal-chop stutter edits`, `minimal sub-bass 808 bed, no bright hats`,
  `low-passed lo-fi mix`, `monotone synthetic vocal`, tempo in the 70 BPM
  half-time region (stutters land on ~0.21 s syllable grid). One dynamics
  phrase (`hot open shout, compressed verse, drop before final hook`) is
  worth its slot.
- The genre lives or dies on the catchphrase choice: 2–3 real, quotable
  phrases, picked with the user like any other direction (Method 1).

### 7. Self-check, then deliver

Check the draft against R1–R6 (Requirements below) and fix what fails, then
deliver in the fixed four-part format (Output contract). Generation advice
always names Custom Mode, the Suno version current at writing, and the
repair rule: a weak chorus → keep the lyrics, change only the Style field's
emotion/instrument descriptors and regenerate; a wrong structure → fix the
lyric tags, keep the Style field.

### 8. Bounded revision loop

Per song direction, at most two revision rounds after the first delivery. A
round = the user reports one generation attempt, this skill adjusts one
field. When the budget is exhausted, report what was delivered, what is
still not landing, and the smallest unblock condition (usually: pick a
different genre direction). Do not keep regenerating in place.

## Requirements

- [B] R1 One musical center: the main genre is the first Style item and no
  descriptor contradicts it — Verification: read the first Style item; scan
  the remaining items for a competing genre label.
- [B] R2 The Style brief is English, 4–7 items, 150–300 characters, with
  concrete tempo and an explicit vocal direction (or `instrumental, no
  vocals`) — Verification: count items and characters; check the tempo and
  vocal entries.
- [B] R3 No real artist names in either field — Verification: scan both
  blocks for artist-name patterns; genre/feature descriptors stand in their
  place.
- [B] R4 The lyrics sheet carries at least `[Verse]` and `[Chorus]` tags,
  and an instrumental request carries no vocal lines — Verification: scan
  the tags.
- [B] R5 The chorus contains one extractable hook phrase; a full-song
  request is 1:50–2:10 with the first chorus around 0:30, and a short-form
  request puts it within the opening 15–20 seconds — Verification: read the
  chorus; walk the tag and bar order.
- [B] R6 The delivery matches the fixed four-part Output contract —
  Verification: compare the reply against the contract before sending.
- [A] R7 When the user asks for a precise arrangement, bar counts match
  between the Style narrative and the lyric tags — Verification: cross-check
  the counts field by field.
- [A] R8 When the theme plausibly supports distinct genres, up to three
  direction options were offered and the user's pick is recorded —
  Verification: conversation record.
- [A] R9 In the meme-chant genre, chant lines are ≤ 7 syllables, the chorus
  is the shortest catchphrase, and the stutter section carries its own tag
  with per-word lines — Verification: count the syllables; scan the tags.
- [B] R10 A full-song request is 1:50–2:10 (or the user's stated length),
  not a 30–55 s short-form skeleton; a short-form request is explicitly
  named — Verification: the section budget totals 60–64 bars for the
  2-minute default; the delivery names the requested length.

## When to stop

- Done when: both blocks plus generation advice are delivered in the fixed
  format and R1–R6 hold with evidence.
- Budgets: one clarification round for the direction; at most three direction
  options; at most two revision rounds per direction (Method 8). Exhausted →
  report the delivered blocks, what is not landing, and the smallest unblock
  condition; blocked items stay blocked.
- This skill delivers prompts, not audio. Whether the result sounds right is
  verified inside Suno; state that plainly rather than promising sound
  quality.

## Output contract

1. **Theme understanding** — one line restating genre, emotion and scene,
   marking which parts were inferred.
2. **Style brief** — a code block labeled for Suno's "Style of Music" field.
3. **Lyrics sheet** — a code block labeled for Suno's Custom Mode "Lyrics"
   field, structure tags included.
4. **Generation advice** — Custom Mode on; the Suno version current at
   writing; the repair rule from Method 7 (keep lyrics + change Style, or
   keep Style + fix tags).

The user verifies by pasting both blocks into Suno Custom Mode and
generating. The close-out maps each Requirement to done/blocked/n-a with
evidence and names any unfinished work.
