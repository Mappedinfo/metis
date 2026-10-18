# Audio-first line timing for generated/free-rhythm vocals

Use this when a Suno-style take does not follow the lyric sheet's bar grid:
the vocal enters late, rushes a phrase, holds a word, or interleaves chorus
and stutter. The original mix stays the MV audio; the vocal stem is timing
evidence.

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
remains the text.

## 3. Align the known lyric

Normalize punctuation and whitespace in both the known lyric and the ASR
words. Match characters with a sequence aligner; a known line starts at the
first ASR word that covers its first character and ends at the next line's
start, or at the last sung word when it is the final line.

If a word is misheard (对 -> 歹, ERROR 404 -> "her sir"), ignore the ASR text
and keep the known lyric. Only the time is taken from ASR.

Do not divide a section evenly. A 4-line section is not 4 equal windows.

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

- Every line start is within the ASR word window; no line is an equal split.
- The first lyric appears with the voice, not at the section start.
- A stutter does not hide the next line.
- The per-second table has 120/120 rows (or the song length); no gaps.
- The original mix is the MV audio; only a level/true-peak safety pass.
- If ASR is unavailable, declare section-level fallback; do not claim line
  accuracy.

## Failure modes

- RMS envelope peaks treated as line starts.
- Equal division of a section.
- ASR transcript used as the displayed lyric.
- Chorus and stutter interleaved but forced into separate tag blocks.
- Stutter covering the next line.
- Remixing the chosen take to force an old cut.
