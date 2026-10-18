# Suno API stage

Use this reference only when the host provides a Suno API. Read the key from
the environment; never print it, put it in a prompt, log, screenshot or commit.
The public docs are at https://docs.sunoapi.org (index:
https://docs.sunoapi.org/llms.txt). The endpoint shapes below follow the
generate / details / timestamped-lyrics / stem / music-video docs.

## Authentication and base

    Base URL: https://api.sunoapi.org
    Header:   Authorization: Bearer $SUNOAPI_KEY
    Content-Type: application/json

The local host may name the variable differently; map it to the process
environment, do not hard-code the value. A callback URL is required by the
generation endpoints; use a reachable callback (a temporary local HTTP server
or a webhook) or poll the task. Do not invent a callback you cannot receive.

## 1. Generate music

POST /api/v1/generate

    {
      "customMode": true,
      "instrumental": false,
      "model": "V6",
      "title": "你说得对",
      "style": "<the English Style brief>",
      "lyrics": "<the tagged lyric sheet>",
      "duration": 120,
      "callBackUrl": "https://your-host/callback"
    }

Custom mode is the path for a planned song: style + lyrics + title. The V6
series allows style up to 1000 characters and lyrics up to 5000; the skill's
Style budget is 150–300 characters. Duration is 10–360 s; use 120 for the
full-song default. The endpoint generates multiple variations in one task.

Response: data.taskId — keep it.

## 2. Poll the generation

GET /api/v1/generate/record-info?taskId={taskId}

Status: PENDING, TEXT_SUCCESS, FIRST_SUCCESS, SUCCESS, CREATE_TASK_FAILED,
GENERATE_AUDIO_FAILED, CALLBACK_EXCEPTION, SENSITIVE_WORD_ERROR.
On SUCCESS, data.response.sunoData[] contains the takes. Each take has:

    id            audioId
    audio_url     downloadable audio
    source_audio_url
    duration
    title / tags / image_url

Keep taskId + the chosen take's audioId. Download the chosen audio, verify
duration/codec, and do not remix it; a level/true-peak safety pass is fine.
URLs expire; download promptly.

## 3. Timestamped lyrics (best timing source)

POST /api/v1/generate/get-timestamped-lyrics

    { "taskId": "...", "audioId": "..." }

Response: data.alignedWords[] with:

    word     the lyric word/tag (may include [Verse] etc.)
    startS   start in seconds
    endS     end in seconds
    success  whether alignment succeeded

This is the preferred line-timing source for an API-generated track. Filter
bracketed tags, keep the accepted lyric as the displayed text, and map each
line to the first/last aligned word. If the API has no alignment, fall back to
the local vocal-stem ASR in audio-first-timing.md.

## 4. Vocal / instrumental stem

POST /api/v1/vocal-removal/generate

    {
      "taskId": "...",
      "audioId": "...",
      "type": "separate_vocal",
      "callBackUrl": "https://your-host/callback"
    }

separate_vocal returns vocals + instrumental; split_stem returns up to 12
stems. Poll:

    GET /api/v1/vocal-removal/record-info?taskId={taskId}

On SUCCESS: vocalUrl, instrumentalUrl, originUrl. Download the vocal for
timing; keep the original mix for the MV. This costs credits per call and is
not cached; do not call it twice by accident.

## 5. Download and verify

- Download the chosen audio to a local path; do not stream the MV from a
  temporary URL.
- ffprobe the duration, codec, sample rate and channels.
- Keep the taskId/audioId and the chosen take in the project record; never
  write the API key.
- If the API returns an error status, report the status and the task id; do
  not retry blindly or spend credits on repeated calls.

## Security and cost

- The key belongs in the process environment only; redact it in any command
  echo or log.
- Generation and stems consume credits; ask before a large batch.
- The API's terms and retention limits govern the outputs; keep local copies
  for the project.
- The platform music-video endpoint is not part of this workflow; do not call
  it unless the user explicitly asks for that separate deliverable. It costs
  credits and is a different output, not evidence for the custom MV.
