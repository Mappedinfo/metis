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
  direction; when the user names no style, the default is a modern,
  energetic, colorful, kaomoji-friendly edit, and for meme-chant or
  short-form references the lyric is the full-frame hero with no persistent
  bottom caption strip. A supplied reference overrides the default; an
  explicit request to harden the BGM permits an opt-in energy edit.
  Delivers the finished MP4 plus the re-runnable renderer source — never a
  storyboard alone.
license: MIT
category: present
domain: [media]
action: [create]
uses: []
artifacts:
  - "Finished MV: MP4 in the requested aspect ratio, lyrics burned in, the song's own audio carried, streams verified"
  - "Renderer source: deterministic HTML seek(t) renderer, frame-render script and ffmpeg assemble script, re-runnable after edits"
  - "Scene timing table: measured audio sections mapped to scenes and lyric cue windows"
  - "Reference style card + beat/cut sheet + PPT/visual-center audit"
  - "When an energy edit is requested: original and hard-edit audio with key/loudness/peak evidence"
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

**The default profile, concretely.** 现代: poster typography with a
full-bleed lyric; optional micro-chrome (one chip or one meter) stays under
10% of the frame and never becomes a header/sidebar/caption scaffold. 激情:
every hit enters with overshoot easing and a short screen shake; scale
pulses lock to the beat; entrances stay under 0.35 s. 色彩: one saturated duotone gradient per
section, cut hard at the section boundary — the cut is the point;
hue-cycling for rapid word flashes. 颜文字: kaomoji/emoji as confetti on
hits, ambient floaters in choruses, and captions on comedy props. Comedy
props are one per video — a single meter tied to the lyric's joke (snapping
to 100% at the chorus) outlives three clever ones.

**Kinetic-zine profile — default for meme-chant and short-form.** The
lyric is the image. No persistent bottom subtitle strip, side instrument
panel or dashboard chrome; burn the line into the composition. One dominant
type mass per beat (35–50% of the frame), at most three type sizes,
secondary doodles/emoji/ASCII ≤20%. Stack, crop, split, outline, halftone
and sticker the lyric; hand-drawn marks and emoji are punctuation. Cut on
the measured quarter/eighth grid: ≥1.2 hard cuts/s average and 3–4/s bursts
in the chorus; no hold longer than two beats except a deliberate breath.
A 9:16 reference is designed natively vertical, never cropped from 16:9.

**PPT failure modes — reject these.** A persistent bottom caption track; a
header + side panel + caption "slide"; equal-weight cards; small centred
text in generous margins; slow cross-fades as the main transition; a
three-column UI; a form/meter dashboard doing the work the lyric should do.
If a still can be mistaken for a slide, it fails regardless of polish.

### 1b. Reference-driven restyle: measure the look before designing

When the user supplies a reference video or says the result is "like a
PPT", write a style card before building: cut rate (cuts/s and burst
pattern), BPM and section energy, palette and type scale, lyric placement,
motion vocabulary (hard cut, stamp, wave, glitch, doodle draw-on), recurring
motifs and what the reference avoids. State three transfer rules and three
anti-rules. Recreate the grammar with original assets; never copy the
reference's frames, drawings, typefaces or audio. Keep the style card next
to the timing table and audit the render against it.

### 2. Measure the audio before designing anything

Get the real numbers instead of guessing: duration via ffprobe; a silence map
(`silencedetect`) for hard gaps; a 0.25 s RMS energy envelope (decode to mono
PCM, window 0.5 s) to find where sections actually start — intro, verse
onsets, chorus hits, the break, the outro. Vocal line onsets are the peaks in
the envelope. Write the scene timing table from these measurements: every
scene boundary and every lyric cue window cites a measured time. Where the
structure is ambiguous, sync to coarse sections and keep line-level reveals
robust rather than pretending sample-accurate sync. Confirm the reading
with ASR where available (a local whisper-class model, word timestamps):
segments give the lyric-line cue windows, but chanting, stutter chops and
heavy FX garble transcription — treat ASR as timing evidence checked against
the accepted lyric sheet, never as a lyric source. Locate chop sections by
an onset-density spike and quantize their inter-onset intervals (a real grid
reads ≈0.21 s / 0.42 s); that quantized grid — not the nominal tempo — is
the flash grid.

### 2b. Audio energy edit — opt-in arrangement, not a silent re-master

The skill starts from finished audio and does not produce the song. If the
user says the BGM is too soft or lacks electronic sound, offer two explicit
routes: (a) a new song via a song-generation capability, or (b) an
**energy edit** of the supplied track. For (b), get explicit approval,
preserve the original, and call it an arrangement/remix, not a re-master:
high-pass the original low end; detect the key by chroma; add a
four-on-the-floor kick, in-key sub/808, hats, claps, an in-key synth arp,
risers, impacts and glitch; sidechain the original; target the reference's
loudness and crest; check true peak and clipping. Deliver both the original
and the hard edit with band/loudness evidence. If the user wants a
different song, stop at the handoff.

