---
name: mv-producer
description: >
  Turn a finished song — an audio file plus its lyric sheet — into a music
  video (MP4) in the requested aspect ratio, with burned-in lyrics,
  section-synced scenes and a deterministic HTML→frames→ffmpeg pipeline.
  Use when the user says "给这首歌做个 MV", "make an MV or lyric video for
  this song", hands over an audio file with lyrics and a ratio such as
  4:3 or 16:9, or wants a generated Suno track put on screen. A named
  ratio (4:3, 16:9, 9:16) is the output frame size only — never a style
  direction; when the user names no style, the default look is modern,
  energetic, colorful and kaomoji-friendly. Delivers the finished MP4 plus
  the re-runnable renderer source — never a storyboard alone.
license: MIT
category: present
domain: [media]
action: [create]
uses: []
artifacts:
  - "Finished MV: MP4 in the requested aspect ratio, lyrics burned in, the song's own audio carried, streams verified"
  - "Renderer source: deterministic HTML seek(t) renderer, frame-render script and ffmpeg assemble script, re-runnable after edits"
  - "Scene timing table: measured audio sections mapped to scenes and lyric cue windows"
---

# mv-producer

## What it does

Takes one finished song (audio file + the lyric sheet it was sung from) and
produces a music video: lyric typography burned into the frame, scenes cut to
the song's measured sections, motion driven by the music's energy. The video
is rendered by code, not filmed: a deterministic HTML renderer draws every
frame from a time value, a headless browser screenshots it frame by frame,
and ffmpeg assembles the MP4 with the original audio. Two decisions stay
separate by contract: the **aspect ratio** is the output frame size, and the
**visual style** is its own choice with its own default.

## When to use / not use

Use for: putting a finished track on screen as an MV or lyric video; a
generated Suno song that needs a visual form; re-rendering an existing MV
after lyric, palette or timing edits from its renderer source.

Hand off instead:

- Producing the song itself (lyrics, style prompt, audio) → a
  song-prompt/generation capability; this skill starts from finished audio.
- Filming or compositing camera footage, dancer shots, VFX plates → out of
  scope; this pipeline draws motion graphics and typography.
- Subtitle files for arbitrary video (SRT/ASS delivery) → a subtitling
  capability, not a self-contained MV.

## Method

### 1. Split the two contracts: ratio is size, style is style

When the user names a ratio — the common MV asks are **4:3 and 16:9** — it
is the **production/output aspect ratio**, nothing else: the canvas the video
is delivered in. It must never be read as a style brief (4:3 does not mean
retro, 16:9 does not mean cinematic). Map it to pixels and move on:

- 4:3 → 1440×1080 · 16:9 → 1920×1080 · 9:16 (vertical, if asked) → 1080×1920
- explicit pixel dimensions from the user always win.

Decide the visual style as its own question. When the user names one, use
it. When they do not, apply the **default style profile**: **modern** (clean
layout, UI-grade typography, confident whitespace), **energetic** (beat-driven
motion, shakes, pops, fast entrances), **colorful** (saturated multi-hue
palette, gradient energy, high-contrast hero text), **kaomoji-friendly**
(emoji and kaomoji — ♥ ♪ ✧ (๑•̀ㅂ•́)و — as particles and punctuation of the
edit). A retro, CRT, minimal or film-look direction is opt-in and recorded as
the user's or the brief's choice, never a side effect of the ratio.

### 2. Measure the audio before designing anything

Get the real numbers instead of guessing: duration via ffprobe; a silence map
(`silencedetect`) for hard gaps; a 0.25 s RMS energy envelope (decode to mono
PCM, window 0.5 s) to find where sections actually start — intro, verse
onsets, chorus hits, the break, the outro. Vocal line onsets are the peaks in
the envelope. Write the scene timing table from these measurements: every
scene boundary and every lyric cue window cites a measured time. Where the
structure is ambiguous, sync to coarse sections and keep line-level reveals
robust rather than pretending sample-accurate sync.

### 3. Parse the lyric sheet into a cue plan

The lyrics carry `[bracket]` structure tags ([Intro]/[Verse]/[Chorus]/[Outro]
…): one tag block = one scene. Every lyric line becomes a subtitle cue with a
start and end window from the timing table; hook lines get hero-typography
moments (falling text, full-screen emphasis) instead of more bubbles. Burn
the lyrics in verbatim — the lyric sheet is the accepted text, not a draft to
improve. Lines with no lyric (instrumental intro, break) get UI-flavor or
deliberate stillness, never invented words.

