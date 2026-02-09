# Guitar Source Of Truth

This document defines a durable source of truth for fretboard note locations,
scale/chord formulas, and future voicing generation in this project.

## Goal

Support current features and upcoming additions (dominant 7, maj7, mMaj7, 7b5,
7#5, etc.) without hard-coding many disconnected shape tables.

## Research Summary

The most reliable path is to separate truth into 3 layers:

1. Fretboard pitch math (deterministic, no lookup tables).
2. Theory dictionaries for chord/scale formulas (library + standards).
3. Rendering/shape heuristics (UI choices, not theory truth).

Primary references used:

- Tonal chord API (`ChordType.get`, `ChordType.all`) and interval definitions:
  `https://tonaljs.github.io/tonal/docs/groups/chords`
- Tonal scale API (`ScaleType.get`, `ScaleType.all`) and interval definitions:
  `https://tonaljs.github.io/tonal/docs/groups/scales`
- Tonal midi utilities (`Midi.*`) for note/midi conversion:
  `https://tonaljs.github.io/tonal/docs/basics/midi`
- W3C MusicXML chord taxonomy (`kind-value`) for naming interoperability:
  `https://www.w3.org/2021/06/musicxml40/musicxml-reference/data-types/kind-value/`
- Fender reference for standard tuning string names (E A D G B E):
  `https://www.fender.com/articles/maintenance/how-to-tune-a-guitar`

## Canonical Model

### 1) Pitch truth on the fretboard

Use open-string MIDI values as canonical tuning:

- Low E: `40` (`E2`)
- A: `45` (`A2`)
- D: `50` (`D3`)
- G: `55` (`G3`)
- B: `59` (`B3`)
- High E: `64` (`E4`)

This is already consistent with current code in `src/projects/guitar/lib/constants.ts`.

Canonical formulas:

- `midiAt(string, fret) = openMidi[string] + fret`
- `pcAt(string, fret) = midiAt(string, fret) % 12`
- Octave identity check: `pcAt(s, f) === pcAt(s, f + 12)` when within range

Important rule: every rendered note location must derive from this math, not
from static shape note labels.

### 2) Theory truth for formulas

Use a dictionary-driven theory layer instead of hand-maintaining interval arrays
in multiple files.

Recommended source:

- `tonal` package dictionaries (`ChordType`, `ScaleType`)

Why:

- Broad coverage (including altered/diminished/half-diminished families).
- Intervals provided in a normalized format.
- Aliases included (for user-facing names and parsing).

Reference examples from `tonal`:

- `7` => `1P 3M 5P 7m`
- `maj7` => `1P 3M 5P 7M`
- `mMaj7` => `1P 3m 5P 7M`
- `7b5` => `1P 3M 5d 7m`
- `7#5` => `1P 3M 5A 7m`
- `m7b5` => `1P 3m 5d 7m`
- `dim7` => `1P 3m 5d 7d`

### 3) Naming / enharmonic spelling truth

Pitch classes should stay numeric internally.
Spelling should be a display policy:

- Key-aware default spelling for scale/chord labels.
- Blues overlays prefer flat labels for altered targets (`b5`, `b6`, `b7`).

This keeps theory logic stable while UI stays musician-friendly.

## Proposed Architecture Changes

Add a dedicated theory catalog module and keep generation logic separate:

- `src/projects/guitar/lib/theory-catalog.ts`
- `src/projects/guitar/lib/fretboard-map.ts`
- `src/projects/guitar/lib/voicing-search.ts`

Responsibilities:

- `theory-catalog.ts`
  - Loads/defines chord + scale formulas (prefer generated snapshot from Tonal).
  - Exposes normalized pitch-class intervals (`number[]`).
- `fretboard-map.ts`
  - Single canonical pitch mapping for any string/fret/tuning.
  - Note naming helpers delegated from numeric pitch classes.
- `voicing-search.ts`
  - Finds playable voicings from formula + constraints.
  - Constraints include string groups, max stretch, max fret, NPS policies.

## Suggested Data Contracts

```ts
type PitchClass = 0|1|2|3|4|5|6|7|8|9|10|11;

interface TuningSpec {
  name: string; // e.g. "standard"
  openMidiByString: number[]; // low E -> high E
}

interface ChordFormulaDef {
  id: string; // "maj7", "mMaj7", "7b5"
  intervalsPc: PitchClass[]; // e.g. [0,4,7,11]
  aliases: string[];
  displayName: string;
}

interface ScaleFormulaDef {
  id: string; // "major", "minorPentatonic", "blues"
  intervalsPc: PitchClass[];
  aliases: string[];
}
```

## Migration Plan

1. Keep existing UX/components unchanged.
2. Introduce `theory-catalog.ts` and route current `chord-types.ts` through it.
3. Add new chord families by formula, not by hard-coded fret sets.
4. Refactor triad/seventh generation to run through one `voicing-search` path.
5. Keep shape ordering and UI styling logic in components; keep theory pure.

## Test Strategy (must-pass invariants)

Add or keep tests that lock down true theory behavior:

- Fretboard math:
  - open-string MIDI/note names map correctly for standard tuning.
  - every `f + 12` position has same pitch class.
- Formula integrity:
  - each supported chord symbol resolves to expected interval set.
  - aliases resolve to same interval set (e.g. `mMaj7` and alias forms).
- Voicing validity:
  - every generated voicing note belongs to the selected formula.
  - required chord tones exist in each voicing unless explicitly optional.
- Shape policies:
  - pentatonic stays strict 2NPS.
  - blues adds only configured target classes (`b5`, `b6`, `b7` toggles).

## Practical Recommendation

Use computed note locations as the single pitch truth and use a normalized
formula catalog (preferably generated from Tonal) as the single theory truth.
Everything else (box ordering, highlight rings, UI toggles) should consume those
two layers.