### 3. Parse the lyric sheet into a cue plan

The lyrics carry `[bracket]` structure tags ([Intro]/[Verse]/[Chorus]/[Outro]
…): one tag block = one scene. Every lyric line becomes a subtitle cue with a
start and end window from the timing table; hook lines get hero-typography
moments (falling text, full-screen emphasis) instead of more bubbles. Burn
the lyrics in verbatim — the lyric sheet is the accepted text, not a draft to
improve. Lines with no lyric (instrumental intro, break) get UI-flavor or
deliberate stillness, never invented words.

**Edit profile — meme-chant flash (梗曲闪烁).** For AI-catchphrase chant
remixes the beat grid is not a tempo assumption but the measured syllable
chops. Take the inter-onset intervals of the densest section; flashes follow
that grid (e.g. ~0.21 s per syllable, ~0.42 s per phrase unit), with
per-line flashes on the beat elsewhere. In stutter sections flash the
chopped word itself — one word per flash, not the whole line. The hot open
shout gets a full-frame smash; the valley holds near-black for one beat
before the final hook. Palette and type still come from the active visual
profile (default or user override); this profile governs the edit grammar
only.

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
carried (loudness scan). Check geometry numerically before the full render:
probe each scene's midpoint, and in the DOM assert bounding boxes stay
inside the safe margins and clear of the chrome — a numeric assertion is
cheaper and stricter than eyeballing frames. Fix what fails in the renderer,
re-render, re-check.
**PPT / visual-center / cut-rate audit (before the full render).** Assert
no persistent bottom caption or side panel unless explicitly requested;
count active beats/cuts per second against the reference; count type sizes
per beat (≤3); measure the largest type mass (≥35% of the frame, centre in
the middle 60%, one focal point). Sample at least ten full-frame beats from
the encoded file, not only section midpoints.

At most two visual-fix rounds per delivery; then report what is still off and
the smallest unblock condition (usually a style or timing decision that
belongs to the user).

## Requirements

- [B] R1 Aspect ratio is the output frame size only; no style is inferred
  from it — Verification: renderer canvas equals the mapped pixels for the
  requested ratio; the style decision is written down separately from it.
- [B] R2 With no user-named style, the default profile (modern, energetic,
  colorful, kaomoji-friendly) is applied and recorded; for meme-chant and
  short-form this is the kinetic-zine profile, with no persistent bottom
  caption strip — Verification: the delivery names the active profile or
  the user's override, and the render has no default subtitle strip.
- [B] R3 Burned-in lyrics match the accepted lyric sheet verbatim; the
  lyric is the frame's hero, and a separate bottom caption is opt-in, not a
  default — Verification: diff the cue list against the lyric sheet and
  inspect the full-frame stills.
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
- [A] R9 In the meme-chant profile, flash times follow the measured chop
  grid rather than a fixed interval — Verification: sampled flash times
  match the timing table's grid entries.
- [A] R10 In a high-energy or reference-driven edit, the measured cut rate
  and visual-center targets are met — Verification: the cut sheet shows
  ≥1.2 cuts/s average and 3–4/s bursts, and each beat has one focal type
  mass ≥35% of the frame with ≤3 type sizes.
- [A] R11 No persistent bottom caption or side panel appears unless
  explicitly requested — Verification: no subtitle strip in the DOM; the
  encoded stills are full-frame compositions.
- [A] R12 If an energy edit is made, the original audio is preserved and
  both versions are delivered with key/loudness/true-peak evidence —
  Verification: both paths, the detected key, integrated loudness and true
  peak are reported.

## When to stop

- Done when: the MP4 at the requested ratio exists, streams verify, encoded
  stills passed, and the renderer source + timing table are delivered with
  R1–R6 evidenced.
- Budgets: at most two visual-fix rounds per delivery; one style-direction
  question when the look is genuinely undecided. Exhausted → deliver what
  passed, name the remaining visual issue and the smallest unblock condition
  (e.g. "pick modern-default or name a style"); blocked items stay blocked.
- The MV is rendered from the song as supplied. Re-mastering is out of
  scope; an explicitly requested energy edit is an arrangement (preserve the
  original, deliver both, measure key/loudness/peak) and is reported as
  such. A new song is a handoff.

## Output contract

1. The finished MP4 (path, ratio, resolution, fps, duration, size).
2. The renderer source: `seek(t)` HTML + frame-render script + assemble
   script + scene timing table — re-runnable by anyone with the song file.
3. A close-out mapping R1–R6 (and R7–R12 where claimed) to
   done/blocked/n-a with evidence, the applied style profile, and any
   unfinished visual work.
4. A reference style card and beat/cut sheet, a PPT/visual-center audit,
   and — if an energy edit was requested — the original and hard-edit audio
   with key/loudness/peak evidence.

The user verifies by playing the MP4; the timing table lets them point at any
moment ("the chorus hits at 23 s") and get a targeted fix instead of a
re-edit.
