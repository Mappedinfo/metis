---
name: mv-producer
description: >
  Turn a theme or a finished song — an audio file plus its lyric sheet — into
  a music video (MP4) in the requested aspect ratio, with burned-in lyrics,
  section/line-synced scenes and a deterministic HTML→frames→ffmpeg pipeline.
  Stage A (optional) turns a theme into a Suno song package and, when an API
  is configured, generates and downloads the audio; Stage B times the vocal
  with API timestamped lyrics or vocal-stem ASR and renders. For
  generated/free-rhythm vocals, line cues come from those timestamps; named
  material effects (black-to-colour, real alpha) are staged as mechanisms,
  not labels.
  Use when the user says "给这首歌做个 MV", "用 Suno 做一首歌并做成 MV",
  "主题做成 MV", "make an MV or lyric video for this song", hands over an
  audio file with lyrics and a ratio such as 4:3 or 16:9, or wants a
  generated Suno track put on screen. A named
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
  - "Vocal-stem ASR or API timestamped-lyrics timing table + per-second lyric/shot map"
  - "Material-effect stills at start/mid/end (black-to-colour, real alpha)"
  - "Song package when Stage A is used: Style brief, tagged lyrics, 62-bar budget, API task/audio IDs, chosen take; no API key"
  - "API timestamped lyrics and/or separated vocal stem when the Suno API is used"
  - "Reference style card + beat/cut sheet + PPT/visual-center audit"
  - "When an energy edit is requested: original and hard-edit audio with key/loudness/peak evidence"
---

# mv-producer

## What it does

Takes a finished song (audio file + the lyric sheet it was sung from) or a
theme. From a theme it writes the song package and, when a Suno API is
configured, generates the audio; from finished audio it starts at the MV
stage. The MV burns lyric typography into the frame, cuts scenes to the
song's measured sections and drives motion from the music's energy. The video
is rendered by code, not filmed: a deterministic HTML renderer draws every
frame from a time value, a headless browser screenshots it frame by frame,
and ffmpeg assembles the MP4 with the original audio. Two decisions stay
separate by contract: the **aspect ratio** is the output frame size, and the
**visual style** is its own choice with its own default.

## When to use / not use

Use for: starting from a theme and generating the song, then the MV; putting
a finished track on screen as an MV or lyric video; a generated Suno song
that needs a visual form; re-rendering an existing MV after lyric, palette or
timing edits from its renderer source.

A song-only request is Stage A: deliver the package and stop before the MV.

Hand off instead:

- A quick platform visualizer is Stage 0b, not the custom MV; the custom MV
  remains the default.
- Filming or compositing camera footage, dancer shots, VFX plates → out of
  scope; this pipeline draws motion graphics and typography.
- Subtitle files for arbitrary video (SRT/ASS delivery) → a subtitling
  capability, not a self-contained MV.

## Method

### 0. Choose the stage: theme → song, or finished audio

This skill covers the whole chain, but the two stages stay separate
artifacts.

- **Finished audio + lyric sheet** → skip to 2.
- **Theme + a configured Suno API** → 0a: write the song package, generate,
  download the chosen take, then continue to 2.
- **Theme, no API** → deliver the song package (Style, tagged lyrics, 62-bar
  budget) and stop before audio; do not pretend to generate.
- **Quick platform video only** → 0b; it is not the custom MV.

### 0a. Song stage (theme → audio)

1. Lock the direction and the full-song length. A song for an MV defaults to
   1:50–2:10; at 144 BPM the tested sheet is 62 bars (Intro 2, Verse 1 8,
   Pre-Chorus 8, Chorus 8, Stutter 4, Verse 2 8, Pre-Chorus 2 8, Bridge 4,
   Final Chorus 8, Outro 4); the first chorus lands around 0:30. A 30–55 s
   hook is a named short-form deliverable, not a shortened full song.
2. Write the Style brief (English, 4–7 items, 150–300 characters, main genre
   first), the tagged lyrics (one rhyme family per section; the last line
   lands on the title/hook; timbre in Style), and the title. Full craft:
   references/song-stage.md.
3. If an API is configured, read the key from the environment; never print,
   log or commit it. Create the generation task, poll it with a bounded
   timeout, download the chosen take and keep taskId/audioId. Endpoints and
   request shapes: references/suno-api.md.