### 4. Build the deterministic renderer

One HTML file at the canvas size, exposing `seek(t)`: a pure function from
time to the complete frame. All positions, opacities, reveals and particle
paths are computed from `t` (seeded PRNG, eased segments) — no CSS
transitions, no wall-clock animation, no video seeking. This is what makes
frame-exact rendering, review probes at arbitrary timestamps and cheap
re-renders after edits possible. Use system CJK fonts (e.g. PingFang SC) as
the base; a display face is an explicit style decision. Keep every scene a
function of the measured timing table, so an edit to timing is an edit to
data, not to layout code.

### 5. Render frames, assemble, and pad for the end card

Screenshot the renderer frame by frame with a headless browser at 24 fps
(JPEG quality ≈92 is enough after H.264), then assemble with ffmpeg:
`libx264 / crf 18 / yuv420p`, AAC 192k, `+faststart`. When the edit ends on
an end card, extend the container past the song with silent padding
(`apad`) and trim with `-shortest` so the card holds on black instead of
being cut off. Keep the render script and assemble script next to the
renderer — the MV's source of truth is these three files plus the timing
table, and every later revision re-runs them.

### 6. Verify on the encoded file, in bounded rounds

Do not judge source frames alone: extract stills from the encoded MP4 at the
key scenes (intro, verse, chorus hit, break, outro, end card) and look at
them; ffprobe the streams (codec, width, height, fps, duration) against the
requested ratio and the measured song length; check the audio actually
carried (loudness scan). Fix what fails in the renderer, re-render, re-check.
At most two visual-fix rounds per delivery; then report what is still off and
the smallest unblock condition (usually a style or timing decision that
belongs to the user).

## Requirements

- [B] R1 Aspect ratio is the output frame size only; no style is inferred
  from it — Verification: renderer canvas equals the mapped pixels for the
  requested ratio; the style decision is written down separately from it.
- [B] R2 With no user-named style, the default profile (modern, energetic,
  colorful, kaomoji-friendly) is applied and recorded — Verification: the
  delivery names the active profile or the user's override.
- [B] R3 Burned-in lyrics match the accepted lyric sheet verbatim —
  Verification: diff the subtitle cue list against the lyric sheet.
- [B] R4 Scene boundaries and cue windows come from measured audio sections
  — Verification: the scene timing table cites detected times, not
  estimates.
- [B] R5 The MP4 is the requested ratio and length, carries the song's
  audio, and is a standard playable stream (H.264 yuv420p + AAC, faststart)
  — Verification: ffprobe fields and a loudness scan on the encoded file.
- [B] R6 Encoded-file stills were inspected at the key scenes and found
  failures fixed — Verification: the sampled scenes are listed with their
  verdicts.
- [A] R7 In the default profile, emoji/kaomoji appear as motion elements,
  not only static decoration — Verification: visible in a chorus still.
- [A] R8 The renderer is deterministic: the same `t` renders the same frame
  — Verification: re-render one timestamp twice and compare.

## When to stop

- Done when: the MP4 at the requested ratio exists, streams verify, encoded
  stills passed, and the renderer source + timing table are delivered with
  R1–R6 evidenced.
- Budgets: at most two visual-fix rounds per delivery; one style-direction
  question when the look is genuinely undecided. Exhausted → deliver what
  passed, name the remaining visual issue and the smallest unblock condition
  (e.g. "pick modern-default or name a style"); blocked items stay blocked.
- The MV is rendered from the song as it is; re-mastering the audio itself
  is out of scope and is reported as such.

## Output contract

1. The finished MP4 (path, ratio, resolution, fps, duration, size).
2. The renderer source: `seek(t)` HTML + frame-render script + assemble
   script + scene timing table — re-runnable by anyone with the song file.
3. A close-out mapping R1–R6 to done/blocked/n-a with evidence, the applied
   style profile (default or override), and any unfinished visual work.

The user verifies by playing the MP4; the timing table lets them point at any
moment ("the chorus hits at 23 s") and get a targeted fix instead of a
re-edit.
