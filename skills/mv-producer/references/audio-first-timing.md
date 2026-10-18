# Audio-first line timing for generated/free-rhythm vocals

Use this when a Suno-style take does not follow the lyric sheet's bar grid:
the vocal enters late, rushes a phrase, holds a word, or interleaves chorus
and stutter. The original mix stays the MV audio; the vocal stem is timing
evidence.

## 0. Review and retain the actual take

Listen through the selected mix before planning animation. Compare the real
duration, words, section order, repetitions, omissions and pauses with the
sheet. Record these differences in the timing table, marking uncertain words
explicitly; retain the original sheet. A missing verse or an early chorus
changes the cue/scene plan. Draft tags and requested BPM cannot supply the
missing performance evidence.

If the existing audio meets the accepted song goal, keep it and change the
animation. Do not incur another generation merely to recover the draft's
order or beat grid. Regeneration addresses an unsuitable song, within the
existing authorization and budget. Bind the timing table to the selected
take's ID or file hash; a different take needs a new review and alignment.

**API evidence first, then check it.** If the track was generated in the same
Suno API task, inspect its timestamped lyrics
(alignedWords: word/startS/endS/success) and its separate_vocal stem.
Check finite, in-range starts/ends, positive durations, ordering, overlaps and
implausibly short tokens. Overlapping/chopped vocals may be real: check the
sound before accepting or rejecting them. A success flag is not a quality
verdict. Use local Demucs + ASR for missing or unreliable evidence, or an
external track. Keep ambiguous intervals explicit rather than forcing an
alignment. See
[suno-api.md](suno-api.md).

## 1. Separate the mix

    python -m demucs.separate -n htdemucs --two-stems vocals -o stems song.mp3

Outputs are normally:

    stems/htdemucs/song/vocals.wav
    stems/htdemucs/song/no_vocals.wav

A project-specific two-stem wrapper is fine; keep the original mix untouched.
Do not use a remix unless the user asked for one.

## 2. Word-timestamp ASR on the vocal stem

Run a local Whisper-class model on vocals.wav, not the mix. faster-whisper
example:

    from faster_whisper import WhisperModel
    model = WhisperModel("small", device="cpu", compute_type="int8")
    segments, info = model.transcribe(
        "vocals.wav",
        language="zh",
        beam_size=5,
        word_timestamps=True,
        vad_filter=False,
        condition_on_previous_text=False,
    )
    for s in segments:
        for w in s.words:
            print(w.start, w.end, w.word)

Keep the segments and words as JSON. The small model is enough for timing;
a larger model helps when the vocal is dense, but the accepted lyric sheet
remains the text for known lines. ASR confidence does not replace checking
unclear words against the audio.

## 3. Align the known lyric

First map the confirmed performed lines in their actual order, including
repeats; exclude omitted lines and retain a record of omissions or verified
word changes. Normalize punctuation and whitespace in these lines and the ASR
words. Match characters with a sequence aligner; a known line starts at the
first ASR word that covers its first character and ends at the next line's
start, or at the end of its sung phrase. Preserve vocal pauses rather than
stretching a cue through an instrumental gap.

If a word is misheard (对 -> 歹, ERROR 404 -> "her sir"), ignore the ASR text
and keep the known lyric. Only the time is taken from ASR.

Do not divide a section evenly or force the full draft onto partial audio.
A 4-line section is not 4 equal windows. Retain the evidence source and any
uncertainty for each cue; API/ASR disagreement needs a targeted audio check,
not an automatic lyric rewrite.

## 4. Write the per-second table

One row per second:

    second, section, shot, active lyric line, vocal dBFS, ASR word

This is the audit trail. It lets the user say "at 1:03 the second line is
early" and get a targeted cue change, not a re-edit.

## 5. Build shots from line starts

A shot may hold two or more lines when the visual has one composition, but its
window starts at the first line and ends at the next shot's first line. The
picture must not run ahead of the voice.

Long intros, post-choruses and instrumental breaks are holds: keep the face,
thread, dots or a deliberate near-black. Never invent lyrics for them.

## 6. Stutter / chop

Use the sung chant interval, not the bracket tag's nominal length. End the
stutter before the next lyric line. Six flashes on a 1.4 s chant can be better
than eleven flashes covering the next phrase.

## 7. Checks

- The selected take, actual sung order and deviations from the sheet are
  recorded before the scene plan; cues contain no unsung draft sections.
- Every line start has checked API/ASR word evidence; no cue uses a fixed BPM
  or an equal split in place of measured vocal time.
- The first lyric appears with the voice, not at the section start.
- A stutter does not hide the next line.
- The per-second table covers the full song, including instrumental gaps and
  the final partial second; blank lyric cells are valid during silence.
- The original mix is the MV audio; only a level/true-peak safety pass.
- A low-cost audiovisual preview is checked before the full render at vocal
  entrances, reordered sections, stutters and uncertain spans. Check these
  again in the encoded MP4, including audio offset from muxing. Record what
  was actually checked; stills alone do not prove perceptual sync.
- If ASR is unavailable, declare section-level fallback; do not claim line
  accuracy.

## Failure modes

- RMS envelope peaks treated as line starts.
- Equal division of a section.
- Draft order or a requested/fixed BPM treated as the actual performance.
- API success, zero-duration words or noisy ASR accepted without checking.
- ASR transcript used as the displayed lyric.
- Chorus and stutter interleaved but forced into separate tag blocks.
- Stutter covering the next line.
- Remixing the chosen take to force an old cut.
- Regenerating usable audio to fix an animation timing problem.