4. Get timestamped lyrics and a vocal stem from the same API when available;
   otherwise use the local separation + ASR in 2a. Keep the original mix for
   the MV.
5. Let the user choose the take. Do not remix it; only a level/true-peak
   safety pass is allowed.

A generated MP3 is a mix, not stems. The API may change BPM/key or produce
free vocal timing; do not assume the 62-bar grid is the performance.

### 0b. Fast platform video (optional)

If the user explicitly wants a quick platform visualizer, call the provider's
music-video endpoint with taskId + audioId, poll it, and download the MP4.
Label it as the platform video, not the custom MV. The custom MV is the
default because it owns the type, thread/face/dots and the audio-first edit.
This path only works for a track generated in the same API task.

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
type mass per shot (35–50% of the frame), at most three type sizes,
secondary doodles/emoji/ASCII ≤20%. Stack, crop, split, outline, halftone
and sticker the lyric; hand-drawn marks and emoji are punctuation. A shot
has an in, an idle and an out: build the type on in 0.15–0.25 s steps, let
it breathe and drift, then hand it to the next shot through a transition.
Cut rate is an outcome, not a target: 0.8–6 s shots (2–6 s is normal for long-form narrative) and roughly
0.2–1.2 changes/s are all valid; there is no minimum; reserve hard cuts and
full-frame flashes for drops and chop bursts. A 9:16 reference is designed natively vertical, never
cropped from 16:9.

**PPT failure modes — reject these.** A persistent bottom caption track; a
header + side panel + caption "slide"; equal-weight cards; small centred
text in generous margins; slow cross-fades as the main transition; a
three-column UI; a form/meter dashboard doing the work the lyric should do.
If a still can be mistaken for a slide, it fails regardless of polish.

### 1b. Reference-driven restyle: measure the look before designing

When the user supplies a reference video or says the result is "like a
PPT", write a style card before building: BPM and section energy, palette
and type scale, lyric placement, motion vocabulary, recurring motifs, and
what the reference avoids. Measure motion, not only cuts: extract 10 fps
strips from within shots, compute the frame-difference baseline, and note
where type builds on, where a character/prop animates, and where the
background reacts to the foreground. A 0.3 cuts/s window can be more alive
than a 1.5 cuts/s window of static posters. State three transfer rules and
three anti-rules. Recreate the grammar with original assets; never copy the
reference's frames, drawings, typefaces or audio. Keep the style card next
to the timing table and audit the render against it.

### 1c. Accepted design preferences

These refine the kinetic-zine profile; a stronger explicit brief still wins.

- **Audio before picture.** For a generated/free-rhythm vocal, line timing
  comes from a vocal-stem word-timestamp ASR; RMS sections place scenes, never
  individual lyric lines. A picture that moves before the voice is wrong even
  if every still is good.
- **The song as supplied is the unit.** A two-minute song gets a two-minute
  MV. A 60–75 s short is a separate deliverable, never a silent truncation of
  the full lyric. Do not remix the chosen take; a level/true-peak safety pass
  is not a remix.
- **Long-form kinetic zine.** 20–30 shots for a two-minute song; 2–6 s shots
  are valid; 0.2–0.35 changes/s; four to six hard cuts at real drops; the rest
  are thread/wipe/morph. Do not raise the cut rate to look energetic.
- **The lyric is the image, held at the voice.** One dominant type mass; the
  full line visible; no bottom caption; no clipped last character; one line
  per card when the line is long. A face, thread or prop never covers the
  type; the face stays behind the type at large sizes.
- **Semantic material effects.** When the lyric names a material or optical
  condition — 五彩斑斓的黑, 透明一点的灰, 便宜还要贵, 今天上线明天再回 — stage
  the named mechanism, not a colour swap or an explanatory label. Black-to-
  colour: a black base with a spectrum physically entering by clip-path; the
  black stays black until the reveal. Transparency: real rgba/opacity over a
  checkerboard or known backdrop with the layer showing through, plus an
  alpha readout if useful. A light-gray fill is not transparency; a
  pre-coloured card is not black-to-colour.
- **Stutter is a short chant, not a section-wide overlay.** End it before the
  next lyric line; six flashes on a 1.4 s chant is better than eleven covering
  “我这就改”. The chop word is the lyric; do not hide the next line.
- **Continuity.** A thread, face, dot field, palette or word carries across
  cuts; the final lands on one giant word/receipt, not another poster. The end
  card is part of the cut.
