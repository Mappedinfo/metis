# Semantic material effects

When the lyric names a material or optical state, stage the mechanism. A label,
a colour swap, or a caption explaining the joke is not the effect.

## Black-to-colour

The base is black. A spectrum physically enters the black; it is not a
pre-coloured card.

Structure:

    <div class="cbCard">
      <div class="cbReveal"><div class="cbSpectrum"></div></div>
      <div class="cbSweep"></div>
      <div class="cbType">你说要五彩斑斓的黑</div>
    </div>

CSS:

    .cbCard { background: #050505; overflow: hidden; }
    .cbReveal {
      position: absolute; inset: 0;
      clip-path: inset(0 calc(100% - var(--x, 6%)) 0 0);
    }
    .cbSpectrum {
      position: absolute; inset: 0;
      background: linear-gradient(110deg,
        #ff2b1f, #ffb800 20%, #d8ff3e 38%, #00e5ff 56%,
        #1f4bff 74%, #b000ff 88%, #ff2b1f);
      mix-blend-mode: screen;
    }

Drive it from seek(t):

    const p = clamp((t - t0) / (t1 - t0), 0, 1);
    const r = clamp((p - 0.02) / 0.78, 0, 1);
    const x = 6 + 94 * (r * r * (3 - 2 * r));
    reveal.style.setProperty("--x", x + "%");

The black side stays black; the words can straddle the boundary. Put the
"五彩斑斓" part on the colour and "黑" on the black at mid-reveal, so the
sentence itself shows the transition.

Avoid mask-image for this: a CSS variable inside mask-image can silently fail
in the headless renderer. clip-path is reliable; verify an encoded still at
start/mid/end.

## Real alpha

Transparency is a compositing operation, not a light-gray fill.

Structure:

    <div class="alChecker"></div>
    <div class="alCard">
      <div class="alType">你说要透明一点的灰</div>
      <div class="alMeter">α <b>0.35</b></div>
    </div>

CSS:

    .alChecker {
      background-color: #F4F1E8;
      background-image:
        linear-gradient(45deg, #cfcabd 25%, transparent 25%,
          transparent 75%, #cfcabd 75%),
        linear-gradient(45deg, #cfcabd 25%, transparent 25%,
          transparent 75%, #cfcabd 75%);
      background-size: 58px 58px;
      background-position: 0 0, 29px 29px;
    }
    .alCard {
      background: rgba(128, 128, 128, var(--a, 0.35));
    }

Drive alpha from seek(t):

    const a = lerp(0.94, 0.35, smoothstep(clamp(p / 0.5, 0, 1)));
    card.style.setProperty("--a", a.toFixed(3));
    readout.textContent = a.toFixed(2);

The checkerboard, the background dots/thread and the face must show through
the gray. A live alpha readout is useful because it makes the mechanism
legible, not decorative.

Avoid: a solid light-gray card; opacity on the whole scene (that fades the
type too); a caption saying "透明" without a visible layer underneath.

## Readability and occlusion

- The face, thread, prop and doodles stay behind the type at large sizes.
- Keep the full line visible; no clipped last character; one line per card
  when the line is long.
- Run a type/geometry probe: every type box inside the safe area, no
  face/thread overlap, at most three type sizes.

## Start/mid/end tests

For every material effect, inspect encoded stills at:

- start: the base state is actually the base (black, opaque, etc.);
- mid: the mechanism is visibly half-done;
- end: the target state is complete and the type is readable.

A single "after" still cannot prove a transition. A single "before" still
cannot prove the mechanism exists.