- **Readability before cleverness.** A full line the viewer can read beats a
  clever crop. Run numeric type/geometry checks before the render; no type
  under the face/thread/prop.

See [references/semantic-effects.md](references/semantic-effects.md) for the
black-to-colour and real-alpha recipes and their start/mid/end still tests.

### 2. Measure the audio before designing anything

Get the real numbers instead of guessing: duration via ffprobe; a silence map
(`silencedetect`) for hard gaps; a 0.25 s RMS energy envelope (decode to mono
PCM, window 0.5 s) to find where sections actually start — intro, verse
onsets, chorus hits, the break, the outro. The envelope measures section
energy; it is not a reliable lyric-line clock. Write the scene timing table
from these measurements: every scene boundary cites a measured time. For a
generated/free-rhythm vocal, line cue windows come from 2a, not from envelope
peaks or equal division. Where ASR is unavailable, sync to coarse sections
and say so; do not pretend line-level sync. Locate chop sections by
an onset-density spike and quantize their inter-onset intervals (a real grid
reads ≈0.21 s / 0.42 s); that quantized grid — not the nominal tempo — is
the flash grid.

### 2a. Audio-first line timing for generated/free-rhythm vocals

A Suno-style take is not a metronome. The vocal may enter late, rush a line,
hold a word, or interleave chorus and stutter. Do not place lyric cues by
equal division of a section, and do not use RMS peaks as line starts.

For an API-generated track, use the API's timestamped lyrics (alignedWords:
word/startS/endS/success) and separate_vocal stem first; fall back to the
local separation + ASR below when those are unavailable or the track came
from outside the API.

1. Separate the mixed track into vocals and instrumental (Demucs `htdemucs`,
   or an equivalent two-stem separator). Keep the original mix for the MV;
   the vocal stem is timing evidence.
2. Run a local word-timestamp ASR (Whisper / faster-whisper) on the vocal
   stem. The accepted lyric sheet is the text; ASR is timing evidence, never
   a lyric source.
3. Align the known lyric to the word timestamps. A line starts at its first
   sung word; it ends at the next line's start or at the end of its sung
   phrase. Do not average the section.
4. Write a per-second table: second, section, shot, active lyric line, vocal
   dBFS, ASR word. This is the audit trail the user can point at.
5. Build shot windows from the line starts. The picture must not run ahead of
   the voice; hold a line for its actual duration. Long intros, post-choruses
   and instrumental breaks are holds, not invented lyric scenes.
6. For stutter/chop, use the sung chant interval; end the stutter before the
   next lyric line. A stutter overlay that covers the next line is a defect.
7. If ASR is unavailable, declare the fallback and keep cues section-level;
   never claim line accuracy you did not measure.

See [references/audio-first-timing.md](references/audio-first-timing.md) for
the concrete separation, ASR, alignment and per-second table workflow.

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
start and end window from the timing table; for a generated/free-rhythm track
those windows come from 2a, never from equal division of a section. Hook
lines get hero-typography
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

### 3b. Motion design — animate shots, not slides

A cut is a transition, not the content. The reference's energy comes from
what happens inside a shot: a phrase builds word by word, a smiley's
expression changes, a hand holds the type, a folder opens, a background
scan reacts. A sequence of full-frame poster stills with hard cuts is a
slideshow with a strobe, not an MV.

**Every shot has three phases.** Enter: the type arrives by build-on,
mask, slide, scale or draw-on, not a pop to a finished poster. Idle: the
type drifts/breathes, a prop orbits, the camera pushes, the background
flows; the shot is never static. Exit: hand off to the next shot through a
match cut, wipe, mask, morph or thread, or make a deliberate hard cut at a
drop. Build a shot table with in/idle/out and the transition to the next
shot.

**Semantic material effects.** A lyric that names a material/optical state
gets the named mechanism, not a colour swap. Animate the reveal from `t`:
black-to-colour via a black base and a spectrum clip-path; transparency via
real rgba/opacity over a checkerboard or known backdrop. See
[references/semantic-effects.md](references/semantic-effects.md); verify the
encoded start/mid/end stills, not just the source.

**Foreground/background interaction is mandatory.** Each shot needs at
least one causal relationship between layers: parallax (foreground and
background move at different rates), occlusion (a prop passes in front of
or behind the type), reaction (dots part around the word, a smiley bounces
off it, a shadow follows the camera), shared motion (the same thread/word
carries across the cut), colour spill, or a light/spotlight that tracks the
word. A flat colour field with centred type is not an interaction.

**Continuity beats novelty.** Carry a motif, prop, thread, palette or word
across shots. Match positions and motion vectors at cuts; let one word
become the next. Do not build every beat as an unrelated new poster.

**Motion budget.** One primary motion, one secondary, ambient background.
Do not animate/flash every element at once. At most one full-frame flash or
inversion per section; no constant strobe. Give the eye rest: at least some
shots move slowly or hold while a single element travels. Reserve rapid
chop flashes for the stutter section, where the chop is the lyric.

**Long-form narrative.** A two-minute story song is not a 60-second edit
stretched. Use 20–30 shots, 2–6 s shots, 0.2–0.35 changes/s and four to six
hard cuts at real drops; the rest are thread/wipe/morph. A long intro or
post-chorus is a hold, not a lyric scene.

**Stutter boundary.** End the stutter before the next lyric line and keep the
next line uncovered; six flashes on a 1.4 s chant can be better than eleven
covering the next phrase.

**Visual-pollution failure modes.** Every beat a new full-frame poster;
constant full-frame flashes; all layers moving at once; effects without
causality; background static; foreground and background independent;
no breathing room; cuts faster than the eye can read. If a 5 s sequence
looks like a slideshow with a strobe, it fails.

**Motion audit.** Before the full render, sample 5 s sequences at 10 fps:
compute frame-difference baseline within shots and at cuts; count
simultaneous moving elements; check that each shot has enter/idle/exit;
check at least one foreground/background interaction per shot; inspect the
transition, not only the stills.

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

Screenshot the renderer frame by frame with a headless browser at 24–30 fps
(30 for 9:16 type clarity; JPEG quality ≈92 is enough after H.264), then assemble with ffmpeg:
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
**PPT / visual-center / motion audit (before the full render).** Assert
no persistent bottom caption or side panel unless explicitly requested;
count type sizes per beat (≤3); measure the largest type mass (≥35% of the
frame, centre in the middle 60%, one focal point); count cut rate but do
not optimize it. For each shot, assert enter/idle/exit and at least one
foreground/background interaction. Sample 5 s sequences at 10 fps and check
the frame-difference baseline, simultaneous moving elements and flash rate;
sample at least ten stills from the encoded file, not only section
midpoints.

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
- [B] R4 Scene boundaries come from measured audio; lyric cue windows come
  from vocal-stem word timestamps (or a declared section-level fallback) —
  Verification: for generated/free-rhythm vocals the per-second table maps
  each line to an ASR word start; no cue is an equal division of a section;
  the fallback is stated when used.
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
  match the timing table's grid entries; the stutter ends before the next
  lyric line and no line is covered.
- [A] R10 In a high-energy or reference-driven edit, the motion and
  visual-center targets are met — Verification: each shot has enter/idle/
  exit and at least one foreground/background interaction; the cut rate is
  recorded as an outcome (roughly 0.2–1.2/s; 0.2–0.35/s is valid for long-form;
  no minimum) and hard cuts/
  flashes are reserved for drops and chop bursts; each shot has one focal
  type mass ≥35% of the frame with ≤3 type sizes.
- [A] R11 No persistent bottom caption or side panel appears unless
  explicitly requested — Verification: no subtitle strip in the DOM; the
  encoded stills are full-frame compositions.
- [A] R12 If an energy edit is made, the original audio is preserved and
  both versions are delivered with key/loudness/true-peak evidence —
  Verification: both paths, the detected key, integrated loudness and true
  peak are reported.
- [A] R13 No static-poster sequence: every shot animates and carries
  continuity — Verification: 5 s sequences at 10 fps show within-shot
  motion and a transition or shared motif; no shot is a finished poster
  held to its cut.
- [A] R14 Visual pollution is bounded: ≤1 full-frame flash/inversion per
  section, ≤3 simultaneous moving elements, and at least some slow/breath
  shots — Verification: the motion audit's counts and a 5 s sequence
  review.
- [B] R15 A lyric that names a material/optical state is staged as that
  mechanism, not a colour swap or explanatory label — Verification:
  black-to-colour starts on a black base and reveals a spectrum (start/mid/
  end stills show black remaining); transparency uses rgba/opacity over a
  checkerboard with the layer visible; a light-gray fill or pre-coloured
  card fails.
- [B] R16 Full lyric lines stay readable: no clipped character, no
  face/thread/prop over the type, and one line per card for long lines —
  Verification: type/geometry probe 0 issues; encoded still at each V2/
  long-line scene.
- [B] R17 The MV covers the supplied song and the chosen take; no
  truncation or remix unless explicitly requested — Verification: duration
  matches the song, or a requested short cut is named as a separate
  deliverable; audio is the supplied mix with only level/true-peak safety.

## Song-stage requirements (S1–S11)

Used only when Stage A is requested; mark n/a when starting from finished
audio.

- [B] S1 One musical center: the main genre is the first Style item and no
  descriptor contradicts it — Verification: read the first item; scan the
  rest.
- [B] S2 The Style brief is English, 4–7 items, 150–300 characters, with a
  concrete tempo and an explicit vocal direction — Verification: count
  items/characters; check tempo and vocal.
- [B] S3 No real artist names in either field — Verification: scan both
  blocks.
- [B] S4 The lyrics sheet carries at least Verse and Chorus tags; an
  instrumental request carries no vocal lines — Verification: scan the tags.
- [B] S5 The chorus contains one extractable hook phrase; a full-song request
  is 1:50–2:10 with the first chorus around 0:30 — Verification: read the
  chorus; walk the tag/bar order.
- [B] S6 The delivery matches the song-stage deliverable — Verification:
  compare the reply with references/song-stage.md.
- [A] S7 Bar counts match between the Style narrative and the lyric tags when
  a precise arrangement is requested — Verification: cross-check.
- [A] S8 Up to three direction options were offered when the theme supports
  distinct genres; the pick is recorded — Verification: conversation record.
- [A] S9 In the meme-chant genre, chant lines are ≤7 syllables, the chorus is
  the shortest catchphrase, and the stutter has its own tag with per-word
  lines — Verification: count; scan.
- [B] S10 A full-song request is 1:50–2:10 (or the user's stated length), not
  a 30–55 s skeleton; a short-form request is explicitly named — Verification:
  the budget totals 60–64 bars for the 2-minute default; the delivery names
  the length.
- [B] S11 API generation, when used, reads the key from the environment and
  never prints/logs/commits it; creates a task, polls with a bounded timeout,
  downloads and verifies the chosen take; no remix. A platform video is only
  the explicit fast path — Verification: no key in transcript/commit; taskId/
  audioId and ffprobe evidence recorded.

## When to stop

- Done when: the MP4 at the requested ratio exists, streams verify, encoded
  stills passed, the full supplied song is covered (or a requested short cut
  is separately named), and the renderer source + timing table are delivered
  with R1–R6 evidenced. If Stage A was requested, the song package, chosen
  take, taskId/audioId and timestamped lyrics/stems used are also delivered.
  If only a theme is supplied and no API is configured, the song package is
  the deliverable; do not fake generation.
- Budgets: at most two visual-fix rounds per delivery; one style-direction
  question when the look is genuinely undecided. Exhausted → deliver what
  passed, name the remaining visual issue and the smallest unblock condition
  (e.g. "pick modern-default or name a style"); blocked items stay blocked.
- The MV is rendered from the song as supplied. Re-mastering is out of
  scope; an explicitly requested energy edit is an arrangement (preserve the
  original, deliver both, measure key/loudness/peak) and is reported as
  such. A new song is Stage A; without an API, stop at the song package.

## Output contract

1. The finished MP4 (path, ratio, resolution, fps, duration, size), or the
   explicitly requested platform fast video, labelled as such.
2. The renderer source: seek(t) HTML + frame-render script + assemble
   script + scene timing table — re-runnable by anyone with the song file.
3. A close-out mapping R1–R6 (and R7–R17, and S1–S11 when Stage A) to
   done/blocked/n-a with evidence, the applied style profile, and any
   unfinished visual work.
4. A reference style card and shot/motion sheet, a PPT/visual-center/
   motion audit, and — when Stage A was used — the song package, chosen
   take, taskId/audioId and the timestamped lyrics/stems used; if an energy
   edit was requested, the original and hard-edit audio with key/loudness/
   true-peak evidence.

The user verifies by playing the MP4; the timing table lets them point at any
moment ("the chorus hits at 23 s") and get a targeted fix instead of a
re-edit.
